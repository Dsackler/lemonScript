// Parser
//
// Exports a default function mapping the source code as a string to the AST.

import ohm from "ohm-js"
import * as ast from "./ast.js"

const lemonScriptGrammar = ohm.grammar(String.raw`lemonScript {
    Program               = Statement*
    Statement             = const? Type id "=" Exp                                                --varDecInit
                            | const? Type id                                                      --varDec
                            | Var "=" Exp                                                         --assignExp
                            | SwitchStatement
                            | FunctionCall
                            | FunctionDec
                            | IfStatement
                            | WhileStatement
                            | ForStatement
                            | Print
                            | ReturnStatement
                            | SliceCrement
                            | continue
                            | break
                            | Exp
    FunctionDec           = functionBeginning (Type | void | id) id "(" Parameters ")" BeginToEnd
    FunctionCall          = Var "(" Arguments ")"
    IfStatement           = ifBeginning "(" Exp ")" BeginToEnd ElseifStatement* ElseStatement?
    ElseifStatement       = elifBeginning "(" Exp ")" BeginToEnd
    ElseStatement         = elseBeginning BeginToEnd
    WhileStatement        = whileBeginning "(" Exp ")" BeginToEnd
    ForStatement          = forBeginning "(" ForArgs ")" BeginToEnd
    ForArgs               = iteratorType id "=" Exp ";" Exp ";" SliceCrement
    SliceCrement          = (id "+=" AddOp | id "-=" AddOp )                                         --binary
                            | (id"++" | id"--" )                                                     --postfix
    SwitchStatement       = switch "("Var")" openBrace Lemoncase+ Defaultcase? closeBrace
    Lemoncase             = case Exp Statement*
    Defaultcase           = default Statement*
    Print                 = print "("Exp")"
    TypeOf                = typeof "("Exp")"
    ReturnStatement       = return Exp?
    BeginToEnd            = openBrace Statement* closeBrace
    Exp                   = Exp logop Joint                                                          --binary
                            | Joint
    Joint                 = Joint relop AddOp                                                        --binary
                            | AddOp
    AddOp                 = AddOp addop Term                                                         --binary
                            | Term
    Term                  = Term mulop Exponential                                                   --binary
                            | Exponential
    Exponential           = Factor "^" Exponential                                                   --binary
                            | Factor
    Factor                = TypeOf
                            | FunctionCall
                            | ("-") Factor                                                           --negation
                            | ("!") Factor                                                           --boolNegation
                            | "(" Exp ")"                                                            --parens
                            | "[" Arguments "]"                                                      --arrayLit
                            | "{" DictValues "}"                                                     --objLit
                            | numlit
                            | stringlit
                            | boollit
                            | Var
    numlit                = digit+ "." digit+                                                        --float
                            | digit+                                                                 --int
    boollit               = "sweet" | "sour"
    stringlit             = "\"" char* "\""
    char                  = "\\n"
                            | "\\'"
                            | "\\\""
                            | "\\\\"
                            | "\\u{" hexDigit hexDigit? hexDigit? hexDigit? hexDigit? hexDigit?  "}"  --hex
                            | ~"\"" ~"\\" any
    Var                   = Property
                            | id
    Property              = Var ".key(" (Var | numlit | stringlit | boollit) ")"                       --dotMemberExp
                            | Var "["digit+"]"                                                         --memberExp
    Type                  = ArrayType | types | DictType
    types                 = ("pulp"|"slice"|"taste"|"dontUseMeForEyeDrops") ~alnum
    ArrayType             = Type "[]"
    DictType              = "<" Type "," Type ">"
    void                  = "noLemon" ~alnum
    functionBeginning     = "When life gives you lemons try" ~alnum
    ifBeginning           = "Squeeze the lemon if" ~alnum
    elifBeginning         = "Keep juicing if" ~alnum
    elseBeginning         = "Toss the lemon and do" ~alnum
    whileBeginning        = "Drink the lemonade while" ~alnum
    forBeginning          = "forEachLemon" ~alnum
    classType             = "Limon" ~alnum
    iteratorType          = "slice" ~alnum
    plant                 = "plant"
    extends               = "branches" ~alnum
    case                  = "lemonCase" ~alnum
    print                 = "pour"
    typeof                = "species"
    openBrace             = "BEGIN JUICING" ~alnum
    closeBrace            = "END JUICING" ~alnum
    switch                = "Pick" ~alnum
    break                 = "chop" ~alnum
    continue              = "nextLemon" ~alnum
    return                = "you get lemonade and" ~alnum
    default               = "citrusLimon" ~alnum
    const                 = "lemonStain" ~alnum
    static                = "trunk" ~alnum
    import                = "receive" ~alnum
    from                  = "from" ~alnum
    keyword               = types | void | print | openBrace
                            | closeBrace | switch | break | case
                            | default | classType | plant | const
                            | forBeginning | continue | boollit | typeof
                            | iteratorType
    id                    = ~keyword letter (alnum | "_")*
    Arguments             = ListOf<Exp, ",">
    Parameters            = ListOf<Binding, ",">
    Binding               = (Type | id) id
    DictValues            = ListOf<KeyValue, ",">
    KeyValue              = Exp ":" Exp
    space                 += "( *)" (~"(* )" any)* "(* )"                                                  --longComment
                          | "( *)" (~"\n" any)* ("\n" | end)                                               --comment
    logop                 = "&&" | "||"
    relop                 = "<=" | "<" | "==" | "!=" | ">=" | ">"
    addop                 = "+" | "-"
    mulop                 = "*"| "/"| "%"
  }`)

const astBuilder = lemonScriptGrammar.createSemantics().addOperation("tree", {
  Program(statements) {
    return new ast.Program(statements.tree())
  },
  Statement_varDecInit(con, type, identifiers, _eq, exp) {
    return new ast.VariableDecInit(
      type.tree(),
      identifiers.tree(),
      exp.tree(),
      con.tree().length !== 0
    )
  },
  Statement_varDec(con, type, identifier) {
    return new ast.VariableDec(type.tree(), identifier.tree(), con.tree().length !== 0)
  },
  Statement_assignExp(variable, _eq, exp) {
    return new ast.Assignment(variable.tree(), exp.tree())
  },
  FunctionDec(_functionBeginning, returnType, name, _left, parameters, _right, body) {
    return new ast.FunctionDec(
      name.tree(),
      returnType.tree(),
      parameters.tree(),
      body.tree()
    )
  },
  FunctionCall(callee, _left, args, _right) {
    return new ast.Call(callee.tree(), args.tree())
  },
  IfStatement(_ifBeginning, _left, condition, _right, ifBlock, cases, elseBlock) {
    return new ast.IfStatement(
      [new ast.IfCase(condition.tree(), ifBlock.tree()), ...cases.tree()],
      elseBlock.tree()
    )
  },
  ElseifStatement(_elifBeginning, _left, condition, _right, elifBlock) {
    return new ast.IfCase(condition.tree(), elifBlock.tree())
  },
  ElseStatement(_elseBeginning, elseBlock) {
    return elseBlock.tree()
  },
  WhileStatement(_whileBeginning, _left, test, _right, body) {
    return new ast.WhileStatement(test.tree(), body.tree())
  },
  ForStatement(_forBeginning, _left, forArgs, _right, body) {
    return new ast.ForStatement(forArgs.tree(), body.tree())
  },
  ForArgs(_slice, name, _eq, exp, _semi1, condition, _semi2, sliceCrement) {
    return new ast.ForArgs(name.tree(), exp.tree(), condition.tree(), sliceCrement.tree())
  },
  SliceCrement_binary(variable, op, exp) {
    return new ast.BinaryExp(variable.tree(), op.sourceString, exp.tree())
  },
  SliceCrement_postfix(variable, op) {
    return new ast.UnaryExpression(op.sourceString, variable.tree(), false)
  },
  SwitchStatement(_switch, _left, exp, _right, _open, cases, defaultCase, _close) {
    return new ast.SwitchStatement(exp.tree(), cases.tree(), defaultCase.tree())
  },
  Lemoncase(_caseKeyword, exp, statements) {
    return new ast.LemonCase(exp.tree(), statements.tree())
  },
  Defaultcase(_defaultKeyword, statements) {
    return statements.tree()
  },
  Arguments(exps) {
    return exps.asIteration().tree()
  },
  Parameters(values) {
    return values.asIteration().tree()
  },
  DictValues(pairs) {
    return pairs.asIteration().tree()
  },
  BeginToEnd(_left, statements, _right) {
    return statements.tree()
  },
  Print(_pour, _left, argument, _right) {
    return new ast.PrintStatement(argument.tree())
  },
  TypeOf(_typeof, _left, argument, _right) {
    return new ast.typeOfStatement(argument.tree())
  },
  Exp_binary(left, op, right) {
    return new ast.BinaryExp(left.tree(), op.sourceString, right.tree())
  },
  Joint_binary(left, op, right) {
    return new ast.BinaryExp(left.tree(), op.sourceString, right.tree())
  },
  AddOp_binary(left, op, right) {
    return new ast.BinaryExp(left.tree(), op.sourceString, right.tree())
  },
  Term_binary(left, op, right) {
    return new ast.BinaryExp(left.tree(), op.sourceString, right.tree())
  },
  Exponential_binary(left, op, right) {
    return new ast.BinaryExp(left.tree(), op.sourceString, right.tree())
  },
  Factor_negation(op, operand) {
    return new ast.UnaryExpression(op.sourceString, operand.tree(), true)
  },
  Factor_boolNegation(op, operand) {
    return new ast.UnaryExpression(op.sourceString, operand.tree(), true)
  },
  Factor_parens(_left, exp, _right) {
    return exp.tree()
  },
  Factor_arrayLit(_open, elements, _close) {
    return new ast.ArrayLit(elements.tree())
  },
  Factor_objLit(_open, pairs, _close) {
    return new ast.ObjLit(pairs.tree())
  },
  break(_) {
    return new ast.Break()
  },
  continue(_) {
    return new ast.Continue()
  },
  ReturnStatement(_return, returnValue) {
    if (returnValue.tree().length === 0) {
      return new ast.ShortReturnStatement()
    }

    return new ast.ReturnStatement(returnValue.tree()[0])
  },
  id(_first, _rest) {
    return new ast.IdentifierExpression(this.sourceString)
  },
  numlit_int(digits) {
    return BigInt(this.sourceString)
  },
  numlit_float(digits, dot, decimals) {
    return Number(this.sourceString)
  },
  stringlit(_left, chars, _right) {
    return chars.sourceString
  },
  boollit(bool) {
    if (bool.sourceString === "sour") {
      return new ast.Bool(bool.sourceString, false, "taste")
    }
    return new ast.Bool(bool.sourceString, true, "taste")
  },
  Property_dotMemberExp(var1, _dot, var2, _close) {
    return new ast.PropertyExpression(var1.tree(), var2.tree())
  },
  Property_memberExp(variable, _open, index, _close) {
    return new ast.MemberExpression(variable.tree(), BigInt(index.sourceString))
  },
  ArrayType(type, _brac) {
    return new ast.ArrayType(type.tree())
  },
  DictType(_arrOpen, keyType, _comma, valueType, _arrClose) {
    return new ast.ObjType(keyType.tree(), valueType.tree())
  },
  KeyValue(key, _sep, value) {
    return new ast.ObjPair(key.tree(), value.tree())
  },
  Binding(type, name) {
    return new ast.VariableDec(type.tree(), name.tree(), false, false)
  },
  _terminal() {
    return this.sourceString
  },
})

export function syntaxIsOkay(sourceCode) {
  const match = lemonScriptGrammar.match(sourceCode)
  return match.succeeded()
}

export default function parse(sourceCode) {
  const match = lemonScriptGrammar.match(sourceCode)
  if (!match.succeeded()) {
    throw new Error(match.message)
  }
  return astBuilder(match).tree()
}
