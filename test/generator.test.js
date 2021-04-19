import assert from "assert"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import generate from "../src/generator.js"

function dedent(s) {
  return `${s}`.replace(/(?<=\n)\s+/g, "").trim()
}

const fixtures = [
  {
    name: "very small",
    source: `
      slice x = 10 * 2
      x++
      pour(species(x))
    `,
    expected: dedent`
      let x_1 = (10 * 2);
      x_1++;
      console.log(typeof x_1);
    `,
  },
  {
    name: "small",
    source: `
      slice x = 10 * 2
      x++
      x--
      taste y = sweet
      y = 5 ^ -x / -100 > - x || sour
      pour((y && y) || sour || (x*2) != 5)
    `,
    expected: dedent`
      let x_1 = (10 * 2);
      x_1++;
      x_1--;
      let y_2 = true;
      y_2 = ((((5 ** -(x_1)) / -(100)) > -(x_1)) || false);
      console.log((((y_2 && y_2) || false) || ((x_1 * 2) !== 5)));
    `,
  },
  {
    name: "if",
    source: `
      slice x = 0
      Squeeze the lemon if(x == 0) BEGIN JUICING pour("1") END JUICING
      Keep juicing if(x == 2) BEGIN JUICING pour(3) END JUICING
      Toss the lemon and do BEGIN JUICING pour(sour) END JUICING
    `,
    expected: dedent`
      let x_1 = 0;
      if ((x_1 === 0)) {
        console.log("1");
      } else if ((x_1 === 2)) {
          console.log(3);
      } else {
          console.log(false);
      }
    `,
  },
  {
    name: "while",
    source: `
      slice x = 0
      Drink the lemonade while (x < 5) BEGIN JUICING
        slice y = 0
        Drink the lemonade while (y < 5) BEGIN JUICING
          pour(x * y)
          y = y + 1
          chop
        END JUICING
        x = x + 1
      END JUICING
    `,
    expected: dedent`
      let x_1 = 0;
      while ((x_1 < 5)) {
        let y_2 = 0;
        while ((y_2 < 5)) {
          console.log((x_1 * y_2));
          y_2 = (y_2 + 1);
          break;
        }
        x_1 = (x_1 + 1);
      }
    `,
  },
  {
    name: "functions",
    source: `
      dontUseMeForEyeDrops z = 0.5
      When life gives you lemons try noLemon f(dontUseMeForEyeDrops x, taste y)
      BEGIN JUICING
        pour(x > 10.0)
        you get lemonade and
      END JUICING
      When life gives you lemons try taste g()
      BEGIN JUICING
        you get lemonade and sour
      END JUICING
      taste q = g()
      f(z, q)
    `,
    expected: dedent`
      let z_1 = 0.5;
      function f_2(x_3, y_4) {
        console.log((x_3 > 10));
        return;
      }
      function g_5() {
        return false;
      }
      let q_6 = g_5();
      f_2(z_1, q_6);
    `,
  },
  {
    name: "arrays and objects",
    source: `
      taste[] a = [sweet, sour, sweet]
      <slice, taste> b = {0: sour, 1: sweet}
      pour(b.key(0) == a[1])
    `,
    expected: dedent`
      let a_1 = [true,false,true];
      let b_2 = {0: false,1: true};
      console.log(((b_2[0]) === (a_1[1])));
    `,
  },
  {
    name: "for loops",
    source: `
        forEachLemon (slice i = 0; i < 5; i++)
            BEGIN JUICING
            pour(i)
            nextLemon
            END JUICING
        forEachLemon (slice i = 0; i < 5; i+=2)
            BEGIN JUICING
            pour(i)
            END JUICING
    `,
    expected: dedent`
      for (let i_1 = 0; (i_1 < 5); i_1++) {
        console.log(i_1);
        continue;
      }
      for (let i_2 = 0; (i_2 < 5); i_2 += 2) {
        console.log(i_2);
      }
    `,
  },
]

describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = generate(analyze(parse(fixture.source)))
      assert.deepEqual(actual, fixture.expected)
    })
  }
})
