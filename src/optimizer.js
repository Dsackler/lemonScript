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

import * as ast from "./ast.js"

export default function optimize(node) {
  return optimizers[node.constructor.name](node)
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
  IfStatement(s) {
    s.cases.map(c => optimize(c))
    s.elseBlock = optimize(s.elseBlock)
    // if (s.test.constructor === Boolean) {
    //   return s.cases ? s.consequent : s.elseBlock
    // }
    return s
  },
  IfCase(s) {
    s.condition = optimize(s.condition)
    s.body = optimize(s.body)
    // if (s.test.constructor === Boolean) {
    //   return s.test ? s.consequent : []
    // }
    return s
  },
  WhileStatement(s) {
    s.condition = optimize(s.condition)
    // if (s.condition === false) {
    //   // while false is a no-op
    //   return []
    // }
    s.body = optimize(s.body)
    return s
  },
  ForStatement(s) {
    s.forArgs = optimize(s.forArgs)
    s.body = optimize(s.body)
    // if (s.collection.constructor === ast.EmptyArray) {
    //   return []
    // }
    return s
  },
  SwitchStatement(s) {
    s.expression = optimize(s.expression)
    s.cases.map(c => optimize(c))
    s.defaultCase = optimize(s.defaultCase)
    return s
  },
  LemonCase(s){
    s.caseExp = optimize(s.caseExp)
    s.statements = this.newChild({ inLoop: true }).optimize(s.statements)
    return s
  },
  PrintStatement(p) {
    p.argument = optimize(p.argument)
    return p
  },
  typeOfStatement(p) {
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
      if (e.left === true) return e.right
      else if (e.right === true) return e.left
    } else if (e.op === "||") {
      if (e.left === false) return e.right
      else if (e.right === false) return e.left
    } else if ([Number, BigInt].includes(e.left.constructor)) {
      // Numeric constant folding when left operand is constant
      if ([Number, BigInt].includes(e.right.constructor)) {
        if (e.op === "+") return e.left + e.right
        else if (e.op === "-") return e.left - e.right
        else if (e.op === "*") return e.left * e.right
        else if (e.op === "/") return e.left / e.right
        else if (e.op === "**") return e.left ** e.right
        else if (e.op === "<") return e.left < e.right
        else if (e.op === "<=") return e.left <= e.right
        else if (e.op === "==") return e.left === e.right
        else if (e.op === "!=") return e.left !== e.right
        else if (e.op === ">=") return e.left >= e.right
        else if (e.op === ">") return e.left > e.right
      } else if (e.left === 0 && e.op === "+") return e.right
      else if (e.left === 1 && e.op === "*") return e.right
      else if (e.left === 0 && e.op === "-") return new ast.UnaryExpression("-", e.right)
      else if (e.left === 1 && e.op === "**") return 1
      else if (e.left === 0 && ["*", "/"].includes(e.op)) return 0
    } else if (e.right.constructor === Number) {
      // Numeric constant folding when right operand is constant
      if (["+", "-"].includes(e.op) && e.right === 0) return e.left
      else if (["*", "/"].includes(e.op) && e.right === 1) return e.left
      else if (e.op === "*" && e.right === 0) return 0
      else if (e.op === "**" && e.right === 0) return 1
    }
    return e
  },
  

  
  Variable(v) {
    return v
  },
  Function(f) {
    // f.body = optimize(f.body)
    return f
  },
  Parameter(p) {
    return p
  },
  Increment(s) {
    return s
  },
  Decrement(s) {
    return s
  },
  
  BreakStatement(s) {
    return s
  },
  
  
  
  
  
  RepeatStatement(s) {
    s.count = optimize(s.count)
    if (s.count === 0) {
      // repeat 0 times is a no-op
      return []
    }
    s.body = optimize(s.body)
    return s
  },
  
  
  Conditional(e) {
    e.test = optimize(e.test)
    e.consequent = optimize(e.consequent)
    e.alternate = optimize(e.alternate)
    if (e.test.constructor === Boolean) {
      return e.test ? e.consequent : e.alternate
    }
    return e
  },
  
  UnaryExpression(e) {
    e.operand = optimize(e.operand)
    if (e.operand.constructor === Number) {
      if (e.op === "-") {
        return -e.operand
      }
    }
    return e
  },
  EmptyOptional(e) {
    return e
  },
  SubscriptExpression(e) {
    e.array = optimize(e.array)
    e.index = optimize(e.index)
    return e
  },
  ArrayExpression(e) {
    e.elements = optimize(e.elements)
    return e
  },
  EmptyArray(e) {
    return e
  },
  MemberExpression(e) {
    e.object = optimize(e.object)
    return e
  },
  
  BigInt(e) {
    return e
  },
  Number(e) {
    return e
  },
  Boolean(e) {
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