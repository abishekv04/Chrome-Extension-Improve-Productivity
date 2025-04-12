document.addEventListener('DOMContentLoaded', function () {
    // Code inside this block will run after the DOM has fully loaded

    // Open or create the IndexedDB database
    const dbName = 'messageDB';
    const request = indexedDB.open(dbName, 1);
    let db;

    request.onerror = function(event) {
        console.error('Error opening IndexedDB:', event.target.error);
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        console.log('Successfully opened IndexedDB:', db);
        displayMessages();
    };

    request.onupgradeneeded = function(event) {
        const db = event.target.result;

        // Create an object store named 'messages' with an auto-incrementing key
        const objectStore = db.createObjectStore('messages', { autoIncrement: true });

        console.log('IndexedDB upgrade needed.');
    };

    function addMessageToDB(message) {
        const transaction = db.transaction(['messages'], 'readwrite');
        const objectStore = transaction.objectStore('messages');

        const request = objectStore.add({ text: message });

        request.onsuccess = function(event) {
            console.log('Message added to IndexedDB.');
            displayMessages();
        };

        request.onerror = function(event) {
            console.error('Error adding message to IndexedDB:', event.target.error);
        };
    }

    function displayMessages() {
        const messageList = document.getElementById('messageList');
        // Clear the existing list
        messageList.innerHTML = '';

        const objectStore = db.transaction(['messages']).objectStore('messages');

        objectStore.openCursor().onsuccess = function(event) {
            const cursor = event.target.result;

            if (cursor) {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item messageItem';

                const deleteLink = document.createElement('span');
                deleteLink.className = 'deleteLink';
                deleteLink.textContent = 'Delete';
                deleteLink.onclick = function() {
                    deleteMessage(cursor.primaryKey);
                };

                listItem.innerHTML = `<span>${cursor.value.text}</span>`;
                listItem.appendChild(deleteLink);

                messageList.appendChild(listItem);

                cursor.continue();
            } else {
                console.log('No more messages in IndexedDB.');
            }
        };
    }

    function deleteMessage(key) {
        const transaction = db.transaction(['messages'], 'readwrite');
        const objectStore = transaction.objectStore('messages');

        const request = objectStore.delete(key);

        request.onsuccess = function(event) {
            console.log('Message deleted from IndexedDB.');
            displayMessages();
        };

        request.onerror = function(event) {
            console.error('Error deleting message from IndexedDB:', event.target.error);
        };
    }

    function addMessage() {
        const messageInput = document.getElementById('messageInput');

        if (messageInput.value.trim() === '') {
            alert('Please enter a message.');
            return;
        }

        addMessageToDB(messageInput.value);
        messageInput.value = '';
    }

    const addButton = document.getElementById('addMessageBtn');
    if (addButton) {
        addButton.addEventListener('click', addMessage);
    } else {
        console.error('Button not found');
    }

    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                // Prevent the default form submission behavior
                event.preventDefault();
                addMessage();
            }
        });
    } else {
        console.error('Input not found');
    }
});
