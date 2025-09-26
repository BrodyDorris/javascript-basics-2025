const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameMusic = document.getElementById('game-music');

canvas.width = 800;
canvas.height = 400;

let gameState = 'main-menu';
let cameraX = 0;
let player = {};
let currentMode = 'cube';
let currentLevel = [];
let levelData = []; // This will hold the data for the level in the editor

// Predefined levels
const officialLevels = [
    {
        name: "Training Grounds",
        data: [
            { type: 'block', x: 400, y: 360, width: 40, height: 40, color: '#fff' },
            { type: 'block', x: 600, y: 360, width: 40, height: 40, color: '#fff' },
            { type: 'spike', x: 800, y: 360, width: 40, height: 40, color: '#ff0000' },
            { type: 'block', x: 1000, y: 320, width: 40, height: 40, color: '#fff' },
            { type: 'block', x: 1040, y: 320, width: 40, height: 40, color: '#fff' },
            { type: 'block', x: 1080, y: 320, width: 40, height: 40, color: '#fff' },
            { type: 'ship-portal', x: 1500, y: 200, width: 40, height: 80, color: '#00ffff', targetMode: 'ship' },
            { type: 'block', x: 2000, y: 360, width: 40, height: 40, color: '#fff' }
        ]
    },
    {
        name: "Obstacle Course",
        data: [
            { type: 'block', x: 400, y: 360, width: 40, height: 40, color: '#fff' },
            { type: 'block', x: 600, y: 360, width: 40, height: 40, color: '#fff' },
            { type: 'spike', x: 800, y: 360, width: 40, height: 40, color: '#ff0000' },
            { type: 'block', x: 1000, y: 320, width: 40, height: 40, color: '#fff' },
            { type: 'spike', x: 1200, y: 360, width: 40, height: 40, color: '#ff0000' },
            { type: 'block', x: 1400, y: 320, width: 40, height: 40, color: '#fff' },
            { type: 'block', x: 1600, y: 360, width: 40, height: 40, color: '#fff' },
            { type: 'block', x: 1800, y: 360, width: 40, height: 40, color: '#fff' }
        ]
    }
];

// Input state management
const inputState = { isPressing: false };

canvas.addEventListener('mousedown', (e) => {
    if (gameState === 'playing') {
        inputState.isPressing = true;
    } else if (gameState === 'editor' && e.button === 0) { // Left-click in editor
        drag = true;
        handleEditorClick(e, cameraX);
    }
});
canvas.addEventListener('mouseup', (e) => {
    if (gameState === 'playing') {
        inputState.isPressing = false;
    } else if (gameState === 'editor' && e.button === 0) {
        drag = false;
    }
});
canvas.addEventListener('mousemove', (e) => {
    if (gameState === 'editor' && drag) {
        handleEditorClick(e, cameraX);
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameState === 'playing') inputState.isPressing = true;
});
document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' && gameState === 'playing') inputState.isPressing = false;
});

// Handle menu transitions
function setGameState(newState) {
    gameState = newState;
    const uiContainer = document.getElementById('ui-container');
    const mainMenu = document.getElementById('main-menu');
    const levelSelectMenu = document.getElementById('level-select-menu');
    const editorUi = document.getElementById('editor-ui');

    uiContainer.style.display = (newState === 'main-menu' || newState === 'level-select') ? 'flex' : 'none';
    mainMenu.style.display = newState === 'main-menu' ? 'block' : 'none';
    levelSelectMenu.style.display = newState === 'level-select' ? 'block' : 'none';
    editorUi.style.display = newState === 'editor' ? 'flex' : 'none';
    canvas.style.display = newState === 'playing' || newState === 'editor' ? 'block' : 'none';

    if (newState === 'level-select') {
        loadLevelList();
    } else if (newState === 'editor') {
        setupEditor();
        currentLevel = levelData; // Use editor's data
        cameraX = 0; // Reset camera for editor
    } else if (newState === 'playing') {
        gameMusic.play().catch(e => console.log("Audio playback failed:", e));
    } else {
        gameMusic.pause();
    }
}

// Game initialization
function initGame(level) {
    player = {
        x: 50,
        y: canvas.height - 50,
        width: 40,
        height: 40,
        velocityY: 0,
        isJumping: false,
        color: gameModes['cube'].color
    };
    cameraX = 0;
    currentMode = 'cube';
    currentLevel = level || [];
    setGameState('playing');
}

function checkCollision() {
    const playerMode = gameModes[currentMode];
    currentLevel.forEach(obj => {
        const objX = obj.x - cameraX;
        // Collision detection logic
        if (
            player.x < objX + obj.width &&
            player.x + player.width > objX &&
            player.y < obj.y + obj.height &&
            player.y + player.height > obj.y
        ) {
            if (obj.type === 'spike') {
                gameOver();
            } else if (obj.type === 'ship-portal' && currentMode !== obj.targetMode) {
                currentMode = obj.targetMode;
                player.color = gameModes[obj.targetMode].color;
            }
        }
    });
}

function gameOver() {
    alert('Game Over!');
    setGameState('main-menu');
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawObjects() {
    currentLevel.forEach(obj => {
        if (obj.x - cameraX + obj.width > 0 && obj.x - cameraX < canvas.width) {
            if (obj.type === 'block') {
                ctx.fillStyle = obj.color;
                ctx.fillRect(obj.x - cameraX, obj.y, obj.width, obj.height);
            } else if (obj.type === 'spike') {
                ctx.fillStyle = obj.color;
                ctx.beginPath();
                ctx.moveTo(obj.x - cameraX, obj.y + obj.height);
                ctx.lineTo(obj.x - cameraX + obj.width / 2, obj.y);
                ctx.lineTo(obj.x - cameraX + obj.width, obj.y + obj.height);
                ctx.closePath();
                ctx.fill();
            } else if (obj.type === 'ship-portal') {
                ctx.fillStyle = obj.color;
                ctx.fillRect(obj.x - cameraX, obj.y, obj.width, obj.height);
            }
        }
    });
}

function gameLoop() {
    if (gameState === 'playing') {
        const playerMode = gameModes[currentMode];
        playerMode.update(player, inputState);

        if (currentMode === 'cube') {
            if (player.y + player.height > canvas.height) {
                player.y = canvas.height - player.height;
                player.isJumping = false;
                player.velocityY = 0;
            }
        }

        checkCollision();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cameraX += 5;
        
        drawObjects();
        drawPlayer();
    } else if (gameState === 'editor') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawObjects();
    }
    requestAnimationFrame(gameLoop);
}

// UI Event Handlers
document.getElementById('play-button').addEventListener('click', () => setGameState('level-select'));
document.getElementById('editor-button').addEventListener('click', () => {
    levelData = [];
    isEditorMode = true;
    setGameState('editor');
});
document.getElementById('back-to-main').addEventListener('click', () => setGameState('main-menu'));
document.getElementById('editor-play-button').addEventListener('click', () => {
    isEditorMode = false;
    initGame(levelData);
});
document.getElementById('editor-back-button').addEventListener('click', () => setGameState('main-menu'));

function loadLevelList() {
    const officialList = document.getElementById('official-level-list');
    const userList = document.getElementById('user-level-list');
    officialList.innerHTML = '';
    userList.innerHTML = '';

    officialLevels.forEach(level => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.textContent = level.name;
        button.addEventListener('click', () => {
            initGame(level.data);
        });
        li.appendChild(button);
        officialList.appendChild(li);
    });

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('gd_level_')) {
            const levelName = key.replace('gd_level_', '');
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.textContent = levelName;
            button.addEventListener('click', () => {
                const levelData = JSON.parse(localStorage.getItem(key));
                initGame(levelData);
            });
            li.appendChild(button);
            userList.appendChild(li);
        }
    }
}

gameLoop();
