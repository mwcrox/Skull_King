const playerInputs = document.querySelectorAll('.player-name');
const scorecardDiv = document.getElementById('scorecard');

document.getElementById('mode-traditional').addEventListener('click', () => generateScorecard('traditional'));
document.getElementById('mode-even').addEventListener('click', () => generateScorecard('even'));
document.getElementById('mode-odd').addEventListener('click', () => generateScorecard('odd'));

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
    if (players.length < 2) {
        alert("Please enter at least 2 player names.");
        return;
    }

    const rounds = getRounds(mode);
    let html = `<table><thead><tr><th>Round</th>`;

    for (let player of players) {
        html += `<th colspan="3">${player}</th>`;
    }

    html += `</tr><tr><th></th>`;
    for (let i = 0; i < players.length; i++) {
        html += `<th>Bid</th><th>Wins</th><th>Score</th>`;
    }

    html += `</tr></thead><tbody>`;

    for (let round of rounds) {
        html += `<tr data-round="${round}"><td>${round}</td>`;
        for (let i = 0; i < players.length; i++) {
            html += `
        <td><input type="number" min="0" class="bid-input" data-player="${i}" data-round="${round}" /></td>
        <td><input type="number" min="0" class="wins-input" data-player="${i}" data-round="${round}" /></td>
        <td class="score-cell" data-player="${i}" data-round="${round}">0</td>`;
        }
        html += `</tr>`;
    }

    // Total row
    html += `<tr id="total-row"><td><strong>Total</strong></td>`;
    for (let i = 0; i < players.length; i++) {
        html += `<td colspan="3" class="player-total" data-player="${i}"><strong>0</strong></td>`;
    }
    html += `</tr></tbody></table>`;

    html += `<div style="text-align: center; margin-top: 20px;">
    <button id="calculate-scores">Calculate Scores</button>
  </div>`;

    scorecardDiv.innerHTML = html;

    document.getElementById('calculate-scores').addEventListener('click', calculateScores);
}

function calculateScores() {
    const scoreCells = scorecardDiv.querySelectorAll('.score-cell');
    const totals = {};

    scoreCells.forEach(cell => {
        const player = parseInt(cell.dataset.player);
        const round = parseInt(cell.dataset.round);

        const bidInput = scorecardDiv.querySelector(`.bid-input[data-player="${player}"][data-round="${round}"]`);
        const winsInput = scorecardDiv.querySelector(`.wins-input[data-player="${player}"][data-round="${round}"]`);

        const bid = parseInt(bidInput.value, 10);
        const wins = parseInt(winsInput.value, 10);

        let score = 0;

        if (!isNaN(bid) && !isNaN(wins)) {
            if (bid === wins) {
                score = bid === 0 ? 10 * round : 20 * bid;
            } else {
                score = bid === 0 ? -10 * round : -10 * Math.abs(bid - wins);
            }
        }

        cell.textContent = score;
        if (!totals[player]) totals[player] = 0;
        totals[player] += score;
    });

    const totalCells = scorecardDiv.querySelectorAll('.player-total');
    totalCells.forEach(cell => {
        const player = cell.dataset.player;
        cell.innerHTML = `<strong>${totals[player] || 0}</strong>`;
    });
}
