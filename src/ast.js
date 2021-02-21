

export class Program {
    constructor(imp, statements) {
        Object.assign(this, {imp, statements})
    }
}

export class ClassDec {
    constructor(name, body) {
        Object.assign(this, {name, body}) 
    }
}

export class FunctionDec {
    constructor(name, params, body) {
        Object.assign(this, {name, params, body})
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

export class PrintStatement {
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
    constructor(condition, body) {
        Object.assign(this, { condition, body })
      }
}

export class VariableDec {
    constructor(type, variable) {
        Object.assign(this, {type, variable})
    }
}

export class VariableDecInit {
    constructor(type, variable, init ) {
        Object.assign(this, {type, variable, init})
    }
}


export class Break {}

export class UnaryExpression {
    constructor(op, operand) {
      Object.assign(this, { op, operand })
    }
}

export class IdentifierExpression{
    constructor(name) {
        this.name = name
    }
}







