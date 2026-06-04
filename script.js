import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

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

const contadorRef = ref(db, "maquinas/injetora_01/pecas");

console.log("Firebase conectado");

onValue(contadorRef, (snapshot) => {
    const valor = snapshot.val() ?? 0;

    console.log("Mudou valor:", valor);

    document.getElementById("contador").innerText = valor;
});
