const API_URL = "https://ws-public.interpol.int/notices/v1/red";
const botonRecargar = document.querySelector("#boton-recargar");
const estado = document.querySelector("#estado");
const listaAvisos = document.querySelector("#lista-avisos");

function mostrarAviso(aviso) {
	const tarjeta = document.createElement("article");
	tarjeta.className = "tarjeta-aviso";

	const nombreCompleto = [aviso.forename, aviso.name].filter(Boolean).join(" ") || "Nombre no disponible";
	const imagenUrl = aviso._links?.thumbnail?.href;
	if (imagenUrl) {
		const imagen = document.createElement("img");
		imagen.src = imagenUrl;
		imagen.alt = `Fotografía de ${nombreCompleto}`;
		imagen.loading = "lazy";
		imagen.referrerPolicy = "no-referrer";
		imagen.addEventListener("error", () => {
			imagen.remove();
			tarjeta.classList.remove("con-foto");
		});
		tarjeta.classList.add("con-foto");
		tarjeta.append(imagen);
	}

	const nombre = document.createElement("h2");
	nombre.textContent = nombreCompleto;
	tarjeta.append(nombre);

	const detalles = document.createElement("p");
	const nacionalidades = Array.isArray(aviso.nationalities) ? aviso.nationalities.join(", ") : "No disponible";
	detalles.textContent = `Fecha de nacimiento: ${aviso.date_of_birth || "No disponible"} · Nacionalidad: ${nacionalidades || "No disponible"}`;
	tarjeta.append(detalles);

	const enlace = aviso._links?.self?.href;
	if (enlace) {
		const verMas = document.createElement("a");
		verMas.href = enlace;
		verMas.target = "_blank";
		verMas.rel = "noopener noreferrer";
		verMas.textContent = "Ver aviso";
		tarjeta.append(verMas);
	}

	return tarjeta;
}

async function cargarAvisos() {
	botonRecargar.disabled = true;
	estado.classList.remove("error");
	estado.textContent = "Cargando avisos…";
	listaAvisos.replaceChildren();

	try {
		const respuesta = await fetch(API_URL);
		if (!respuesta.ok) {
			throw new Error(`Error HTTP ${respuesta.status}`);
		}

		const datos = await respuesta.json();
		const avisos = datos._embedded?.notices || [];

		if (avisos.length === 0) {
			estado.textContent = "La API no devolvió avisos.";
			return;
		}

		listaAvisos.append(...avisos.map(mostrarAviso));
		estado.textContent = `Se encontraron ${avisos.length} avisos.`;
	} catch (error) {
		estado.classList.add("error");
		estado.textContent = `No se pudieron cargar los avisos: ${error.message}. Revisa tu conexión o la disponibilidad de la API.`;
	} finally {
		botonRecargar.disabled = false;
	}
}

botonRecargar.addEventListener("click", cargarAvisos);
cargarAvisos();
