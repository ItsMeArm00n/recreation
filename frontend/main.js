const socket = io('https://recreation-b4h8.onrender.com'); // <-- Replace with your backend URL
let roomCode = '';
let myId = '';

function joinRoom() {
  roomCode = document.getElementById('roomCode').value;
  const name = document.getElementById('name').value;
  socket.emit('joinRoom', { roomCode, name });
}

function startGame() {
  socket.emit('startGame', roomCode);
}

socket.on('connect', () => {
  myId = socket.id;
});

socket.on('playerList', (players) => {
  const list = document.getElementById('playerList');
  list.innerHTML = ''; // Clear old list

  players.forEach((player) => {
    const li = document.createElement('li');
    li.innerText = player.name;
    list.appendChild(li);
  });
});

socket.on('yourRole', (role) => {
  alert('Your Role: ' + role);
});

socket.on('yourOperation', (op) => {
  alert('Your Operation: ' + op);
});

socket.on('startDiscussion', () => {
  alert('Discuss for 2 minutes!');
  setTimeout(() => {
    document.getElementById('voteSection').style.display = 'block';
  }, 120000); // 2 minutes
});

socket.on('gameOver', (result) => {
  alert(`Game Over! ${result.winner} wins!\nVotes: ${JSON.stringify(result.votes)}\nRoles: ${JSON.stringify(result.roles)}`);
});
