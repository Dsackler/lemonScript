# lemonScript
## Introduction
One morning, a young Khalid awoke and decided to finish his A.I assignment. “Gosh, I just hate python more than life itself” he muttered as he typed with a sour face. At that moment, he looked at the lemon pulp he has been collecting for the past 5 years due to his midnight lemon snack addiction. At that moment, he decided to call his much smarter and superior friend David to write him a language that everyone could enjoy. So, David formed a team with Brent, Julian, Justin, Raul, and Khalid with the intent to create a language for all lemon enthusiasts.
The stage has been set. lemonScript was to be a self-explanatory, statically-typed, esoteric language with the sole purpose of saving people who had a sour taste in their mouth from using popular languages. 

**Brought to you by:** [Julian Arregoces](https://github.com/Jarregoc),[Raul Rodriguez](https://github.com/RaulRdz15), [Brent Shafer](https://github.com/bshafer93), Justin Yee, [David Sackler](https://github.com/Dsackler), [Khalid Alghunaim](https://github.com/kfg2000)
*I will link everyones name to their github account later*

## Features
- statically typed language
- switch statements
- easily defined blocks of code seperated by the words BEGIN JUICING and END JUICING

## Types
| JavaScript | lemonscript |
| ---------- | ----------- |
| String     | Pulp	   |
| Number     | Slices (for integers) or dontUseMeForEyeDrops (for floats)      |
| Boolean    | Sour        |
| const      | lemonStain  |


## Variable Declaration and Assignment


| JavaScript                           | RealHotGirlScript                     |
| ------------------------------------ | ------------------------------------- |
| let x = 10;                          | Slices x = 10                         |
| let y = "Lemons are great";          | Pulp y = "Lemons are great"           |
| let z = 4.20;                        | dontUseMeForEyeDrops z = 4.20         |
| let a = true;                        | Sour a = sweet                        |
| const name = "yellow";               | lemonStain color = "yellow"           |


## Built In Functions

<table>
<tr>
<td> <h3>lemonScript</h3> </td> <td> <h3>javascript</h3> </td>
</tr>
<tr>
<td> 


	pour(“Hello World”)	
	
</td>
<td>


```javascript
console.log("Hello, World!")
```

</td>
</tr>
</table>



## Function Declarations

<table>
<tr>
<td> <h3>lemonScript</h3> </td> <td> <h3>javascript</h3> </td>
</tr>
<tr>
<td> 
	When life gives you lemons try (return type) *name*() BEGIN JUICING
	  statements                          		
        END JUICING
</td>
<td>
	function name([param[, param,[..., param]]]) {
            [statements]
        }
</td>
</tr>
</table>

## Comments

| JavaScript | lemonscript |
| --- | ----|
| //this is a single line comment | ( \*)this is a comment |
| /\*this is a multi-line comment | ( \*)this is a multi-comment(\* ) |


## Arithmetic

- sum = 2 + 4
- difference = 2 - 4
- multiplication = 2 * 4
- integer division = 4 / 2
- exponents = 4 ^ 2 *note we can change this to ** or something else
- modulus = 4 % 2

## A guide to lemonscript's keywords

| JavaScript | lemonscript |
| ---------- | ----------- |
|   boolean      |  taste      |
|   break        |  chop       |
|   case         |  lemonCase #|
|   catch        |  spit       |
|   const        |  lemonStain |
|   continue     |  nextLemon  |
|   default      |  citrusLimon |
|   do           |  do           |
|   else         | Toss the lemon and do |
|   else if      | Keep juicing if |
|   false        | sour        |
|   for          | forEachLemon|
|   function     | When life gives you lemons try (return type) *name*() BEGIN    |
|   if           | Squeeze the lemon if|
|   implements   | graft       |
|   in           | in          |
|   interface    | lemonDNA    |
|   let          | harvest     |
|   new          | seed      |
|   null         | empty     |
|   private      | greenhouse|
|   protected    | garden    |
|   public       | orchard   |
|   return       | you get lemonade and ... |
|   static       | trunk     |
|   switch       | Pick ()    |
|   this         | thisLemon   |
|   throw        | tossLemonade |
|   throws       | tossLemonades|
|   true         | sweet      |
|   try          | bite       |
|   typeof       | species    |
|   void         | noLemon    |
|   while        | Drink the lemonade while |
|   class        | Limon      |
|   export       | ship       |
|   extends      | branches   |
|   import       | receive    |
|   super        | takeLemonadeBreak  |


## Types of Static Semantic Errors

## Control Flow

<table>
<tr>
<td> <h3>Programming Feature</h3>      </td><td> <h3>lemonScript</h3> </td> <td> <h3>javascript</h3> </td>
</tr>
<tr>
<td> If/Else </td>
<td> 
	
	Squeeze the lemon if(x == 10)
		BEGIN JUICING
		pour(“Number is 10”)
		END JUICING
		
	Keep juicing if(x == 20)
		BEING JUICING
		pour(“Number is 10”)
		END JUICING

	Toss the lemon and do
		BEGIN JUICING
		pour(“Number is not 10 or 20”)
		END JUICING
	
</td>
<td>
	
```javascript
	if (x == 10) {
		console.log(“Number is 10”)
	} else if (x == 20) {
		console.log(“Number is 20”)
	} else {
		console.log(“Number is not 10 or 20”)
	}
```
</td>
</tr>

<tr>
<td> For Loops </td>
	
<td> 

	forEachLemon (slice i = 0; i < 5; i++) {
		BEGIN JUICING
		pour(“Number: ” + i)
		END JUICING
	}
	
</td>
<td>


```javascript
for (i = 0; i < 5; i++) {
	console.log(“Number: ” + i)
}
```

</td>
	
	
</tr>
<tr>
<td> While Loops </td>
<td> 
	
	Drink the lemonade while (x > 0) 
		BEGIN JUICING
		pour(x)
		x--
		END JUICING
	
</td>
<td>

```javascript
while (x > 0) {
	console.log(x)
	x--
}
```

</td>
	
</tr>
</table>


## Example Programs
### Hello World


<table>
<tr>
<td> <h3>lemonScript</h3> </td> <td> <h3>javascript</h3> </td>
</tr>
<tr>
<td> 


	When life gives you lemons try noLemon helloWorld()
		BEGIN JUICING
		pour(“Hello World”)
		END JUICING
	
</td>
<td>


```javascript
function helloWorld() {
	console.log(“Hello World”)
}
```

</td>
</tr>
</table>



### Adding Two Numbers

<table>
<tr>
<td> <h3>lemonScript</h3> </td> <td> <h3>javascript</h3> </td>
</tr>
<tr>
<td> 


	When life gives you lemons try slices add(slices a, slices b) 
		BEGIN JUICING
		you get lemonade and a + b
		END JUICING	
	
</td>
<td>


```javascript
function add(a, b) {
	return a + b
}
```

</td>
</tr>
</table>

### Switch Statements

<table>
<tr>
<td> <h3>lemonScript</h3> </td> <td> <h3>javascript</h3> </td>
</tr>
<tr>
<td> 
	
	slice even = 4
	Pulp twofoursixeight
	Pick (even)
	  BEGIN JUICING
	  lemonCase 2
	    twofoursix = "two"
	    chop
	  lemonCase 4
	    twofoursix = "four"
	    chop
	  lemonCase 6
	    twofoursix = "six"
	    chop
	  citrusLimon
	    twofoursix = "eight"
	  END JUICING
	pour(“Our result is ” + twofoursix)
		
	
</td>
<td>


```javascript
let even = 4;
let twofoursixeight;
switch (even) {
  case 2:
    twofoursix = "two";
    break;
  case 4:
    twofoursix = "four";
    break;
  case 6:
    twofoursix = "six";
    break;
  default:
    twofoursix = "Eight";
}

console.log(“Our result is ” + twofoursix);
```

</td>
</tr>
</table>

### Nth Fibonacci 

<table>
<tr>
<td> <h3>lemonScript</h3> </td> <td> <h3>javascript</h3> </td>
</tr>
<tr>
<td> 


	When life gives you lemons try slices fibonacci(slices num) 
		BEGIN JUICING
		Squeeze the lemon if(num == 0)
		  BEGIN JUICING
		  you get lemonade and 0
		  END JUICING
		Squeeze the lemon if(num == 1 || num == 2)
		  BEGIN JUICING
		  you get lemonade and 1
		  END JUICING
		you get lemonade and fibonacci(num - 2) + fibonacci(num - 1)
		END JUICING	
	
</td>
<td>


```javascript
function fibonacci(num){
  if(num == 0){
    return 0;
  }
  if(num == 1 || num == 2){
    return 1
  }
  return fibonacci(num - 2) + fibonacci(num - 1)
}
```

</td>
</tr>
</table>


## Optimizations


