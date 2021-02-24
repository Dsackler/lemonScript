export class Program {
    constructor(imps, statements) {
        Object.assign(this, {imps, statements})
    }
}

export class Import {
    constructor(imp, location) {
        Object.assign(this, {imp, location})
    }
}

export class VariableDecInit {
    constructor(type, variable, init ) {
        Object.assign(this, {type, variable, init})
    }
}

export class VariableDec {
    constructor(type, variable) {
        Object.assign(this, {type, variable})
    }
}

export class Assignment {
    constructor(target, source) {
        Object.assign(this, {target, source})
    }
}

export class ClassDec {
    constructor(name, isExt, ext, classBody) {
        Object.assign(this, {name, isExt, ext, classBody})
    }
}

export class ClassBody {
    constructor(constructor, statements) {
        Object.assign(this, {constructor, statements})
    }
}

export class Constructor {
    constructor(parameters, body) {
        Object.assign(this, {parameters, body})
    }
}

export class FunctionDec {
    constructor(name, stat, returnType, params, body) {
        Object.assign(this, {name, stat, returnType, params, body})
    }
}

export class Call {
    constructor(callee, args) {
      Object.assign(this, { callee, args })
    }
}

export class IfStatement {
    constructor(condition, body, alternates, elseBlock) {
        Object.assign(this, {condition, body, alternates, elseBlock})
    }
}
export class ElseIfStatement {
    constructor(condition, body) {
        Object.assign(this, {condition, body})
    }
}

export class WhileStatement {
    constructor(condition, body) {
        Object.assign(this, {condition, body})
    }
}

export class ForStatement {
    constructor(forArgs, body) {
        Object.assign(this, {forArgs, body})
    }
}

export class ForArgs {
    constructor(variable, exp, condition, sliceCrement) {
        Object.assign(this, {variable, exp, condition, sliceCrement})
    }
}

export class SwitchStatement {
    constructor(expression, cases, defaultCase) {
      Object.assign(this, { expression, cases, defaultCase});
    }
}

export class LemonCase {
    constructor(caseExp, statements) {
      Object.assign(this, { caseExp, statements });
    }
}

export class PrintStatement {
    constructor(argument) {
        this.argument = argument
    }
}

export class typeOfStatement {
    constructor(argument) {
        this.argument = argument
    }
}

export class ReturnStatement {
    constructor(returnValue) {
      this.returnValue = returnValue
    }
}

export class BinaryExp {
    constructor(left, op, right) {
        Object.assign(this, {left, op, right})
    }
}

export class UnaryExpression {
    constructor(op, operand, isprefix) {
      Object.assign(this, { op, operand, isprefix })
    }
}

export class ArrayType {
    constructor(memberType) {
      Object.assign(this, {memberType})
    }
}

export class ObjType {
    constructor(keyType, valueType) {
      Object.assign(this, {keyType, valueType})
    }
}

export class ArrayLit {
    constructor(elements) {
      Object.assign(this, {elements})
    }
}

export class ObjLit {
    constructor(keyValuePairs) {
      Object.assign(this, {keyValuePairs})
    }
}

export class ObjPair {
    constructor(key, value) {
      Object.assign(this, {key, value})
    }
}

export class MemberExpression {
    constructor(vari, index) {
        Object.assign(this, {vari, index})
    }
}

export class PropertyExpression {
    constructor(var1, var2) {
        Object.assign(this, {var1, var2})
    }
}


export class Continue {}

export class Break {}

export class IdentifierExpression{
    constructor(name) {
        this.name = name
    }
}
