document
  .getElementById("loginButton")
  .addEventListener("click", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    if (username === "financeiro" && password === "sogamax") {
      errorMessage.style.display = "none";
      window.location.href = "/home.html";
    } else {
      errorMessage.style.display = "block";
    }
  });
