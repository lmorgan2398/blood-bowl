import './styles.css';
import * as teams from './teams.js';
import * as display from './display.js';
import * as bonuses from './bonuses.js';
import * as matches from './matches.js';
import * as storage from './storage.js';

// === CURRENT LEAGUE BONUSES ===
let bonus1 = bonuses.createBonus(
  'Fully Painted Team',
  'painted',
  '1 point awarded if your team is painted to the 3 color minimum.',
  1,
  1
);

let bonus2 = bonuses.createBonus(
  'Vulgar Display of Power',
  'casualties',
  '3 points (awarded if a team causes at least 3 casualties in a match)',
  3,
  3
);

let bonus3 = bonuses.createBonus(
  'Aerial Domination',
  'passes',
  '3 points (for completing 3 successful passes in a match)',
  3,
  3
);

let bonus4 = bonuses.createBonus(
  'Clean Sheet',
  'opponent TDs',
  '3 points (for holding opponents to zero touchdowns)',
  0,
  3
);

let bonus5 = bonuses.createBonus(
  "It's Not the Size of the Dog...",
  'underdog',
  '3 points (for forcing a tie or win with a team value deficit of 150k or more)',
  1,
  3
);


// === DOMContentLoaded: Load Data & Initial Display ===
document.addEventListener('DOMContentLoaded', () => {
  storage.loadAll(teams, matches, bonuses);

  if (bonuses.getBonuses().length === 0) {
    bonuses.addBonus(bonus1);
    bonuses.addBonus(bonus2);
    bonuses.addBonus(bonus3);
    bonuses.addBonus(bonus4);
    bonuses.addBonus(bonus5);
  }
  display.renderBonusToggles();

  matches.updateRecords(teams.getTeams());
  teams.assignRanks();
  display.clearInputs();
  display.displayTeams(teams.getTeams());
  display.displayMatches(matches.getMatches());
});

// === TEAM EVENT LISTENERS ===
const teamDialog = document.getElementById('team-dialog');
const newTeamNameInput = document.querySelector('#team-form #name-input');
const newTeamTickerInput = document.querySelector('#team-form #ticker-input');

document.getElementById('new-team-btn').onclick = () => {
    display.clearInputs();
    teamDialog.showModal();
};
document.getElementById('cancel-team-btn').onclick = () => teamDialog.close();

newTeamNameInput.addEventListener('input', () => {
  const words = newTeamNameInput.value.trim().split(/\s+/);
  const initials = words.map(w => w[0]?.toUpperCase() || '').join('');
  newTeamTickerInput.value = initials.slice(0, 3);
});

document.querySelector('#add-team-btn').addEventListener('click', (e) => {
  e.preventDefault();
  const name = newTeamNameInput.value;
  const ticker = newTeamTickerInput.value;
  const race = document.querySelector('#team-form #race-input').value;
  const coach = document.querySelector('#team-form #coach-input').value;
  const editingTeamID = display.getEditingTeamID();

  const newTeam = editingTeamID
  ? teams.createTeam(name, race, coach, ticker, editingTeamID)
  : teams.createTeam(name, race, coach, ticker);


  if (editingTeamID) {
    teams.setTeamByID(editingTeamID, newTeam);
    display.setEditingTeamID(null);
  } else {
    teams.addTeam(newTeam);
  }

  document.querySelector('#add-team-btn').textContent = 'Add Team';
  document.querySelector('#team-form-title').textContent = 'New Team';
  matches.updateRecords(teams.getTeams());
  teams.assignRanks();
  storage.saveAll(teams, matches, bonuses);
  display.displayTeams(teams.getTeams());
  display.clearInputs();
  teamDialog.close();
});

// === MATCH EVENT LISTENERS ===
const matchDialog = document.getElementById('match-dialog');

document.getElementById('new-match-btn').onclick = () => {
  display.populateTeamSelects(teams.getTeams());
  display.clearInputs();
  // Set form to new mode (instead of edit)
  display.setEditingMatchID(null);
  display.setMatchFormMode(false);
  matchDialog.showModal();
};

document.getElementById('cancel-match-btn').onclick = () => {
  display.setEditingMatchID(null);
  matchDialog.close();
};

document.querySelector('#add-match-btn').addEventListener('click', (e) => {
  e.preventDefault();

  const homeID = document.querySelector('#home-select').value;
  const awayID = document.querySelector('#away-select').value;

  if (homeID === awayID) {
    alert("A team cannot play against itself.");
    return;
  }

  const getInputVal = name => {
    const el = document.querySelector(`[name="${name}"]`);
    return el.type === 'checkbox' ? el.checked : el.value;
  };

  const editingMatchID = display.getEditingMatchID();

  const newMatch = matches.createMatch(
    homeID, awayID,
    getInputVal('homeTDs'), getInputVal('awayTDs'),
    getInputVal('homePasses'), getInputVal('awayPasses'),
    getInputVal('homeCasualties'), getInputVal('awayCasualties'),
    getInputVal('homePainted'), getInputVal('awayPainted'),
    getInputVal('homeUnderdog'), getInputVal('awayUnderdog'),
    getInputVal('date'),
    editingMatchID || null
  );

  if (editingMatchID) {
    matches.setMatchByID(editingMatchID, newMatch);
    display.setEditingMatchID(null);
  } else {
    matches.addMatch(newMatch);
  }

  matches.updateRecords(teams.getTeams());
  teams.assignRanks();
  storage.saveAll(teams, matches, bonuses);
  display.displayTeams(teams.getTeams());
  display.displayMatches(matches.getMatches());

  matchDialog.close();
});

// === DETAILS EVENT LISTENERS ===
document.querySelector('#teams tbody').addEventListener('click', (e) => {
  const row = e.target.closest('tr');
  if (row?.dataset.teamId) {
    const team = teams.getTeamByID(row.dataset.teamId); // this line was missing
    if (team) {
      display.showTeamDetails(team);
    }
  }
});

document.querySelector('#matches tbody').addEventListener('click', (e) => {
  const row = e.target.closest('tr');
  if (row?.dataset.matchId) {
    const match = matches.getMatches().find(m => m.id === row.dataset.matchId);
    if (match) {
      const home = match.teams.find(t => t.isHome);
      const away = match.teams.find(t => !t.isHome);
      const homeTeam = teams.getTeamByID(home.id);
      const awayTeam = teams.getTeamByID(away.id);
      display.showMatchDetails(match, homeTeam, awayTeam);
    }
  }
});

// === DELETE EVENT LISTENERS ===
document.getElementById('delete-team-btn').addEventListener('click', () => {
  teams.removeTeamByID(display.selectedTeamID);
  teams.assignRanks();
  storage.saveAll(teams, matches, bonuses);
  display.displayTeams(teams.getTeams());
  display.displayMatches(matches.getMatches());
  document.getElementById('team-details-dialog').close();
});

document.getElementById('delete-match-btn').addEventListener('click', () => {
  matches.removeMatchByID(display.selectedMatchID);
  matches.updateRecords(teams.getTeams());
  teams.assignRanks();
  storage.saveAll(teams, matches, bonuses);
  display.displayMatches(matches.getMatches());
  display.displayTeams(teams.getTeams());
  document.getElementById('match-details-dialog').close();
});

// === IMPORT/EXPORT SECTION ===
const jsonInput = document.getElementById('json-input');
const exportBtn = document.getElementById('export-json');
const importBtn = document.getElementById('import-json');

exportBtn.addEventListener('click', () => {
  const exportData = {
    version: 1,
    teams: teams.getTeams(),
    matches: matches.getMatches(),
    bonuses: bonuses.getBonuses()
  };

  const json = JSON.stringify(exportData, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    alert('League data copied to clipboard!');
  }).catch(err => {
    alert('Failed to copy JSON to clipboard');
    console.error(err);
  });
});

importBtn.addEventListener('click', async () => {
  let jsonText = jsonInput.value.trim();

  // If the input is empty, try to get JSON from the clipboard
  if (!jsonText) {
    try {
      jsonText = await navigator.clipboard.readText();
      if (!jsonText.trim()) return alert('Clipboard is empty or invalid.');
    } catch (err) {
      return alert('Could not read from clipboard.');
    }
  }

  try {
    const parsed = JSON.parse(jsonText);
    console.log(parsed);

    // Ensure correct structure
    if (
      !parsed ||
      !Array.isArray(parsed.teams) ||
      !Array.isArray(parsed.matches) ||
      !Array.isArray(parsed.bonuses)
    ) {
      return alert('Invalid JSON structure: expected { teams, matches, bonuses }');
    }

    // Save to modules
    teams.setTeams(parsed.teams);
    matches.setMatches(parsed.matches);
    bonuses.setBonuses(parsed.bonuses);

    // Persist to localStorage
    storage.save('teams', parsed.teams);
    storage.save('matches', parsed.matches);
    storage.save('bonuses', parsed.bonuses);

    console.log('Working here?');
    // Update state
    matches.updateRecords(teams.getTeams());
    teams.assignRanks();

    console.log('Working here?');
    // Re-render UI
    display.displayTeams(teams.getTeams());
    display.displayMatches(matches.getMatches());
    console.log('Working here?');

    alert('League data successfully imported!');
  } catch (err) {
    console.error(err);
    alert('Error importing data. Please make sure it’s valid JSON.');
  }
});


