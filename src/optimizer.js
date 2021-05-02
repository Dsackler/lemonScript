// Optimizer
//
// This module exports a single function to perform machine-independent
// optimizations on the analyzed semantic graph.
//
// The only optimizations supported here are:
//
//   - assignments to self (x = x) turn into no-ops
//   - constant folding
//   - some strength reductions (+0, -0, *0, *1, etc.)
//   - turn references to built-ins true and false to be literals
//   - remove all disjuncts in || list after literal true
//   - remove all conjuncts in && list after literal false
//   - while-false becomes a no-op
//   - repeat-0 is a no-op
//   - for-loop over empty array is a no-op
//   - for-loop with low > high is a no-op
//   - if-true and if-false reduce to only the taken arm
//   - loop unrolling

import * as ast from "./ast.js"
import { Bool } from "./ast.js"

export default function optimize(node) {
  return optimizers[node.constructor.name](node)
}

const toBool = boolean => {
  return boolean ? new Bool("sweet", true, "taste") : new Bool("sour", false, "taste")
}

const optimizers = {
  Program(p) {
    p.statements = optimize(p.statements)
    return p
  },
  VariableDecInit(d) {
    d.init = optimize(d.init)
    return d
  },
  VariableDec(d) {
    return d
  },
  Variable(v) {
    return v
  },
  Assignment(s) {
    s.source = optimize(s.source)
    s.target = optimize(s.target)
    if (s.source === s.target) {
      return []
    }
    return s
  },
  FunctionDec(d) {
    d.body = optimize(d.body)
    return d
  },
  Call(c) {
    c.callee = optimize(c.callee)
    c.args = optimize(c.args)
    return c
  },
  Function(d) {
    return d
  },
  IfStatement(s) {
    let last = null
    s.cases[0] = optimize(s.cases[0])
    if (s.cases[0].condition.constructor === Bool) {
      if (s.cases[0].condition.value) {
        return s.cases[0].body
      } else {
        s.cases.splice(0, 1)
      }
    }
    for (let index = 1; index < s.cases.length; index++) {
      s.cases[index] = optimize(s.cases[index])
      if (s.cases[index].condition.constructor === Bool) {
        if (s.cases[index].condition.value) {
          last = s.cases[index]
          s.cases.splice(index)
          break
        } else {
          s.cases.splice(index, 1)
          index--
          continue
        }
      }
    }
    if (last != null) {
      s.elseBlock = last.body
    }
    s.elseBlock = optimize(s.elseBlock)

    return s.cases.length === 0 ? s.elseBlock : s
  },
  IfCase(s) {
    s.condition = optimize(s.condition)
    s.body = optimize(s.body)
    return s
  },
  WhileStatement(s) {
    s.condition = optimize(s.condition)
    if (s.condition.constructor === Bool && !s.condition.value) {
      return []
    }
    s.body = optimize(s.body)
    return s
  },
  ForStatement(s) {
    s.forArgs = optimize(s.forArgs)
    s.body = optimize(s.body)
    if(s.forArgs.canUnroll){
      const checkBody = (body) => {
        for(let statementIndex = 0; statementIndex < body.length; statementIndex++){
          if(body[statementIndex].constructor === ast.Assignment){
            if(s.forArgs.identifier.name === body[statementIndex].source.name) {
              return false
            }
          }
          if(body[statementIndex].constructor === ast.UnaryExpression && ["++", "--"].includes(body[statementIndex].op)){
            if(s.forArgs.identifier.name === body[statementIndex].operand.name) {
              return false
            }
          }
          // because functions can have shadow variables
          if([ast.FunctionDec, ast.WhileStatement, ast.IfStatement, ast.SwitchStatement, ast.ForStatement].includes(body[statementIndex].constructor)){
            return false
          }
        }
        return true
      }

      const newStatement = (statement, identifier, value) => {
        if(statement.constructor === ast.Variable){
          if (statement.name === identifier) return value
        }
        if(statement.constructor === ast.VariableDecInit){
          return new ast.VariableDecInit(statement.type, statement.variable, newStatement(statement.init, identifier, value), statement.con)
        }
        if(statement.constructor === ast.Assignment){
          return new ast.Assignment(statement.source, newStatement(statement.target, identifier, value))
        }
        if(statement.constructor === ast.Call){
          let args = []
          statement.args.forEach((arg) => {
            args.push(newStatement(arg, identifier, value))
          })
          return new ast.Call(statement.callee, args)
        }
        if(statement.constructor === ast.PrintStatement){
          return new ast.PrintStatement(newStatement(statement.argument, identifier, value))
        }
        if(statement.constructor === ast.TypeOfOperator){
          return new ast.TypeOfOperator(newStatement(statement.argument, identifier, value))
        }
        if(statement.constructor === ast.BinaryExp){
          return new ast.BinaryExp(newStatement(statement.left, identifier, value), statement.op, newStatement(statement.right, identifier, value))
        }
        if(statement.constructor === ast.UnaryExpression){
          return new ast.UnaryExpression(statement.op, newStatement(statement.operand, identifier, value), statement.isprefix)
        }
        if(statement.constructor === ast.ArrayLit){
          let elements = []
          statement.elements.forEach((element) => {
            elements.push(newStatement(element, identifier, value))
          })
          return new ast.ArrayLit(elements)
        }
        if(statement.constructor === ast.ObjLit){
          let keyValuePairs = []
          statement.keyValuePairs.forEach((keyValuePair) => {
            keyValuePairs.push(newStatement(keyValuePair, identifier, value))
          })
          return new ast.ObjLit(keyValuePairs)
        }
        if(statement.constructor === ast.ObjPair){
          return new ast.ObjPair(newStatement(statement.key, identifier, value), newStatement(statement.value, identifier, value))
        }
        return statement
      }
      const makeBody = (body, identifier, value) => {
        let newBody = []
        for(let statementIndex = 0; statementIndex < body.length; statementIndex++){
          newBody.push(newStatement(body[statementIndex], identifier, value))
        }
        return newBody
      }

      if(checkBody(s.body)){
        let newBody = []
        let bound = s.forArgs.condition.right
        if(s.forArgs.condition.op === "<"){
          bound--
        } else if(s.forArgs.condition.op === ">"){
          bound++
        }
        if(s.forArgs.sliceCrement.op === "++"){
          for(let i = s.forArgs.exp; i <= bound; i++){
            newBody.push(makeBody(s.body, s.forArgs.identifier.name, i))
          }
        } else {
          for(let i = s.forArgs.exp; i >= bound; i--){
            newBody.push(makeBody(s.body, s.forArgs.identifier.name, i))
          }
        }
        return optimize(newBody)
      }
    }
    return s
  },
  ForArgs(a) {
    a.identifier = optimize(a.identifier)
    a.exp = optimize(a.exp)
    a.condition = optimize(a.condition)
    a.sliceCrement = optimize(a.sliceCrement)
    // identifier prob
    if(a.condition.constructor !== ast.BinaryExp || ![Number, BigInt].includes(a.condition.right.constructor) || a.condition.left.name !== a.identifier.name || !["<","<=",">",">="].includes(a.condition.op)) {
      return a
    }
    if(a.sliceCrement.constructor === ast.UnaryExpression && a.sliceCrement.operand.name === a.identifier.name){
      if(a.sliceCrement.op === "++" && ["<", "<="].includes(a.condition.op)) {
        a.canUnroll = true
      } else if(a.sliceCrement.op === "--" && [">", ">="].includes(a.condition.op)) {
        a.canUnroll = true
      }
    }
    return a
  },
  SwitchStatement(s) {
    s.expression = optimize(s.expression)
    s.cases.map(c => optimize(c))
    s.defaultCase = optimize(s.defaultCase)
    return s
  },
  LemonCase(s) {
    s.caseExp = optimize(s.caseExp)
    s.statements = optimize(s.statements)
    return s
  },
  PrintStatement(p) {
    p.argument = optimize(p.argument)
    return p
  },
  TypeOfOperator(p) {
    p.argument = optimize(p.argument)
    return p
  },
  ReturnStatement(s) {
    s.returnValue = optimize(s.returnValue)
    return s
  },
  ShortReturnStatement(s) {
    return s
  },
  BinaryExp(e) {
    e.left = optimize(e.left)
    e.right = optimize(e.right)
    if (e.op === "&&") {
      // Optimize boolean constants in && and ||
      if (e.left.value === true) return e.right
      else if (e.right.value === true) return e.left
    } else if (e.op === "||") {
      if (e.left.value === false) return e.right
      else if (e.right.value === false) return e.left
    } else if ([Number, BigInt].includes(e.left.constructor)) {
      // Numeric constant folding when left operand is constant
      if ([Number, BigInt].includes(e.right.constructor)) {
        if (e.op === "+") return e.left + e.right
        else if (e.op === "-") return e.left - e.right
        else if (e.op === "*") return e.left * e.right
        else if (e.op === "/") return e.left / e.right
        else if (e.op === "%") return e.left % e.right
        else if (e.op === "^") return e.left ** e.right
        else if (e.op === "<") return toBool(e.left < e.right)
        else if (e.op === "<=") return toBool(e.left <= e.right)
        else if (e.op === "==") return toBool(e.left === e.right)
        else if (e.op === "!=") return toBool(e.left !== e.right)
        else if (e.op === ">=") return toBool(e.left >= e.right)
        else if (e.op === ">") return toBool(e.left > e.right)
      } else if (e.left === 0 && e.op === "+") return e.right
      else if (e.left === 1 && e.op === "*") return e.right
      else if (e.left === 0 && e.op === "-")
        return new ast.UnaryExpression("-", e.right, true)
      else if (e.left === 1 && e.op === "^") return 1
      else if (e.left === 0 && ["*", "/"].includes(e.op)) return 0
    } else if (e.right.constructor === Number) {
      // Numeric constant folding when right operand is constant
      if (["+", "-"].includes(e.op) && e.right === 0) return e.left
      else if (["*", "/"].includes(e.op) && e.right === 1) return e.left
      else if (e.op === "*" && e.right === 0) return 0
      else if (e.op === "^" && e.right === 0) return 1
      else if (e.op === "+=") return new ast.Assignment(e.left, new ast.BinaryExp(e.left, "+", e.right))
      else if (e.op === "-=") return new ast.Assignment(e.left, new ast.BinaryExp(e.left, "-", e.right))
    } else if (e.op === "+" && e.left.constructor === String) {
      return e.left + e.right
    }
    return e
  },
  UnaryExpression(e) {
    e.operand = optimize(e.operand)
    if ([Number, BigInt].includes(e.operand.constructor)) {
      if (e.op === "-") {
        return -e.operand
      }
    } else if (e.operand.constructor === Bool) {
      if (e.op === "!") {
        return toBool(!e.operand.value)
      }
    }
    return e
  },
  ArrayLit(e) {
    e.elements = optimize(e.elements)
    return e
  },
  ObjLit(a) {
    a.keyValuePairs.map(keyValuePair => optimize(keyValuePair))
    return a
  },
  ObjPair(p) {
    p.key = optimize(p.key)
    p.value = optimize(p.value)
  },
  MemberExpression(e) {
    e.array = optimize(e.array)
    // doesnt need to check the subscript because parser forces it to be a number
    return e
  },
  PropertyExpression(e) {
    e.object = optimize(e.object)
    e.field = optimize(e.field)
    return e
  },
  Continue(s) {
    return s
  },
  Break(s) {
    return s
  },
  IdentifierExpression(e) {
    return e
  },
  Bool(e) {
    return e
  },
  Number(e) {
    return e
  },
  BigInt(e) {
    return e
  },
  String(e) {
    return e
  },
  Array(a) {
    // Flatmap since each element can be an array
    return a.flatMap(optimize)
  },
}
