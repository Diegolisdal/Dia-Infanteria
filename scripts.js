// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCDGtD1nbjIS_rbRMT3_50UED7lB9tU0fw",
    authDomain: "obsequiodiadelarma.firebaseapp.com",
    databaseURL: "https://obsequiodiadelarma-default-rtdb.firebaseio.com",
    projectId: "obsequiodiadelarma",
    storageBucket: "obsequiodiadelarma.appspot.com",
    messagingSenderId: "300494048059",
    appId: "1:300494048059:web:3d6b8cc0e84f625f1fc51e"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
console.log("Firebase initialized");

let selectedVoteCell;

// Cargar los datos almacenados al iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadItemsFromDatabase();
});

document.getElementById('giftForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const itemName = document.getElementById('itemName').value;
    const itemPrice = document.getElementById('itemPrice').value;
    const itemUrl = document.getElementById('itemUrl').value;
    const itemImage = document.getElementById('itemImage').files[0];

    // Verificar que los campos requeridos no estén vacíos
    if (itemName && itemPrice && itemUrl) {
        if (itemImage) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                const imageDataUrl = event.target.result;
                addItemToDatabase(itemName, itemPrice, imageDataUrl, itemUrl);
                document.getElementById('giftForm').reset();
            };

            reader.readAsDataURL(itemImage);
        } else {
            addItemToDatabase(itemName, itemPrice, null, itemUrl); // Imagen es opcional
            document.getElementById('giftForm').reset();
        }
    } else {
        alert('Por favor, completa todos los campos obligatorios.');
    }
});

function addItemToDatabase(name, price, image, url) {
    const newItem = {
        name: name,
        price: price,
        image: image || "",  // Imagen opcional, se guarda como cadena vacía si no se proporciona
        url: url,
        votes: 0,
        voters: []
    };

    const newItemRef = database.ref('items').push();
    newItemRef.set(newItem)
        .then(() => {
            console.log("Item added successfully.");
        })
        .catch((error) => {
            console.error("Error adding item: ", error);
        });
}

function loadItemsFromDatabase() {
    const itemsRef = database.ref('items');
    itemsRef.on('value', function(snapshot) {
        const items = snapshot.val();
        const tableBody = document.getElementById('giftTable').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = ''; // Limpiar la tabla

        for (let id in items) {
            const item = items[id];
            addItemToTable(id, item.name, item.price, item.image, item.url, item.votes, item.voters);
        }
    });
}

// Función para agregar ítems a la tabla
function addItemToTable(id, name, price, image, url, votes, voters) {
    const table = document.getElementById('giftTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    
    const nameCell = newRow.insertCell(0);
    nameCell.textContent = name;

    const priceCell = newRow.insertCell(1);
    priceCell.textContent = `$${price}`;

    const imageCell = newRow.insertCell(2);
    if (image) {
        const img = document.createElement('img');
        img.src = image;
        img.alt = name;
        img.style.width = "50px";  // Ajusta el tamaño de la imagen para que se vea mejor
        imageCell.appendChild(img);
    } else {
        imageCell.textContent = 'No image';
    }

    const urlCell = newRow.insertCell(3);
    const link = document.createElement('a');
    link.href = url;
    link.textContent = 'View';
    link.target = '_blank';
    urlCell.appendChild(link);

    const voteCell = newRow.insertCell(4);
    
    // Asegurar que voters sea un array antes de usar join
    if (!Array.isArray(voters)) {
        voters = []; // Si no es un array, inicializar como uno vacío
    }
    voteCell.textContent = `${votes} (${voters.join(", ")})`;
    voteCell.dataset.id = id;
    voteCell.dataset.voters = JSON.stringify(voters);

    const voteButton = document.createElement('button');
    voteButton.textContent = 'Vote';
    voteButton.classList.add('vote');
    voteButton.addEventListener('click', function() {
        selectedVoteCell = voteCell;
        showModal();
    });
    voteCell.appendChild(voteButton);

    const actionsCell = newRow.insertCell(5);
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete');
    deleteButton.addEventListener('click', function() {
        // Confirmar eliminación antes de proceder
        if (confirm('¿Estás seguro de que deseas eliminar este artículo?')) {
            database.ref('items/' + id).remove()
                .then(() => {
                    console.log("Item removed successfully.");
                })
                .catch((error) => {
                    console.error("Error removing item: ", error);
                });
        }
    });
    actionsCell.appendChild(deleteButton);
}


function showModal() {
    document.getElementById('voteModal').style.display = 'block';
}

function hideModal() {
    document.getElementById('voteModal').style.display = 'none';
}

document.getElementById('confirmVote').addEventListener('click', function() {
    const personSelect = document.getElementById('personSelect');
    const selectedPerson = personSelect.value;
    
    if (selectedPerson) {
        const id = selectedVoteCell.dataset.id;
        const voters = JSON.parse(selectedVoteCell.dataset.voters);

        if (!voters.includes(selectedPerson)) { // Solo añade si no ha votado aún
            voters.push(selectedPerson);
            const newVotes = voters.length;
            selectedVoteCell.textContent = `${newVotes} (${voters.join(", ")})`;
            selectedVoteCell.dataset.voters = JSON.stringify(voters);

            // Actualizar en la base de datos
            database.ref('items/' + id).update({
                votes: newVotes,
                voters: voters
            });

            hideModal();
        } else {
            alert('Esta persona ya ha votado por este ítem.');
        }
    } else {
        alert('Por favor, selecciona un nombre antes de confirmar tu voto.');
    }
});
