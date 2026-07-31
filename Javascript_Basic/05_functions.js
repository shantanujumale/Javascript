// function add(a,b){
//     console.log(a+b);
// }

// add(1,2);

// function add(a = 0,b = 0){
//     console.log(a+b);
// }

// add(1,2);

// function a(){
//     return 12 + 1 ;
// }

// let val = a();
// console.log(val);


// function abcd(){
//     let aa = 1;
//     function a(){
//         console.log(aa);
//     }

// }


// what is the difference between function decleration and expredssion in tern of hositing

// greet();

// function greet(){
//     console.log('hello');
// }



// What does operator means parameter

// function greet(a,b,c,...val){
//     console.log(a,b,c,val);

// }

// greet(1 ,2,3,4,5,5,3);


// use rest parameter to accept any number of score and return the total

// function greet(...score){
//     let total = 0; 
//     score.forEach(function(val){
//         total = total +val;
//     })

//     return total;

// }

// console.log(greet(10,11,12,13,14,15,16)) ;


// function checkage(age){

//     if (age<18) return 'Too young';
//     return 'Allow';
// }

// console.log(checkage(23));


// pass a function into another function and execute it inside
// function greet(val){
//     val();
//  }

//  greet(function(){
//     console.log('Hello...');
//  })


// covert the above function into pure function

// let total = 0;
// function addtotal(num){
//     let newtotal = total;
//     total = total + num;
// }



// write a BMI calculator

// function discountcalculator(dis){
//     return function(price){
//         return price - price * (dis / 100);
//     };
// }

// let discount = discountcalculator(10);
// console.log(discount(200));

console.log('Hello teene');