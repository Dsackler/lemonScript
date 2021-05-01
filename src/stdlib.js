import { Type, FunctionType, Variable, Function, ArrayType } from "./ast.js"

function makeFunction(name, type) {
  return Object.assign(new Function(name), { type })
}

export const types = {
  slice: Type.INT,
  dontUseMeForEyeDrops: Type.FLOAT,
  taste: Type.BOOLEAN,
  pulp: Type.STRING,
  noLemon: Type.VOID,
  any: Type.ANY,
}

export const functions = {
  pour: makeFunction("pour", new FunctionType([Type.ANY], Type.VOID)),
  species: makeFunction("species", new FunctionType([Type.ANY], Type.STRING)),
}
