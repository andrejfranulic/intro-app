const API_URL = "http://localhost:1337/api/contactos";
const form = document.getElementById("contactForm");
const tbody = document.querySelector("#contactTable tbody");

// Cargar contactos
async function loadContacts() {
    try {
        const response = await fetch(API_URL);
        const json = await response.json();
        console.log('Datos recibidos:', json);
        console.log('Tipo de datos:', typeof json);
        console.log('Es Array?', Array.isArray(json));
        
        // Si json es directamente el array de contactos
        const contacts = Array.isArray(json) ? json : json.data;
        console.log('Contactos a procesar:', contacts);
        
        if (!contacts) {
            console.error('No se encontraron contactos en la respuesta');
            return;
        }

        renderContacts(contacts);
    } catch (error) {
        console.error('Error al cargar contactos:', error);
    }
}

// Mostrar contactos en la tabla
function renderContacts(contacts) {
    tbody.innerHTML = "";
    
    if (!Array.isArray(contacts)) {
        console.error('Error: contacts no es un array:', contacts);
        return;
    }

    contacts.forEach((contact, index) => {
        console.log(`Procesando contacto ${index}:`, contact);
        
        // Intentamos acceder a los datos directamente o a través de attributes
        const contactData = contact.attributes || contact;
        
        if (!contactData) {
            console.error(`Error: Datos de contacto ${index} inválidos:`, contact);
            return;
        }

        const tr = document.createElement("tr");
        // Usamos el documentId para los botones de acción
        const documentId = contact.documentId || contact.id;
        tr.innerHTML = `
            <td>${contactData.nombre || ''}</td>
            <td>${contactData.apellido || ''}</td>
            <td>${contactData.telefono || ''}</td>
            <td>${contactData.correo || ''}</td>
            <td>
                <button onclick="startEdit('${documentId}', ${JSON.stringify(contactData).replace(/"/g, '&quot;')})">✏️</button>
                <button onclick="deleteContact('${documentId}')">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

let editingId = null;
const submitButton = form.querySelector('button[type="submit"]');
const originalButtonText = submitButton.textContent;

// Manejar envío del formulario (crear o actualizar)
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const contactData = {
        data: {
            nombre: form.nombre.value || '',
            apellido: form.apellido.value || '',
            telefono: form.telefono.value || '',
            correo: form.correo.value || ''
        }
    };

    try {
        let url = API_URL;
        let method = "POST";

        if (editingId) {
            // Si estamos editando, usar PUT y agregar el ID a la URL
            url = `${API_URL}/${editingId}`;
            method = "PUT";
        }

        await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(contactData)
        });

        // Resetear el formulario y el modo de edición
        form.reset();
        submitButton.textContent = originalButtonText;
        editingId = null;

        loadContacts();
    } catch (error) {
        console.error('Error al guardar contacto:', error);
    }
});

// Borrar contacto
async function deleteContact(documentId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${documentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // Recargar la lista después de borrar
            loadContacts();
        } else {
            console.error('Error al eliminar el contacto');
        }
    } catch (error) {
        console.error('Error al eliminar el contacto:', error);
    }
}

// Iniciar edición de un contacto
function startEdit(documentId, contactData) {
    editingId = documentId;
    
    // Rellenar el formulario con los datos del contacto
    form.nombre.value = contactData.nombre || '';
    form.apellido.value = contactData.apellido || '';
    form.telefono.value = contactData.telefono || '';
    form.correo.value = contactData.correo || '';
    
    // Cambiar el texto del botón a "Actualizar"
    submitButton.textContent = "Actualizar";
    
    // Hacer scroll al formulario
    form.scrollIntoView({ behavior: 'smooth' });
}

// Cargar contactos al iniciar
loadContacts();
