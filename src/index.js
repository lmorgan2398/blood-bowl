import './styles.css';

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
      losses: 0,
      get record() {
        return `${this.wins}-${this.losses}`
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

  return { getTeams, setTeams, createTeam, addTeam, getTeamByTicker, getTeamByID, removeTeamByID }
})();

let team1 = teams.createTeam('Thorium Reavers', 'Chaos Dwarfs', 'Riley', 'TR');
let team2 = teams.createTeam('Eversong Gliders', 'Elfs', 'Lucas', 'EG');
let team3 = teams.createTeam('Felsworn Tinkerers', 'Goblins', 'Jakob', 'FT');

teams.addTeam(team1);
teams.addTeam(team2);
teams.addTeam(team3);

console.log(teams.getTeams());

let display = (function(){
  let teamsTable = document.querySelector('#teams');
  
  const displayTeams = (teamsList) => {
    teamsList.forEach((team) => {
      let tr = document.createElement('tr');
      teamsTable.appendChild(tr);
      let td1 = document.createElement('td');
      tr.appendChild(td1);
      td1.textContent = 'placeholder';
      let td2 = document.createElement('td');
      tr.appendChild(td2);
      td2.textContent = team.name;
      let td3 = document.createElement('td');
      tr.appendChild(td3);
      td3.textContent = team.record;
    })
  };

  return { displayTeams }
})();

let matches = (function(){
  let matches = [];

  const getMatches = () => matches;
  const setMatches = (array) => matches = array;

  const createMatch = (homeTeamID, awayTeamID, homeTDs, awayTDs, homeCasualties, awayCasualties, date) => {
    let matchID = crypto.randomUUID();
    let winnerID;
    let loserID;
    if(homeTDs > awayTDs) {
      winnerID = homeTeamID;
      loserID = awayTeamID;
    }
    else if(homeTDs < awayTDs) {
      winnerID = awayTeamID;
      loserID = homeTeamID;
    }
    return {
      homeTeamID,
      awayTeamID,
      homeTDs,
      awayTDs,
      homeCasualties,
      awayCasualties,
      date,
      winnerID,
      loserID,
      id: matchID,
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
    matches.forEach((match) => {
      let winner = teams.getTeamByTicker(match.winnerID);
      console.log(winner);
      winner.wins++;
      let loser = teams.getTeamByTicker(match.loserID);
      loser.losses++;
    });
  }

  return { getMatches, setMatches, createMatch, addMatch, removeMatchByID, updateRecords };
})();

let matchTeam1 = 'TR';
let matchTeam2 = 'EG';
let match1 = matches.createMatch(matchTeam1, matchTeam2, 3, 2, 1, 2, 'placeholder');
let match2 = matches.createMatch(matchTeam2, matchTeam1, 1, 2, 1, 1, 'placeholder');
matches.addMatch(match1);
matches.addMatch(match2);
console.log(matches.getMatches());

matches.updateRecords();
console.log(teams.getTeams());

display.displayTeams(teams.getTeams());