document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const roomsList = document.getElementById('rooms-list');
    const currentRoomHeader = document.getElementById('current-room');
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-btn');
    const createRoomButton = document.getElementById('create-room-btn');

    let currentRoom = '';

    // Function to join a room
    function joinRoom(room) {
        currentRoom = room;
        currentRoomHeader.textContent = `Room: ${room}`;
        messagesContainer.innerHTML = '';
        socket.emit('joinRoom', room);
    }

    // Function to send a message
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            socket.emit('message', { room: currentRoom, text: message });
            messageInput.value = '';
        }
    }

    // Handle incoming messages
    socket.on('message', (data) => {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${data.username} (${data.time}): ${data.text}`;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });

    // Populate rooms list
    socket.on('rooms', (rooms) => {
        roomsList.innerHTML = '';
        rooms.forEach((room) => {
            const roomElement = document.createElement('li');
            roomElement.textContent = room;
            roomElement.addEventListener('click', () => joinRoom(room));
            roomsList.appendChild(roomElement);
        });
    });

    // Create a new room
    createRoomButton.addEventListener('click', () => {
        const roomName = prompt('Enter room name:');
        if (roomName) {
            socket.emit('createRoom', roomName);
        }
    });

    // Send message on button click
    sendButton.addEventListener('click', sendMessage);

    // Send message on Enter key press
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Initial request for room list
    socket.emit('getRooms');
});
