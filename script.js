<script>
async function atualizar() {

  const url =
    "https://projetomes-31cea-default-rtdb.firebaseio.com/maquinas/injetora_01/pecas.json";

  const resposta = await fetch(url);
  const pecas = await resposta.json();

  document.getElementById("contador").innerText = pecas;
}

setInterval(atualizar, 1000);
atualizar();
</script>
