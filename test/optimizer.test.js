import assert from "assert"
import optimize from "../src/optimizer.js"
import * as ast from "../src/ast.js"

// Make some test cases easier to read
const x = new ast.Variable("x", false)
const sweet = new ast.Bool("sweet", true, "taste")
const sour = new ast.Bool("sour", false, "taste")
const xpp = new ast.UnaryExpression("++", x, false)
const xmm = new ast.UnaryExpression("--", x, false)
const return1p1 = new ast.ReturnStatement(new ast.BinaryExp(1,"+",1))
const return2 = new ast.ReturnStatement(2)
const returnShort = new ast.ShortReturnStatement()
// const returnX = new ast.ReturnStatement(x)
const onePlusTwo = new ast.BinaryExp(1, "+", 2)
const intFun = body => new ast.FunctionDec("f", ast.Type.INT, [], body)
const switch1p2 = (...cases) => new ast.SwitchStatement(onePlusTwo, cases, return1p1)
const switch3 = (...cases) => new ast.SwitchStatement(3, cases, return2)
const ifStatements = (...ifcases) => new ast.IfStatement(ifcases, [])
const ifStatementsXmm = (...ifcases) => new ast.IfStatement(ifcases, xmm)
const ifCase = (exp) => new ast.IfCase(exp, [])
const program = (...statements) => new ast.Program(statements)

// const callIdentity = args => new ast.Call(identity, args)
const or = (...d) => d.reduce((x, y) => new ast.BinaryExp(x, "||", y))
const and = (...c) => c.reduce((x, y) => new ast.BinaryExp(x, "&&", y))
const less = (x, y) => new ast.BinaryExp(x, "<", y)
const eq = (x, y) => new ast.BinaryExp(x, "==", y)
// const times = (x, y) => new ast.BinaryExp("*", x, y)
const neg = x => new ast.UnaryExpression("-", x, true)
const array = (...elements) => new ast.ArrayLit(elements)
const obj = (...keyValuePairs) => new ast.ObjLit(keyValuePairs)
const objPair = (key, value) => new ast.ObjPair(key, value)

// const emptyArray = new ast.EmptyArray(ast.Type.INT)
// const sub = (a, e) => new ast.SubscriptExpression(a, e)
// const unwrapElse = (o, e) => new ast.BinaryExp("??", o, e)
// const conditional = (x, y, z) => new ast.Conditional(x, y, z)
// const emptyOptional = new ast.EmptyOptional(ast.Type.INT)
// const some = x => new ast.UnaryExpression("some", x)

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
  ["optimizes 1^", new ast.BinaryExp(1,"^", x), 1],
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
  ["applies if-false after folding", new ast.IfStatement([new ast.IfCase(eq(1,1), xpp)], []), xpp],
  ["optimizes else if-false", ifStatements(ifCase(x), ifCase(sour), new ast.IfCase(sweet, xmm), ifCase(x)), ifStatementsXmm(ifCase(x))],
  ["optimizes else if-true", ifStatements(ifCase(x), ifCase(x), new ast.IfCase(sweet, xmm), ifCase(x)), ifStatementsXmm(ifCase(x), ifCase(x))],
  ["optimizes while-false", new ast.WhileStatement(sour, xpp), []],
  ["optimizes while-true", new ast.WhileStatement(x, new ast.Assignment(x,onePlusTwo)), new ast.WhileStatement(x, new ast.Assignment(x,3))],
  ["optimizes in switch", switch1p2(new ast.LemonCase(onePlusTwo, new ast.Break())), switch3(new ast.LemonCase(3, new ast.Break()))],
  ["optimizes in functions", intFun(return1p1), intFun(return2)],
  ["optimizes in functions with short return (shouldn't change)", intFun(returnShort), intFun(returnShort)],
  ["optimizes in array literals", array(0, onePlusTwo, 9), array(0, 3, 9)],
  ["optimizes in object literals", obj(objPair(1,onePlusTwo)), obj(objPair(1,3))],
  ["optimizes in Member Expression (should not change)", new ast.MemberExpression(x,1), new ast.MemberExpression(x,1)],
  ["optimizes in Property Expression (should not change)", new ast.PropertyExpression(x,x), new ast.PropertyExpression(x,x)],
  ["optimizes in print statement", new ast.PrintStatement(onePlusTwo), new ast.PrintStatement(3)],
  ["optimizes in typeof statement", new ast.typeOfStatement(onePlusTwo), new ast.typeOfStatement(3)],
  ["optimizes in call statement", new ast.Call("f", onePlusTwo), new ast.Call("f", 3)],
  ["optimizes in variable declaration (shouldn't change)", new ast.VariableDec(ast.Type.INT, "y"), new ast.VariableDec(ast.Type.INT, "y")],
  ["optimizes in initializing a variable", new ast.VariableDecInit(ast.Type.BOOLEAN, "y", and(sour,sweet)), new ast.VariableDecInit(ast.Type.BOOLEAN, "y", sour)],
  ["optimizes in programs", program(new ast.VariableDecInit(ast.Type.BOOLEAN, "y", and(sour,sweet))), program(new ast.VariableDecInit(ast.Type.BOOLEAN, "y", sour))],




  // ["optimizes in arguments", callIdentity([times(3, 5)]), callIdentity([15])],
//   [
//     "passes through nonoptimizable constructs",
//     ...Array(2).fill([
//       new ast.Program([new ast.ShortReturnStatement()]),
//       new ast.VariableDeclaration("x", true, "z"),
//       new ast.TypeDeclaration([new ast.Field("x", ast.Type.INT)]),
//       new ast.Assignment(x, new ast.BinaryExp("*", x, "z")),
//       new ast.Assignment(x, new ast.UnaryExpression("not", x)),
//       new ast.Call(identity, new ast.MemberExpression(x, "f")),
//       new ast.VariableDeclaration("q", false, new ast.EmptyArray(ast.Type.FLOAT)),
//       new ast.VariableDeclaration("r", false, new ast.EmptyOptional(ast.Type.INT)),
//       new ast.WhileStatement(true, [new ast.BreakStatement()]),
//       new ast.RepeatStatement(5, [new ast.ReturnStatement(1)]),
//       conditional(x, 1, 2),
//       unwrapElse(some(x), 7),
//       new ast.IfStatement(x, [], []),
//       new ast.ShortIfStatement(x, []),
//       new ast.ForRangeStatement(x, 2, "..<", 5, []),
//       new ast.ForStatement(x, array(1, 2, 3), []),
//     ]),
//   ],
]

describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
        // console.log(before)
        // console.log(optimize(before))
      assert.deepEqual(optimize(before), after)
    })
  }
})
