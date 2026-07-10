// EXTERNAL JAVASCRIPT

console.log("External JS successfully loaded.");

// Simulate an error catch using console.error()
try {
    // Intentionally referencing an undefined variable to cause an error
    const data = nonexistentVariable;
} catch (error) {
    console.error("An error occurred in the external script:", error.message);
}

// Automatically execute the environment logger from internal JS on load
if (typeof logEnvironmentDetails === "function") {
    logEnvironmentDetails();
} else {
    console.error("Failed to call logEnvironmentDetails: Function not found.");
}
