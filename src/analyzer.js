import {
  Variable,
  Type,
  FunctionType,
  Function,
  ArrayType,
  ObjType,
} from "./ast.js"
import * as stdlib from "./stdlib.js"

function must(condition, errorMessage) {
  if (!condition) {
    throw new Error(errorMessage)
  }
}

const check = self => ({
  isNumeric() {
    must(
      [Type.INT, Type.FLOAT].includes(self.type),
      `Expected a number, found ${self.type.name}`
    )
  },
  isNumericOrString() {
    must(
      [Type.INT, Type.FLOAT, Type.STRING].includes(self.type),
      `Expected a number or string, found ${self.type.name}`
    )
  },
  isBoolean() {
    must(self.type === Type.BOOLEAN, `Expected a boolean, found ${self.type.name}`)
  },
  isInteger() {
    must(self.type === Type.INT, `Expected an integer, found ${self.type.name}`)
  },
  // isAType() {
  //   must([Type, StructDeclaration].includes(self.constructor), "Type expected")
  // },
  isAnArray() {
    must(self.type.constructor === ArrayType, "Array expected")
  },
  isDict() {
    must(self.type.constructor === ObjType, "Dictionary expected")
  },
  hasSameTypeAs(other) {
    must(self.type.isEquivalentTo(other.type), "Operands do not have the same type")
  },
  allHaveSameType() {
    must(
      self.slice(1).every(e => e.type.isEquivalentTo(self[0].type)),
      "Not all elements have the same type"
    )
  },
  allCasesHaveSameType(cases) {
    must(
      cases.every(c => c.caseExp.type.isEquivalentTo(this.type)),
      "Not all cases have the same type as the expression passed in"
    )
  },
  isAssignableTo(type) {

    must(
      type === Type.ANY || self.type.isAssignableTo(type),
      `Cannot assign a ${self.type.name} to a ${type.name}`
    )
  },
  isNotAConstant() {
    must(!self.con, `Cannot assign to constant ${self.name}`)
  },
  areAllDistinct() {
    must(new Set(self.map(f => f.name)).size === self.length, "Keys must be distinct")
  },
  // isInTheDictionary(dict) {
  //   must(dict.type.fields.map(f => f.name).includes(self), "No such key exists")
  // },
  isInsideALoop() {
    must(self.inLoop, "Break can only appear in a loop")
  },
  isInsideAFunction(context) {
    must(self.function, "Return can only appear in a function")
  },
  isCallable() {
    must(
      self.type.constructor == FunctionType,
      "Call of non-function"
    )
  },
  returnsNothing() {
    must(self.type.returnTypes.isEquivalentTo( Type.VOID), "Cannot return a value here")
  },
  returnsSomething() {
    must(!self.type.returnTypes.isEquivalentTo( Type.VOID), " Something should be returned here")
  },
  isReturnableFrom(f) {

    check(self).isAssignableTo(f.type.returnTypes)
  },
  match(targetTypes) {
    // self is the array of arguments
    must(
      targetTypes.length === self.length,
      `${targetTypes.length} argument(s) required but ${self.length} passed`
    )
    targetTypes.forEach((type, i) => check(self[i]).isAssignableTo(type))
  },
  matchParametersOf(calleeType) {
    check(self).match(calleeType.parameterTypes)
  },
  allSameKeyTypes() {
    must(
      self.slice(1).every(pair => pair.key.type.isEquivalentTo(self[0].key.type)),
    )
  },
  allSameValueTypes() {
    must(
      self.slice(1).every(pair => pair.value.type.isEquivalentTo(self[0].value.type)),
    )
  },
})

class Context {
  constructor(parent = null, configuration = {}) {
    // Parent (enclosing scope) for static scope analysis
    this.parent = parent
    // All local declarations. Names map to variable declarations, types, and
    // function declarations
    this.locals = new Map()
    // Whether we are in a loop, so that we know whether breaks and continues
    // are legal here
    this.inLoop = configuration.inLoop ?? parent?.inLoop ?? false
    // Whether we are in a function, so that we know whether a return
    // statement can appear here, and if so, how we typecheck it
    this.function = configuration.function ?? parent?.function ?? null
  }
  sees(name) {
    // Search "outward" through enclosing scopes
    return this.locals.has(name) || this.parent?.sees(name)
  }
  isWithinScope(name) {
    // Search "outward" through enclosing scopes
    return this.locals.has(name)
  }
  add(name, entity) {
    // No shadowing! Prevent addition if id anywhere in scope chain!
    if (this.isWithinScope(name)) {
      throw new Error(`Identifier ${name} already declared`)
    }
    this.locals.set(name, entity)
  }
  lookup(name) {
    const entity = this.locals.get(name)
    if (entity) {
      return entity
    } else if (this.parent) {
      return this.parent.lookup(name)
    }
    throw new Error(`Identifier ${name} not declared`)
  }
  newChild(configuration = {}) {
    // Create new (nested) context, which is just like the current context
    // except that certain fields can be overridden
    return new Context(this, configuration)
  }
  analyze(node) {
    return this[node.constructor.name](node)
  }
  // maybe remove imports...
  Program(p) {
    p.statements = this.analyze(p.statements)
    return p
  }
  VariableDecInit(d) {
    // Declarations generate brand new variable objects
    d.init = this.analyze(d.init)
    d.type = this.analyze(d.type)
    let type = d.type.constructor === String ? d.type : d.type.name
    if(!this.sees(type)){
      this.add(d.type.name, d.type)
    }
    d.variable = new Variable(d.variable.name, d.con, this.lookup(type))
    check(d.variable).hasSameTypeAs(d.init)
    this.add(d.variable.name, d.variable)
    return d
  }
  VariableDec(d) {
    // Declarations generate brand new variable objects
    let type = d.type.constructor === String ? d.type : d.type.name
    if(!this.sees(type)){
      this.add(d.type.name, d.type)
    }
    d.variable = new Variable(d.identifier, d.con, this.lookup(type))
    this.add(d.variable.name, d.variable)
    return d
  }
  Assignment(s) {
    s.source = this.analyze(s.source)
    s.target = this.analyze(s.target)

    
    check(s.source).isAssignableTo(s.target.type)
    check(s.target).isNotAConstant()
    return s
  }
  FunctionDec(d) {
    d.returnTypes =  this.analyze(d.returnTypes) 
    if(d.returnTypes.constructor === String){
      d.returnTypes = this.locals.get(d.returnTypes)
    }
    // Declarations generate brand new function objects
    const f = (d.function = new Function(d.name.name))
    console.log(f)
    // When entering a function body, we must reset the inLoop setting,
    // because it is possible to declare a function inside a loop!
    const childContext = this.newChild({ inLoop: false, function: f })
    d.params = childContext.analyze(d.params)
    console.log(d.params)
    f.type = new FunctionType(
      d.params.map(p => p.type),
      d.returnTypes
    )



    // Add before analyzing the body to allow recursion
    this.add(f.name, f)
    d.body = childContext.analyze(d.body)
    return d
  }
  FunctionType(t) {
    t.paramTypes = this.analyze(t.paramTypes)
    t.returnTypes = this.analyze(t.returnTypes)
    return t
  }

  Call(c) {
    c.callee = this.analyze(c.callee)
    check(c.callee).isCallable()
    c.args = this.analyze(c.args)
    check(c.args).matchParametersOf(c.callee.type)
    c.type = c.callee.type.returnTypes
    return c
  }
  IfStatement(s) {
    s.cases.map(c => this.analyze(c))
    s.elseBlock = this.newChild().analyze(s.elseBlock)
    return s
  }
  IfCase(s) {
    s.condition = this.analyze(s.condition)
    check(s.condition).isBoolean()
    s.body = this.newChild().analyze(s.body)
    return s
  }
  WhileStatement(s) {
    s.condition = this.analyze(s.condition)
    check(s.condition).isBoolean()
    s.body = this.newChild({ inLoop: true }).analyze(s.body)
    return s
  }
  ForStatement(s) {
    s.forArgs = this.analyze(s.forArgs)
    s.body = this.newChild({ inLoop: true }).analyze(s.body)
    return s
  }
  forArgs(s) {
    s.exp = this.analyze(s.exp)
    s.variable = new Variable(s.name, false, Type.INT)
    check(s.variable).hasSameTypeAs(s.init)

    s.condition = this.analyze(s.condition)
    check(s.condition).isBoolean()
    this.add(s.variable.name, s.variable)

    // maybe wrong?
    s.sliceCrement = this.analyze(s.sliceCrement)

    return s
  }
  SwitchStatement(s){
    s.expression = this.analyze(s.expression)
    s.cases.map(c => this.analyze(c))
    check(s.expression).allCasesHaveSameType(s.cases)
    s.defaultCase = this.analyze(s.defaultCase)
    return s
  }
  LemonCase(s){
    s.caseExp = this.analyze(s.caseExp)
    s.statements = this.newChild().analyze(s.statements)
    return s
  }

  PrintStatement(p) {
    p.argument = this.analyze(p.argument)
    return p
  }

  typeOfStatement(p) {
    p.argument = this.analyze(p.argument)
    return p
  }

  ReturnStatement(s) {
    check(this).isInsideAFunction()
    check(this.function).returnsSomething()

    s.returnValue = this.analyze(s.returnValue)
    check(s.returnValue).isReturnableFrom(this.function)
    return s
  }

  ShortReturnStatement(s) {
    check(this).isInsideAFunction()
    check(this.function).returnsNothing()
    return s
  }

  BinaryExp(e) {
    e.left = this.analyze(e.left)
    e.right = this.analyze(e.right)
    if (["&&", "||"].includes(e.op)) {
      check(e.left).isBoolean()
      check(e.right).isBoolean()
      e.type = Type.BOOLEAN
    } else if (["+", "+="].includes(e.op)) {
      check(e.left).isNumericOrString()
      check(e.left).hasSameTypeAs(e.right)
      e.type = e.left.type
    } else if (["-", "*", "/", "%", "^", "-="].includes(e.op)) {
      check(e.left).isNumeric()
      check(e.left).hasSameTypeAs(e.right)
      e.type = e.left.type
    } else if (["<", "<=", ">", ">="].includes(e.op)) {
      check(e.left).isNumericOrString()
      check(e.left).hasSameTypeAs(e.right)
      e.type = Type.BOOLEAN
    } else if (["==", "!="].includes(e.op)) {
      check(e.left).hasSameTypeAs(e.right)
      e.type = Type.BOOLEAN
    }
    return e
  }
  UnaryExpression(e) {
    e.operand = this.analyze(e.operand)
    check(e.operand).isNumeric()
    e.type = e.operand.type
    return e
  }

  ArrayType(t) {
    t.memberType = this.analyze(t.memberType)
    let type = t.memberType.constructor === String ? t.memberType : t.memberType.name
    if(!this.sees(type)){
      this.add(t.memberType.name, t.memberType)
    }
    t.memberType = this.lookup(type)
    return t
  }

  ObjType(t) {
    t.keyType = this.analyze(t.keyType)
    let keyType = t.keyType.constructor === String ? t.keyType : t.keyType.name
    if(!this.sees(keyType)){
      this.add(t.keyType.name, t.keyType)
    }
    t.keyType = this.lookup(keyType)

    t.valueType = this.analyze(t.valueType)
    let valueType = t.valueType.constructor === String ? t.valueType : t.valueType.name
    if(!this.sees(valueType)){
      this.add(t.valueType.name, t.valueType)
    }
    t.valueType = this.lookup(valueType)
    return t
  }

  ArrayLit(a) {

    //Check if the literal is empty, then we keep the type it came with. 
    // If a.type is undefined we could just assign it to TYPE.any
    a.elements = this.analyze(a.elements)
    if(a.elements.length  > 0)
    {
      check(a.elements).allHaveSameType()
      a.type = new ArrayType(a.elements[0].type)
    }else{
      a.type = Type.EMPTY_ARRAY
    }
    return a
  
  }

  ObjLit(a) {

    if(a.keyValuePairs.length > 0 ) {
      a.keyValuePairs = this.analyze(a.keyValuePairs)
      check(a.keyValuePairs).allSameKeyTypes()
      check(a.keyValuePairs).allSameValueTypes()
      a.type = new ObjType(a.keyValuePairs[0].key.type, a.keyValuePairs[0].value.type)
    }else{
      a.type = Type.EMPTY_OBJECT
    }

    return a
  }

  ObjPair(p) {
    p.key = this.analyze(p.key)
    p.value = this.analyze(p.value)
    return p
  }

  MemberExpression(e) {
    e.vari = this.analyze(e.vari)
    e.type = e.vari.type.memberType
    e.index = this.analyze(e.index)
    check(e.index).isInteger()
    return e
  }

  PropertyExpression(e) {
    e.var1 = this.analyze(e.var1)
    check(e.var1).isDict()
    e.var2 = this.analyze(e.var2)
    e.var1.type.keyType.isEquivalentTo(e.var2.type)
    e.type = e.var1.type.valueType
    return e
  }
  Continue(s) {
    check(this).isInsideALoop()
    return s
  }
  Break(s) {
    check(this).isInsideALoop()
    return s
  }

  IdentifierExpression(e) {
    // Id expressions get "replaced" with the variables they refer to
    return this.lookup(e.name)
  }
  Bool(b){
   // console.log(this.locals)
    b.type = this.lookup(b.type)
    //console.log(b)
    return b
  }
  // TypeId(t) {
  //   t = this.lookup(t.name)
  //   check(t).isAType()
  //   return t
  // }
  Number(e) {
    return e
  }
  BigInt(e) {
    return e
  }
  Boolean(e) {
    return e
  }
  String(e) {
    return e
  }
  Array(a) {
    return a.map(item => this.analyze(item))
  }
  Object(a) {
    let newObj = {}
    for(const [key,value] of Object.entries(a)) {
      newObj[this.analyze(key)] = this.analyze(value)
    }
   return newObj
  }
}

export default function analyze(node) {
  // Allow primitives to be automatically typed
  Number.prototype.type = Type.FLOAT
  BigInt.prototype.type = Type.INT
  Boolean.prototype.type = Type.BOOLEAN
  String.prototype.type = Type.STRING
  Type.prototype.type = Type.TYPE
  const initialContext = new Context()

  // Add in all the predefined identifiers from the stdlib module
  const library = { ...stdlib.types, ...stdlib.functions }
  for (const [name, type] of Object.entries(library)) {
    initialContext.add(name, type)
  }
  return initialContext.analyze(node)
}
