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
        if (bonus.active === false) return;
        const appliesAuto = (bonus.type == 'opponent TDs' && oppTDs <= bonus.count) || 
        (bonus.type == 'opponent casualties' && oppCasualties >= bonus.count) ||
        (bonus.type == 'passes' && passes >= bonus.count);

        const appliesManual = (bonus.type == 'painted' && painted) ||
        (bonus.type == 'underdog' && underdog);

        if (appliesAuto) {
            points += bonus.points;
            appliedBonuses.push(`${bonus.name}: +${bonus.points} points for ${bonus.count} ${bonus.type}`);
        } else if (appliesManual) {
            points += bonus.points;
            appliedBonuses.push(`${bonus.name}: +${bonus.points} points`);
        }
    })

    return { points, appliedBonuses }
}

export { getBonuses, setBonuses, createBonus, addBonus, removeBonusByID, applyBonuses }