import assert from "assert"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import * as ast from "../src/ast.js"

// Programs that are semantically correct
const semanticChecks = [
  ["variable declarations",'dontUseMeForEyeDrops x = 1.0 dontUseMeForEyeDrops y = x'],
  ["variable declarations 2", 'lemonStain slice x = 1 taste y = sour'],
  ["complex declaration", "<slice[], <pulp,taste>> x"],
  ["super complex declaration", "<<slice[], <taste, pulp>>, <pulp[][],taste>> x"],
  ["double array declaration", "slice[][] x"],
  ["double array declaration", "slice[][] x = [ [1],[2],[3,4]]"],
  ["array initialization", "slice[] x = [1,2,3]"],
  ["Dictionary initialization", "<slice, pulp> x = {1: \"hi\",2: \"bye\"}"],
  ["complex Dictionary initialization", "<slice[], <pulp,taste>> x = {[1,2]: {\"hi\": sour}, [3,4]: {\"bye\": sweet}}"],
  ["super complex initialization", "<<slice[], <taste, pulp>>, <pulp[][],taste>> x = {{[1,2]: {sour: \"hi\"}}: {[[\"cool\", \"story\"], [\"bro\"]]: sweet}}"],
  ["initialize with empty array", "slice[] a = []"],
  ["Array member initialization check", "slice[] x = [] x[0] = 2 "],
  ["initialize empty object", "<slice,pulp> basicObj = {}"],
  ["Object member initialization", "<slice,pulp> x = {}  x.key(2) = \" ImValue \" " ],
  ["complex initialization", "<slice[], <pulp,taste>> x"],
  ["complex parameters", "When life gives you lemons try noLemon f( <slice[], <pulp,taste>> x ) BEGIN JUICING  END JUICING"],
  ["increment and decrement", "slice x = 10 x-- x++ x+=2"],
  ["short return", "When life gives you lemons try noLemon helloWorld() BEGIN JUICING you get lemonade and END JUICING"],
  ["long return", "When life gives you lemons try taste tralse() BEGIN JUICING you get lemonade and sweet END JUICING"],
  ["return in nested if", "When life gives you lemons try slice retTen(slice a) BEGIN JUICING Squeeze the lemon if(a == 10) BEGIN JUICING you get lemonade and a END JUICING END JUICING"],
  ["break in nested if", "slice x = 20 Drink the lemonade while (x > 0) BEGIN JUICING Squeeze the lemon if(x == 10) BEGIN JUICING chop END JUICING x-- END JUICING"],
  ["continue in nested if", "slice x = 20 Drink the lemonade while (x > 0) BEGIN JUICING Squeeze the lemon if(x == 10) BEGIN JUICING nextLemon END JUICING x-- END JUICING"],
  ["long if", "slice x = 10 Squeeze the lemon if(x == 10) BEGIN JUICING pour(\"Number is 10\") END JUICING Toss the lemon and do BEGIN JUICING pour(\"Number is not 10 or 20\") END JUICING"],
  ["else if", "slice x = 20 Squeeze the lemon if(x == 10) BEGIN JUICING pour(\"Number is 10\") END JUICING Keep juicing if(x == 20) BEGIN JUICING pour(\"Number is 10\") END JUICING Toss the lemon and do BEGIN JUICING pour(\"Number is not 10 or 20\") END JUICING"],
  ["for with args", "forEachLemon (slice i = 0; i < 5; i++) BEGIN JUICING pour(i) END JUICING"],
  ["||", "pour(sweet||1<2||sour||3>4)"],
  ["&&", "species(sweet&&1<2&&sour&&3>4)"],
  ["relations", 'pour(10 < 20)'],
  ["arithmetic", "slice x x = 4 slice y = 2 slice z = 1 pour(x + y - - z ^ y % x / y)"],
  ["subscript exp", "slice[] arr = [1,2,3] pour(arr[1])"],
  ["property exp", "<slice, slice> dict = {1:1, 2:2} slice x = dict.key(1) pour(x)"],
  ["array parameters", "When life gives you lemons try noLemon sumOfArray( slice[] arr, slice arrLength ) BEGIN JUICING END JUICING"],
  ["function call", "When life gives you lemons try slice nothing() BEGIN JUICING you get lemonade and 1 END JUICING nothing()"],
  ["function call 2", "When life gives you lemons try slice something(slice x) BEGIN JUICING you get lemonade and x END JUICING something(2)"],
  ["initialize var to function pass", "When life gives you lemons try slice sumOfArray(slice[] a, <slice, slice>b, slice x) BEGIN JUICING you get lemonade and 1 END JUICING slice x = sumOfArray([1,2,3], {1:1, 2:2}, 2)"],
  ["while statement", "slice x = 0 Drink the lemonade while(x<2) BEGIN JUICING x+=1 END JUICING"],
  ["switch statement", "slice x = 0 Pick(x) BEGIN JUICING lemonCase 0 x=x*2 citrusLimon x=x^2 END JUICING"],
  ["break in switch statement", "slice x = 0 Pick(x) BEGIN JUICING lemonCase 0 x=x*2 chop lemonCase 1 x=x/2 citrusLimon x=x^2 END JUICING"],
]

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  ["non-int unary sliceCrement", "taste x=sour x++", /Expected a number, found taste/],
  ["non-int/string binary sliceCrement", 'taste x=sour x+=sweet', /Expected a number or string, found taste/],
  ["undeclared id", "pour(x)", /Identifier x not declared/],
  ["redeclared id", "slice x = 1 slice x = 2", /Identifier x already declared/],
  ["assign to const", "lemonStain slice x = 1 x=2", /Cannot assign to constant x/],
  ["unary increment to const", "lemonStain slice x = 1 x++", /Cannot assign to constant x/],
  ["binary increment to const", "lemonStain slice x = 1 x+=2", /Cannot assign to constant x/],
  ["unary decrement to const", "lemonStain slice x = 1 x--", /Cannot assign to constant x/],
  ["binary decrement to const", "lemonStain slice x = 1 x-=2", /Cannot assign to constant x/],
  ["assign bad type", "slice x = 1 x = sweet", /Cannot assign a taste to a slice/],
  ["assign bad array type", "slice x = 1 x = [sweet]", /Cannot assign a taste\[\] to a slice/],
  ["assign bad object type", "slice x = 1 x = {1:1}", /Cannot assign a <slice, slice> to a slice/],
  ["break outside loop", "chop", /Break can only appear in a loop/],
  [
    "break inside function",
    "Drink the lemonade while(sweet) BEGIN JUICING When life gives you lemons try noLemon helloWorld() BEGIN JUICING chop you get lemonade and END JUICING END JUICING",
    /Break can only appear in a loop/,
  ],
  ["return outside function", "you get lemonade and", /Return can only appear in a function/],
  [
    "return value from void function",
    "When life gives you lemons try noLemon helloWorld() BEGIN JUICING you get lemonade and 1 END JUICING",
    /Cannot return a value here/,
  ],
  [
    "return nothing from non-void",
    "When life gives you lemons try slice helloWorld() BEGIN JUICING you get lemonade and END JUICING",
    /Something should be returned here/,
  ],
  [
    "return type mismatch",
    "When life gives you lemons try slice helloWorld() BEGIN JUICING you get lemonade and 1.0 END JUICING",
    /Cannot assign a dontUseMeForEyeDrops to a slice/
  ],
  [
    "non-boolean short if test",
    "Squeeze the lemon if(1) BEGIN JUICING END JUICING",
    /Expected a boolean, found slice/
  ],
  [
    "non-boolean else if test",
    "Squeeze the lemon if(sweet) BEGIN JUICING END JUICING Keep juicing if(1) BEGIN JUICING END JUICING",
    /Expected a boolean, found slice/
  ],
  [
    "non-boolean while test",
    "Drink the lemonade while(1) BEGIN JUICING x+=1 END JUICING",
    /a boolean, found slice/
  ],
  [
    "non-integer for var initialization",
    "forEachLemon (slice i = sweet; i < 5; i++) BEGIN JUICING pour(i) END JUICING",
    /an integer, found taste/
  ],
  [
    "non-boolean for condition",
    "forEachLemon (slice i = 1; i; i++) BEGIN JUICING pour(i) END JUICING",
    /a boolean, found slice/
  ],
  ["bad types for ||", "pour(sweet||1)", /a boolean, found slice/],
  ["bad types for &&", "pour(sweet&&1)", /a boolean, found slice/],
  ["bad types for ==", "pour(1.0==1)", /Operands do not have the same type/],
  ["bad types for !=", "pour(sour!=1)", /Operands do not have the same type/],
  ["bad types for +", "pour(sour+1)", /number or string, found taste/],
  ["bad types for -", "pour(sweet-1)", /a number, found taste/],
  ["bad types for *", "pour(sweet*1)", /a number, found taste/],
  ["bad types for /", "pour(sweet/1)", /a number, found taste/],
  ["bad types for ^", "pour(sweet^1)", /a number, found taste/],
  ["bad types for <", "pour(sweet<1)", /number or string, found taste/],
  ["bad types for <=", "pour(sweet<=1)", /number or string, found taste/],
  ["bad types for >", "pour(sweet>1)", /number or string, found taste/],
  ["bad types for >=", "pour(sweet>=1)", /number or string, found taste/],
  ["bad types for negation", "pour(-sweet)", /a number, found taste/],
  ["bad types for boolean negation", "pour(!1)", /a boolean, found slice/],
  ["diff type array elements", "pour([3,3.0])", /Not all elements have the same type/],
  ["call of uncallable", "slice x = 1 pour(x())", /Call of non-function/],
  [
    "Too few args",
    "When life gives you lemons try noLemon args(slice x) BEGIN JUICING END JUICING args()",
    /1 argument\(s\) required but 0 passed/,
  ],
  [
    "Too many args",
    "When life gives you lemons try noLemon args(slice x) BEGIN JUICING END JUICING args(1,2)",
    /1 argument\(s\) required but 2 passed/,
  ],
  [
    "Parameter type mismatch",
    "When life gives you lemons try noLemon args(slice x) BEGIN JUICING END JUICING args(1.0)",
    /Cannot assign a dontUseMeForEyeDrops to a slice/,
  ],
]


describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)))
    })
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)), errorMessagePattern)
    })
  }
})
