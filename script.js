import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    get,
    child,
    remove
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";


// =======================
// FIREBASE
// =======================

const firebaseConfig = {
    apiKey: "AIzaSyDJn252wAEujb3p2501MWAjeT3kp5rWOns",
    authDomain: "projetomes-31cea.firebaseapp.com",
    databaseURL: "https://projetomes-31cea-default-rtdb.firebaseio.com",
    projectId: "projetomes-31cea",
    storageBucket: "projetomes-31cea.firebasestorage.app",
    messagingSenderId: "465528378623",
    appId: "1:465528378623:web:a861025c34fa1f7ddfa8ca"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let maquinaEditando = null;


// =======================
// CADASTRO
// =======================

async function cadastrarMaquina() {

    const nome = document.getElementById("nomeMaquina").value;
    const codigo = document.getElementById("codigoMaquina").value;
    const setor = document.getElementById("setorMaquina").value;
    const esp32Id = document.getElementById("esp32Id").value;
    const codigoOriginal = maquinaEditando || codigo;

    try {

        await set(
            ref(db, "maquinas/" + codigoOriginal),
            {
                nome,
                codigo,
                setor,
                esp32Id,
                status: "desligada",
                quantidade: 0
            }
        );

        document.getElementById("formCadastro").reset();

        fecharCadastro();

        carregarMaquinas();

    } catch (erro) {

        console.error(erro);
        alert("Erro ao cadastrar máquina.");

    }
}


// =======================
// LISTAGEM
// =======================

async function carregarMaquinas() {

    const lista = document.getElementById("listaMaquinas");

    lista.innerHTML = "";

    try {

        const snapshot =
            await get(child(ref(db), "maquinas"));

        if (snapshot.exists()) {

            const maquinas = snapshot.val();

            Object.values(maquinas).forEach(maquina => {

                lista.innerHTML += `
                    <div class="card-maquina">

                        <div class="card-header">

                            <h3>${maquina.nome}</h3>

                            <div class="card-acoes">

                                <button
                                    class="icone-btn editar"
                                    onclick="editarMaquina('${maquina.codigo}')"
                                >
                                    ✏️
                                </button>

                                <button
                                    class="icone-btn excluir"
                                    onclick="excluirMaquina('${maquina.codigo}')"
                                >
                                    🗑️
                                </button>

                            </div>

                        </div>

                        <p>
                            <strong>Código:</strong>
                            ${maquina.codigo}
                        </p>

                        <p>
                            <strong>Setor:</strong>
                            ${maquina.setor}
                        </p>

                        <p>
                            <strong>ESP32:</strong>
                            ${maquina.esp32Id}
                        </p>

                    </div>
                `;

            });

        }

    } catch (erro) {

        console.error(erro);

    }
}


// =======================
// EXCLUIR
// =======================

window.excluirMaquina = async function(codigo) {

    const confirmar =
        confirm("Deseja excluir esta máquina?");

    if (!confirmar) return;

    try {

        await remove(
            ref(db, "maquinas/" + codigo)
        );

        carregarMaquinas();

    } catch (erro) {

        console.error(erro);

        alert("Erro ao excluir máquina.");

    }

};


// =======================
// EDITAR
// =======================

window.editarMaquina = async function(codigo) {

    const snapshot =
        await get(child(ref(db), "maquinas/" + codigo));

    if (!snapshot.exists()) return;

    const maquina = snapshot.val();

    document.getElementById("nomeMaquina").value =
        maquina.nome;

    document.getElementById("codigoMaquina").value =
        maquina.codigo;
    
    document.getElementById("codigoMaquina")
    .disabled = true;

    document.getElementById("setorMaquina").value =
        maquina.setor;

    document.getElementById("esp32Id").value =
        maquina.esp32Id;

    document.getElementById("tituloModal")
        .textContent = "Editar Máquina";

    document.getElementById("btnSalvar")
        .textContent = "Salvar Alterações";

    maquinaEditando = codigo;

    document.getElementById("modalCadastro")
        .style.display = "flex";
};


// =======================
// EVENTOS
// =======================

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("formCadastro");

    if (form) {

        form.addEventListener("submit", (e) => {

            e.preventDefault();

            cadastrarMaquina();

        });

    }

    carregarMaquinas();

});


// =======================
// TROCA DE TELAS
// =======================

window.abrirTela = function(id) {

    document.querySelectorAll(".tela").forEach(tela => {
        tela.style.display = "none";
    });

    document.getElementById(id).style.display = "block";

    // 👇 ADICIONE ISSO
    if (id === "monitoramento") {
        carregarMonitoramento();
    }
};


// =======================
// MODAL CADASTRO
// =======================

window.abrirCadastro = function() {

    document.getElementById("formCadastro").reset();

    document.getElementById("codigoMaquina")
        .disabled = false;

    document.getElementById("tituloModal")
        .textContent = "Nova Máquina";

    document.getElementById("btnSalvar")
        .textContent = "Cadastrar";

    maquinaEditando = null;

    document.getElementById("modalCadastro")
        .style.display = "flex";
};

window.fecharCadastro = function() {

    document.getElementById("modalCadastro")
        .style.display = "none";

};


// =======================
// TELA INICIAL
// =======================

abrirTela("dashboard");

async function carregarMonitoramento() {

    const container =
        document.getElementById("monitoramentoMaquinas");

    container.innerHTML = "";

    const snapshot =
        await get(child(ref(db), "maquinas"));

    if (!snapshot.exists()) return;

    const maquinas = snapshot.val();

    Object.values(maquinas).forEach(maquina => {

        let cor = "status-verde";
        let emoji = "🟢";

        if (maquina.status === "parada") {
            cor = "status-amarelo";
            emoji = "🟡";
        }

        if (maquina.status === "desligada") {
            cor = "status-vermelho";
            emoji = "🔴";
        }

        container.innerHTML += `
            <div class="card-maquina">

                <div class="card-header">

                    <h3>${maquina.nome}</h3>

                    <span>${emoji}</span>

                </div>

                <p><strong>Código:</strong> ${maquina.codigo}</p>

                <p><strong>Setor:</strong> ${maquina.setor}</p>

                <p><strong>Quantidade:</strong> ${maquina.quantidade ?? 0}</p>

                <div class="monitor-status ${cor}">
                    ${emoji} ${maquina.status || "produzindo"}
                </div>

            </div>
        `;
    });
}