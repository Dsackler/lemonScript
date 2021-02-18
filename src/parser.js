
// Parser
//
// Exports a default function mapping the source code as a string to the AST.

import ohm from "ohm-js"

const lemonScriptGrammar = ohm.grammar(String.raw`lemonScript {
    Program   	          = Import* Statement*                                                            --program
    Import 		            = import id from id                                                             --importDec
    Statement 	          = const? static? Type id "=" Exp                                             --varDecInit
                            | const? static? Type id							                                        --varDec
                            | Var "=" Exp                      		                                    --assignExp
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
    Print								  = print"("Exp")"
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


export default function parse(sourceCode) {
  const match = lemonScriptGrammar.match(sourceCode)
  return match.succeeded()
}
