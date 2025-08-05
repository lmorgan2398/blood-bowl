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
        totalTDs: 0,
        totalCasualties: 0,
        gamesPlayed: 0,
        get record() {
            return `${this.wins}-${this.draws}-${this.losses}`
        },
        id,
    }
};

const rehydrateTeams = (plainArray) => {
  return plainArray.map(data => {
    const team = createTeam(data.name, data.race, data.coach, data.ticker);
    team.id = data.id;
    team.wins = data.wins;
    team.draws = data.draws;
    team.losses = data.losses;
    team.leaguePoints = data.leaguePoints;
    team.rank = data.rank ?? null;
    return team;
  });
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
        let leaguePointsMaxIndex = i;
        for (let j = i + 1; j < orderedTeams.length; j++) {
            if (orderedTeams[j].leaguePoints > leaguePointsMax) {
                leaguePointsMax = orderedTeams[j].leaguePoints;
                leaguePointsMaxIndex = j;
            }
        }
        // Swap values
        let temp = orderedTeams[leaguePointsMaxIndex];
        orderedTeams[leaguePointsMaxIndex] = orderedTeams[i];
        orderedTeams[i] = temp;
    }
    orderedTeams.forEach((team, i) => {
        team.rank = i + 1;
    });
    setTeams(orderedTeams);
}

export { getTeams, setTeams, createTeam, rehydrateTeams, addTeam, getTeamByTicker, getTeamByID, removeTeamByID, assignRanks }