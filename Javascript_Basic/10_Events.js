console.log('Hello Teena...');


// element.addEventListerner('event name',function(){
//     // ---
// });


// let h1 = document.querySelector('h1');

// h1.addEventListener('click',function(){
//     h1.style.color = 'red';
// });

// h1.addEventListener('dblclick',function(){
//     h1.style.color = 'green';
// });

//remove EventListener

// let h1 = document.querySelector('h1');

// function c1(){
//     h1.style.color = 'green';
// }
// h1.addEventListener('click',c1);
// h1.removeEventListener('click',c1);

// let p = document.querySelector('p');

// p.addEventListener('click',function(){
//     p.style.color = 'red';
// });


// let i = document.querySelector("input");
// i.addEventListener('input',function(){
//     console.log('typed');
// });


// let i = document.querySelector("input");
// i.addEventListener('input',function(d){
//     console.log(d.data);
// });


// let inp = document.querySelector('input');

// inp.addEventListener('input',function(d){
//     if(d.data !== null){
//         console.log(dets.data);
//     }
// })



// let sel = document.querySelector('select');
// sel.addEventListener('change',function(d){
//     console.log(d.target.value);
// })

let sel = document.querySelector('select');
let device = document.querySelector('#device')
sel.addEventListener('change',function(d){
    // device.textContent = 'Device Selected';
    device.textContent = `${d.target.value} Device Selected`;
})

