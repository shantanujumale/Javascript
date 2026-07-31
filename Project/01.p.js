let h1 = document.querySelector('h1');
window.addEventListener('keydown',function (d){
    if(d.key === ' '){
        h1.textContent = 'SPC';
    }
    else{
        h1.textContent = d.key;
    }
});


