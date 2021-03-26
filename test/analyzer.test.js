import assert from "assert"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import * as ast from "../src/ast.js"

// Programs that are semantically correct
const lemonChecks = [
  ["variable declarations",
  'dontUseMeForEyeDrops x = 1.0 dontUseMeForEyeDrops y = x'],
  ["variable declarations 2",
  'lemonStain trunk slice x = 1 taste y = sour'],
  ["complex declaration", "<slice[], <pulp,taste>> x"],
  ["super complex declaration", "<<slice[], <taste, pulp>>, <pulp[][],taste>> x"],
  ["double array declaration", "slice[][] x"],
  ["array initialization", "slice[] x = [1,2,3]"],
  ["Dictionary initialization", "<slice, pulp> x = {1: \"hi\",2: \"bye\"}"],
  ["complex Dictionary initialization", "<slice[], <pulp,taste>> x = {[1,2]: {\"hi\": sour}, [3,4]: {\"bye\": sweet}}"],
  // ["super complex initialization", "<<slice[], <taste, pulp>>, <pulp[][],taste>> x"],
  // ["complex initialization",
  // "<slice[], <pulp,taste>> x"],
  // ["complex parameters", "When life gives you lemons try noLemon f(<slice[], <pulp,taste>> x) BEGIN JUICING slice x END JUICING"],
  // ["increment and decrement", "slice x = 10 x-- x++ x+=2"],
  // ["short return", "When life gives you lemons try noLemon helloWorld() BEGIN JUICING you get lemonade and END JUICING"],
  // ["long return", "When life gives you lemons try taste tralse() BEGIN JUICING you get lemonade and sweet END JUICING"],
  // ["return in nested if", "When life gives you lemons try slice return10(slice a) BEGIN JUICING Squeeze the lemon if(a == 10) BEGIN JUICING you get lemonade and a END JUICING END JUICING"],
  // ["break in nested if", "slice x = 20 Drink the lemonade while (x > 0) BEGIN JUICING Squeeze the lemon if(x == 10) BEGIN JUICING chop END JUICING x-- END JUICING"],
  // ["long if", "Squeeze the lemon if(x == 10) BEGIN JUICING pour(“Number is 10”) END JUICING Toss the lemon and do BEGIN JUICING pour(“Number is not 10 or 20”) END JUICING"],
  // ["else if", "Squeeze the lemon if(x == 10) BEGIN JUICING pour(“Number is 10”) END JUICING Keep juicing if(x == 20) BEGIN JUICING pour(“Number is 10”) END JUICING Toss the lemon and do BEGIN JUICING pour(“Number is not 10 or 20”) END JUICING"],
  // ["for with args", "forEachLemon (slice i = 0; i < 5; i++) BEGIN JUICING pour(“Number: ” + i) END JUICING"],
  // ["||", "pour(sweet||1<2||sour||3>4)"],
  // ["&&", "pour(sweet&&1<2&&sour&&!3>4)"],
  // ["relations", 'pour(10 < 20)'],
  // ["arithmetic", "slice x x = 4 slice y = 2 slice z = 1 pour(x + y - - z ^ y % x / y)"],
  // ["subscript exp", "slice[] arr = [1,2,3] pour(arr[1])"],
  // ["array parameters", "When life gives you lemons try slice sumOfArray( slice[] arr, slice arrLength ) BEGIN JUICING END JUICING"],
]
const semanticChecks = [
  // ["variable declarations",
  // 'dontUseMeForEyeDrops x = 1.0 dontUseMeForEyeDrops y = x'],
  // ["variable declarations 2",
  // 'lemonStain trunk slice x = 1 taste y = sour'],
  ["complex declaration",
  "<slice[], <pulp,taste>> x"],
  // ["complex initialization",
  // "<slice[], <pulp,taste>> x"],
  ["complex parameters", "When life gives you lemons try noLemon f(<slice[], <pulp,taste>> x) BEGIN JUICING slice x END JUICING"],
  ["increment and decrement", "slice x = 10 x-- x++ x+=2"],
  // ["initialize with empty array", "let a = [](of int);"],
  // ["struct declaration", "struct S {f: (int)->boolean? g: string}"],
  // ["assign arrays", "let a = [](of int);let b=[1];a=b;b=a;"],
  // ["initialize with empty optional", "let a = no int;"],
  ["short return", "When life gives you lemons try noLemon helloWorld() BEGIN JUICING you get lemonade and END JUICING"],
  ["long return", "When life gives you lemons try taste tralse() BEGIN JUICING you get lemonade and sweet END JUICING"],
  // ["assign optionals", "let a = no int;let b=some 1;a=b;b=a;"],
  ["return in nested if", "When life gives you lemons try slice return10(slice a) BEGIN JUICING Squeeze the lemon if(a == 10) BEGIN JUICING you get lemonade and a END JUICING END JUICING"],
  ["break in nested if", "slice x = 20 Drink the lemonade while (x > 0) BEGIN JUICING Squeeze the lemon if(x == 10) BEGIN JUICING chop END JUICING x-- END JUICING"],
  ["long if", "Squeeze the lemon if(x == 10) BEGIN JUICING pour(“Number is 10”) END JUICING Toss the lemon and do BEGIN JUICING pour(“Number is not 10 or 20”) END JUICING"],
  ["else if", "Squeeze the lemon if(x == 10) BEGIN JUICING pour(“Number is 10”) END JUICING Keep juicing if(x == 20) BEGIN JUICING pour(“Number is 10”) END JUICING Toss the lemon and do BEGIN JUICING pour(“Number is not 10 or 20”) END JUICING"],
  // ["for over collection", "for i in [2,3,5] {print(1);}"],
  ["for with args", "forEachLemon (slice i = 0; i < 5; i++) BEGIN JUICING pour(“Number: ” + i) END JUICING"],
  // ["repeat", "repeat 3 {let a = 1; print(a);}"],
  // ["conditionals with ints", "print(true ? 8 : 5);"],
  // ["conditionals with floats", "print(1<2 ? 8.0 : -5.22);"],
  // ["conditionals with strings", 'print(1<2 ? "x" : "y");'],
  // ["??", "print(some 5 ?? 0);"],
  // ["nested ??", "print(some 5 ?? 8 ?? 0);"],
  ["||", "pour(sweet||1<2||sour||3>4)"],
  ["&&", "pour(sweet&&1<2&&sour&&!3>4)"],
  // ["bit ops", "print((1&2)|(9^3));"],
  ["relations", 'pour(10 < 20)'],
  // ["ok to == arrays", "print([1]==[5,8]);"],
  // ["ok to != arrays", "print([1]!=[5,8]);"],
  // ["shifts", "print(1<<3<<5<<8>>2>>0);"],
  ["arithmetic", "slice x x = 4 slice y = 2 slice z = 1 pour(x + y - - z ^ y % x / y)"],
  // ["array length", "print(#[1,2,3]);"],
  // ["optional types", "let x = no int; x = some 100;"],
  // ["variables", "let x=[[[[1]]]]; print(x[0][0][0][0]+2);"],
  // ["recursive structs", "struct S {z: S?} let x = S(no S);"],
  // ["nested structs", "struct T{y:int} struct S{z: T} let x=S(T(1)); print(x.z.y);"],
  // ["member exp", "struct S {x: int} let y = S(1);print(y.x);"],
  ["subscript exp", "slice[] arr = [1,2,3] pour(arr[1])"],
  // ["array of struct", "struct S{} let x=[S(), S()];"],
  // ["struct of arrays and opts", "struct S{x: [int] y: string??}"],
  // ["assigned functions", "function f() {}\nlet g = f;g = f;"],
  // ["call of assigned functions", "function f(x: int) {}\nlet g=f;g(1);"],
  // ["type equivalence of nested arrays", "function f(x: [[int]]) {} print(f([[1],[2]]));"],
  // [
  //   "call of assigned function in expression",
  //   `function f(x: int, y: boolean): int {}
  //   let g = f;
  //   print(g(1, true));
  //   f = g; // Type check here`,
  // ],
  // [
  //   "pass a function to a function",
  //   `function f(x: int, y: (boolean)->void): int { return 1; }
  //    function g(z: boolean) {}
  //    f(2, g);`,
  // ],
  // [
  //   "function return types",
  //   `function square(x: int): int { return x * x; }
  //    function compose(): (int)->int { return square; }`,
  // ],
  // ["struct parameters", "struct S {} function f(x: S) {}"],
  ["array parameters", "When life gives you lemons try slice sumOfArray( slice[] arr, slice arrLength ) BEGIN JUICING END JUICING"],
  // ["optional parameters", "function f(x: [int], y: string?) {}"],
  // ["built-in constants", "print(25.0 * π);"],
  // ["built-in sin", "print(sin(π));"],
  // ["built-in cos", "print(cos(93.999));"],
  // ["built-in hypot", "print(hypot(-4.0, 3.00001));"],
]

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  ["non-distinct fields", "struct S {x: boolean x: int}", /Fields must be distinct/],
  ["non-int increment", "let x=false;x++;", /an integer, found boolean/],
  ["non-int decrement", 'let x=some[""];x++;', /an integer, found [string]?/],
  ["undeclared id", "print(x);", /Identifier x not declared/],
  ["redeclared id", "let x = 1;let x = 1;", /Identifier x already declared/],
  ["assign to const", "const x = 1;x = 2;", /Cannot assign to constant x/],
  ["assign bad type", "let x=1;x=true;", /Cannot assign a boolean to a int/],
  ["assign bad array type", "let x=1;x=[true];", /Cannot assign a \[boolean\] to a int/],
  ["assign bad optional type", "let x=1;x=some 2;", /Cannot assign a int\? to a int/],
  ["break outside loop", "break;", /Break can only appear in a loop/],
  [
    "break inside function",
    "while true {function f() {break;}}",
    /Break can only appear in a loop/,
  ],
  ["return outside function", "return;", /Return can only appear in a function/],
  [
    "return value from void function",
    "function f() {return 1;}",
    /Cannot return a value here/,
  ],
  [
    "return nothing from non-void",
    "function f(): int {return;}",
    /should be returned here/,
  ],
  ["return type mismatch", "function f(): int {return false;}", /boolean to a int/],
  ["non-boolean short if test", "if 1 {}", /a boolean, found int/],
  ["non-boolean if test", "if 1 {} else {}", /a boolean, found int/],
  ["non-boolean while test", "while 1 {}", /a boolean, found int/],
  ["non-integer repeat", 'repeat "1" {}', /an integer, found string/],
  ["non-integer low range", "for i in true...2 {}", /an integer, found boolean/],
  ["non-integer high range", "for i in 1..<no int {}", /an integer, found int\?/],
  ["non-array in for", "for i in 100 {}", /Array expected/],
  ["non-boolean conditional test", "print(1?2:3);", /a boolean, found int/],
  ["diff types in conditional arms", "print(true?1:true);", /not have the same type/],
  ["unwrap non-optional", "print(1??2);", /Optional expected/],
  ["bad types for ||", "print(false||1);", /a boolean, found int/],
  ["bad types for &&", "print(false&&1);", /a boolean, found int/],
  ["bad types for ==", "print(false==1);", /Operands do not have the same type/],
  ["bad types for !=", "print(false==1);", /Operands do not have the same type/],
  ["bad types for +", "print(false+1);", /number or string, found boolean/],
  ["bad types for -", "print(false-1);", /a number, found boolean/],
  ["bad types for *", "print(false*1);", /a number, found boolean/],
  ["bad types for /", "print(false/1);", /a number, found boolean/],
  ["bad types for **", "print(false**1);", /a number, found boolean/],
  ["bad types for <", "print(false<1);", /number or string, found boolean/],
  ["bad types for <=", "print(false<=1);", /number or string, found bool/],
  ["bad types for >", "print(false>1);", /number or string, found bool/],
  ["bad types for >=", "print(false>=1);", /number or string, found bool/],
  ["bad types for ==", "print(2==2.0);", /not have the same type/],
  ["bad types for !=", "print(false!=1);", /not have the same type/],
  ["bad types for negation", "print(-true);", /a number, found boolean/],
  ["bad types for length", "print(#false);", /Array expected/],
  ["bad types for not", 'print(!"hello");', /a boolean, found string/],
  ["non-integer index", "let a=[1];print(a[false]);", /integer, found boolean/],
  ["no such field", "struct S{} let x=S(); print(x.y);", /No such field/],
  ["diff type array elements", "print([3,3.0]);", /Not all elements have the same type/],
  ["shadowing", "let x = 1;\nwhile true {let x = 1;}", /Identifier x already declared/],
  ["call of uncallable", "let x = 1;\nprint(x());", /Call of non-function/],
  [
    "Too many args",
    "function f(x: int) {}\nf(1,2);",
    /1 argument\(s\) required but 2 passed/,
  ],
  [
    "Too few args",
    "function f(x: int) {}\nf();",
    /1 argument\(s\) required but 0 passed/,
  ],
  [
    "Parameter type mismatch",
    "function f(x: int) {}\nf(false);",
    /Cannot assign a boolean to a int/,
  ],
  [
    "function type mismatch",
    `function f(x: int, y: (boolean)->void): int { return 1; }
     function g(z: boolean): int { return 5; }
     f(2, g);`,
    /Cannot assign a \(boolean\)->int to a \(boolean\)->void/,
  ],
  ["bad call to stdlib sin()", "print(sin(true));", /Cannot assign a boolean to a float/],
  ["Non-type in param", "let x=1;function f(y:x){}", /Type expected/],
  ["Non-type in return type", "let x=1;function f():x{return 1;}", /Type expected/],
  ["Non-type in field type", "let x=1;struct S {y:x}", /Type expected/],
]


describe("The analyzer", () => {
  for (const [scenario, source] of lemonChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)))
    })
  }
  // for (const [scenario, source, errorMessagePattern] of semanticErrors) {
  //   it(`throws on ${scenario}`, () => {
  //     assert.throws(() => analyze(parse(source)), errorMessagePattern)
  //   })
  // }
})
