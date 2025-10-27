// ===== CONTROLADOR DE CARGA SIMPLE =====
class LoadingScreenController {
    constructor() {
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.loadingText = document.getElementById('loadingText');
        this.paddle = document.getElementById('paddle');
        this.ball = document.getElementById('ball');
        this.fadeOverlay = document.getElementById('fadeOverlay');
        
        this.currentProgress = 0;
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        this.resetLoading();
        this.startSimpleLoading();
        this.animateLoadingText();
    }
    
    resetLoading() {
        this.currentProgress = 0;
        this.updateProgress();
        
        // Ocultar interfaces
        const mainInterface = document.getElementById('mainInterface');
        if (mainInterface) {
            mainInterface.style.display = 'none';
        }
        
        // Mostrar pantalla de carga
        const loadingContainer = document.querySelector('.loading-container');
        if (loadingContainer) {
            loadingContainer.style.display = 'flex';
        }
        
        this.fadeOverlay.classList.remove('active');
    }
    
    startSimpleLoading() {
        this.isLoading = true;
        this.currentProgress = 0;
        
        const loadStep = () => {
            if (!this.isLoading) return;
            
            this.currentProgress += 1;
            this.updateProgress();
            this.updateObjectPositions();
            
            if (this.currentProgress >= 100) {
                console.log('¡100% ALCANZADO!');
                this.completeLoading();
            } else {
                setTimeout(loadStep, 40); // 40ms * 100 = 4 segundos
            }
        };
        
        loadStep();
    }
    
    updateProgress() {
        this.progressFill.style.width = `${this.currentProgress}%`;
        this.progressText.textContent = `${this.currentProgress}%`;
    }
    
    updateObjectPositions() {
        const progressBarWidth = 400;
        const ballPosition = (this.currentProgress / 100) * progressBarWidth;
        const paddlePosition = Math.max(0, ballPosition - 30);
        
        this.ball.style.left = `${ballPosition}px`;
        this.paddle.style.left = `${paddlePosition - 20}px`;
    }
    
    animateLoadingText() {
        let dotCount = 0;
        
        const updateText = () => {
            if (!this.isLoading) return;
            
            dotCount = (dotCount + 1) % 4;
            const dots = '.'.repeat(dotCount);
            this.loadingText.textContent = `Cargando${dots}`;
            
            setTimeout(updateText, 500);
        };
        
        updateText();
    }
    
    completeLoading() {
        this.isLoading = false;
        
        // Efectos al 100%
        this.progressFill.style.boxShadow = '0 0 30px rgba(0, 255, 136, 1)';
        this.loadingText.textContent = '¡Carga Completa!';
        this.loadingText.style.color = '#00ff88';
        
        console.log('Transicionando a interfaz principal...');
        
        // Transición inmediata
        setTimeout(() => {
            this.showMainInterface();
        }, 1500);
    }
    
    showMainInterface() {
        // Fade out
        this.fadeOverlay.classList.add('active');
        
        setTimeout(() => {
            // Ocultar carga
            document.querySelector('.loading-container').style.display = 'none';
            
            // Mostrar interfaz principal
            const mainInterface = document.getElementById('mainInterface');
            if (mainInterface) {
                mainInterface.style.display = 'flex';
                console.log('Interfaz principal mostrada');
                
                // Inicializar
                if (typeof initializeMainInterface === 'function') {
                    initializeMainInterface();
                }
            }
            
            // Fade in
            setTimeout(() => {
                this.fadeOverlay.classList.remove('active');
            }, 500);
        }, 1000);
    }
}

// ===== SISTEMA DE PROGRESIÓN DEL JUGADOR =====
let playerData = {
    name: 'Jugador',
    level: 1,
    experience: 0,
    coins: 50,
    stars: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    totalScore: 0
};

// Sistema de experiencia y niveles
const LEVEL_SYSTEM = {
    getExpRequiredForLevel: (level) => {
        return level * 100; // 100 EXP por nivel
    },
    
    getExpForWin: (difficulty) => {
        const expValues = {
            'easy': 25,
            'medium': 40,
            'hard': 60
        };
        return expValues[difficulty] || 25;
    },
    
    getCoinsForWin: (difficulty) => {
        const coinValues = {
            'easy': 10,
            'medium': 20,
            'hard': 35
        };
        return coinValues[difficulty] || 10;
    }
};

function initializeMainInterface() {
    loadPlayerData();
    updatePlayerDisplay();
    startTableAnimation();
}

function loadPlayerData() {
    const savedData = localStorage.getItem('pingPongPlayerData');
    if (savedData) {
        playerData = { ...playerData, ...JSON.parse(savedData) };
    }
}

function savePlayerData() {
    localStorage.setItem('pingPongPlayerData', JSON.stringify(playerData));
}

function updatePlayerDisplay() {
    // Actualizar nombre y nivel
    document.getElementById('playerNameDisplay').textContent = playerData.name;
    document.getElementById('playerLevelDisplay').textContent = playerData.level;
    
    // Actualizar monedas y estrellas
    document.getElementById('coinsDisplay').textContent = playerData.coins;
    document.getElementById('starsDisplay').textContent = playerData.stars;
    document.getElementById('shopCoinsDisplay').textContent = playerData.coins;
    
    // Actualizar barra de experiencia
    updateExperienceBar();
}

function updateExperienceBar() {
    const expRequired = LEVEL_SYSTEM.getExpRequiredForLevel(playerData.level);
    const expProgress = (playerData.experience / expRequired) * 100;
    
    document.getElementById('expBarFill').style.width = `${expProgress}%`;
    document.getElementById('expText').textContent = `${playerData.experience}/${expRequired} EXP`;
}

function addExperience(amount) {
    playerData.experience += amount;
    
    // Verificar subida de nivel
    const expRequired = LEVEL_SYSTEM.getExpRequiredForLevel(playerData.level);
    
    if (playerData.experience >= expRequired) {
        levelUp();
    }
    
    updateExperienceBar();
    savePlayerData();
}

function levelUp() {
    const expRequired = LEVEL_SYSTEM.getExpRequiredForLevel(playerData.level);
    playerData.experience -= expRequired;
    playerData.level++;
    
    // Recompensa por subir de nivel
    const levelReward = playerData.level * 5; // 5 monedas por nivel
    playerData.coins += levelReward;
    
    // Efectos visuales
    showLevelUpEffect();
    
    // Notificación
    showNotification(`¡NIVEL ${playerData.level}! +${levelReward} monedas`, '#f1c40f');
    
    updatePlayerDisplay();
    savePlayerData();
}

function showLevelUpEffect() {
    const levelElement = document.getElementById('playerLevelDisplay');
    levelElement.parentElement.classList.add('level-up-animation');
    
    setTimeout(() => {
        levelElement.parentElement.classList.remove('level-up-animation');
    }, 2000);
}

function startTableAnimation() {
    // La mesa ya tiene animación en CSS
}

// Funciones de juego
function showGameModes() {
    document.getElementById('gameModesOverlay').style.display = 'flex';
}

function hideGameModes() {
    document.getElementById('gameModesOverlay').style.display = 'none';
}

function playGame(difficulty) {
    hideGameModes();
    
    // Ocultar interfaz principal y mostrar juego
    document.getElementById('mainInterface').style.display = 'none';
    document.getElementById('gameInterface').style.display = 'flex';
    
    // Inicializar juego
    initializePingPongGame(difficulty);
}

function handleGameWin(difficulty) {
    const expGained = LEVEL_SYSTEM.getExpForWin(difficulty);
    const coinsGained = LEVEL_SYSTEM.getCoinsForWin(difficulty);
    
    // Actualizar estadísticas
    playerData.gamesPlayed++;
    playerData.gamesWon++;
    playerData.coins += coinsGained;
    
    // Agregar experiencia (esto puede causar subida de nivel)
    addExperience(expGained);
    
    // Posibilidad de ganar estrella en dificultad difícil
    if (difficulty === 'hard' && Math.random() > 0.7) {
        playerData.stars++;
        showNotification(`¡VICTORIA! +${expGained} EXP, +${coinsGained} 🪙, +1 ⭐`, '#27ae60');
    } else {
        showNotification(`¡VICTORIA! +${expGained} EXP, +${coinsGained} 🪙`, '#27ae60');
    }
    
    updatePlayerDisplay();
    savePlayerData();
}

function handleGameLoss() {
    playerData.gamesPlayed++;
    
    // Pequeña recompensa por participar
    const consolationExp = 5;
    addExperience(consolationExp);
    
    showNotification(`Derrota... +${consolationExp} EXP por intentarlo`, '#e74c3c');
    
    updatePlayerDisplay();
    savePlayerData();
}

function showCustomization() {
    showNotification('Personalización - Próximamente', '#9b59b6');
}

function showOptions() {
    showNotification('Opciones - Próximamente', '#34495e');
}

// ===== SISTEMA DE TIENDA AZUL =====
function openBlueShop() {
    console.log('Abriendo tienda azul...');
    
    // Ocultar interfaz principal
    document.getElementById('mainInterface').style.display = 'none';
    
    // Mostrar interfaz de tienda azul
    const blueShop = document.getElementById('blueShopInterface');
    if (blueShop) {
        blueShop.style.display = 'flex';
        
        // Cargar items de la tienda
        loadShopItems('pelotas');
    }
}

function closeBlueShop() {
    console.log('Cerrando tienda azul...');
    
    // Ocultar interfaz de tienda azul
    document.getElementById('blueShopInterface').style.display = 'none';
    
    // Mostrar interfaz principal
    document.getElementById('mainInterface').style.display = 'flex';
}

function showCategory(category) {
    // Actualizar botones de categoría
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Cargar items de la categoría
    loadShopItems(category);
}

function loadShopItems(category) {
    const shopGrid = document.getElementById('shopItemsGrid');
    shopGrid.innerHTML = '';
    
    const items = getShopItemsByCategory(category);
    
    items.forEach(item => {
        const itemElement = createShopItemElement(item);
        shopGrid.appendChild(itemElement);
    });
}

function getShopItemsByCategory(category) {
    const shopData = {
        pelotas: [
            { id: 1, name: 'Pelota Clásica', price: 0, icon: '⚪', owned: true },
            { id: 2, name: 'Pelota Neón', price: 50, icon: '🟢', owned: false },
            { id: 3, name: 'Pelota Fuego', price: 100, icon: '🔴', owned: false },
            { id: 4, name: 'Pelota Arcoíris', price: 150, icon: '🌈', owned: false },
            { id: 5, name: 'Pelota Diamante', price: 300, icon: '💎', owned: false }
        ],
        paletas: [
            { id: 6, name: 'Paleta Clásica', price: 0, icon: '🏓', owned: true },
            { id: 7, name: 'Paleta Pro', price: 200, icon: '🏓', owned: false },
            { id: 8, name: 'Paleta Carbono', price: 400, icon: '🏓', owned: false },
            { id: 9, name: 'Paleta Titanio', price: 600, icon: '🏓', owned: false }
        ],
        mesas: [
            { id: 10, name: 'Mesa Clásica', price: 0, icon: '🏓', owned: true },
            { id: 11, name: 'Mesa Futurista', price: 500, icon: '🛸', owned: false },
            { id: 12, name: 'Mesa Cristal', price: 800, icon: '💠', owned: false },
            { id: 13, name: 'Mesa Holográfica', price: 1200, icon: '🔮', owned: false }
        ]
    };
    
    return shopData[category] || [];
}

function createShopItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'shop-item-card';
    itemDiv.innerHTML = `
        <div class="item-icon-large">${item.icon}</div>
        <h3 class="item-name">${item.name}</h3>
        <div class="item-price">${item.price === 0 ? 'GRATIS' : item.price + ' 🪙'}</div>
        <button class="purchase-btn ${item.owned ? 'owned' : ''}" 
                onclick="purchaseItem(${item.id}, '${item.name}', ${item.price})"
                ${item.owned ? 'disabled' : ''}>
            ${item.owned ? 'COMPRADO' : 'COMPRAR'}
        </button>
    `;
    
    return itemDiv;
}

function purchaseItem(itemId, itemName, price) {
    if (price === 0) {
        showNotification('¡Item gratuito!', '#00ff88');
        return;
    }
    
    // Simular compra
    showNotification(`¡${itemName} comprado por ${price} monedas!`, '#3498db');
    
    // Actualizar el botón
    event.currentTarget.textContent = 'COMPRADO';
    event.currentTarget.classList.add('owned');
    event.currentTarget.disabled = true;
}

// ===== SISTEMA DE NOTIFICACIONES =====
function showNotification(message, color = '#00ff88') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${color};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        font-weight: bold;
        z-index: 10000;
        transform: translateX(300px);
        transition: transform 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(300px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ===== SISTEMA DE JUEGO PING PONG ===== 
let gameState = {
    isPlaying: false,
    isPaused: false,
    difficulty: 'easy',
    playerScore: 0,
    opponentScore: 0,
    playerSets: 0,
    opponentSets: 0,
    currentSet: 1,
    ballPosition: { x: 50, y: 50 },
    ballVelocity: { x: 2, y: 1.5 },
    playerPaddlePos: { x: 50, y: 90 },
    opponentPaddlePos: { x: 50, y: 10 },
    gameLoop: null,
    lastTime: 0
};

function initializePingPongGame(difficulty) {
    gameState.difficulty = difficulty;
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.playerScore = 0;
    gameState.opponentScore = 0;
    gameState.playerSets = 0;
    gameState.opponentSets = 0;
    gameState.currentSet = 1;
    
    // Posición inicial de la pelota
    resetBallPosition();
    
    // Actualizar UI
    updateGameUI();
    document.getElementById('difficultyDisplay').textContent = difficulty.toUpperCase();
    
    // Configurar controles
    setupGameControls();
    
    // Iniciar loop del juego
    gameState.lastTime = performance.now();
    gameState.gameLoop = requestAnimationFrame(gameLoop);
}

function resetBallPosition() {
    gameState.ballPosition = { x: 50, y: 50 };
    
    // Velocidad aleatoria inicial
    const angle = (Math.random() - 0.5) * Math.PI / 3; // ±30 grados
    const speed = getDifficultySpeed();
    
    gameState.ballVelocity = {
        x: Math.sin(angle) * speed,
        y: (Math.random() > 0.5 ? 1 : -1) * Math.cos(angle) * speed
    };
}

function getDifficultySpeed() {
    const speeds = {
        'easy': 1.5,
        'medium': 2.2,
        'hard': 3.0
    };
    return speeds[gameState.difficulty] || 1.5;
}

function setupGameControls() {
    const gameContainer = document.getElementById('gameTableContainer');
    
    // Controles de teclado
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Controles de mouse/touch
    gameContainer.addEventListener('mousemove', handleMouseMove);
    gameContainer.addEventListener('touchmove', handleTouchMove);
}

let keysPressed = {};

function handleKeyDown(e) {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    keysPressed[e.key] = true;
    e.preventDefault();
}

function handleKeyUp(e) {
    keysPressed[e.key] = false;
}

function handleMouseMove(e) {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Limitar movimiento del jugador a su mitad de la mesa
    gameState.playerPaddlePos.x = Math.max(10, Math.min(90, x));
    gameState.playerPaddlePos.y = Math.max(70, Math.min(95, y));
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    
    gameState.playerPaddlePos.x = Math.max(10, Math.min(90, x));
    gameState.playerPaddlePos.y = Math.max(70, Math.min(95, y));
}

function gameLoop(currentTime) {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    const deltaTime = currentTime - gameState.lastTime;
    gameState.lastTime = currentTime;
    
    // Actualizar controles de teclado
    updateKeyboardControls();
    
    // Actualizar física de la pelota
    updateBallPhysics(deltaTime);
    
    // Actualizar IA del oponente
    updateOpponentAI();
    
    // Actualizar posiciones visuales
    updateVisualPositions();
    
    // Continuar loop
    gameState.gameLoop = requestAnimationFrame(gameLoop);
}

function updateKeyboardControls() {
    const speed = 3;
    
    if (keysPressed['ArrowLeft'] || keysPressed['a'] || keysPressed['A']) {
        gameState.playerPaddlePos.x = Math.max(10, gameState.playerPaddlePos.x - speed);
    }
    if (keysPressed['ArrowRight'] || keysPressed['d'] || keysPressed['D']) {
        gameState.playerPaddlePos.x = Math.min(90, gameState.playerPaddlePos.x + speed);
    }
    if (keysPressed['ArrowUp'] || keysPressed['w'] || keysPressed['W']) {
        gameState.playerPaddlePos.y = Math.max(70, gameState.playerPaddlePos.y - speed);
    }
    if (keysPressed['ArrowDown'] || keysPressed['s'] || keysPressed['S']) {
        gameState.playerPaddlePos.y = Math.min(95, gameState.playerPaddlePos.y + speed);
    }
}

function updateBallPhysics(deltaTime) {
    const speed = deltaTime * 0.1;
    
    // Mover pelota
    gameState.ballPosition.x += gameState.ballVelocity.x * speed;
    gameState.ballPosition.y += gameState.ballVelocity.y * speed;
    
    // Rebote en paredes laterales
    if (gameState.ballPosition.x <= 2 || gameState.ballPosition.x >= 98) {
        gameState.ballVelocity.x *= -1;
        showImpactEffect(gameState.ballPosition.x, gameState.ballPosition.y);
    }
    
    // Colisión con paletas
    checkPaddleCollisions();
    
    // Verificar puntos
    if (gameState.ballPosition.y <= 0) {
        // Punto para el jugador
        scorePoint('player');
    } else if (gameState.ballPosition.y >= 100) {
        // Punto para el oponente
        scorePoint('opponent');
    }
}

function checkPaddleCollisions() {
    const ballX = gameState.ballPosition.x;
    const ballY = gameState.ballPosition.y;
    
    // Colisión con paleta del jugador
    if (ballY >= 85 && ballY <= 95) {
        const paddleX = gameState.playerPaddlePos.x;
        if (ballX >= paddleX - 8 && ballX <= paddleX + 8) {
            gameState.ballVelocity.y *= -1;
            
            // Agregar efecto de dirección basado en dónde golpea la paleta
            const hitOffset = (ballX - paddleX) / 8;
            gameState.ballVelocity.x += hitOffset * 0.5;
            
            showImpactEffect(ballX, ballY);
        }
    }
    
    // Colisión con paleta del oponente
    if (ballY >= 5 && ballY <= 15) {
        const paddleX = gameState.opponentPaddlePos.x;
        if (ballX >= paddleX - 8 && ballX <= paddleX + 8) {
            gameState.ballVelocity.y *= -1;
            
            const hitOffset = (ballX - paddleX) / 8;
            gameState.ballVelocity.x += hitOffset * 0.3;
            
            showImpactEffect(ballX, ballY);
        }
    }
}

function updateOpponentAI() {
    const ballX = gameState.ballPosition.x;
    const paddleX = gameState.opponentPaddlePos.x;
    
    // IA más inteligente según dificultad
    let aiSpeed = 1.5;
    let aiAccuracy = 0.8;
    
    switch (gameState.difficulty) {
        case 'easy':
            aiSpeed = 1.2;
            aiAccuracy = 0.6;
            break;
        case 'medium':
            aiSpeed = 1.8;
            aiAccuracy = 0.8;
            break;
        case 'hard':
            aiSpeed = 2.5;
            aiAccuracy = 0.95;
            break;
    }
    
    // Solo seguir la pelota si viene hacia el oponente
    if (gameState.ballVelocity.y < 0) {
        const targetX = ballX + (Math.random() - 0.5) * (100 - aiAccuracy * 100);
        
        if (paddleX < targetX) {
            gameState.opponentPaddlePos.x = Math.min(90, paddleX + aiSpeed);
        } else if (paddleX > targetX) {
            gameState.opponentPaddlePos.x = Math.max(10, paddleX - aiSpeed);
        }
    }
}

function updateVisualPositions() {
    // Actualizar pelota
    const ball = document.getElementById('gameBall');
    ball.style.left = gameState.ballPosition.x + '%';
    ball.style.top = gameState.ballPosition.y + '%';
    
    // Actualizar paleta del jugador
    const playerPaddle = document.getElementById('playerPaddle');
    playerPaddle.style.left = gameState.playerPaddlePos.x + '%';
    playerPaddle.style.bottom = (100 - gameState.playerPaddlePos.y) + '%';
    
    // Actualizar paleta del oponente
    const opponentPaddle = document.getElementById('opponentPaddle');
    opponentPaddle.style.left = gameState.opponentPaddlePos.x + '%';
    opponentPaddle.style.top = gameState.opponentPaddlePos.y + '%';
}

function showImpactEffect(x, y) {
    const effect = document.getElementById('impactEffect');
    effect.style.left = x + '%';
    effect.style.top = y + '%';
    effect.classList.remove('active');
    
    setTimeout(() => {
        effect.classList.add('active');
    }, 10);
}

function scorePoint(scorer) {
    if (scorer === 'player') {
        gameState.playerScore++;
    } else {
        gameState.opponentScore++;
    }
    
    updateGameUI();
    
    // Verificar si alguien ganó el set (20 puntos)
    if (gameState.playerScore >= 20 || gameState.opponentScore >= 20) {
        if (Math.abs(gameState.playerScore - gameState.opponentScore) >= 2) {
            endSet(scorer);
        }
    }
    
    // Resetear pelota
    setTimeout(() => {
        resetBallPosition();
    }, 1000);
}

function endSet(winner) {
    if (winner === 'player') {
        gameState.playerSets++;
    } else {
        gameState.opponentSets++;
    }
    
    gameState.playerScore = 0;
    gameState.opponentScore = 0;
    gameState.currentSet++;
    
    updateGameUI();
    
    // Verificar si alguien ganó el match (mejor de 3 sets)
    if (gameState.playerSets >= 2 || gameState.opponentSets >= 2) {
        endGame(gameState.playerSets > gameState.opponentSets ? 'player' : 'opponent');
    }
}

function endGame(winner) {
    gameState.isPlaying = false;
    cancelAnimationFrame(gameState.gameLoop);
    
    // Mostrar resultado
    const resultOverlay = document.getElementById('resultOverlay');
    const resultTitle = document.getElementById('resultTitle');
    const finalScore = document.getElementById('finalScore');
    const gameRewards = document.getElementById('gameRewards');
    
    if (winner === 'player') {
        resultTitle.textContent = '¡VICTORIA!';
        resultTitle.style.color = '#27ae60';
        
        // Calcular recompensas
        const expGained = LEVEL_SYSTEM.getExpForWin(gameState.difficulty);
        const coinsGained = LEVEL_SYSTEM.getCoinsForWin(gameState.difficulty);
        
        // Aplicar recompensas
        playerData.gamesPlayed++;
        playerData.gamesWon++;
        playerData.coins += coinsGained;
        addExperience(expGained);
        
        gameRewards.innerHTML = `
            <span>+${expGained} EXP</span>
            <span>+${coinsGained} 🪙</span>
        `;
        
        updatePlayerDisplay();
        savePlayerData();
    } else {
        resultTitle.textContent = 'DERROTA';
        resultTitle.style.color = '#e74c3c';
        
        playerData.gamesPlayed++;
        addExperience(5); // Consolación
        
        gameRewards.innerHTML = '<span>+5 EXP</span>';
        
        updatePlayerDisplay();
        savePlayerData();
    }
    
    finalScore.textContent = `${gameState.playerSets} - ${gameState.opponentSets}`;
    resultOverlay.style.display = 'flex';
}

function updateGameUI() {
    document.getElementById('playerScore').textContent = gameState.playerScore;
    document.getElementById('opponentScore').textContent = gameState.opponentScore;
    document.getElementById('playerSets').textContent = gameState.playerSets;
    document.getElementById('opponentSets').textContent = gameState.opponentSets;
    document.getElementById('currentSet').textContent = `Set ${gameState.currentSet}`;
}

// Funciones de control del juego
function pauseGame() {
    if (gameState.isPlaying && !gameState.isPaused) {
        gameState.isPaused = true;
        document.getElementById('pauseOverlay').style.display = 'flex';
    }
}

function resumeGame() {
    if (gameState.isPlaying && gameState.isPaused) {
        gameState.isPaused = false;
        document.getElementById('pauseOverlay').style.display = 'none';
        gameState.lastTime = performance.now();
        gameState.gameLoop = requestAnimationFrame(gameLoop);
    }
}

function quitGame() {
    gameState.isPlaying = false;
    cancelAnimationFrame(gameState.gameLoop);
    
    // Limpiar event listeners
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    
    // Volver al menú
    document.getElementById('gameInterface').style.display = 'none';
    document.getElementById('pauseOverlay').style.display = 'none';
    document.getElementById('mainInterface').style.display = 'flex';
}

function playAgain() {
    document.getElementById('resultOverlay').style.display = 'none';
    initializePingPongGame(gameState.difficulty);
}

function backToMenu() {
    document.getElementById('resultOverlay').style.display = 'none';
    quitGame();
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando Ping Pong 3D...');
    
    // Asegurar que las interfaces estén ocultas al inicio
    const mainInterface = document.getElementById('mainInterface');
    if (mainInterface) {
        mainInterface.style.display = 'none';
    }
    
    const gameInterface = document.getElementById('gameInterface');
    if (gameInterface) {
        gameInterface.style.display = 'none';
    }
    
    const blueShop = document.getElementById('blueShopInterface');
    if (blueShop) {
        blueShop.style.display = 'none';
    }
    
    // Inicializar controlador de carga
    window.loadingController = new LoadingScreenController();
});

// Controles de teclado para testing
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        location.reload();
    }
});