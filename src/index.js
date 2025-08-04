import './styles.css';

// Module to keep track of teams and stats
let teams = (function(){
  let teams = [];

  const getTeams = () => teams;
  const setTeams = (array) => teams = array;

  const createTeam = (name, race, coach, ticker) => {
    let id = crypto.randomUUID();
    return {
      name, 
      race, 
      coach, 
      ticker,
      wins: 0,
      draws: 0,
      losses: 0,
      leaguePoints: 0,
      rank: 1,
      get record() {
        return `${this.wins}-${this.draws}-${this.losses}`
      },
      id,
    }
  };

  const addTeam = (team) => teams.push(team);

  const getTeamByTicker = (ticker) => teams.find(team => team.ticker === ticker);

  const getTeamByID = (id) => teams.find(team => team.id === id);

  const removeTeamByID = (id) => {
    teams.forEach((team, i) => {
      if(id === team.id) {
        teams.splice(i, 1);
      }
    })
  }

  const assignRanks = () => {
    let orderedTeams = Array.from(teams);
    for (let i = 0; i < orderedTeams.length; i++) {
      let leaguePointsMax = orderedTeams[i].leaguePoints;
      let leaguePointsMaxIndex = [i];
      for (let j = i + 1; j < orderedTeams.length; j++) {
        if (orderedTeams[j].leaguePoints > leaguePointsMax) {
          leaguePointsMax = orderedTeams[j].leaguePoints;
          leaguePointsMaxIndex = j;
        }
        // Swap values
        let temp = orderedTeams[leaguePointsMaxIndex];
        orderedTeams[leaguePointsMaxIndex] = orderedTeams[i];
        orderedTeams[i] = temp;
      }
    }
    orderedTeams.forEach((team, i) => {
      team.rank = i + 1;
    });
  }

  return { getTeams, setTeams, createTeam, addTeam, getTeamByTicker, getTeamByID, removeTeamByID, assignRanks }
})();

// Create and add 3 mock teams
let team1 = teams.createTeam('Thorium Reavers', 'Chaos Dwarfs', 'Riley', 'TR');
let team2 = teams.createTeam('Eversong Gliders', 'Elfs', 'Lucas', 'EG');
let team3 = teams.createTeam('Felsworn Tinkerers', 'Goblins', 'Jakob', 'FT');

teams.addTeam(team1);
teams.addTeam(team2);
teams.addTeam(team3);

console.log(teams.getTeams());

// Module to update HTML display
let display = (function(){
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
    while(matchesTable.firstChild){
      matchesTable.removeChild(matchesTable.firstChild);
    };

    // Populate match table
    matchesList.forEach((match) => {
      const tr = document.createElement('tr');
      matchesTable.appendChild(tr);

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
    });
  };

  const homeSelect = document.getElementById('home-select');
  const awaySelect = document.getElementById('away-select');

  function populateTeamSelects() {
    const teamList = teams.getTeams();

    // Clear any previous options except the default
    homeSelect.innerHTML = '<option value="">-- Select Team --</option>';
    awaySelect.innerHTML = '<option value="">-- Select Team --</option>';

    teamList.forEach(team => {
      const option = document.createElement('option');
      option.value = team.id;
      option.textContent = `${team.name} (${team.ticker})`;

      // Clone for each dropdown so the option nodes aren't shared
      homeSelect.appendChild(option.cloneNode(true));
      awaySelect.appendChild(option.cloneNode(true));
    });
  }



  return { displayTeams, displayMatches, populateTeamSelects }
})();

// Module to keep track of bonuses
let bonuses = (function() {
  let bonuses = [];

  const getBonuses = () => bonuses;
  const setBonuses = (array) => bonuses = array;

  const createBonus = (name, type, count, points) => {
    let bonusID = crypto.randomUUID();
    return {
      name,
      type,
      count,
      points,
      id: bonusID,
    }
  };

  const addBonus = (bonus) => bonuses.push(bonus);

  const removeBonusByID = (id) => {
    bonuses.forEach((bonus, i) => {
      if (id === bonus.id) {
        bonuses.splice(i, 1);
      };
    })
  };

  const applyBonuses = (oppTDs, oppCasualties, passes, painted, underdog) => {
    let points = 0;
    let appliedBonuses = [];

    bonuses.forEach((bonus) => {
      const appliesAuto = (bonus.type == 'opponent TDs' && oppTDs <= bonus.count) || 
       (bonus.type == 'opponent casualties' && oppCasualties >= bonus.count) ||
       (bonus.type == 'passes' && passes >= bonus.count);

      const appliesManual = (bonus.type == 'painted' && painted) ||
       (bonus.type == 'underdog' && underdog);

      if (appliesAuto) {
        points += bonus.points;
        appliedBonuses.push(`${bonus.name}: +${bonus.points} points for ${bonus.count} ${bonus.type}`);
      } else if (appliesManual) {
        appliedBonuses.push(`${bonus.name}: +${bonus.points} points`);
      }
    })

    return { points, appliedBonuses }
  }

  return { getBonuses, setBonuses, createBonus, addBonus, removeBonusByID, applyBonuses }
})();

// Create some mock bonuses
let bonus1 = bonuses.createBonus('Fully Painted Team', 'underdog', 1, 1);
let bonus2 = bonuses.createBonus('Vulgar Display of Power', 'opponent casualties', 3, 3);
let bonus3 = bonuses.createBonus('Aerial Domination', 'passes', 3, 3);
let bonus4 = bonuses.createBonus('Clean Sheet', 'opponent TDs', 0, 3);

bonuses.addBonus(bonus1);
bonuses.addBonus(bonus2);
bonuses.addBonus(bonus3);
bonuses.addBonus(bonus4);
console.log(bonuses.getBonuses());

// Module to log matches
let matches = (function(){
  let matches = [];

  const getMatches = () => matches;
  const setMatches = (array) => matches = array;

  const createMatch = (homeTeamID, awayTeamID, homeTDs, awayTDs, homePasses, awayPasses, homeCasualties, awayCasualties, homePainted, awayPainted, homeUnderdog, awayUnderdog, date) => {
    let matchID = crypto.randomUUID();

    let homeResult = 'draw';
    let awayResult = 'draw';

    let homeBasePoints = 0;
    let awayBasePoints = 0;

    // Check for winners/losers and apply base points
    if (homeTDs > awayTDs) {
      homeResult = 'win';
      homeBasePoints += 3;
      awayResult = 'loss';
      awayBasePoints += 1;
    } else if (homeTDs < awayTDs) {
      homeResult = 'loss';
      homeBasePoints += 1;
      awayResult = 'win';
      awayBasePoints +=3;
    } else {
      homeBasePoints +=2;
      awayBasePoints +=2;
    }

    let homeBonusData = bonuses.applyBonuses(awayTDs, awayCasualties, homePasses, homePainted, homeUnderdog);
    let awayBonusData = bonuses.applyBonuses(homeTDs, homeCasualties, awayPasses, awayPainted, awayUnderdog);
    
    let homeBonusPoints = homeBonusData.points;
    let awayBonusPoints = awayBonusData.points;

    let homeLeaguePoints = homeBasePoints + homeBonusPoints;
    let awayLeaguePoints = awayBasePoints + awayBonusPoints;

    return {
      date,
      id: matchID,
      teams: [
        {
          id: homeTeamID,
          tds: homeTDs,
          casualties: homeCasualties,
          passes: homePasses,
          result: homeResult,
          leaguePoints: homeLeaguePoints,
          bonusesApplied: homeBonusData.appliedBonuses,
          isHome: true
        },
        {
          id: awayTeamID,
          tds: awayTDs,
          casualties: awayCasualties,
          passes: awayPasses,
          result: awayResult,
          leaguePoints: awayLeaguePoints,
          bonusesApplied: awayBonusData.appliedBonuses,
          isHome: false
        }
      ]
    }
  };

  const addMatch = (match) => matches.push(match);

  const removeMatchByID = (id) => {
    matches.forEach((match, i) => {
      if(id === match.id) {
        matches.splice(i, 1);
      }
    })
  };

  const updateRecords = () => {
    // Clear current records before tallying
    let initialRecords = teams.getTeams();
    initialRecords.forEach((record) => {
      record.wins = 0;
      record.draws = 0;
      record.losses = 0;
      record.leaguePoints = 0;
    });
    matches.forEach((match) => {
      match.teams.forEach((team) => {
        let teamData = teams.getTeamByID(team.id);
        if (team.result === 'win') {
          teamData.wins++;
        } else if (team.result === 'loss') {
          teamData.losses++;
        } else if (team.result === 'draw') {
          teamData.draws++;
        }
        teamData.leaguePoints += team.leaguePoints;
      });
    });
  };

  return { getMatches, setMatches, createMatch, addMatch, removeMatchByID, updateRecords };
})();

// Set 2 teams as match teams and create 2 mock matches
let matchTeam1 = teams.getTeamByTicker('TR').id;
let matchTeam2 = teams.getTeamByTicker('EG').id;
let match1 = matches.createMatch(matchTeam1, matchTeam2, 3, 0, 3, 2, 1, 3, true, true, false, false, 'placeholder');
let match2 = matches.createMatch(matchTeam2, matchTeam1, 1, 2, 2, 1, 1, 1, true, false, false, false, 'placeholder');
matches.addMatch(match1);
matches.addMatch(match2);
console.log(matches.getMatches());

// Call function to update teams records by checking match history and getting ranks
matches.updateRecords();
teams.assignRanks();
console.log(teams.getTeams());

display.displayTeams(teams.getTeams());
display.displayMatches(matches.getMatches());

// Experimental form info
// Team stuff
const teamDialog = document.getElementById('team-dialog');
document.getElementById('new-team-btn').onclick = () => teamDialog.showModal();
document.getElementById('cancel-team-btn').onclick = () => teamDialog.close();

const newTeamNameInput = document.querySelector('#team-form #name-input');
const newTeamTickerInput = document.querySelector('#team-form #ticker-input');

newTeamNameInput.addEventListener('input', () => {
  const words = newTeamNameInput.value.trim().split(/\s+/);
  const initials = words.map(w => w[0]?.toUpperCase() || '').join('');
  newTeamTickerInput.value = initials.slice(0, 3); // limit to 3 chars
});

const addTeamBtn = document.querySelector('#add-team-btn');
const newTeamRaceInput = document.querySelector('#team-form #race-input');
const newTeamCoachInput = document.querySelector('#team-form #coach-input');
addTeamBtn.addEventListener('click', (e) => {
  e.preventDefault();
  let newTeam = teams.createTeam(newTeamNameInput.value, newTeamRaceInput.value, newTeamCoachInput.value, newTeamTickerInput.value);
  teams.addTeam(newTeam);
  display.displayTeams(teams.getTeams());
  teamDialog.close();
})

// Match stuff
const matchDialog = document.getElementById('match-dialog');
document.getElementById('new-match-btn').onclick = () => {
  display.populateTeamSelects();
  matchDialog.showModal()
};
document.getElementById('cancel-match-btn').onclick = () => matchDialog.close();

// Match query selectors
// Home team inputs
const homeTDs = document.querySelector('[name="homeTDs"]');
const homeCasualties = document.querySelector('[name="homeCasualties"]');
const homePasses = document.querySelector('[name="homePasses"]');
const homePainted = document.querySelector('[name="homePainted"]');
const homeUnderdog = document.querySelector('[name="homeUnderdog"]');

// Away team inputs
const awayTDs = document.querySelector('[name="awayTDs"]');
const awayCasualties = document.querySelector('[name="awayCasualties"]');
const awayPasses = document.querySelector('[name="awayPasses"]');
const awayPainted = document.querySelector('[name="awayPainted"]');
const awayUnderdog = document.querySelector('[name="awayUnderdog"]');

// Match date input
const matchDate = document.querySelector('[name="date"]');
const addMatchBtn = document.querySelector('#add-match-btn');

const homeSelect = document.querySelector('#home-select');
const awaySelect = document.querySelector('#away-select');
addMatchBtn.addEventListener('click', (e) => {
  e.preventDefault();

  const homeID = homeSelect.value;
  const awayID = awaySelect.value;

  // Validate they're not the same
  if (homeID === awayID) {
    alert("A team cannot play against itself.");
    return;
  }


  // Use homeID and awayID with your createMatch() function
  let newMatch = matches.createMatch(homeID, awayID, homeTDs.value, awayTDs.value, homePasses.value, awayPasses.value, homeCasualties.value, awayCasualties.value, homePainted.value, awayPainted.value, homeUnderdog.value, awayUnderdog.value, matchDate.value);
  matches.addMatch(newMatch);
  display.displayMatches(matches.getMatches());
  matches.updateRecords();
  teams.assignRanks();
  display.displayTeams(teams.getTeams());
  matchDialog.close();
});
