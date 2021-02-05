import assert from "assert"
import parse from "../src/parser.js"
import fs from "fs"



const GOOD_TESTS = `test/cases/goodPrograms`;
const BAD_TESTS = `test/cases/badPrograms`;



describe("The parser", () => {
  fs.readdirSync(GOOD_TESTS).forEach((name) => {
      it(`matches the program ${name}`, (done) => {
        fs.readFile(`${GOOD_TESTS}/${name}`, "utf-8", (err, input) => {
          assert.ok(parse(input));
          done();
        });
      });
  });

})

describe("The parser", () => {
  fs.readdirSync(BAD_TESTS).forEach((name) => {
      it(`matches the program ${name}`, (done) => {
        fs.readFile(`${BAD_TESTS}/${name}`, "utf-8", (err, input) => {
          assert.ok(!parse(input));
          done();
        });
      });
  });

})
  