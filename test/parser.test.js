import assert from "assert"
import parse, { syntaxIsOkay } from "../src/parser.js"
import fs from "fs"



const GOOD_TESTS = `test/cases/goodPrograms`;
const BAD_TESTS = `test/cases/badPrograms`;



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
  fs.readdirSync(BAD_TESTS).forEach((name) => {
      it(`rejects the bad program named ${name}`, (done) => {
        fs.readFile(`${BAD_TESTS}/${name}`, "utf-8", (err, input) => {
          assert.throws(() => parse(program))
          done();
        });
      });
  });
})
