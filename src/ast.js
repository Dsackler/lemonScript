import util from "util"

export class Program {
  constructor(statements) {
    Object.assign(this, { statements })
  }
  [util.inspect.custom]() {
    return prettied(this)
  }
}

export class Type {
  constructor(name) {
    this.name = name
  }
  static BOOLEAN = new Type("taste")
  static INT = new Type("slice")
  static FLOAT = new Type("dontUseMeForEyeDrops")
  static STRING = new Type("pulp")
  static VOID = new Type("noLemon")
  static EMPTY_ARRAY = new Type("emptyArray")
  static EMPTY_OBJECT = new Type("emptyObject")
  static ANY = new Type("any")
  // Equivalence: when are two types the same
  isEquivalentTo(target) {
    return this === target
  }
  // T1 assignable to T2 is when x:T1 can be assigned to y:T2. By default
  // this is only when two types are equivalent; however, for other kinds
  // of types there may be special rules.
  isAssignableTo(target) {
    return this.isEquivalentTo(target)
  }
}

export class Bool extends Type {
  constructor(name, value, type) {
    super(name)
    Object.assign(this, { name, value, type })
  }
}

export class VariableDecInit {
  constructor(type, variable, init, con) {
    Object.assign(this, { con, type, variable, init })
  }
}

export class VariableDec {
  constructor(type, identifier, con) {
    Object.assign(this, { con, type, identifier })
  }
}

export class Assignment {
  constructor(source, target) {
    Object.assign(this, { target, source })
  }
}

export class FunctionDec {
  constructor(identifier, returnType, params, body) {
    Object.assign(this, { identifier, returnType, params, body })
  }
}

// Created during semantic analysis only!
export class Function {
  constructor(name) {
    this.name = name
  }
}

// Created during semantic analysis only!
export class FunctionType {
  constructor(paramTypes, returnType) {
    Object.assign(this, { paramTypes, returnType })
  }
}

export class Call {
  constructor(callee, args) {
    Object.assign(this, { callee, args })
  }
}

export class IfStatement {
  constructor(cases, elseBlock) {
    Object.assign(this, { cases, elseBlock })
  }
}
export class IfCase {
  constructor(condition, body) {
    Object.assign(this, { condition, body })
  }
}

export class WhileStatement {
  constructor(condition, body) {
    Object.assign(this, { condition, body })
  }
}

export class ForStatement {
  constructor(forArgs, body) {
    Object.assign(this, { forArgs, body })
  }
}

export class ForArgs {
  constructor(identifier, exp, condition, sliceCrement) {
    Object.assign(this, { identifier, exp, condition, sliceCrement })
  }
}

// our version of switch forces the first right case to end the statement,
// so no need for break
export class SwitchStatement {
  constructor(expression, cases, defaultCase) {
    Object.assign(this, { expression, cases, defaultCase })
  }
}

export class LemonCase {
  constructor(caseExp, statements) {
    Object.assign(this, { caseExp, statements })
  }
}

export class PrintStatement {
  constructor(argument) {
    this.argument = argument
  }
}

// move to exp
export class TypeOfOperator {
  constructor(argument) {
    this.argument = argument
  }
}

export class ReturnStatement {
  constructor(returnValue) {
    this.returnValue = returnValue
  }
}

export class ShortReturnStatement {
  constructor(returnValue) {
    this.returnValue = Type.VOID
  }
}

export class BinaryExp {
  constructor(left, op, right) {
    Object.assign(this, { left, op, right })
  }
}

export class UnaryExpression {
  constructor(op, operand, isprefix) {
    Object.assign(this, { op, operand, isprefix })
  }
}

// Created during semantic analysis only!
export class Variable {
  constructor(name, con, type) {
    Object.assign(this, { name, con, type })
  }
}

export class ArrayType extends Type {
  constructor(memberType) {
    let memberName = getObjName(memberType)
    super(`${memberName}[]`)
    Object.assign(this, { memberType })
  }

  isEquivalentTo(target) {
    if (target === Type.EMPTY_ARRAY || this === Type.EMPTY_ARRAY) {
      return true
    }
    return (
      target.constructor === ArrayType &&
      this.memberType.isEquivalentTo(target.memberType)
    )
  }
}

export class ObjType extends Type {
  constructor(keyType, valueType) {
    let keyName = getObjName(keyType)
    let valueName = getObjName(valueType)
    super(`<${keyName}, ${valueName}>`)
    Object.assign(this, { keyType, valueType })
  }
  isEquivalentTo(target) {
    if (target === Type.EMPTY_OBJECT || this === Type.EMPTY_OBJECT) {
      return true
    }
    return (
      target.constructor === ObjType &&
      this.keyType.isEquivalentTo(target.keyType) &&
      this.valueType.isEquivalentTo(target.valueType)
    )
  }
}

function getObjName(type) {
  if (type.constructor === ObjType) {
    let keyName = getObjName(type.keyType)
    let valueName = getObjName(type.valueType)
    return `<${keyName}, ${valueName}>`
  } else if (type.constructor === ArrayType) {
    return getObjName(type.memberType) + "[]"
  } else if (type.constructor === Type) {
    return type.name
  } else {
    return type
  }
}

export class ArrayLit {
  constructor(elements) {
    Object.assign(this, { elements })
  }
}

export class ObjLit {
  constructor(keyValuePairs) {
    Object.assign(this, { keyValuePairs })
  }
}

export class ObjPair {
  constructor(key, value) {
    Object.assign(this, { key, value })
  }
}

export class MemberExpression {
  constructor(array, index) {
    Object.assign(this, { array, index })
  }
}

export class PropertyExpression {
  constructor(object, field) {
    Object.assign(this, { object, field })
  }
}

export class Continue {}

export class Break {}

export class IdentifierExpression {
  constructor(name) {
    this.name = name
  }
}

// Stolen from Dr Toal, thanks!
function prettied(node) {
  // Return a compact and pretty string representation of the node graph,
  // taking care of cycles. Written here from scratch because the built-in
  // inspect function, while nice, isn't nice enough.
  const tags = new Map()

  function tag(node) {
    if (tags.has(node) || typeof node !== "object" || node === null) return
    tags.set(node, tags.size + 1)
    for (const child of Object.values(node)) {
      Array.isArray(child) ? child.forEach(tag) : tag(child)
    }
  }

  function* lines() {
    function view(e) {
      if (tags.has(e)) return `#${tags.get(e)}`
      if (Array.isArray(e)) return `[${e.map(view)}]`
      return util.inspect(e)
    }
    for (let [node, id] of [...tags.entries()].sort((a, b) => a[1] - b[1])) {
      let [type, props] = [node.constructor.name, ""]
      Object.entries(node).forEach(([k, v]) => (props += ` ${k}=${view(v)}`))
      yield `${String(id).padStart(4, " ")} | ${type}${props}`
    }
  }

  tag(node)
  return [...lines()].join("\n")
}
