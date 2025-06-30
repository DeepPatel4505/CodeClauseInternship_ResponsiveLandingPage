// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Dynamic background animation
const hero = document.querySelector('.hero');
let mouseX = 0;
let mouseY = 0;

hero.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    // Purple variations (HSL format for better color control)
    const purpleHue = 265 + mouseX * 15; // 265-280° hue range
    const purpleSat = 70 + mouseY * 15;  // 70-85% saturation
    const purpleLight = 50 - mouseY * 10; // 40-50% lightness

    // Orange variations
    const orangeHue = 30 - mouseX * 10;  // 20-30° hue range
    const orangeSat = 80 - mouseY * 10;   // 70-80% saturation
    const orangeLight = 60 + mouseX * 5;  // 60-65% lightness

    hero.style.background = `
        linear-gradient(
            ${135 + mouseX * 30}deg,
            hsl(${purpleHue}, ${purpleSat}%, ${purpleLight}%) 0%,
            hsl(${orangeHue}, ${orangeSat}%, ${orangeLight}%) 100%
        )
    `;
});


// Button click effects
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        let ripple = document.createElement('span');
        ripple.classList.add('ripple');
        this.appendChild(ripple);
        
        let x = e.clientX - e.target.offsetLeft;
        let y = e.clientY - e.target.offsetTop;
        
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple effect styles
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Enhanced floating shapes
function createFloatingShape() {
    const shape = document.createElement('div');
    shape.className = 'shape';
    shape.style.left = Math.random() * 100 + '%';
    shape.style.width = (Math.random() * 60 + 40) + 'px';
    shape.style.height = shape.style.width;
    shape.style.animationDuration = (Math.random() * 10 + 15) + 's';
    shape.style.animationDelay = Math.random() * 5 + 's';
    
    document.querySelector('.floating-shapes').appendChild(shape);
    
    setTimeout(() => {
        shape.remove();
    }, 25000);
}

// Create new floating shapes periodically
setInterval(createFloatingShape, 3000);

// Game state
let gameState = {
    players: [],
    currentRound: 1,
    totalRounds: 13,
    maxCards: 7,
    scores: [],
    trumpSuits: []
};

// DOM Elements
const gameSetup = document.getElementById('gameSetup');
const gamePlay = document.getElementById('gamePlay');
const gameResults = document.getElementById('gameResults');
const playerCount = document.getElementById('playerCount');
const maxCards = document.getElementById('maxCards');
const totalRounds = document.getElementById('totalRounds');
const playerNames = document.getElementById('playerNames');
const startGame = document.getElementById('startGame');
const currentRound = document.getElementById('currentRound');
const cardsThisRound = document.getElementById('cardsThisRound');
const trumpSuit = document.getElementById('trumpSuit');
const biddingPlayers = document.getElementById('biddingPlayers');
const scoringPlayers = document.getElementById('scoringPlayers');
const nextRound = document.getElementById('nextRound');
const finishGame = document.getElementById('finishGame');
const leaderboard = document.getElementById('leaderboard');
const downloadCSV = document.getElementById('downloadCSV');

// Event Listeners
playerCount.addEventListener('change', updatePlayerNameInputs);
startGame.addEventListener('click', initializeGame);
nextRound.addEventListener('click', proceedToNextRound);
finishGame.addEventListener('click', endGame);
downloadCSV.addEventListener('click', downloadGameResults);

// Update player name inputs when player count changes
function updatePlayerNameInputs() {
    const count = parseInt(playerCount.value);
    playerNames.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.className = 'mb-4';
        div.innerHTML = `
            <label class="block text-sm font-medium text-gray-700">Player ${i + 1} Name</label>
            <input type="text" class="player-name mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
        `;
        playerNames.appendChild(div);
    }
}

// Initialize game
function initializeGame() {
    // Get player names
    const nameInputs = document.querySelectorAll('.player-name');
    gameState.players = Array.from(nameInputs).map(input => input.value.trim());
    
    // Validate inputs
    if (gameState.players.some(name => !name)) {
        alert('Please enter names for all players');
        return;
    }
    
    // Set game parameters
    gameState.maxCards = parseInt(maxCards.value);
    gameState.totalRounds = parseInt(totalRounds.value);
    gameState.currentRound = 1;
    gameState.scores = Array(gameState.players.length).fill(0);
    gameState.trumpSuits = [];
    
    // Show game play section
    gameSetup.classList.add('hidden');
    gamePlay.classList.remove('hidden');
    
    // Initialize first round
    updateRoundDisplay();
    renderBiddingPhase();
}

// Update round display
function updateRoundDisplay() {
    currentRound.textContent = gameState.currentRound;
    const cards = calculateCardsThisRound();
    cardsThisRound.textContent = cards;
}

// Calculate cards for current round
function calculateCardsThisRound() {
    const max = gameState.maxCards;
    const round = gameState.currentRound;
    const cycle = 2 * max - 2;
    const position = (round - 1) % cycle;
    return position < max ? position + 1 : 2 * max - position - 1;
}

// Render bidding phase
function renderBiddingPhase() {
    biddingPlayers.innerHTML = '';
    const cardsThisRound = calculateCardsThisRound();
    let totalBids = 0;
    
    gameState.players.forEach((player, index) => {
        const isLastPlayer = index === gameState.players.length - 1;
        const div = document.createElement('div');
        div.className = 'bg-gray-50 p-4 rounded-lg';
        div.innerHTML = `
            <h4 class="font-medium mb-2">${player}</h4>
            <div class="flex items-center gap-2">
                <button class="bid-decrease bg-gray-200 px-3 py-1 rounded">-</button>
                <span class="bid-value text-xl font-bold">0</span>
                <button class="bid-increase bg-gray-200 px-3 py-1 rounded">+</button>
            </div>
            <div class="mt-2 text-sm text-gray-600">
                Max bid: ${isLastPlayer ? cardsThisRound - totalBids : cardsThisRound}
            </div>
        `;
        
        const bidValue = div.querySelector('.bid-value');
        const decreaseBtn = div.querySelector('.bid-decrease');
        const increaseBtn = div.querySelector('.bid-increase');
        
        decreaseBtn.addEventListener('click', () => {
            const currentBid = parseInt(bidValue.textContent);
            if (currentBid > 0) {
                bidValue.textContent = currentBid - 1;
                totalBids--;
            }
        });
        
        increaseBtn.addEventListener('click', () => {
            const currentBid = parseInt(bidValue.textContent);
            const maxBid = isLastPlayer ? cardsThisRound - totalBids : cardsThisRound;
            if (currentBid < maxBid) {
                bidValue.textContent = currentBid + 1;
                totalBids++;
            }
        });
        
        biddingPlayers.appendChild(div);
    });
}

// Render scoring phase
function renderScoringPhase() {
    scoringPlayers.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = 'bg-gray-50 p-4 rounded-lg';
        div.innerHTML = `
            <h4 class="font-medium mb-2">${player}</h4>
            <div class="flex items-center gap-4">
                <label class="flex items-center">
                    <input type="radio" name="score-${index}" value="hit" class="mr-2">
                    Hit Bid
                </label>
                <label class="flex items-center">
                    <input type="radio" name="score-${index}" value="miss" class="mr-2">
                    Missed Bid
                </label>
            </div>
        `;
        scoringPlayers.appendChild(div);
    });
}

// Proceed to next round
function proceedToNextRound() {
    // Get bids and scores
    const bids = Array.from(document.querySelectorAll('.bid-value')).map(el => parseInt(el.textContent));
    const scoreInputs = document.querySelectorAll('input[type="radio"]:checked');
    
    if (scoreInputs.length !== gameState.players.length) {
        alert('Please record scores for all players');
        return;
    }
    
    // Calculate scores
    const roundScores = gameState.players.map((_, index) => {
        const bid = bids[index];
        const hit = scoreInputs[index].value === 'hit';
        return hit ? 10 + bid : 0;
    });
    
    // Update game state
    gameState.scores = gameState.scores.map((score, index) => score + roundScores[index]);
    gameState.trumpSuits.push(trumpSuit.value);
    
    if (gameState.currentRound === gameState.totalRounds) {
        endGame();
    } else {
        gameState.currentRound++;
        updateRoundDisplay();
        renderBiddingPhase();
    }
}

// End game and show results
function endGame() {
    gamePlay.classList.add('hidden');
    gameResults.classList.remove('hidden');
    
    // Create leaderboard
    const playerScores = gameState.players.map((player, index) => ({
        name: player,
        score: gameState.scores[index]
    })).sort((a, b) => b.score - a.score);
    
    leaderboard.innerHTML = `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${playerScores.map((player, index) => `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${index + 1}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${player.name}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${player.score}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Download game results as CSV
function downloadGameResults() {
    const headers = ['Round', 'Trump Suit', ...gameState.players];
    const rows = [];
    
    for (let i = 0; i < gameState.totalRounds; i++) {
        const row = [
            i + 1,
            gameState.trumpSuits[i] || '',
            ...gameState.players.map((_, index) => gameState.scores[index] || 0)
        ];
        rows.push(row);
    }
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'judgment_game_results.csv';
    link.click();
}

// Initialize player name inputs on page load
updatePlayerNameInputs();