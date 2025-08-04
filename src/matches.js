import * as bonuses from './bonuses.js';
import * as teams from './teams.js';

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
    });
};

const getMatchByID = (id) => matches.find(match => match.id === id);

const updateRecords = (initialRecords) => {
// Clear current records before tallying
    initialRecords.forEach((record) => {
        record.wins = 0;
        record.draws = 0;
        record.losses = 0;
        record.leaguePoints = 0;
    });
    matches.forEach((match) => {
        match.teams.forEach((team) => {
        let teamData = teams.getTeamByID(team.id);
        if(!teamData) return;
        
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

export { getMatches, setMatches, createMatch, addMatch, removeMatchByID, getMatchByID, updateRecords };
