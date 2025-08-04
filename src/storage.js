import { rehydrateTeams } from './teams.js';

const save = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

const load = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};

const saveAll = (teamsModule, matchesModule, bonusesModule) => {
    save('teams', teamsModule.getTeams());
    save('matches', matchesModule.getMatches());
    save('bonuses', bonusesModule.getBonuses());
};

const loadAll = (teamsModule, matchesModule, bonusesModule) => {
    const rawTeams = load('teams');
    const savedMatches = load('matches');
    const savedBonuses = load('bonuses');

    if (rawTeams) teamsModule.setTeams(rehydrateTeams(rawTeams));
    if (savedMatches) matchesModule.setMatches(savedMatches);
    if (savedBonuses) bonusesModule.setBonuses(savedBonuses);
};

export { saveAll, loadAll }
