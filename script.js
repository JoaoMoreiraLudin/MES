async function atualizarContador() {
    const resposta = await fetch(
        "https://projetomes-31cea-default-rtdb.firebaseio.com/maquinas/injetora_01/pecas.json"
    );

    const pecas = await resposta.json();

    console.log("Valor recebido:", pecas);

    document.getElementById("contador").innerText = pecas;
}

atualizarContador();
