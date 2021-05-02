// Code Generator lemonScript -> JavaScript
//
// Invoke generate(program) with the program node to get back the JavaScript
// translation as a string.

import { Type } from "./ast.js"
import * as stdlib from "./stdlib.js"

export default function generate(program) {
  const output = []
  var expStandalone = true
  var isParam = false

  // Variable and function names in JS will be suffixed with _1, _2, _3,
  // etc. This is because "switch", for example, is a legal name in Carlos,
  // but not in JS. So, the Carlos variable "switch" must become something
  // like "switch_1". We handle this by mapping each name to its suffix.
  const targetName = (mapping => {
    return entity => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1)
      }
      return `${entity.name}_${mapping.get(entity)}`
    }
  })(new Map())

  const gen = node => {
    return generators[node.constructor.name](node)
  }

  const generators = {
    // Key idea: when generating an expression, just return the JS string; when
    // generating a statement, write lines of translated JS to the output array.

    Program(p) {
      gen(p.statements)
    },
    VariableDecInit(d) {
      // We don't care about const vs. let in the generated code! The analyzer has
      // already checked that we never updated a const, so let is always fine.
      expStandalone = false
      output.push(`let ${gen(d.variable)} = ${gen(d.init)};`)
      expStandalone = true
    },
    VariableDec(d) {
      expStandalone = false
      if (isParam) {
        let variable = `${gen(d.variable)}`
        expStandalone = true
        return variable
      } else {
        output.push(`let ${gen(d.variable)};`)
      }
      expStandalone = true
    },
    Assignment(s) {
      expStandalone = false
      output.push(`${gen(s.source)} = ${gen(s.target)};`)
      expStandalone = true
    },

    FunctionDec(f) {
      const funcName = targetName(f.function)
      isParam = true
      output.push(`function ${funcName}(${gen(f.params).join(", ")}) {`)
      isParam = false
      gen(f.body)
      output.push("}")
    },
    Call(c) {
      const targetCode = `${gen(c.callee)}(${gen(c.args).join(", ")})`
      // Calls in expressions vs in statements are handled differently
      if (c.callee.type.returnTypes !== Type.VOID) {
        return targetCode
      }
      output.push(`${targetCode};`)
    },
    Function(f) {
      return targetName(f)
    },
    PrintStatement(p) {
      expStandalone = false
      output.push(`console.log(${gen(p.argument)});`)
      expStandalone = true
    },
    typeOfStatement(p) {
      if (expStandalone) {
        expStandalone = false
        output.push(`typeof ${gen(p.argument)};`)
        expStandalone = true
      } else {
        return `typeof ${gen(p.argument)}`
      }
    },
    IfStatement(s) {
      expStandalone = false
      output.push(`if (${gen(s.cases[0].condition)}) {`)
      expStandalone = true
      gen(s.cases[0].body)
      for (let i = 1; i < s.cases.length; i++) {
        gen(s.cases[i])
      }
      output.push(`} else {`)
      gen(s.elseBlock)
      output.push(`}`)
    },
    IfCase(s) {
      expStandalone = false
      output.push(`} else if (${gen(s.condition)}) {`)
      expStandalone = true
      gen(s.body)
    },
    WhileStatement(s) {
      expStandalone = false
      output.push(`while (${gen(s.condition)}) {`)
      expStandalone = true
      gen(s.body)
      output.push("}")
    },
    ForStatement(s) {
      gen(s.forArgs)
      gen(s.body)
      output.push("}")
    },
    ForArgs(s) {
      expStandalone = false
      output.push(
        `for (let ${gen(s.variable)} = ${gen(s.exp)}; ${gen(s.condition)}; ${gen(
          s.sliceCrement
        )}) {`
      )
      expStandalone = true
    },
    SwitchStatement(s) {
      output.push(`switch(${gen(s.expression)}) {`)
      for (let i = 0; i < s.cases.length; i++) {
        gen(s.cases[i])
      }
      output.push(`default:`)
      gen(s.defaultCase)
      output.push(`}`)
    },
    LemonCase(s) {
      output.push(`case ${gen(s.caseExp)}:`)
      gen(s.statements)
    },
    ReturnStatement(s) {
      output.push(`return ${gen(s.returnValue)};`)
    },
    ShortReturnStatement(s) {
      output.push("return;")
    },
    BinaryExp(e) {
      const op = { "==": "===", "!=": "!==", "^": "**" }[e.op] ?? e.op

      if (["+=", "-="].includes(e.op)) {
        if (expStandalone) {
          expStandalone = false
          output.push(`${gen(e.left)} ${op} ${gen(e.right)};`)
          expStandalone = true
          return
        }
        return `${gen(e.left)} ${op} ${gen(e.right)}`
      }
      if (expStandalone) {
        expStandalone = false
        output.push(`(${gen(e.left)} ${op} ${gen(e.right)});`)
        expStandalone = true
        return
      }
      return `(${gen(e.left)} ${op} ${gen(e.right)})`
    },
    UnaryExpression(e) {
      if (expStandalone) {
        if (e.isprefix) {
          expStandalone = false
          output.push(`${e.op}(${gen(e.operand)});`)
          expStandalone = true
          return
        }
        expStandalone = false
        output.push(`${gen(e.operand)}${e.op};`)
        expStandalone = true
        return
      }
      if (e.isprefix) {
        return `${e.op}(${gen(e.operand)})`
      }
      return `${gen(e.operand)}${e.op}`
    },
    ArrayLit(a) {
      return `[${gen(a.elements).join(",")}]`
    },
    ObjLit(o) {
      return `{${gen(o.keyValuePairs).join(",")}}`
    },
    ObjPair(p) {
      return `${gen(p.key)}: ${gen(p.value)}`
    },
    MemberExpression(e) {
      return `(${gen(e.vari)}[${e.index}])`
    },
    PropertyExpression(e) {
      return `(${gen(e.var1)}[${e.var2}])`
    },
    Continue(s) {
      output.push("continue;")
    },
    Break(s) {
      output.push("break;")
    },
    Variable(v) {
      return targetName(v)
    },
    Bool(b) {
      return `${b.value}`
    },
    Number(e) {
      return e
    },
    BigInt(e) {
      return e
    },
    String(e) {
      // This ensures in JavaScript they get quotes!
      return JSON.stringify(e)
    },
    Array(a) {
      return a.map(gen)
    },
  }

  gen(program)
  return output.join("\n")
}
