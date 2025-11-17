import { db } from '../firebaseConfig.js';
import { collection, addDoc } from 'firebase/firestore';
export default function mostrarOriginal() {

    let app = {
        title: "Nombre de la app",
        episode_id: "Aqui agregamos una descripción de 30 palabras",
        director: "George Lucas",
};

    const contenedor = document.getElementById("app");
    contenedor.innerHTML = "";

    const form = document.createElement("div");
    const resultado = document.createElement("pre");
    resultado.textContent = JSON.stringify(app, null, 2);

    const campos = [
        { key: "title", label: "Titulo" },
        { key: "episode_id", label: "Episodio" },
        { key: "director", label: "Director" },
    ];

    campos.forEach(({ key, label }) => {
        const p = document.createElement("p");
        p.textContent = label;
        const input = document.createElement("input");
        input.placeholder = label;
        input.value = app[key];
        input.oninput = () => {
            app[key] = input.value;
            resultado.textContent = JSON.stringify(app, null, 2);
        };
        form.appendChild(p);
        form.appendChild(input);
    });

    // 🔘 Botón para guardar en Firebase
    const botonGuardar = document.createElement("button");
    botonGuardar.textContent = "Guardar en Firebase";

    botonGuardar.onclick = async () => {
        try {
            await addDoc(collection(db, "proyectos"), app);
            alert("✅ Datos guardados correctamente en Firebase!");
        } catch (error) {
            console.error("Error al guardar en Firebase:", error);
            alert("❌ Ocurrió un error al guardar en Firebase.");
        }
    };
    form.appendChild(botonGuardar);
    // Agregar todo al contenedor
    contenedor.appendChild(form);
    contenedor.appendChild(resultado);


}