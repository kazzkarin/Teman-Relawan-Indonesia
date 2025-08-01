document.addEventListener("DOMContentLoaded", function () {
  // Load Header
  fetch("../../komponen/header/header.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("header-container").innerHTML = data;
    });

  // Load Footer
  fetch("../../komponen/footer/footer.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("footer-container").innerHTML = data;
    });
});
