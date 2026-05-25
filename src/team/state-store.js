const fs = require('fs');
const path = require('path');

function teamStatePath(cwd) {
  return path.join(cwd, '.oma', 'state', 'team-state.json');
}

function readTeamState(cwd) {
  const file = teamStatePath(cwd);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function writeTeamState(cwd, state) {
  const file = teamStatePath(cwd);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

function clearTeamState(cwd) {
  const file = teamStatePath(cwd);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

module.exports = {
  readTeamState,
  writeTeamState,
  clearTeamState,
};
