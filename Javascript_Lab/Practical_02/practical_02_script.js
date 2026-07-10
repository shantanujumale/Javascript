// 1. CONST: For global values that never change
const TAX_RATE = 0.10; // 10% tax rate

// Grab the button element from the HTML
const calculateButton = document.getElementById('calcBtn');

// Trigger calculation when the user clicks the button
calculateButton.addEventListener('click', function() {
    
    // 2. LET: For values that will be recalculated or changed
    let subtotal = 0;

    // Package the input elements into an object to demonstrate destructuring
    const inputElements = {
        priceInput: document.getElementById('price'),
        qtyInput: document.getElementById('quantity')
    };

    // 3. DESTRUCTURING: Extract properties into individual variables
    const { priceInput, qtyInput } = inputElements;

    // Convert string inputs from the DOM into numbers
    const price = Number(priceInput.value);
    const qty = Number(qtyInput.value);

    // Reassigning the let variable
    subtotal = price * qty;

    // 4. VAR: Function-scoped variable (older syntax style)
    var taxAmount = subtotal * TAX_RATE;
    var finalTotal = subtotal + taxAmount;

    // 5. TEMPLATE LITERALS: Clean multi-line strings using backticks (`) and ${}
    const outputText = `
        Subtotal: $${subtotal.toFixed(2)} <br>
        Tax (10%): $${taxAmount.toFixed(2)} <br>
        <strong>Total Bill: $${finalTotal.toFixed(2)}</strong>
    `;

    // Render the final string inside the result div
    document.getElementById('result').innerHTML = outputText;
});
