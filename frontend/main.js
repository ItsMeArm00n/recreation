const socket = io('https://your-backend-url.onrender.com'); // <-- Replace with your backend URL
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
  const voteDiv = document.getElementById('voteOptions');
  voteDiv.innerHTML = '';
  players.forEach((p) => {
    if (p.name) {
      const btn = document.createElement('button');
      btn.innerText = p.name;
      btn.onclick = () => {
        socket.emit('submitVote', { roomCode, targetId: p.id });
        document.getElementById('voteSection').style.display = 'none';
      };
      voteDiv.appendChild(btn);
    }
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
