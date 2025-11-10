const playerInputs = document.querySelectorAll('.player-name');
const scorecardDiv = document.getElementById('scorecard');

document.getElementById('mode-traditional').addEventListener('click', () => startGame('traditional'));
document.getElementById('mode-even').addEventListener('click', () => startGame('even'));
document.getElementById('mode-odd').addEventListener('click', () => startGame('odd'));

function startGame(mode) {
    document.getElementById('player-setup').style.display = 'none';
    document.getElementById('mode-select').style.display = 'none';
    document.getElementById('leaderboard').style.display = 'block';
    generateScorecard(mode);
}

function getPlayerNames() {
    return Array.from(playerInputs)
        .map(input => input.value.trim())
        .filter(name => name !== "");
}

function getRounds(mode) {
    if (mode === 'traditional') return Array.from({ length: 10 }, (_, i) => i + 1);
    if (mode === 'even') return [2, 4, 6, 8, 10];
    if (mode === 'odd') return [1, 3, 5, 7, 9];
    return [];
}

function generateScorecard(mode) {
    const players = getPlayerNames();
    const rounds = getRounds(mode);
    let html = `<table class="small-cell"><thead><tr><th>Round</th>`;

    for (let player of players) {
        html += `<th colspan="4">${player}</th>`;
    }

    html += `</tr><tr><th></th>`;
    for (let i = 0; i < players.length; i++) {
        html += `<th>Bid</th><th>Wins</th><th>Bonus</th><th>Score</th>`;
    }

    html += `</tr></thead><tbody>`;

    for (let round of rounds) {
        html += `<tr data-round="${round}"><td>${round}</td>`;
        for (let i = 0; i < players.length; i++) {
            html += `
        <td><input type="number" inputmode="numeric" class="bid-input" data-player="${i}" data-round="${round}" /></td>
        <td><input type="number" inputmode="numeric" class="wins-input" data-player="${i}" data-round="${round}" /></td>
        <td><input type="number" inputmode="numeric" class="bonus-input" data-player="${i}" data-round="${round}" /></td>
        <td class="score-cell" data-player="${i}" data-round="${round}">0</td>`;
        }
        html += `</tr>`;
    }

    html += `<tr id="total-row"><td><strong>Total</strong></td>`;
    for (let i = 0; i < players.length; i++) {
        html += `<td colspan="4" class="player-total" data-player="${i}"><strong>0</strong></td>`;
    }
    html += `</tr></tbody></table>`;

    scorecardDiv.innerHTML = html;

    attachLiveListeners();
    updateLeaderboard();
}

function attachLiveListeners() {
    const inputs = scorecardDiv.querySelectorAll('.bid-input, .wins-input, .bonus-input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const round = parseInt(input.dataset.round, 10);
            const player = parseInt(input.dataset.player, 10);
            calculatePlayerRoundScore(player, round);
            updatePlayerTotal(player);
            updateLeaderboard();
        });
    });
}

function calculatePlayerRoundScore(player, round) {
    const bidStr = getInputValue(`.bid-input`, player, round);
    const winsStr = getInputValue(`.wins-input`, player, round);
    const bonus = parseInt(getInputValue(`.bonus-input`, player, round)) || 0;

    const bid = parseInt(bidStr);
    const wins = parseInt(winsStr);
    const scoreCell = document.querySelector(`.score-cell[data-player="${player}"][data-round="${round}"]`);

    // If bid or wins missing → do not calculate
    if (bidStr === '' || winsStr === '' || isNaN(bid) || isNaN(wins)) {
        scoreCell.textContent = 0;
        return;
    }

    let score = 0;
    if (bid === wins) {
        score = bid === 0 ? 10 * round : 20 * bid;
    } else {
        score = bid === 0 ? -10 * round : -10 * Math.abs(bid - wins);
    }

    score += bonus;
    scoreCell.textContent = score;
}


function getInputValue(selector, player, round) {
    const input = document.querySelector(`${selector}[data-player="${player}"][data-round="${round}"]`);
    return input?.value || "0";
}

function updatePlayerTotal(player) {
    const scores = scorecardDiv.querySelectorAll(`.score-cell[data-player="${player}"]`);
    let total = 0;
    scores.forEach(cell => {
        const val = parseInt(cell.textContent, 10);
        if (!isNaN(val)) total += val;
    });
    document.querySelector(`.player-total[data-player="${player}"]`).innerHTML = `<strong>${total}</strong>`;
}

function updateLeaderboard() {
    const players = getPlayerNames();
    const scores = players.map((name, i) => {
        const score = parseInt(document.querySelector(`.player-total[data-player="${i}"]`)?.textContent, 10) || 0;
        return { name, score };
    });

    scores.sort((a, b) => b.score - a.score);

    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    scores.forEach((p, i) => {
        const li = document.createElement('li');

        const rank = document.createElement('span');
        rank.className = 'leader-rank';
        rank.textContent = `${i + 1}.`;

        const info = document.createElement('span');
        info.className = 'leader-info';
        info.textContent = `${p.name} — ${p.score}`;
        
        if (p.score < 0) {
            info.style.color = 'red';
        } else {
            info.style.color = 'white';
        }

        li.appendChild(rank);
        li.appendChild(info);
        list.appendChild(li);
    });
}



// Hold to Reset
let holdTimer;
const resetBtn = document.getElementById('reset-btn');
const resetFill = document.getElementById('reset-fill');

// Mouse events
resetBtn.addEventListener('mousedown', startHold);
resetBtn.addEventListener('mouseup', cancelReset);
resetBtn.addEventListener('mouseleave', cancelReset);

// Touch events
resetBtn.addEventListener('touchstart', startHold);
resetBtn.addEventListener('touchend', cancelReset);
resetBtn.addEventListener('touchcancel', cancelReset);

function startHold(e) {
    e.preventDefault(); // Prevent default behavior (like text selection)
    resetFill.style.transition = 'width 3s linear';
    resetFill.style.width = '100%';
    holdTimer = setTimeout(resetToHome, 3000);
}

function cancelReset() {
    clearTimeout(holdTimer);
    resetFill.style.transition = 'width 0.3s ease';
    resetFill.style.width = '0%';
}

function resetToHome() {
    document.getElementById('player-setup').style.display = 'grid';
    document.getElementById('mode-select').style.display = 'block';
    document.getElementById('leaderboard').style.display = 'none';

    scorecardDiv.innerHTML = '';
    document.getElementById('leaderboard-list').innerHTML = '';
    resetFill.style.width = '0%';
    playerInputs.forEach(input => input.value = '');
}

