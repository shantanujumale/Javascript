let form = document.querySelector('form');
let inputs = document.querySelectorAll('input'); // all inputs
let main = document.querySelector('#main');

form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Create card
    let card = document.createElement('div');
    card.classList.add('card');

    // Profile section
    let profile = document.createElement('div');
    profile.classList.add('profile');

    let img = document.createElement('img');
    img.setAttribute('src', inputs[0].value); // profile image URL
    img.style.width = "60px";
    img.style.height = "60px";
    img.style.borderRadius = "50%";

    profile.appendChild(img);
    card.appendChild(profile);

    // Name
    let h3 = document.createElement('h3');
    h3.textContent = inputs[1].value;
    card.appendChild(h3);

    // Info
    let h5 = document.createElement('h5');
    h5.textContent = inputs[2].value;
    card.appendChild(h5);

    // Append card to main
    main.appendChild(card);

    // Clear inputs
    inputs.forEach(function(i) {
        if (i.type !== 'submit') {
            i.value = '';
        }
    });
});
