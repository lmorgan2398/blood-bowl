import './styles.css';
import * as teams from './teams.js';
import * as display from './display.js';
import * as bonuses from './bonuses.js';
import * as matches from './matches.js';
import * as storage from './storage.js';

// === CURRENT LEAGUE BONUSES ===
let bonus1 = bonuses.createBonus('Fully Painted Team', 'underdog', 1, 1);
let bonus2 = bonuses.createBonus('Vulgar Display of Power', 'opponent casualties', 3, 3);
let bonus3 = bonuses.createBonus('Aerial Domination', 'passes', 3, 3);
let bonus4 = bonuses.createBonus('Clean Sheet', 'opponent TDs', 0, 3);
let bonus5 = bonuses.createBonus('\"It\'s Not the Size of the Dog...\"', 'underdog', 1, 3);

bonuses.addBonus(bonus1);
bonuses.addBonus(bonus2);
bonuses.addBonus(bonus3);
bonuses.addBonus(bonus4);
bonuses.addBonus(bonus5);

// === DOMContentLoaded: Load Data & Initial Display ===
document.addEventListener('DOMContentLoaded', () => {
  storage.loadAll(teams, matches, bonuses);
  matches.updateRecords(teams.getTeams());
  teams.assignRanks();
  display.displayTeams(teams.getTeams());
  display.displayMatches(matches.getMatches());
});

// === TEAM EVENT LISTENERS ===
const teamDialog = document.getElementById('team-dialog');
const newTeamNameInput = document.querySelector('#team-form #name-input');
const newTeamTickerInput = document.querySelector('#team-form #ticker-input');

document.getElementById('new-team-btn').onclick = () => teamDialog.showModal();
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

  const newTeam = teams.createTeam(name, race, coach, ticker);
  teams.addTeam(newTeam);
  storage.saveAll(teams, matches, bonuses);
  display.displayTeams(teams.getTeams());
  teamDialog.close();
});

// === MATCH EVENT LISTENERS ===
const matchDialog = document.getElementById('match-dialog');

document.getElementById('new-match-btn').onclick = () => {
  display.populateTeamSelects(teams.getTeams());
  matchDialog.showModal();
};

document.getElementById('cancel-match-btn').onclick = () => matchDialog.close();

document.querySelector('#add-match-btn').addEventListener('click', (e) => {
  e.preventDefault();

  const homeID = document.querySelector('#home-select').value;
  const awayID = document.querySelector('#away-select').value;

  if (homeID === awayID) {
    alert("A team cannot play against itself.");
    return;
  }

  const getInputVal = name => document.querySelector(`[name="${name}"]`).value;
  const newMatch = matches.createMatch(
    homeID, awayID,
    getInputVal('homeTDs'), getInputVal('awayTDs'),
    getInputVal('homePasses'), getInputVal('awayPasses'),
    getInputVal('homeCasualties'), getInputVal('awayCasualties'),
    getInputVal('homePainted'), getInputVal('awayPainted'),
    getInputVal('homeUnderdog'), getInputVal('awayUnderdog'),
    getInputVal('date')
  );

  matches.addMatch(newMatch);
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
