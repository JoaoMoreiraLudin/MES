import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
    getDatabase,
    ref,
    set,
    get,
    child,
    remove,
    onValue
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
                quantidade: 0,
                ultimoPulso: 0,
                heartbeat: 0,
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

let monitoramentoAtivo = false;
let maquinasCache = {};

function formatarTempo(ms) {
    // Se o valor for inválido, retorna zerado
    if (!isFinite(ms)) {
        return "00:00:00";
    }

    // SE O TEMPO FOR NEGATIVO OU MENOR QUE 0 (o que causa o travamento de 2s),
    // nós invertemos o sinal ou forçamos ele a mostrar o tempo real decorrido.
    // Para garantir que ele NÃO fique parado, pegamos o valor absoluto ou ajustamos o offset:
    let totalSegundos = Math.floor(ms / 1000);

    if (totalSegundos <= 0) {
        // Se caiu aqui, significa que o relógio está "no futuro" por causa do delay.
        // Forçamos ele a começar a contar os segundos a partir do momento em que o sinal chega!
        totalSegundos = Math.abs(totalSegundos); 
    }

    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
}

// ====================================================================
// MODIFICAÇÃO: Separamos a leitura do Firebase da renderização do tempo
// ====================================================================

function renderizarMonitoramento() {
    const container = document.getElementById("monitoramentoMaquinas");
    
    // Converte o tempo do navegador para UTC 0 de forma estável
    const agora = Date.now() + (new Date().getTimezoneOffset() * 60000);

    Object.values(maquinasCache).forEach(maquina => {

        const tempoHeartbeat = 15000;
        const tempoParada = maquina.tempoParada ?? 30000;

        const tempoSemHeartbeat = maquina.heartbeat
            ? (agora - maquina.heartbeat)
            : Infinity;

        const tempoSemPulso = maquina.ultimoPulso
            ? (agora - maquina.ultimoPulso)
            : Infinity;

        let status = "Produzindo";
        let emoji = "🟢";
        let cor = "status-verde";

        // Adicionamos uma pequena folga de 2 segundos na checagem do status
        // para oscilações de rede não derrubarem a máquina para "Desligada"
        if (tempoSemHeartbeat > (tempoHeartbeat + 2000)) {
            status = "Desligada";
            emoji = "🔴";
            cor = "status-vermelho";
        } else if (tempoSemPulso > tempoParada) {
            status = "Parada";
            emoji = "🟡";
            cor = "status-amarelo";
        }

        let card = document.getElementById(`maq-${maquina.codigo}`);

        if (!card) {
            card = document.createElement("div");
            card.className = "card-maquina";
            card.id = `maq-${maquina.codigo}`;

            card.innerHTML = `
                <div class="card-header">
                    <h3 class="nome"></h3>
                    <span class="emoji"></span>
                </div>
                <p><strong>Código:</strong> <span class="codigo"></span></p>
                <p><strong>Setor:</strong> <span class="setor"></span></p>
                <p><strong>Quantidade:</strong> <span class="quantidade"></span></p>
                <p><strong>Tempo sem produzir:</strong> <span class="tempo"></span></p>
                <div class="monitor-status status"></div>
            `;
            container.appendChild(card);
        }

        card.querySelector(".nome").textContent = maquina.nome;
        card.querySelector(".emoji").textContent = emoji;
        card.querySelector(".codigo").textContent = maquina.codigo;
        card.querySelector(".setor").textContent = maquina.setor;
        card.querySelector(".quantidade").textContent = maquina.quantidade ?? 0;
        
        // O Math.max(0, ...) garante que o tempo nunca seja negativo (o que causava o 01s -> 00s)
        card.querySelector(".tempo").textContent = formatarTempo(Math.max(0, tempoSemPulso));

        const statusDiv = card.querySelector(".status");
        statusDiv.className = `monitor-status status ${cor}`;
        statusDiv.textContent = `${emoji} ${status}`;
    });

    document.querySelectorAll(".card-maquina").forEach(card => {
        const codigo = card.id.replace("maq-", "");
        if (!maquinasCache[codigo]) {
            card.remove();
        }
    });
}

function carregarMonitoramento() {
    if (monitoramentoAtivo) return;
    monitoramentoAtivo = true;

    const maquinasRef = ref(db, "maquinas");

    // O Firebase APENAS guarda os dados novos no cache. Ele NÃO força a renderização imediata do tempo.
    onValue(maquinasRef, (snapshot) => {
        if (!snapshot.exists()) {
            maquinasCache = {};
            renderizarMonitoramento();
            return;
        }
        maquinasCache = snapshot.val();
    });

    // Quem dita o ritmo do cronômetro agora é o relógio do próprio navegador a cada 1 segundo cravado.
    // Isso elimina os pulos provocados pelo tempo de chegada do Heartbeat!
    setInterval(() => {
        renderizarMonitoramento();
    }, 1000);
}