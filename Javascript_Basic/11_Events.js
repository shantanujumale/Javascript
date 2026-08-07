let btn = document.querySelector('#btn');
let filenp = document.querySelector('#filenp');

btn.addEventListener('click', function() {
    filenp.click();
});

filenp.addEventListener('change',function(d){
 
    btn.textContent = d.target.files[0].name;
})