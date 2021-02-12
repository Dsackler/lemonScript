import assert from "assert"

export class Program {
    constructor(imp, statements) {
        Object.assign(this, {imp, statements})
    }
}

export class ClassDeclaration {
    constructor(name, body) {
        Object.assign(this, {name, body}) 
    }
}

export class FuncDeclaration {
    constructor(name, params, body) {
        Object.assign(this, {name, params, body})
    }
}

export class Parameters {
    constructor(type, name) {
        Object.assign(this, {type, name})
    }
}

