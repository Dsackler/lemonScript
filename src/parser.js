
// Parser
//
// Exports a default function mapping the source code as a string to the AST.

import ohm from "ohm-js"
import * as ast from "./ast.js"

const lemonScriptGrammar = ohm.grammar(String.raw`lemonScript {
    Program   	          = Import* Statement*                                                            --program
    Import 		            = import id from id                                                             --importDec
    Statement 	          = const? static? Type id "=" Exp                                                --varDecInit
                            | const? static? Type id							                                        --varDec
                            | Var "=" Exp                      		                                        --assignExp
                            | SwitchStatement
                            | FunctionCall
                            | FunctionDec
                            | IfStatement
                            | WhileStatement
                            | ForStatement
                            | ClassDec
                            | Print
                            | TypeOf
                            | ReturnStatement
                            | SliceCrement
                            | continue
                            | break
                            | Exp
    ClassDec					    = classType id (extends id)? ClassBeginToEnd
    ClassBeginToEnd 	    = openBrace Constructor Statement* closeBrace
    Constructor				    = "plant" "(" Parameters ")" BeginToEnd
    FunctionDec 			    = functionBeginning static? (Type | void | id) id "(" Parameters ")" BeginToEnd
    FunctionCall          = Var "(" Arguments ")"
    IfStatement  			    = ifBeginning "(" Exp ")" BeginToEnd ElseifStatement* ElseStatement?
    ElseifStatement  		  = elifBeginning "(" Exp ")" BeginToEnd
    ElseStatement  		    = elseBeginning BeginToEnd
    WhileStatement 		    = whileBeginning "(" Exp ")" BeginToEnd
    ForStatement 			    = forBeginning "(" ForArgs ")" BeginToEnd
    ForArgs          		  = "slice" id "=" Exp ";" Exp ";" SliceCrement
    SliceCrement   		    = (id "+=" AddOp | id "-=" AddOp )                                              --binary
                            | (id"++" | id"--" )							                                            --postfix
    SwitchStatement 		  = switch "("Var")" SwitchBeginToEnd
    SwitchBeginToEnd 		  = openBrace Lemoncase+ Defaultcase? closeBrace
    Lemoncase 			      = case Exp Statement*
    Defaultcase					  = default Statement*
    Print								  = print "("Exp")"
    TypeOf						    = typeof "("Exp")"
    ReturnStatement		    = return Exp?
    BeginToEnd 	          = openBrace Statement+ closeBrace
    Exp                   = BoolOp
    BoolOp 			          = BoolOp logop Bool                                                             --binary
                            | Bool
    Bool      	          = Bool relop AddOp                                                              --binary
                            | AddOp
    AddOp                 = AddOp addop Term                                                              --binary
                            | Term
    Term      	          = Term mulop Exponential                                                        --binary
                            | Exponential
    Exponential           = Factor "^" Exponential                                                        --binary
                            | Factor
    Factor 		            = FunctionCall
                            | ("-" ) Factor                                                               --prefix
                            | "(" BoolOp ")"                                                              --templateLit
                            | "[" Arguments "]"					                                                  --arrayLit
                            | "{" DictValues "}"				                                                  --objLit
                            | numlit
                            | stringlit
                            | boollit
                            | Var
    numlit       		      = digit+ ("." digit+)?                                                          --literal
    boollit 		          = "sweet" | "sour"                                                              --boolLit
    stringlit 		        = "\"" char* "\""                                                               --strLit
    char 				          = "\\n"
                            | "\\'"
                            | "\\\""
                            | "\\\\"
                            | "\\u{" hexDigit hexDigit? hexDigit? hexDigit? hexDigit? hexDigit?  "}" 			--hex
                            | ~"\"" ~"\\" any
    Var					          = Property
                            | id
    Property              = Var "." Var		                                                                --dotMemberExp
                            | Var "["digit+"]"                                                            --memberExp
    Type       			      = ArrayType | types | DictType
    types                 = ("pulp"|"slice"|"taste"|"dontUseMeForEyeDrops") ~alnum
    ArrayType			        = Type "[]"                                                                     --arrayDec
    DictType			        = "<" Type "," Type ">"                                                         --objDec
    void					        = "noLemon" ~alnum
    functionBeginning     = "When life gives you lemons try" ~alnum
    ifBeginning       	  = "Squeeze the lemon if" ~alnum
    elifBeginning       	= "Keep juicing if" ~alnum
    elseBeginning       	= "Toss the lemon and do" ~alnum
    whileBeginning        = "Drink the lemonade while" ~alnum
    forBeginning 		      = "forEachLemon" ~alnum
    classType				      = "Limon" ~alnum
    extends				        = "branches" ~alnum
    case					        = "lemonCase" ~alnum
    print					        = "pour"
    typeof					      = "species"
    openBrace 			      = "BEGIN JUICING" ~alnum
    closeBrace			      = "END JUICING" ~alnum
    switch 					      = "Pick" ~alnum
    break					        = "chop" ~alnum
    continue 			        = "nextLemon" ~alnum
    return				        = "you get lemonade and" ~alnum
    default				        = "citrusLimon" ~alnum
    const					        = "lemonStain" ~alnum
    static			  	      = "trunk" ~alnum
    import			  	      = "receive" ~alnum
    from				          = "from" ~alnum
    keyword   			      = types | void | print | openBrace | closeBrace | switch | break | case | default | classType | const | forBeginning | continue | boollit | typeof
    id        			      = ~keyword letter (alnum | "_")*
    Arguments 			      = ListOf<Exp, ",">
    Parameters			      = ListOf<Binding, ",">
    Binding 			        = (Type | id) id
    DictValues			      = ListOf<KeyValue, ",">
    KeyValue		          = Exp ":" Exp
    space    				      += "( *)" (~"(* )" any)* "(* )"  				                                        --longComment
                            | "( *)" (~"\n" any)* ("\n" | end) 		 	                                      --comment
    logop				          = "&&" | "||"
    relop   			        = "<=" | "<" | "==" | "!=" | ">=" | ">"
    addop 			          = "+" | "-"
    mulop				          = "*"| "/"| "%"
  }`)

const astBuilder = lemonScriptGrammar.createSemantics().addOperation("tree", {

  Program(statements) {
    return new ast.Program(statements.tree())
  },
  Statement_varDec(con, stat, type, identifier) {
    return new ast.VariableDec(con.sourceString, stat.sourceString, type.tree(), identifier.tree())
  },
  Statement_varDecInit(con, stat, type, identifiers, _eq, exp) {
    return new ast.VariableDecInit(con.sourceString, stat.sourceString, type.tree(), identifiers.tree(), exp.tree())
  },
  Statement_assignExp(identifier, _eq, exp) {
    return new ast.Assignment(identifier.tree(), exp.tree())
  },
  FunctionDec(_functionBeginning, stat, returnType, name, _left, parameters, _right, body) {
    return new ast.FunctionDec(
      name.tree(),
      stat.sourceString,
      returnType.sourceString,
      parameters.asIteration().tree(),
      body.tree()
    )
  },
  FunctionCall(callee, _left, args, _right) {
    return new ast.Call(callee.tree(), args.tree())
  },
  Parameters(values) {
    return values.asIteration().tree()
  },
  BeginToEnd(_left, statements, _right) {
    return statements.tree()
  },
  ForStatement(_forBeginning, _left, iterator, _right, body) {
    return new ast.ForLoop(iterator.tree(), body.tree())
  },
  WhileStatement(_whileBeginning, _left, test, _right, body) {
    return new ast.WhileLoop(test.tree(), body.tree())
  },
  Print(_pour, _left, argument, _right) { //left and right are parens
    return new ast.PrintStatement(argument.tree())
  },
  break(_) {
    return new ast.Break()
  },
  ReturnStatement(_return, returnValue) {
    return new ast.ReturnStatement(returnValue.tree())
  },
  id(_first, _rest) {
    return new ast.IdentifierExpression(this.sourceString)
  },
  stringlit_strLit(_left, chars, _right) {
    return chars.sourceString
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

