import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8DnmQmwXkG4ye3wglmwcBmLqNwPDGg00",
  authDomain: "sogamaxos.firebaseapp.com",
  projectId: "sogamaxos",
  storageBucket: "sogamaxos.appspot.com",
  messagingSenderId: "490830501986",
  appId: "1:490830501986:web:8112a6495f91c36a42d93b",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document
  .getElementById("loginButton")
  .addEventListener("click", async function (event) {
    event.preventDefault();

    const email = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");
    const button = document.getElementById("loginButton");

    button.textContent = "Entrando...";
    button.disabled = true;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      errorMessage.style.display = "none";

      setTimeout(() => {
        window.location.href = "/home.html";
      }, 500);
    } catch (error) {
      errorMessage.style.display = "block";
      errorMessage.textContent = traduzirErro(error.code);
    } finally {
      button.textContent = "Entrar";
      button.disabled = false;
    }
  });

function traduzirErro(codigo) {
  const erros = {
    "auth/invalid-email": "E-mail inválido.",
    "auth/user-disabled": "Usuário desativado.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/network-request-failed": "Falha na conexão.",
    "auth/too-many-requests": "Muitas tentativas, tente mais tarde.",
  };
  return erros[codigo] || "Erro ao fazer login.";
}
