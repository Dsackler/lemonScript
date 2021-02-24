

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

export class Parameters {
    constructor(type, name) {
        Object.assign(this, {type, name})
    }
}

export class ForStatement {
    constructor(iterator, condition, body) {
        Object.assign(this, {iterator, condition, body})
    }
}

export class Continue {}

export class Assignment {
    constructor(target, source) {
        Object.assign(this, {target, source})
    }
}

export class WhileStatement {
    constructor(condition, body) {
        Object.assign(this, {condition, body})
    }
}

export class BinaryExp {
    constructor(left, op, right) {
        Object.assign(this, {left, op, right})
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

export class Call {
    constructor(callee, args) {
      Object.assign(this, { callee, args })
    }
}

export class IfStatement {
    constructor(condition, body, alternate) {
        Object.assign(this, {condition, body, alternate})
      }
}

export class VariableDec {
    constructor(type, variable) {
        Object.assign(this, {type, variable})
    }
}

export class SwitchStatement {
    constructor(expression, cases, defaultCase) {
      Object.assign(this, { expression, cases, defaultCase});
    }
}

export class VariableDecInit {
    constructor(type, variable, init ) {
        Object.assign(this, {type, variable, init})
    }
}

export class Break {}

export class UnaryExpression {
    constructor(op, operand, isprefix) {
      Object.assign(this, { op, operand, isprefix })
    }
}

export class IdentifierExpression{
    constructor(name) {
        this.name = name
    }
}
