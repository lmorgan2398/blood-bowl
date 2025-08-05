import * as bonuses from './bonuses.js';
import * as teams from './teams.js';
import * as storage from './storage.js';

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

    let homeBonusData = bonuses.applyBonuses(homeResult, awayTDs, awayCasualties, homePasses, homePainted, homeUnderdog);
    let awayBonusData = bonuses.applyBonuses(awayResult, homeTDs, homeCasualties, awayPasses, awayPainted, awayUnderdog);

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
            painted: homePainted,
            underdog: homeUnderdog,
            casualties: homeCasualties,
            passes: homePasses,
            result: homeResult,
            basePoints: homeBasePoints,
            leaguePoints: homeLeaguePoints,
            bonusesApplied: homeBonusData.appliedBonuses,
            isHome: true
        },
        {
            id: awayTeamID,
            tds: awayTDs,
            painted: awayPainted,
            underdog: awayUnderdog,
            casualties: awayCasualties,
            passes: awayPasses,
            result: awayResult,
            basePoints: awayBasePoints,
            leaguePoints: awayLeaguePoints,
            bonusesApplied: awayBonusData.appliedBonuses,
            isHome: false
        }
        ],
    }
};

const addMatch = (match) => matches.push(match);

const removeMatchByID = (id) => {
    matches.forEach((match, i) => {
        if(id === match.id) {
        matches.splice(i, 1);
        }
    });
};

const setMatchByID = (id, updatedMatch) => {
  const index = matches.findIndex(m => m.id === id);
  if (index !== -1) {
    matches[index] = updatedMatch;
  } else {
    console.warn(`setMatchByID: No match found with id ${id}`);
  }
};


const getMatchByID = (id) => matches.find(match => match.id === id);

const updateRecords = (teams) => {
  const matches = getMatches();

  // Reset all team stats
  teams.forEach(team => {
    team.wins = 0;
    team.draws = 0;
    team.losses = 0;
    team.leaguePoints = 0;
    team.totalTDs = 0;
    team.totalCasualties = 0;
    team.gamesPlayed = 0;
  });

  matches.forEach(match => {
    match.teams.forEach(matchTeam => {
      const team = teams.find(t => t.id === matchTeam.id);
      if (!team) return;

      team.leaguePoints += Number(matchTeam.leaguePoints);
      team.totalTDs += Number(matchTeam.tds);
      team.totalCasualties += Number(matchTeam.casualties);
      team.gamesPlayed += 1;

      if (matchTeam.result === 'win') {
        team.wins += 1;
      } else if (matchTeam.result === 'draw') {
        team.draws += 1;
      } else if (matchTeam.result === 'loss') {
        team.losses += 1;
      }
    });
  });
};

const reapplyBonusesToAllMatches = () => {
  const currentMatches = getMatches();

  currentMatches.forEach((match) => {
    const [home, away] = match.teams;

    const updatedMatch = createMatch(
      home.id,
      away.id,
      home.tds,
      away.tds,
      home.passes,
      away.passes,
      home.casualties,
      away.casualties,
      // Assume these were stored correctly before
      home.painted,
      away.painted,
      home.underdog,
      away.underdog,
      match.date
    );

    // Preserve ID before replacing match data
    updatedMatch.id = match.id;

    setMatchByID(match.id, updatedMatch);
  });
};

export { getMatches, setMatches, createMatch, addMatch, removeMatchByID, getMatchByID, updateRecords, reapplyBonusesToAllMatches };
