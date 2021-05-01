// Compiler
//
// This module exports a single function
//
//   compile(sourceCodeString, outputType)
//
// The second argument tells the compiler what to return. It must be one of:
//
//   ast        the abstract syntax tree
//   analyzed   the semantically analyzed representation
//   optimized  the optimized semantically analyzed representation
//   js         the translation to JavaScript

import parse from "./parser.js"
import analyze from "./analyzer.js"
import generate from "./generator.js"

export default function compile(source, outputType) {
  outputType = outputType.toLowerCase()
  if (outputType === "ast") {
    return parse(source)
  } else if (outputType === "analyze") {
    return analyze(parse(source))
  } else if (outputType === "generate") {
    return generate(analyze(parse(source)))
  } else if (outputType === "lemon") {
    let easterEggQuotes = [
      "unsqueeze the lemonade till you get lemons 🍋",
      "🍋 🍋🍋 🍋🍋🍋 🍋🍋🍋🍋 🍋🍋🍋🍋🍋 ...",
      "no lemons here :(",
      "chocoMilk coming out next ?",
      "lemonScript > python",
    ]
    return easterEggQuotes[Math.floor(Math.random() * easterEggQuotes.length)]
  } else {
    return "Unknown output type"
  }
}
