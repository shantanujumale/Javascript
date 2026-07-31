console.log('Hello Teena...');

// function discountcalculator(dis){
//     return function(price){
//         return price - price * (dis / 100);
//     };
// }

// let discount = discountcalculator(10);
// console.log(discount(200));
// console.log(discount(1000));

// function counter(){
//     let count = 0;
//     return function(){
//         count++;
//         return count;
//     }
// }

// let c = counter();
// console.log(c());
// console.log(c());
// console.log(c());

// let d = counter();
// console.log(d());

// create a pure function to transfor a value

// function double(val){
//     return val * val;
// }

// console.log(double(23));

//  customer multiplier

// function multipler(factor){
//     return function(number){
//         return number * factor;
//     };
// }

// let double = multipler(2);
// let triple = multipler(3);

// console.log(double(5));
// console.log(triple(5));


 // private data

//  function secretholder(secret){
//     return {
//         get_secret : function(){
//             return secret;
//         },
//         set_secret: function(newsecret){
//             secret = newsecret;
//         }
//     };
//  }

//  let mysecret = secretholder('Shantanu');
//  console.log(mysecret.get_secret());

//  mysecret.set_secret('Teena');
//  console.log(mysecret.get_secret());


