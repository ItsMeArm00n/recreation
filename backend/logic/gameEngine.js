const { ROLES, OPERATIONS, HIDDEN_AGENDA } = require('../../shared/constants');

function generateRoles(playerIds) {
  const roles = {};
  const virusCount = playerIds.length <= 6 ? 2 : 3;
  const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
  shuffled.forEach((id, index) => {
    roles[id] = index < virusCount ? ROLES.VIRUS : ROLES.SERVICE;
  });
  return roles;
}

function generateOperations(playerIds) {
  const ops = {};
  const opPool = [...OPERATIONS].sort(() => Math.random() - 0.5);
  playerIds.forEach((id, i) => {
    ops[id] = opPool[i];
  });
  return ops;
}

function applyOperationEffects(playerIds, ops, roles) {
  const extras = {};
  playerIds.forEach((pid) => {
    if (ops[pid] === 'Hidden Agenda') {
      const agendas = Object.values(HIDDEN_AGENDA);
      const selected = agendas[Math.floor(Math.random() * agendas.length)];
      extras[pid] = { hiddenAgenda: selected };
    }
  });
  return extras;
}

function evaluateVotes(game) {
  const voteMap = {};
  for (let v of game.votes) {
    voteMap[v.to] = (voteMap[v.to] || 0) + 1;
  }
  const sorted = Object.entries(voteMap).sort((a, b) => b[1] - a[1]);
  if (sorted.length < 1 || (sorted.length > 1 && sorted[0][1] === sorted[1][1])) {
    return { result: 'tie', winner: 'VIRUS' };
  }
  const imprisoned = sorted[0][0];
  const team = game.roles[imprisoned];
  const winner = team === ROLES.VIRUS ? 'SERVICE' : 'VIRUS';
  return { result: 'playerImprisoned', imprisoned, winner, roles: game.roles, ops: game.ops, votes: game.votes, extra: game.extra };
}

module.exports = { generateRoles, generateOperations, evaluateVotes, applyOperationEffects };
