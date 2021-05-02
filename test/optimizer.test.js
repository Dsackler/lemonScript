import assert from "assert"
import optimize from "../src/optimizer.js"
import * as ast from "../src/ast.js"

// Make some test cases easier to read
const x = new ast.Variable("x", false)
const y = new ast.Variable("y", false)
const z = new ast.Variable("z", false)
const i = new ast.Variable("i", false)
const iIden = new ast.IdentifierExpression("i")
const sweet = new ast.Bool("sweet", true, "taste")
const sour = new ast.Bool("sour", false, "taste")
const xpp = new ast.UnaryExpression("++", x, false)
const xmm = new ast.UnaryExpression("--", x, false)
const return1p1 = new ast.ReturnStatement(new ast.BinaryExp(1, "+", 1))
const return2 = new ast.ReturnStatement(2)
const returnShort = new ast.ShortReturnStatement()


const onePlusTwo = new ast.BinaryExp(1, "+", 2)
const intFun = body => new ast.FunctionDec("f", ast.Type.INT, [], body)
const switch1p2 = (...cases) => new ast.SwitchStatement(onePlusTwo, cases, return1p1)
const switch3 = (...cases) => new ast.SwitchStatement(3, cases, return2)
const ifStatements = (...ifcases) => new ast.IfStatement(ifcases, [])
const ifStatementsXmm = (...ifcases) => new ast.IfStatement(ifcases, xmm)
const ifCase = exp => new ast.IfCase(exp, [])
const program = (...statements) => new ast.Program(statements)

const or = (...d) => d.reduce((x, y) => new ast.BinaryExp(x, "||", y))
const and = (...c) => c.reduce((x, y) => new ast.BinaryExp(x, "&&", y))
const less = (x, y) => new ast.BinaryExp(x, "<", y)
const eq = (x, y) => new ast.BinaryExp(x, "==", y)
const neg = x => new ast.UnaryExpression("-", x, true)
const array = (...elements) => new ast.ArrayLit(elements)
const obj = (...keyValuePairs) => new ast.ObjLit(keyValuePairs)
const objPair = (key, value) => new ast.ObjPair(key, value)

// nounrolling
const forArgs = new ast.ForArgs(iIden, 0, new ast.BinaryExp(10, ">=", i), new ast.BinaryExp(i, "+=", 2))
const forShort = new ast.ForStatement(forArgs, [new ast.Continue()])

const forArgsOptimized = new ast.ForArgs(iIden, 0, new ast.BinaryExp(10, ">=", i), new ast.Assignment(i, new ast.BinaryExp(i, "+", 2)))
const forShortOptimized = new ast.ForStatement(forArgsOptimized, [new ast.Continue()])

const forArgs2 = new ast.ForArgs(iIden, 0, new ast.BinaryExp(10, ">=", i), new ast.BinaryExp(i, "-=", 2))
const forShort2 = new ast.ForStatement(forArgs2, [new ast.Break()])

const forArgsOptimized2 = new ast.ForArgs(iIden, 0, new ast.BinaryExp(10, ">=", i), new ast.Assignment(i, new ast.BinaryExp(i, "-", 2)))
const forShortOptimized2 = new ast.ForStatement(forArgsOptimized2, [new ast.Break()])

const forArgspp = new ast.ForArgs(iIden, 0, new ast.BinaryExp(i, "<", 3), new ast.UnaryExpression("++", i, false))
const forArgsmm = new ast.ForArgs(iIden, 3, new ast.BinaryExp(i, ">", 0), new ast.UnaryExpression("--", i, false))
const forWhile = new ast.ForStatement(forArgspp, [new ast.WhileStatement(sweet, [])])
const forUnary = new ast.ForStatement(forArgspp, [new ast.UnaryExpression("++", i, false)])
const forAssignment = new ast.ForStatement(forArgspp, [new ast.Assignment(i, 1)])

// unrolling
// print and typeof
const forShortPrint = new ast.ForStatement(forArgspp, [new ast.PrintStatement(i), new ast.PrintStatement(new ast.BinaryExp(i, "+", 1))])
const forShortTypeOf = new ast.ForStatement(forArgsmm, [new ast.TypeOfOperator(i)])
const loopUnrollingShortPrint = [new ast.PrintStatement(0), new ast.PrintStatement(1), new ast.PrintStatement(1), new ast.PrintStatement(2), new ast.PrintStatement(2), new ast.PrintStatement(3)]
const loopUnrollingShorttypeOf = [new ast.TypeOfOperator(3), new ast.TypeOfOperator(2), new ast.TypeOfOperator(1)]

// with arrays and objects
const forShortwArrObjBody = [new ast.VariableDecInit("slice[]", x, new ast.ArrayLit([1,2,i])), new ast.VariableDecInit("<slice, slice>", y, new ast.ObjLit([new ast.ObjPair(1,i)])), new ast.Assignment(z, i)]
const forShortwArrObj = new ast.ForStatement(forArgspp, forShortwArrObjBody)
const forShortwArrObjOptimized = [
  new ast.VariableDecInit("slice[]", x, new ast.ArrayLit([1,2,0])), new ast.VariableDecInit("<slice, slice>", y, new ast.ObjLit([new ast.ObjPair(1,0)])), new ast.Assignment(z, 0),
  new ast.VariableDecInit("slice[]", x, new ast.ArrayLit([1,2,1])), new ast.VariableDecInit("<slice, slice>", y, new ast.ObjLit([new ast.ObjPair(1,1)])), new ast.Assignment(z, 1),
  new ast.VariableDecInit("slice[]", x, new ast.ArrayLit([1,2,2])), new ast.VariableDecInit("<slice, slice>", y, new ast.ObjLit([new ast.ObjPair(1,2)])), new ast.Assignment(z, 2),
]

// calls and unary
const forShortBodyCall = [new ast.Call("f", [new ast.UnaryExpression("-",i,true)])]
const forShortCall = new ast.ForStatement(forArgspp, forShortBodyCall)
const forShortCallOptimized = [new ast.Call("f", [-0]),new ast.Call("f", [-1]),new ast.Call("f", [-2])]


const tests = [
  ["folds +", new ast.BinaryExp(5, "+", 8), 13],
  ["folds -", new ast.BinaryExp(5n, "-", 8n), -3n],
  ["folds *", new ast.BinaryExp(5, "*", 8), 40],
  ["folds /", new ast.BinaryExp(5, "/", 8), 0.625],
  ["folds **", new ast.BinaryExp(5, "^", 8), 390625],
  ["folds %", new ast.BinaryExp(3, "%", 2), 1],
  ["folds <", new ast.BinaryExp(5, "<", 8), sweet],
  ["folds <=", new ast.BinaryExp(5, "<=", 8), sweet],
  ["folds ==", new ast.BinaryExp(5, "==", 8), sour],
  ["folds !=", new ast.BinaryExp(5, "!=", 8), sweet],
  ["folds >=", new ast.BinaryExp(5, ">=", 8), sour],
  ["folds >", new ast.BinaryExp(5, ">", 8), sour],
  ["optimizes strings", new ast.BinaryExp("1", "+", "2"), "12"],
  ["optimizes +0", new ast.BinaryExp(x, "+", 0), x],
  ["optimizes -0", new ast.BinaryExp(x, "-", 0), x],
  ["optimizes *1", new ast.BinaryExp(x, "*", 1), x],
  ["optimizes /1", new ast.BinaryExp(x, "/", 1), x],
  ["optimizes *0", new ast.BinaryExp(x, "*", 0), 0],
  ["optimizes 0*", new ast.BinaryExp(0, "*", x), 0],
  ["optimizes 0/", new ast.BinaryExp(0, "/", x), 0],
  ["optimizes 0+", new ast.BinaryExp(0, "+", x), x],
  ["optimizes 0-", new ast.BinaryExp(0, "-", x), neg(x)],
  ["optimizes 1*", new ast.BinaryExp(1, "*", x), x],
  ["optimizes 1^", new ast.BinaryExp(1, "^", x), 1],
  ["optimizes ^0", new ast.BinaryExp(x, "^", 0), 1],
  ["folds negation", new ast.UnaryExpression("-", 8, true), -8],
  ["folds bang (!)", new ast.UnaryExpression("!", sour, false), sweet],
  ["removes left false from ||", or(sour, less(x, 1)), less(x, 1)],
  ["removes right false from ||", or(less(x, 1), sour), less(x, 1)],
  ["removes left true from &&", and(sweet, less(x, 1)), less(x, 1)],
  ["removes right true from &&", and(less(x, 1), sweet), less(x, 1)],
  ["removes x=x at beginning", [new ast.Assignment(x, x), xpp], [xpp]],
  ["removes x=x at end", [xpp, new ast.Assignment(x, x)], [xpp]],
  ["removes x=x in middle", [xpp, new ast.Assignment(x, x), xpp], [xpp, xpp]],
  ["optimizes if-true", new ast.IfStatement([new ast.IfCase(sweet, xpp)], []), xpp],
  ["optimizes if-false", new ast.IfStatement([new ast.IfCase(sour, xpp)], xmm), xmm],
  [
    "applies if-false after folding",
    new ast.IfStatement([new ast.IfCase(eq(1, 1), xpp)], []),
    xpp,
  ],
  [
    "optimizes else if-false",
    ifStatements(ifCase(x), ifCase(sour), new ast.IfCase(sweet, xmm), ifCase(x)),
    ifStatementsXmm(ifCase(x)),
  ],
  [
    "optimizes else if-true",
    ifStatements(ifCase(x), ifCase(x), new ast.IfCase(sweet, xmm), ifCase(x)),
    ifStatementsXmm(ifCase(x), ifCase(x)),
  ],
  ["optimizes while-false", new ast.WhileStatement(sour, xpp), []],
  [
    "optimizes while-true",
    new ast.WhileStatement(x, new ast.Assignment(x, onePlusTwo)),
    new ast.WhileStatement(x, new ast.Assignment(x, 3)),
  ],
  [
    "optimizes in switch",
    switch1p2(new ast.LemonCase(onePlusTwo, new ast.Break())),
    switch3(new ast.LemonCase(3, new ast.Break())),
  ],
  ["optimizes in functions", intFun(return1p1), intFun(return2)],
  [
    "optimizes in functions with short return (shouldn't change)",
    intFun(returnShort),
    intFun(returnShort),
  ],
  ["optimizes in array literals", array(0, onePlusTwo, 9), array(0, 3, 9)],
  ["optimizes in object literals", obj(objPair(1, onePlusTwo)), obj(objPair(1, 3))],
  [
    "optimizes in Member Expression (should not change)",
    new ast.MemberExpression(x, 1),
    new ast.MemberExpression(x, 1),
  ],
  [
    "optimizes in Property Expression (should not change)",
    new ast.PropertyExpression(x, x),
    new ast.PropertyExpression(x, x),
  ],
  [
    "optimizes in print statement",
    new ast.PrintStatement(onePlusTwo),
    new ast.PrintStatement(3),
  ],
  [
    "optimizes in typeof statement",
    new ast.TypeOfOperator(onePlusTwo),
    new ast.TypeOfOperator(3),
  ],
  ["optimizes in call statement", new ast.Call("f", onePlusTwo), new ast.Call("f", 3)],
  [
    "optimizes nothing in variable declaration (shouldn't change)",
    new ast.VariableDec(ast.Type.INT, "y"),
    new ast.VariableDec(ast.Type.INT, "y"),
  ],
  [
    "optimizes nothing in function type (shouldn't change)",
    new ast.Function("y"),
    new ast.Function("y"),
  ],
  [
    "optimizes in initializing a variable",
    new ast.VariableDecInit(ast.Type.BOOLEAN, "y", and(sour, sweet)),
    new ast.VariableDecInit(ast.Type.BOOLEAN, "y", sour),
  ],
  [
    "optimizes in programs",
    program(new ast.VariableDecInit(ast.Type.BOOLEAN, "y", and(sour, sweet))),
    program(new ast.VariableDecInit(ast.Type.BOOLEAN, "y", sour)),
  ],
  [
    "optimizes in simple for without unrolling using += in sliceCrement",
    forShort,
    forShortOptimized
  ],
  [
    "optimizes in simple for without unrolling using -= in sliceCrement",
    forShort2,
    forShortOptimized2
  ],
  [
    "optimizes in simple for without unrolling with while",
    forWhile,
    forWhile
  ],
  [
    "optimizes in simple for without unrolling with unary",
    forUnary,
    forUnary
  ],
  [
    "optimizes in simple for without unrolling with Assignment",
    forAssignment,
    forAssignment
  ],
  [
    "optimizes in simple for print",
    forShortPrint,
    loopUnrollingShortPrint
  ],
  [
    "optimizes in simple for typeOf",
    forShortTypeOf,
    loopUnrollingShorttypeOf
  ],
  [
    "optimizes in simple for with arrays and dictionaries",
    forShortwArrObj,
    forShortwArrObjOptimized
  ],
  [
    "optimizes in simple for with calls and unary exps",
    forShortCall,
    forShortCallOptimized
  ],
]

describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepEqual(optimize(before), after)
    })
  }
})
