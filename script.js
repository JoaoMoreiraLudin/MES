async function atualizarContador() {
    try {
        const resposta = await fetch(
            "https://projetomes-31cea-default-rtdb.firebaseio.com/maquinas/injetora_01/pecas.json"
        );

        const pecas = await resposta.json();

        document.getElementById("contador").innerText = pecas || 0;

    } catch (erro) {
        console.error("Erro ao ler Firebase:", erro);
    }
}

// Atualiza a cada segundo
setInterval(atualizarContador, 1000);

// Atualiza ao abrir a página
atualizarContador();
