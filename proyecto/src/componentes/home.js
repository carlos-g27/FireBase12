export default async function mostrarHome() {
  const contenedor = document.getElementById("app");
  if (!contenedor) {
    console.error("No se encontró el elemento #app en el DOM");
    return;
  }
  contenedor.innerHTML = "";

  const loading = document.createElement("p");
  loading.textContent = "Cargando películas...";
  contenedor.appendChild(loading);

  const apiUrl = "https://www.swapi.tech/api/films";

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

    const data = await res.json();
    console.log("Raw films API response:", data);

    // Extraer lista de items de varias estructuras posibles
    let items = [];
    if (Array.isArray(data.result)) items = data.result;
    else if (Array.isArray(data.results)) items = data.results;
    else if (Array.isArray(data.result?.results)) items = data.result.results;
    else if (Array.isArray(data.results?.results)) items = data.results.results;
    else if (Array.isArray(data)) items = data;
    else if (data.result?.uid && data.result?.properties) items = [data.result]; // caso singular
    else items = data.result ? (Array.isArray(data.result) ? data.result : [data.result]) : [];

    // Limitamos el número de detalles a fetch (evita muchas requests si la API fuera grande)
    const maxFetchDetails = 20;
    const toFetch = items.slice(0, maxFetchDetails);

    const detailPromises = toFetch.map(async (it) => {
      // Si el item ya contiene propiedades completas:
      // it puede ser { uid, url, name } o puede ser { uid, properties: {...} } o { title, ... }
      // Si tiene url, traemos detalle para asegurarnos de obtener properties.
      let fetched = null;
      if (it.url) {
        try {
          const r = await fetch(it.url);
          if (r.ok) {
            fetched = await r.json();
          }
        } catch (e) {
          console.warn("No se pudo traer detalle de", it.url, e);
        }
      }

      // Candidate props vienen primero de fetched.result.properties, luego it.properties, luego fetched.result, luego fetched
      const props =
        fetched?.result?.properties ??
        fetched?.properties ??
        fetched?.result ??
        it?.properties ??
        it;

      // Normalizamos a un objeto con campos conocidos
      const normalized = {
        title:
          props.title ??
          props.name ??
          props.properties?.title ??
          props.properties?.name ??
          "",

        director:
          props.director ??
          props.properties?.director ??
          props.properties?.Director ?? // por si hay variación
          "",

        episode_id:
          // algunos retornan como string, otros como number
          (props.episode_id ?? props.episode ?? props.properties?.episode_id ?? props.properties?.episode) ?? "",

        release_date:
          props.release_date ??
          props.properties?.release_date ??
          props.date ??
          "",

        description:
          props.opening_crawl ??
          props.description ??
          props.properties?.opening_crawl ??
          props.properties?.description ??
          "",
        
        // guardamos el objeto original para inspección si hace falta
        __raw: props,
        __source_url: it.url ?? fetched?.url ?? null,
      };

      return normalized;
    });

    const details = await Promise.all(detailPromises);
    console.log("Normalized details:", details);

    // Limpiar y renderizar
    contenedor.innerHTML = "";

    if (!details.length) {
      const no = document.createElement("p");
      no.textContent = "No se encontraron películas en la API.";
      contenedor.appendChild(no);
      return;
    }

    const lista = document.createElement("div");
    lista.style.display = "grid";
    lista.style.gridTemplateColumns = "repeat(auto-fit, minmax(260px, 1fr))";
    lista.style.gap = "12px";

    details.forEach((movie) => {
      const title = movie.title && movie.title.trim() ? movie.title : "Título desconocido";
      const director = movie.director || "—";
      const episode = movie.episode_id || "—";
      const release = movie.release_date || "—";
      const description = movie.description || "";

      const card = document.createElement("article");
      card.style.border = "1px solid #ddd";
      card.style.padding = "14px";
      card.style.borderRadius = "8px";
      card.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
      card.style.background = "#222"; // si tu UI es oscura como en la imagen
      card.style.color = "#fff";

      const h = document.createElement("h3");
      h.textContent = title;
      h.style.marginTop = "0";
      h.style.textAlign = "center";
      card.appendChild(h);

      const meta = document.createElement("p");
      meta.innerHTML = `<strong>Director:</strong> ${director} — <strong>Episodio:</strong> ${episode} — <strong>Fecha:</strong> ${release}`;
      meta.style.fontSize = "0.95em";
      meta.style.margin = "6px 0 10px 0";
      meta.style.textAlign = "center";
      card.appendChild(meta);

      if (description) {
        const p = document.createElement("p");
        p.textContent = description.length > 240 ? description.slice(0, 240) + "…" : description;
        p.style.fontSize = "0.9em";
        p.style.textAlign = "center";
        p.style.opacity = "0.9";
        card.appendChild(p);
      }

      // Botón para ver raw JSON (útil para debugging)
      const btn = document.createElement("button");
      btn.textContent = "Ver JSON (debug)";
      btn.style.marginTop = "10px";
      btn.onclick = () => {
        // mostrar en consola el objeto raw y normalizado
        console.log("Raw objeto de película:", movie.__raw);
        alert(`Revisa la consola para ver el objeto raw de "${title}"`);
      };
      card.appendChild(btn);

      lista.appendChild(card);
    });

    contenedor.appendChild(lista);
  } catch (error) {
    contenedor.innerHTML = "";
    const err = document.createElement("p");
    console.error("Error al cargar films:", error);
    err.textContent = "Ocurrió un error al cargar la API: " + error.message;
    contenedor.appendChild(err);
  }
}