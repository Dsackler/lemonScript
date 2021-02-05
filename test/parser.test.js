import assert from "assert"
import util from "util"
import parse from "../src/parser.js"

//missing BEGIN JUICING

const errorFixture = [
    ["Missing BEGIN JUICING/ENG JUICING compilation error", "print 5 -", /Line 1, col 10:/],
    ["a non-operator", "print 7 * ((2 _ 3)", /Line 1, col 15:/],
    ["an expression starting with a )", "print )", /Line 1, col 7:/],
    ["a statement starting with expression", "x * 5", /Line 1, col 3:/],
    ["an illegal statement on line 2", "print 5\nx * 5", /Line 2, col 3:/],
    ["a statement starting with a )", "print 5\n) * 5", /Line 2, col 1:/],
    ["an expression starting with a *", "let x = * 71", /Line 1, col 9:/],
  ]
  
  describe("The parser", () => {
    it("can parse all the nodes", done => {
      assert.deepStrictEqual(util.format(parse(source)), expectedAst)
      done()
    })
    for (const [scenario, source, errorMessagePattern] of errorFixture) {
      it(`throws on ${scenario}`, done => {
        assert.throws(() => parse(source), errorMessagePattern)
        done()
      })
    }
  })
  