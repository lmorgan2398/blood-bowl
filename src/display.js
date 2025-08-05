import * as teams from './teams.js';
import * as storage from './storage.js';
import * as bonuses from './bonuses.js';
import * as matches from './matches.js';

let teamsTable = document.querySelector('#teams tbody');

const displayTeams = (teamsList) => {
    // Clear current display
    while(teamsTable.firstChild){
        teamsTable.removeChild(teamsTable.firstChild);
    };

    // Populate display 
    teamsList.forEach((team) => {
        let tr = document.createElement('tr');
        teamsTable.appendChild(tr);
        tr.dataset.teamId = team.id;

        let td1 = document.createElement('td');
        tr.appendChild(td1);
        td1.textContent = team.rank;

        let td2 = document.createElement('td');
        tr.appendChild(td2);
        td2.textContent = team.name;

        let td3 = document.createElement('td');
        tr.appendChild(td3);
        td3.textContent = team.record;

        let td4 = document.createElement('td');
        tr.appendChild(td4);
        td4.textContent = team.leaguePoints;
    })
};

let matchesTable = document.querySelector('#matches tbody');

const displayMatches = (matchesList) => {
    // Clear match display
    while (matchesTable.firstChild) {
        matchesTable.removeChild(matchesTable.firstChild);
    }

    // Populate match table in reverse order (newest first)
    for (let i = matchesList.length - 1; i >= 0; i--) {
        const match = matchesList[i];

        const tr = document.createElement('tr');
        matchesTable.appendChild(tr);
        tr.dataset.matchId = match.id;

        const homeTeam = match.teams.find(t => t.isHome);
        const awayTeam = match.teams.find(t => !t.isHome);

        const homeTeamName = teams.getTeamByID(homeTeam.id)?.name || 'Unknown';
        const awayTeamName = teams.getTeamByID(awayTeam.id)?.name || 'Unknown';

        const td1 = document.createElement('td');
        td1.textContent = homeTeamName;
        tr.appendChild(td1);

        const td2 = document.createElement('td');
        td2.textContent = `${homeTeam.tds}-${awayTeam.tds}`;
        tr.appendChild(td2);

        const td3 = document.createElement('td');
        td3.textContent = awayTeamName;
        tr.appendChild(td3);

        const td4 = document.createElement('td');
        td4.textContent = match.date || 'N/A';
        tr.appendChild(td4);
    }
};


const homeSelect = document.getElementById('home-select');
const awaySelect = document.getElementById('away-select');

const populateTeamSelects = (teamsList) => {

    // Clear any previous options except the default
    homeSelect.innerHTML = '<option value="">-- Select Team --</option>';
    awaySelect.innerHTML = '<option value="">-- Select Team --</option>';

    teamsList.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = `${team.name} (${team.ticker})`;

        // Clone for each dropdown so the option nodes aren't shared
        homeSelect.appendChild(option.cloneNode(true));
        awaySelect.appendChild(option.cloneNode(true));
    });
}

// DOM references
const teamDialog = document.getElementById('team-details-dialog');
const matchDialog = document.getElementById('match-details-dialog');
const teamBody = document.getElementById('team-details-body');
const matchBody = document.getElementById('match-details-body');

let selectedTeamID = null;
let selectedMatchID = null;

// === TEAM DETAILS ===
const showTeamDetails = (team) => {
    if (!team) return;

    selectedTeamID = team.id;

    teamBody.innerHTML = `
        <p><strong>Name:</strong> ${team.name}</p>
        <p><strong>Race:</strong> ${team.race}</p>
        <p><strong>Coach:</strong> ${team.coach}</p>
        <p><strong>Ticker:</strong> ${team.ticker}</p>
        <p><strong>Record:</strong> ${team.wins}-${team.draws}-${team.losses}</p>
        <p><strong>League Points:</strong> ${team.leaguePoints}</p>
        <p><strong>Rank:</strong> ${team.rank}</p>
    `;

    // ==== Mini Match History ====
    const teamMatches = matches.getMatches()
      .filter(match => match.teams.some(t => t.id === team.id))
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first

    const matchHistory = document.createElement('div');
    matchHistory.classList.add('team-match-history');

    const historyHeader = document.createElement('h4');
    historyHeader.textContent = 'Match History';
    matchHistory.appendChild(historyHeader);

    teamMatches.forEach(match => {
        const [home, away] = match.teams;
        const isHome = home.id === team.id;
        const self = isHome ? home : away;
        const opponent = isHome ? away : home;

        const opponentName = teams.getTeamByID(opponent.id)?.name || 'Unknown';
        const result = self.result;
        const score = isHome ? `${home.tds}-${away.tds}` : `${away.tds}-${home.tds}`;
        const date = match.date;

        const row = document.createElement('div');
        row.classList.add('mini-match-row');
        row.innerHTML = `
            <span class="match-date">${date}</span>
            <span class="opponent-name">${opponentName}</span>
            <span class="score">${score}</span>
            <span class="result ${result}">${capitalize(result)}</span>
        `;

        row.addEventListener('click', () => {
            showMatchDetails(match, teams.getTeamByID(home.id), teams.getTeamByID(away.id));
        });

        matchHistory.appendChild(row);
    });

    teamBody.appendChild(matchHistory);

    teamDialog.showModal();
};


// === MATCH DETAILS ===
const showMatchDetails = (match, homeTeam, awayTeam) => {
    if (!match) return;

    selectedMatchID = match.id;

    const [home, away] = match.teams;

    const formatBonuses = (bonuses) => {
        if (!bonuses || bonuses.length === 0) return '<li>No bonuses earned.</li>';
        return bonuses.map(b => `<li>${b}</li>`).join('');
    };

    matchBody.innerHTML = `
        <div class="match-details-grid">
        <div class="match-team-block">
            <h4>${homeTeam?.name || 'Unknown'} <span class="label">Home</span></h4>
            <p><strong>TDs:</strong> ${home.tds}</p>
            <p><strong>Casualties:</strong> ${home.casualties}</p>
            <p><strong>Passes:</strong> ${home.passes}</p>
            <p><strong>Result:</strong> ${capitalize(home.result)} (+${home.basePoints} points)</p>
            <p><strong>League Points:</strong> ${home.leaguePoints}</p>
            <p><strong>Bonuses:</strong></p>
            <ul>${formatBonuses(home.bonusesApplied)}</ul>
        </div>

        <div class="match-team-block">
            <h4>${awayTeam?.name || 'Unknown'} <span class="label">Away</span></h4>
            <p><strong>TDs:</strong> ${away.tds}</p>
            <p><strong>Casualties:</strong> ${away.casualties}</p>
            <p><strong>Passes:</strong> ${away.passes}</p>
            <p><strong>Result:</strong> ${capitalize(away.result)} (+${away.basePoints} points)</p>
            <p><strong>League Points:</strong> ${away.leaguePoints}</p>
            <p><strong>Bonuses:</strong></p>
            <ul>${formatBonuses(away.bonusesApplied)}</ul>
        </div>
        </div>

        <p style="text-align:center; margin-top:1rem;"><strong>Date:</strong> ${match.date}</p>
    `;


    matchDialog.showModal();
}

const inputs = document.querySelectorAll('input');
const numInputs = document.querySelectorAll('input[type="number"]');
const selects = document.querySelectorAll('select');
const checks = document.querySelectorAll('input[type="checkbox"]');
const clearInputs = () => {
    inputs.forEach((input) => {
        input.value = ' ';
    });
    numInputs.forEach((input) => {
        input.value = 0;
    });
    selects.forEach((select) => {
        select.selectedIndex = 0;
    });
    checks.forEach((check) => {
        check.checked = false;
    });
}

const renderBonusToggles = () => {
  const container = document.getElementById('bonus-toggle-form');
  container.innerHTML = ''; // Clear previous

  bonuses.getBonuses().forEach(bonus => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('bonus-toggle-label');

    // Top row: checkbox + name
    const topRow = document.createElement('div');
    topRow.classList.add('bonus-toggle-top');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'bonusToggle';
    checkbox.value = bonus.id;
    checkbox.checked = bonus.active ?? true;

    checkbox.addEventListener('change', (e) => {
      bonus.active = e.target.checked;
      storage.save('bonuses', bonuses.getBonuses());

      matches.reapplyBonusesToAllMatches();

      matches.updateRecords(teams.getTeams());
      teams.assignRanks();

      displayMatches(matches.getMatches());
      displayTeams(teams.getTeams());
    });

    const nameSpan = document.createElement('span');
    nameSpan.textContent = bonus.name;

    topRow.appendChild(checkbox);
    topRow.appendChild(nameSpan);

    // Detail dropdown
    const detail = document.createElement('div');
    detail.classList.add('bonus-detail');
    detail.textContent = bonus.description;

    // Clicking anywhere on label (except checkbox) toggles dropdown
    wrapper.addEventListener('click', (e) => {
      if (e.target !== checkbox) {
        detail.classList.toggle('show');
      }
    });

    wrapper.appendChild(topRow);
    wrapper.appendChild(detail);
    container.appendChild(wrapper);
  });
};


const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

export { displayTeams, displayMatches, populateTeamSelects, showTeamDetails, showMatchDetails, selectedTeamID, selectedMatchID, clearInputs, renderBonusToggles }
