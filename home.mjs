import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { deleteDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

const loading = () => {
  const loadingContainer = document.querySelector(".container-loud");

  loadingContainer.style.display = "flex";

  window.addEventListener("load", () => {
    setInterval(() => {
      loadingContainer.style.display = "none";
    }, 500);
  });
};

loading();

const firebaseConfig = {
  apiKey: "AIzaSyCCs0S8CbwwYVBI0ZFAG8-p2o-sbdnjHBQ",
  authDomain: "contas-fixas-ec60f.firebaseapp.com",
  projectId: "contas-fixas-ec60f",
  storageBucket: "contas-fixas-ec60f.appspot.com",
  messagingSenderId: "56045884403",
  appId: "1:56045884403:web:07cfdea4581699174bb886",
  measurementId: "G-7KV3ZLLWZ6",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let contas = [];
const empresas = [
  "Sogamax - ES",
  "Sogamax - Cardoso",
  "Sogamax - Campos",
  "Sogamax - Italva",
  "Sogamax - MG",
  "Sogamax - SP",
  "C.B. - MG",
  "C.B. - Matriz",
  "C.B. - ES",
  "Qualipay",
  "SGM - RJ",
  "SGM - ES",
  "Holding RecPag",
  "Holding PagRec",
  "JHM Serviços",
  "MCLUS",
];

const tiposDespesa = [
  "Água",
  "Aluguel/Condomínio",
  "Assessoria Contábil",
  "Associação/Filiação",
  "Coleta e Dispensação de Medicamentos Vencidos",
  "Combustível Frota",
  "DARF COFINS",
  "DARF PIS",
  "Dispensação",
  "Energia",
  "FGTS (Funcionário)",
  "GPS (INSS)",
  "ICMS",
  "ICMS - Compet",
  "ICMS - Proteg",
  "ICMS - ST",
  "Internet",
  "Monitoramento – Alarme",
  "Outras Despesas",
  "Pedágio",
  "Plano de Saúde",
  "Plano Odontológico",
  "Plataforma de Consulta",
  "Rastreamento",
  "Seguro de Carga",
  "Seguro Predial",
  "Serasa Consulta",
  "Simples Nacional",
  "Software (Manutenção)",
  "Software (Desenvolvimento)",
  "Taxa de Relatório de Medicamentos",
  "Taxas Extras",
  "Telefonia",
];

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

function addFilterOptions() {
  empresas.forEach((em) => {
    filtroEmpresa.add(new Option(em));
    selectEmpresa.add(new Option(em));
  });
  tiposDespesa.forEach((ds) => {
    filtroTipoDespesa.add(new Option(ds));
    selectTipoDespesa.add(new Option(ds));
  });
}
addFilterOptions();
async function getContas() {
  contas = [];
  try {
    const querySnapshot = await getDocs(collection(db, "contas"));
    querySnapshot.forEach((doc) => {
      let conta = doc.data();
      conta.firestoreId = doc.id;
      contas.push(conta);
    });

    // Encontrar o maior ID para o próximo
    let maiorId = 0;
    contas.forEach((conta) => {
      if (conta.id > maiorId) {
        maiorId = conta.id;
      }
    });

    // Armazenar o maior ID encontrado para usá-lo no próximo
    localStorage.setItem("maiorId", maiorId);

    ordenarPorId();
  } catch (error) {
    console.error("Erro ao buscar contas:", error);
  }
}

function renderizarTabela(contasFiltradas = contas) {
  tableBody.innerHTML = "";
  contasFiltradas.forEach((conta) => {
    conta.observacao === undefined ? (conta.observacao = "") : conta.observacao;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td data-label="ID">${conta.id}</td>
      <td data-label="Agente">${conta.agente}</td>
      <td data-label="Descrição">${conta.descricao}</td>
     <td class="centralizado" data-label="Dia Vencimento">
  ${conta.diaVencimento.toString().padStart(2, "0")}
</td>
     <td data-label="Valor">R$ ${conta.valor.toLocaleString("pt-BR", {
       style: "currency",
       currency: "BRL",
     })}</td>

      <td data-label="Empresa">${conta.empresa}</td>
      <td data-label="Tipo Despesa">${conta.tipoDespesa}</td>
      <td data-label="Observação">${conta.observacao}</td>
      <td class="buttons" data-label="Ação">
        <button class="btn-editar">Editar</button>
        <button class="btn-excluir" data-id="${
          conta.firestoreId
        }">Excluir</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  document.querySelectorAll(".btn-excluir").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      if (confirm("Tem certeza que deseja excluir esta despesa?")) {
        await excluirConta(id);
      }
    });
  });

  async function excluirConta(id) {
    try {
      const contaRef = doc(db, "contas", id);
      await deleteDoc(contaRef);
      alert("Despesa excluída com sucesso!");
      window.location.reload();
      await getContas();
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      alert("Erro ao excluir despesa.");
    }
  }

  const buttonsEdit = document.querySelectorAll(".btn-editar");
  buttonsEdit.forEach((el) => {
    el.addEventListener("click", (e) => {
      let idConta =
        e.target.parentElement.parentElement.querySelector("td").textContent;
      abrirModalEdicao(idConta);
    });
  });
}

let ordenacaoAscendente = true;

function ordenarPorId() {
  contas.sort((a, b) => {
    if (ordenacaoAscendente) {
      return a.id - b.id;
    } else {
      return b.id - a.id;
    }
  });
  renderizarTabela();
  ordenacaoAscendente = !ordenacaoAscendente;
}
function aplicarFiltros() {
  const empresaFiltro = filtroEmpresa.value;
  const observacaoFiltro = filtroObservacao.value.toLowerCase();
  const diaVencimentoFiltro = filtroDiaVencimento.value;
  const tipoDespesaFiltro = filtroTipoDespesa.value;

  const agenteFiltro = document
    .getElementById("formAgente")
    .value.toLowerCase();

  const contasFiltradas = contas.filter((conta) => {
    const empresaMatch =
      empresaFiltro === "Todas" || conta.empresa === empresaFiltro;
    const observacaoMatch =
      observacaoFiltro === "" ||
      conta.observacao.toLowerCase().includes(observacaoFiltro);
    const diaVencimentoMatch =
      diaVencimentoFiltro === "" ||
      conta.diaVencimento === parseInt(diaVencimentoFiltro);
    const tipoDespesaMatch =
      tipoDespesaFiltro === "Todas" || conta.tipoDespesa === tipoDespesaFiltro;

    const agenteMatch =
      agenteFiltro === "" || conta.agente.toLowerCase().includes(agenteFiltro);

    return (
      empresaMatch &&
      observacaoMatch &&
      diaVencimentoMatch &&
      tipoDespesaMatch &&
      agenteMatch
    );
  });

  renderizarTabela(contasFiltradas);
}

filtroEmpresa.addEventListener("change", aplicarFiltros);
filtroObservacao.addEventListener("input", aplicarFiltros);
filtroDiaVencimento.addEventListener("input", aplicarFiltros);
filtroTipoDespesa.addEventListener("change", aplicarFiltros);
document.getElementById("formAgente").addEventListener("input", aplicarFiltros);

function abrirModalEdicao(id) {
  id = Number(id);
  const conta = contas.find((conta) => conta.id === id);

  if (conta) {
    editando = true;
    modalTitulo.textContent = "Editar Despesa";
    idDespesaInput.value = Number(conta.id);
    document.getElementById("id").value = conta.id;
    document.getElementById("descricao").value = conta.descricao;
    document.getElementById("valor").value = conta.valor;
    document.getElementById("diaVencimento").value = conta.diaVencimento;
    document.getElementById("empresa").selectedOptions[0].textContent =
      conta.empresa;
    document.getElementById("observacao").value = conta.observacao;
    document.getElementById("tipoDespesa").selectedOptions[0].textContent =
      conta.tipoDespesa;
    document.getElementById("agente").value = conta.agente;
    modal.style.display = "flex";
  }
}

abrirModalBtn.addEventListener("click", () => {
  editando = false;
  modalTitulo.textContent = "Cadastrar Nova Despesa";
  formDespesa.reset();
  modal.style.display = "flex";
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
    conta = contas.find((conta) => conta.id === Number(id));

    idFire = conta.firestoreId;
  } catch (error) {}

  const despesa = {
    id: Number(id),
    agente: document.getElementById("agente").value,
    descricao: document.getElementById("descricao").value,
    diaVencimento: parseInt(document.getElementById("diaVencimento").value),
    valor: parseFloat(document.getElementById("valor").value),
    empresa: document.getElementById("empresa").value,
    tipoDespesa: document.getElementById("tipoDespesa").value,
    observacao: document.getElementById("observacao").value,
  };

  try {
    if (editando) {
      const contaRef = doc(db, "contas", idFire);
      await updateDoc(contaRef, despesa);
      window.location.reload();
    } else {
      await addDoc(collection(db, "contas"), despesa);
      window.location.reload();
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
  aplicarFiltros();

  const buttonsEdit = document.querySelectorAll(".btn-editar");
  buttonsEdit.forEach((el) => {
    el.addEventListener("click", (e) => {
      let idConta =
        e.target.parentElement.parentElement.querySelector("td").textContent;
      abrirModalEdicao(idConta);
    });
  });
});
