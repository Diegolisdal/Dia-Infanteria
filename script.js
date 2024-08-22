let selectedVoteCell; // Para almacenar la celda que se está votando

document.getElementById('giftForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const itemName = document.getElementById('itemName').value;
    const itemPrice = document.getElementById('itemPrice').value;
    const itemUrl = document.getElementById('itemUrl').value;
    const itemImage = document.getElementById('itemImage').files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const imageDataUrl = event.target.result;
        addItem(itemName, itemPrice, imageDataUrl, itemUrl);
        document.getElementById('giftForm').reset();
    };

    reader.readAsDataURL(itemImage);
});

function addItem(name, price, image, url) {
    const table = document.getElementById('giftTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    
    const nameCell = newRow.insertCell(0);
    nameCell.textContent = name;

    const priceCell = newRow.insertCell(1);
    priceCell.textContent = `$${price}`;

    const imageCell = newRow.insertCell(2);
    const img = document.createElement('img');
    img.src = image;
    imageCell.appendChild(img);

    const urlCell = newRow.insertCell(3);
    const link = document.createElement('a');
    link.href = url;
    link.textContent = 'View';
    link.target = '_blank';
    urlCell.appendChild(link);

    const voteCell = newRow.insertCell(4);
    voteCell.textContent = "0";  // Inicializa la celda de votos en 0
    voteCell.dataset.voters = "[]"; // Almacena los votantes en un array JSON
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
        table.deleteRow(newRow.rowIndex - 1);
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
        let voters = JSON.parse(selectedVoteCell.dataset.voters); // Obtén los votantes actuales
        if (!voters.includes(selectedPerson)) { // Solo añade si no ha votado aún
            voters.push(selectedPerson);
            selectedVoteCell.dataset.voters = JSON.stringify(voters);
            selectedVoteCell.textContent = `${voters.length} (${voters.join(", ")})`;
        } else {
            alert('Esta persona ya ha votado por este ítem.');
        }
        hideModal();
    } else {
        alert('Please select a name before confirming your vote.');
    }
});
