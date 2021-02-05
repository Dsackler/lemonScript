  
// Parser
//
// Exports a default function mapping the source code as a string to the AST.

import ohm from "ohm-js"

const lemonScriptGrammar = ohm.grammar(String.raw`lemonScript {
    Program   	= Import* Statement*
    Import 		   = import id from id
    Statement 	= const? static? Type id "=" BoolOp                  	--declareAssign
                          | const? static? Type id							        	 --declare
                          | Var "=" BoolOp                      		 --assign
                          | SwitchStatement
                          | FunctionCall                      								--function_call
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
                          | BoolOp
    ClassDec					= classType id (extends id)? ClassBeginToEnd
    ClassBeginToEnd 	  = openBrace Constructor Statement* closeBrace
    Constructor				= "plant" "(" Parameters ")" BeginToEnd
    FunctionDec 			  = functionBeginning static? (Type | void | id) id "(" Parameters ")" BeginToEnd
    FunctionCall         	   = Var "(" Arguments ")" 
    IfStatement  			    = ifBeginning "(" BoolOp ")" BeginToEnd ElseifStatement* ElseStatement?
    ElseifStatement  		 = elifBeginning "(" BoolOp ")" BeginToEnd 
    ElseStatement  		 = elseBeginning BeginToEnd 
    WhileStatement 		= whileBeginning "(" BoolOp ")" BeginToEnd 
    ForStatement 			  = forBeginning "(" ForArgs ")" BeginToEnd
    ForArgs          			  = "slice" id "=" BoolOp ";" BoolOp ";" SliceCrement
    SliceCrement   		  = (id"+=" AddOp | id"-=" AddOp )   -- binary
                                        | (id"++" | id"--" )							--unary
    SwitchStatement 		= switch "("Var")" SwitchBeginToEnd
    SwitchBeginToEnd 		= openBrace Lemoncase+ Defaultcase? closeBrace
    Lemoncase 			= case BoolOp Statement* 
    Defaultcase					= default Statement* 
    Print								= print"("BoolOp")"
    TypeOf						= typeof "("BoolOp")"
    ReturnStatement		= return BoolOp?
    BeginToEnd 	 = openBrace Statement+ closeBrace 
    BoolOp 			= BoolOp conop Bool  --binary
                            | Bool
    Bool      		= Bool relop AddOp --binary
                            | AddOp
    AddOp       	  = AddOp addop Term            --binary
                          | Term
    Term      		= Term mulop Exponential          --binary
                          | Exponential
    Exponential   = Factor "^" Exponential                --binary
                            | Factor
    Factor 		   = FunctionCall
                          | ("-" ) Factor       --unary
                          | "(" BoolOp ")"                     --parens
                          | "[" Arguments "]"					--arrays
                          | "{" DictValues "}"					--dictionary
                          | numlit
                          | stringlit
                          | boollit
                          | Var
    numlit       		= digit+ ("." digit+)?
    boollit 		     = "sweet" | "sour"
    stringlit 		  = "\"" char* "\""
    char 				 = "\\n" 
                          | "\\'"  
                          | "\\\""
                          | "\\\\"
                          | "\\u{" hexDigit hexDigit? hexDigit? hexDigit? hexDigit? hexDigit?  "}" 			--hex
                          | ~"\"" ~"\\" any
    Var					= Var "." Var		 --property_or_dictionary
                                | Var "["digit+"]"	--array
                              | id
    Type       			= ArrayType | types | DictType
    types                 = ("pulp"|"slice"|"taste"|"dontUseMeForEyeDrops") ~alnum
    ArrayType			= Type "[]" 
    DictType			  = "<" Type "," Type ">" 
    void					= "noLemon" ~alnum
    functionBeginning     = "When life gives you lemons try" ~alnum
    ifBeginning       	= "Squeeze the lemon if" ~alnum
    elifBeginning       	= "Keep juicing if" ~alnum
    elseBeginning       	= "Toss the lemon and do" ~alnum
    whileBeginning   = "Drink the lemonade while" ~alnum
    forBeginning 		= "forEachLemon" ~alnum
    classType				= "Limon" ~alnum
    extends				= "branches" ~alnum
    case					   = "lemonCase" ~alnum
    print					     = "pour"
    typeof					= "species"
    openBrace 			= "BEGIN JUICING" ~alnum
    closeBrace			= "END JUICING" ~alnum
    switch 					= "Pick" ~alnum
    break					= "chop" ~alnum
    continue 			 = "nextLemon" ~alnum
    return				= "you get lemonade and" ~alnum
    default				= "citrusLimon" ~alnum
    const					= "lemonStain" ~alnum
    static				= "trunk" ~alnum
    import				= "recieve" ~alnum
    from				= "from" ~alnum
    keyword   			= types | void | print | openBrace | closeBrace | switch | break | case | default | classType | const | forBeginning | continue | boollit | typeof
    id        			= ~keyword letter (alnum | "_")*
    Arguments 			= (BoolOp",")* BoolOp			--unary
                          |""
    Parameters			= (Type id",")* Type id	--params
                            |""
    DictValues			= (BoolOp ":" BoolOp ",")* BoolOp ":" BoolOp --params
                            |""
    space    				+= "( *)" (~"(* )" any)* "(* )"  				 --longComment
                                    | "( *)" (~"\n" any)* ("\n" | end) 		 	--comment
    conop				  = "&&" | "||"
    relop   				= "<=" | "<" | "==" | "!=" | ">=" | ">"
    addop 			  = "+" | "-"
    mulop				  = "*"| "/"| "%"
  }`)


export default function parse(sourceCode) {
  const match = lemonScriptGrammar.match(sourceCode)
  return match.succeeded()
}