(function () {
	const API_URL = 'http://localhost:1337/api/portada?populate=*';
	// Base URL where Strapi serves uploads (adjust if your Strapi runs on another host)
	const STRAPI_BASE = 'http://localhost:1337';

	const loadingEl = document.getElementById('loading');
	const titleEl = document.getElementById('title');
	const metaEl = document.getElementById('meta');
	const errorEl = document.getElementById('error');
	const portadaEl = document.getElementById('portada');

	function showLoading() {
		loadingEl.style.display = '';
		titleEl.style.display = 'none';
		metaEl.style.display = 'none';
		errorEl.style.display = 'none';
	}

	function showError(msg) {
		loadingEl.style.display = 'none';
		titleEl.style.display = 'none';
		metaEl.style.display = 'none';
		errorEl.textContent = msg;
		errorEl.style.display = '';
	}

	function render(data) {
		if (!data) {
			showError('No se encontró contenido para la portada');
			return;
		}

		// data may be the object itself (data) or nested in data.data
		const payload = data.data || data;

		// If payload is an object with attributes, prefer them
		const item = payload.attributes || payload;

		const title = item.title || item.nombre || 'Sin título';
		const id = item.documentId || payload.documentId || payload.id || item.id || '';
		const created = item.createdAt || payload.createdAt || '';
		const updated = item.updatedAt || payload.updatedAt || '';

		loadingEl.style.display = 'none';
		titleEl.textContent = title;
		titleEl.style.display = '';

		const metaParts = [];
		if (id) metaParts.push(`ID: ${id}`);
		if (created) metaParts.push(`Creado: ${new Date(created).toLocaleString()}`);
		if (updated) metaParts.push(`Actualizado: ${new Date(updated).toLocaleString()}`);

		metaEl.textContent = metaParts.join(' · ');
		metaEl.style.display = '';
    
		// Remove any previous media/components inserted dynamically
		const existingMedia = document.getElementById('portada-media');
		if (existingMedia) existingMedia.remove();
		const existingComps = document.getElementById('portada-components');
		if (existingComps) existingComps.remove();

		// Helper to extract image info (url, alt, caption) from Strapi media field/object
		function getImageInfo(field) {
			if (!field) return null;
			const data = field.data || field;
			// normalize single or array
			const first = Array.isArray(data) ? data[0] : data;
			if (!first) return null;
			// Formats: prefer large > medium > small > thumbnail
			const formats = first.formats || first.attributes?.formats;
			let selectedUrl = null;
			if (formats) {
				for (const key of ['large', 'medium', 'small', 'thumbnail']) {
					if (formats[key] && formats[key].url) {
						selectedUrl = formats[key].url;
						break;
					}
				}
			}
			// fallback to direct url
			if (!selectedUrl) selectedUrl = first.url || first.attributes?.url || null;
			if (!selectedUrl) return null;
			const alt = first.alternativeText || first.attributes?.alternativeText || first.name || '';
			const caption = first.caption || first.attributes?.caption || '';
			return { url: selectedUrl, alt, caption };
		}

		// Try typical field names where image may be stored
		const imageFields = ['imagen', 'image', 'hero', 'heroImage', 'thumbnail', 'intro'];
		let imageUrl = null;
		let imageInfo = null;
		for (const f of imageFields) {
			if (item[f]) {
				imageInfo = getImageInfo(item[f]);
				if (imageInfo) break;
			}
			if (payload[f]) {
				imageInfo = getImageInfo(payload[f]);
				if (imageInfo) break;
			}
		}

		if (imageInfo) {
			const mediaDiv = document.createElement('figure');
			mediaDiv.id = 'portada-media';
			mediaDiv.style.marginBottom = '1rem';
			const img = document.createElement('img');
			img.src = imageInfo.url.startsWith('http') ? imageInfo.url : (STRAPI_BASE + imageInfo.url);
			img.alt = imageInfo.alt || title;
			img.style.maxWidth = '100%';
			img.style.borderRadius = '6px';
			mediaDiv.appendChild(img);
			if (imageInfo.caption) {
				const fig = document.createElement('figcaption');
				fig.textContent = imageInfo.caption;
				fig.style.color = '#666';
				fig.style.fontSize = '0.9rem';
				mediaDiv.appendChild(fig);
			}
			portadaEl.insertBefore(mediaDiv, titleEl);
		}

		// Render simple components / dynamic zones if present
		const comps = item.components || item.content || item.body || payload.components || payload.content;
		if (Array.isArray(comps) && comps.length) {
			const compsDiv = document.createElement('div');
			compsDiv.id = 'portada-components';
			compsDiv.style.marginTop = '1rem';
			comps.forEach((c) => {
				// Try to render common fields
				const compEl = document.createElement('div');
				compEl.style.marginBottom = '0.75rem';
				if (c.__component) compEl.classList.add(c.__component.replace('/', '-'));
				if (c.title) {
					const h = document.createElement('h3');
					h.textContent = c.title;
					compEl.appendChild(h);
				}
				if (c.text) {
					const p = document.createElement('p');
					p.textContent = c.text;
					compEl.appendChild(p);
				}
				// Try to pull an image inside the component
				const compImageUrl = getImageUrl(c.image || c.imagen || c.picture);
				if (compImageUrl) {
					const img = document.createElement('img');
					img.src = compImageUrl.startsWith('http') ? compImageUrl : (window.location.origin + compImageUrl);
					img.style.maxWidth = '100%';
					img.style.borderRadius = '6px';
					compEl.appendChild(img);
				}
				// Fallback: if nothing rendered, show JSON (for debugging)
				if (!compEl.childNodes.length) {
					const pre = document.createElement('pre');
					pre.textContent = JSON.stringify(c, null, 2);
					pre.style.fontSize = '0.85rem';
					compEl.appendChild(pre);
				}
				compsDiv.appendChild(compEl);
			});
			portadaEl.appendChild(compsDiv);
		}
	}

	async function loadPortada() {
		showLoading();
		try {
			const res = await fetch(API_URL);
			if (!res.ok) {
				throw new Error(`HTTP ${res.status}`);
			}
			const json = await res.json();
			console.log('Portada API response:', json);
			// In your example the shape is { data: { id, documentId, title, ... } }
			render(json.data ? { data: json.data } : json);
		} catch (err) {
			console.error('Error loading portada:', err);
			showError('Error al cargar la portada: ' + (err.message || err));
		}
	}

	// run when DOM ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', loadPortada);
	} else {
		loadPortada();
	}
})();

