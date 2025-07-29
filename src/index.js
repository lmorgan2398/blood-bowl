import './styles.css';

const leagues = [];
const teams = [];
const matches = [];

const teamForm = document.getElementById('teamForm');
const teamList = document.getElementById('teamList');
const teamSelects = document.querySelectorAll('#matchForm select');

const bonusTypeSelect = document.getElementById('bonusType');
const bonusInputsContainer = document.getElementById('bonusInputs');
const addBonusBtn = document.getElementById('addBonusBtn');
const bonusList = document.getElementById('bonusList');

// Bonus info
let bonuses = [];

bonusTypeSelect.addEventListener('change', () => {
  const selected = bonusTypeSelect.value;
  bonusInputsContainer.innerHTML = '';

  if (selected === 'casualty' || selected === 'td') {
    const label = selected === 'casualty' ? 'Casualties Needed:' : 'TDs Needed:';

    bonusInputsContainer.innerHTML = `
      <label>${label}</label>
      <input type="number" id="countNeeded" min="1" required />

      <label>Points Awarded:</label>
      <input type="number" id="pointsAwarded" min="1" required />
    `;
  }
});

addBonusBtn.addEventListener('click', () => {
  const type = bonusTypeSelect.value;
  const countNeeded = document.getElementById('countNeeded');
  const pointsAwarded = document.getElementById('pointsAwarded');

  if (type == '') {
    alert ('Please select a bonus type.');
    return;
  }
  if (!countNeeded.value| !pointsAwarded.value) {
    alert('Please fill in both inputs.');
    return;
  }

  const bonus = {
    type,
    count: parseInt(countNeeded.value),
    points: parseInt(pointsAwarded.value)
  };

  bonuses.push(bonus);
  renderBonusList();
  resetForm();
});

function renderBonusList() {
  bonusList.innerHTML = bonuses.map((b, i) => {
    const label = b.type === 'casualty' ? 'Casualties' : 'Touchdowns';
    return `<li>+${b.points} points for ${b.count}+ ${label}</li>`;
  }).join('');
}

function resetForm() {
  bonusTypeSelect.value = '';
  bonusInputsContainer.innerHTML = '';
}

const matchForm = document.getElementById('matchForm');
const matchList = document.getElementById('matchList');

teamForm.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(teamForm);
    const team = Object.fromEntries(formData.entries());
    teams.push(team);
    updateTeamList();
    updateTeamSelects();
    teamForm.reset();
});

function updateTeamList() {
    teamList.innerHTML = teams.map(t => `<li>${t.name} (${t.ticker}) - ${t.race}, Coach: ${t.coach}</li>`).join('');
}

function updateTeamSelects() {
    teamSelects.forEach(select => {
    select.innerHTML = teams.map(t => `<option value="${t.ticker}">${t.name} (${t.ticker})</option>`).join('');
    });
}

bonusForm.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(bonusForm);
    const bonus = Object.fromEntries(formData.entries());
    bonus.points = parseInt(bonus.points);
    bonuses.push(bonus);
    updateBonusList();
    bonusForm.reset();
});

function updateBonusList() {
    bonusList.innerHTML = bonuses.map(b => `<li>${b.condition} = +${b.points} pts</li>`).join('');
}

matchForm.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(matchForm);
    const match = Object.fromEntries(formData.entries());
    match.td1 = parseInt(match.td1);
    match.td2 = parseInt(match.td2);
    match.cas1 = parseInt(match.cas1);
    match.cas2 = parseInt(match.cas2);
    applyBonuses(match);
    matches.push(match);
    renderMatches();
    matchForm.reset();
});

function applyBonuses(match) {
    match.score1 = match.td1;
    match.score2 = match.td2;
    bonuses.forEach(b => {
    if (b.condition.includes('TDs')) {
        if (match.td1 >= parseInt(b.condition)) match.score1 += b.points;
        if (match.td2 >= parseInt(b.condition)) match.score2 += b.points;
    } else if (b.condition.includes('casualties')) {
        if (match.cas1 >= parseInt(b.condition)) match.score1 += b.points;
        if (match.cas2 >= parseInt(b.condition)) match.score2 += b.points;
    }
    });
}

function renderMatches() {
    matchList.innerHTML = matches.map(m => {
    const winner = m.score1 > m.score2 ? m.team1 : (m.score1 < m.score2 ? m.team2 : 'Draw');
    return `<li>${m.team1} vs ${m.team2}: ${m.score1} - ${m.score2} (${winner})<br /><small>${m.notes}</small></li>`;
    }).join('');
}