const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { generateRoles, generateOperations, evaluateVotes, applyOperationEffects } = require('./logic/gameEngine');
const { ROLES } = require('../shared/constants');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

app.use(cors());

let games = {}; // { roomCode: { players: {}, roles: {}, ops: {}, votes: [], extra: {} } }

io.on('connection', (socket) => {
  console.log('New client:', socket.id);

  socket.on('joinRoom', ({ roomCode, name }) => {
    socket.join(roomCode);
    if (!games[roomCode]) games[roomCode] = { players: {}, roles: {}, ops: {}, votes: [], extra: {} };
    games[roomCode].players[socket.id] = { name };
    io.to(roomCode).emit('playerList', Object.values(games[roomCode].players));
  });

  socket.on('startGame', (roomCode) => {
    const playerIds = Object.keys(games[roomCode].players);
    const roles = generateRoles(playerIds);
    const ops = generateOperations(playerIds);
    games[roomCode].roles = roles;
    games[roomCode].ops = ops;
    games[roomCode].votes = [];
    games[roomCode].extra = applyOperationEffects(playerIds, ops, roles);

    playerIds.forEach(pid => {
      io.to(pid).emit('yourRole', roles[pid]);
      io.to(pid).emit('yourOperation', ops[pid]);
    });
    io.to(roomCode).emit('startDiscussion');
  });

  socket.on('submitVote', ({ roomCode, targetId }) => {
    games[roomCode].votes.push({ from: socket.id, to: targetId });
    if (games[roomCode].votes.length === Object.keys(games[roomCode].players).length) {
      const result = evaluateVotes(games[roomCode]);
      io.to(roomCode).emit('gameOver', result);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
