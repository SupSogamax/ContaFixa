import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCCs0S8CbwwYVBI0ZFAG8-p2o-sbdnjHBQ",
  authDomain: "contas-fixas-ec60f.firebaseapp.com",
  projectId: "contas-fixas-ec60f",
  storageBucket: "contas-fixas-ec60f.firebasestorage.app",
  messagingSenderId: "56045884403",
  appId: "1:56045884403:web:07cfdea4581699174bb886",
  measurementId: "G-7KV3ZLLWZ6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let contas = [];
const empresas = ["Empresa A", "Empresa B", "Empresa C"];
const tiposDespesa = ["Aluguel", "Energia", "Água", "Internet", "Telefone", "Outros"];

const tableBody = document.querySelector("#contasTable tbody");
const modal = document.getElementById("modal");
const modalTitulo = document.getElementById("modalTitulo");
const abrirModalBtn = document.getElementById("abrirModal");
const fecharModalBtn = document.getElementById("fecharModal");
const formDespesa = document.getElementById("formDespesa");
const filtroEmpresa = document.getElementById("filtroEmpresa");
const filtroObservacao = document.getElementById("filtroObservacao");
const filtroDiaVencimento = document.getElementById("filtroDiaVencimento");
const filtroTipoDespesa = document.getElementById("filtroTipoDespesa");
const selectEmpresa = document.getElementById("empresa");
const selectTipoDespesa = document.getElementById("tipoDespesa");
const idDespesaInput = document.getElementById("idDespesa");

let editando = false;

function addFilterOptions(){

    empresas.forEach(em => filtroEmpresa.add(new Option(em), selectEmpresa.add(new Option(em))));
    tiposDespesa.forEach(ds => filtroTipoDespesa.add(new Option(ds), selectTipoDespesa.add(new Option(ds))));


}
addFilterOptions()

async function getContas() {
  contas = [];
  try {
    const querySnapshot = await getDocs(collection(db, "contas"));
    querySnapshot.forEach((doc) => {
      let conta = doc.data();
      conta.firestoreId = doc.id;
      contas.push(conta);
    });
    renderizarTabela();
  } catch (error) {
    console.error("Erro ao buscar contas:", error);
  }
}


function renderizarTabela() {
  tableBody.innerHTML = "";
  contas.forEach(conta => {
    conta.observacao === undefined? conta.observacao = "": conta.observacao
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${conta.id}</td>
      <td>${conta.agente}</td>
      <td>${conta.descricao}</td>
      <td class="centralizado">${conta.diaVencimento}</td>
      <td>R$ ${conta.valor.toFixed(2)}</td>
      <td>${conta.empresa}</td>
      <td>${conta.tipoDespesa}</td>
      <td>${conta.observacao}</td>
      <td><button class="btn-editar">Editar</button></td>
    `;
    tableBody.appendChild(row);
    
  });
}
function abrirModalEdicao(id) {

  id = Number(id)
  const conta = contas.find(conta => conta.id === id);
  
  
  
  if (conta) {
    editando = true;
    modalTitulo.textContent = "Editar Despesa";
    idDespesaInput.value = Number(conta.id);
    document.getElementById("id").value = conta.id
    document.getElementById("descricao").value = conta.descricao;
    document.getElementById("valor").value = conta.valor;
    document.getElementById("diaVencimento").value = conta.diaVencimento;
    document.getElementById("empresa").selectedOptions[0].textContent = conta.empresa;
    document.getElementById("observacao").value = conta.observacao;
    document.getElementById("tipoDespesa").selectedOptions[0].textContent = conta.tipoDespesa;
    document.getElementById("agente").value = conta.agente;
    modal.style.display = "block";
  }
}

abrirModalBtn.addEventListener("click", () => {
  editando = false;
  modalTitulo.textContent = "Cadastrar Nova Despesa";
  formDespesa.reset();
  modal.style.display = "block";
});

fecharModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

formDespesa.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  
  const id = document.querySelector("#id").value;
  
  let conta;
  let idFire;
  try {
    contas.find(conta => conta.id === Number(id))
    idFire = conta.firestoreId;  
  } catch (error) {
    
  }
  
  const despesa = {
    id: id,
    agente: document.getElementById("agente").value,
    descricao: document.getElementById("descricao").value,
    diaVencimento: parseInt(document.getElementById("diaVencimento").value),
    valor: parseFloat(document.getElementById("valor").value),
    empresa: document.getElementById("empresa").value,
    tipoDespesa: document.getElementById("tipoDespesa").value,
    observacao: document.getElementById("observacao").value
  };

  try {
    if (editando) {
      const contaRef = doc(db, "contas", idFire);
      await updateDoc(contaRef, despesa);
      window.location.reload()
    } else {
      await addDoc(collection(db, "contas"), despesa);
      window.location.reload()
    }

    modal.style.display = "none";
    formDespesa.reset();
    await getContas();
  } catch (error) {
    console.error("Erro ao salvar despesa:", error);
  }
});

document.addEventListener("DOMContentLoaded", async function () {
  await getContas();
  const buttonsEdit = document.querySelectorAll('.btn-editar')
  buttonsEdit.forEach(el=>{el.addEventListener("click",(e)=>{
    let idConta = e.target.parentElement.parentElement.querySelector("td").textContent
    console.log(idConta);
    
    abrirModalEdicao(idConta)
  })} )
  
  
  
});
