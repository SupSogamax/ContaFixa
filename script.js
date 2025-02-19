document
  .getElementById("loginButton")
  .addEventListener("click", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    if (username === "admin" && password === "1234") {
      errorMessage.style.display = "none";
      window.location.href = "/home.html";
    } else {
      errorMessage.style.display = "block";
    }
  });
