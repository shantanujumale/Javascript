console.log('Hello Teena');

// let car = {
//   brand: "Tesla",
//   model: "Model 3",
//   year: 2024,
//   start: function() {
//     return this.brand + " " + this.model + " is starting...";
//   }
// };

// console.log(car.brand);       
// console.log(car["year"]); 
// console.log(car.year);   
// console.log(car.start());    


// reverse the string

// function revstring(sentence){
//     return sentence
//     .split(" ")
//     .map(word => word.split("").reverse().join(""))
//     .join(" ");

// }

// console.log(revstring("Hello Teena"));



function secondLargest(arr) {
  let first = -Infinity, second = -Infinity;
  for (let num of arr) {
    if (num > first) {
      second = first;
      first = num;
    } else if (num > second && num < first) {
      second = num;
    }
  }
  return second;
}


console.log([10,23,12,31,24]);




0// console.log(secondLargest([10, 20, 4, 45, 99])); // 45
