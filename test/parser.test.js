import assert from "assert"
import util from "util"
import parse, { syntaxIsOkay } from "../src/parser.js"
import fs from "fs"



const GOOD_TESTS = `test/cases/goodPrograms`;
const BAD_TESTS = `test/cases/badPrograms`;

const extraExample = `pour(0)`

const expectedAst = `   1 | Program statements=[#2]
   2 | PrintStatement argument=0n`

describe("The syntax", () => {
  fs.readdirSync(GOOD_TESTS).forEach((name) => {
      it(`matches the program ${name}`, (done) => {
        fs.readFile(`${GOOD_TESTS}/${name}`, "utf-8", (err, input) => {
          assert.ok(syntaxIsOkay(input));
          done();
        });
      });
  });
})

describe("The syntax", () => {
  fs.readdirSync(BAD_TESTS).forEach((name) => {
      it(`matches the program ${name}`, (done) => {
        fs.readFile(`${BAD_TESTS}/${name}`, "utf-8", (err, input) => {
          assert.ok(!syntaxIsOkay(input));
          done();
        });
      });
  });
})

describe("The Parser", () => {
  fs.readdirSync(GOOD_TESTS).forEach((name) => {
      it(`matches the program ${name}`, (done) => {
        fs.readFile(`${GOOD_TESTS}/${name}`, "utf-8", (err, input) => {
          assert.ok(parse(input));
          done();
        });
      });
  });
})
describe("The Parser", () => {
  fs.readdirSync(BAD_TESTS).forEach((name) => {
      it(`rejects the bad program named ${name}`, (done) => {
        fs.readFile(`${BAD_TESTS}/${name}`, "utf-8", (err, input) => {
          assert.throws(() => parse(input))
          done();
        });
      });
  });
})
describe("The ast printer", () => {
  it("produces the expected AST for all node types", () => {
    assert.deepStrictEqual(util.format(parse(extraExample)), expectedAst)
  })
})
