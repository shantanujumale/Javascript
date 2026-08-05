document.getElementById("myForm").addEventListener("submit", function(e) {
  e.preventDefault(); // prevent page reload

  // Collect form data
  let name = document.getElementById("name").value;
  let age = document.getElementById("age").value;
  let email = document.getElementById("email").value;
  let profile = document.getElementById("profile").value;

  // Create CSV content
  let csvContent = "Name,Age,Email,Profile Pic\n";
  csvContent += `${name},${age},${email},${profile}\n`;

  // Create downloadable file
  let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "form_data.csv"; // Excel can open this
  link.click();
});
