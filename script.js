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
            'easy': 30,
            'medium': 60,
            'hard': 100
        };
        return coinValues[difficulty] || 30;
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

        // Resetear tabs y mostrar pelotas por defecto
        resetShopTabs();
        loadShopItems('pelotas');

        // Actualizar monedas en la tienda
        updateShopCurrency();
    }
}

function resetShopTabs() {
    // Quitar active de todos los tabs
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Activar el tab de pelotas
    const pelotasTab = document.querySelector('.category-btn[onclick*="pelotas"]');
    if (pelotasTab) {
        pelotasTab.classList.add('active');
    }
}

function updateShopCurrency() {
    const shopCoinsElement = document.getElementById('shopCoinsDisplay');
    if (shopCoinsElement) {
        shopCoinsElement.textContent = playerData.coins;
    }
}

function closeBlueShop() {
    console.log('Cerrando tienda azul...');

    // Ocultar interfaz de tienda azul
    document.getElementById('blueShopInterface').style.display = 'none';

    // Mostrar interfaz principal
    document.getElementById('mainInterface').style.display = 'flex';

    // Actualizar display del jugador por si compró algo
    updatePlayerDisplay();
}

function showCategory(category) {
    console.log('Mostrando categoría:', category);

    // Actualizar botones de categoría
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Activar el botón clickeado
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

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

    // Verificar si tiene suficientes monedas
    if (playerData.coins < price) {
        showNotification('¡No tienes suficientes monedas!', '#e74c3c');
        return;
    }

    // Realizar compra
    playerData.coins -= price;

    // Guardar datos
    savePlayerData();

    // Actualizar displays
    updatePlayerDisplay();
    updateShopCurrency();

    // Mostrar notificación
    showNotification(`¡${itemName} comprado por ${price} monedas!`, '#3498db');

    // Actualizar el botón
    if (event && event.currentTarget) {
        event.currentTarget.textContent = 'COMPRADO';
        event.currentTarget.classList.add('owned');
        event.currentTarget.disabled = true;
    }
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
    ballVelocity: { x: 0, y: 0 },
    ballSpin: { topspin: 0, sidespin: 0 },
    playerPaddlePos: { x: 50, y: 90 },
    opponentPaddlePos: { x: 50, y: 10 },
    gameLoop: null,
    lastTime: 0,
    isServing: true,
    serverSide: 'player', // 'player' o 'opponent'
    rallyCount: 0,
    lastHitBy: null,
    ballHeight: 0, // Simular altura de la pelota
    gamePhase: 'serve' // 'serve', 'rally', 'point'
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
    gameState.isServing = true;
    gameState.serverSide = 'player';
    gameState.rallyCount = 0;
    gameState.gamePhase = 'serve';

    // Posición inicial para saque
    prepareServe();

    // Actualizar UI
    updateGameUI();
    document.getElementById('difficultyDisplay').textContent = difficulty.toUpperCase();

    // Configurar controles
    setupGameControls();

    // Mostrar instrucciones de saque
    showServeInstructions();

    // Iniciar loop del juego
    gameState.lastTime = performance.now();
    gameState.gameLoop = requestAnimationFrame(gameLoop);
}

function prepareServe() {
    gameState.gamePhase = 'serve';
    gameState.rallyCount = 0;

    if (gameState.serverSide === 'player') {
        gameState.ballPosition = { x: 50, y: 85 };
        gameState.playerPaddlePos = { x: 50, y: 90 };
    } else {
        gameState.ballPosition = { x: 50, y: 15 };
        gameState.opponentPaddlePos = { x: 50, y: 10 };
    }

    gameState.ballVelocity = { x: 0, y: 0 };
    gameState.ballSpin = { topspin: 0, sidespin: 0 };
    gameState.ballHeight = 0;
}

function executeServe(serverSide, targetX = 50) {
    gameState.gamePhase = 'rally';
    gameState.rallyCount = 1;
    gameState.lastHitBy = serverSide;

    const speed = getDifficultySpeed() * 0.8; // Saque más lento
    const direction = serverSide === 'player' ? -1 : 1;

    // Saque con variación según dificultad
    let accuracy = 0.9;
    if (gameState.difficulty === 'easy') accuracy = 0.7;
    else if (gameState.difficulty === 'medium') accuracy = 0.8;

    const targetVariation = (Math.random() - 0.5) * (100 - accuracy * 100);
    const finalTargetX = Math.max(10, Math.min(90, targetX + targetVariation));

    gameState.ballVelocity = {
        x: (finalTargetX - gameState.ballPosition.x) * 0.02,
        y: direction * speed
    };

    // Agregar spin al saque
    gameState.ballSpin.topspin = (Math.random() - 0.5) * 0.5;
    gameState.ballSpin.sidespin = (Math.random() - 0.5) * 0.3;
}

function executeTopspinAttack(attackerSide, power = 1.0) {
    const direction = attackerSide === 'player' ? -1 : 1;
    const speed = getDifficultySpeed() * power;

    // Topspin agresivo
    gameState.ballVelocity.y = direction * speed * 1.3;
    gameState.ballVelocity.x += (Math.random() - 0.5) * speed * 0.5;

    // Mucho topspin
    gameState.ballSpin.topspin = direction * 0.8;
    gameState.ballSpin.sidespin = (Math.random() - 0.5) * 0.4;

    gameState.lastHitBy = attackerSide;
    gameState.rallyCount++;

    showImpactEffect(gameState.ballPosition.x, gameState.ballPosition.y);
}

function showServeInstructions() {
    const instructions = gameState.serverSide === 'player'
        ? 'Tu saque - Presiona ESPACIO para sacar'
        : 'Saque del oponente - Prepárate para defender';

    showNotification(instructions, '#3498db');
}

function getDifficultySpeed() {
    const speeds = {
        'easy': 1.0,    // Más lento para principiantes
        'medium': 1.4,  // Velocidad moderada
        'hard': 1.8     // Rápido pero controlable
    };
    return speeds[gameState.difficulty] || 1.0;
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

    // Saque con espacio
    if (e.key === ' ' && gameState.gamePhase === 'serve' && gameState.serverSide === 'player') {
        const targetX = gameState.playerPaddlePos.x + (Math.random() - 0.5) * 20;
        executeServe('player', targetX);
        e.preventDefault();
        return;
    }

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

    // Movimiento directo y ultra responsivo (sin lag)
    const targetX = Math.max(2, Math.min(98, x));
    const targetY = Math.max(60, Math.min(99, y));

    // Movimiento casi instantáneo - más ligero
    gameState.playerPaddlePos.x += (targetX - gameState.playerPaddlePos.x) * 0.95;
    gameState.playerPaddlePos.y += (targetY - gameState.playerPaddlePos.y) * 0.95;
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    // Movimiento súper responsivo en móviles
    const targetX = Math.max(2, Math.min(98, x));
    const targetY = Math.max(60, Math.min(99, y));

    // Movimiento directo para mejor control táctil
    gameState.playerPaddlePos.x = targetX;
    gameState.playerPaddlePos.y = targetY;
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
    let speed = 6.5; // Velocidad base más rápida y fluida

    // Velocidad adaptativa según la situación
    if (gameState.gamePhase === 'rally') {
        const ballSpeed = Math.sqrt(gameState.ballVelocity.x ** 2 + gameState.ballVelocity.y ** 2);
        if (ballSpeed > 2.5) {
            speed = 8.0; // Muy rápido para pelotas rápidas
        }
    }

    // Movimiento horizontal (súper fluido)
    if (keysPressed['ArrowLeft'] || keysPressed['a'] || keysPressed['A']) {
        gameState.playerPaddlePos.x = Math.max(2, gameState.playerPaddlePos.x - speed);
    }
    if (keysPressed['ArrowRight'] || keysPressed['d'] || keysPressed['D']) {
        gameState.playerPaddlePos.x = Math.min(98, gameState.playerPaddlePos.x + speed);
    }

    // Movimiento vertical (súper fluido)
    if (keysPressed['ArrowUp'] || keysPressed['w'] || keysPressed['W']) {
        gameState.playerPaddlePos.y = Math.max(60, gameState.playerPaddlePos.y - speed);
    }
    if (keysPressed['ArrowDown'] || keysPressed['s'] || keysPressed['S']) {
        gameState.playerPaddlePos.y = Math.min(99, gameState.playerPaddlePos.y + speed);
    }
}

function updateBallPhysics(deltaTime) {
    if (gameState.gamePhase === 'serve') return;

    const speed = deltaTime * 0.06; // Aumentado para movimiento más fluido

    // Efectos de spin más suaves
    const spinEffect = {
        x: gameState.ballSpin.sidespin * speed * 0.2,
        y: gameState.ballSpin.topspin * speed * 0.15
    };

    // Mover pelota de forma más fluida y directa
    gameState.ballPosition.x += (gameState.ballVelocity.x + spinEffect.x) * speed;
    gameState.ballPosition.y += (gameState.ballVelocity.y + spinEffect.y) * speed;

    // Altura simple sin gravedad excesiva
    const distanceFromCenter = Math.abs(gameState.ballPosition.y - 50);
    gameState.ballHeight = Math.max(0, Math.sin((distanceFromCenter / 50) * Math.PI) * 8);

    // Reducir spin más rápido
    gameState.ballSpin.topspin *= 0.98;
    gameState.ballSpin.sidespin *= 0.98;

    // Rebotes en paredes laterales más simples
    if (gameState.ballPosition.x <= 2 || gameState.ballPosition.x >= 98) {
        gameState.ballVelocity.x *= -0.7;
        gameState.ballSpin.sidespin *= -0.3;
        gameState.ballPosition.x = Math.max(2, Math.min(98, gameState.ballPosition.x));
        showImpactEffect(gameState.ballPosition.x, gameState.ballPosition.y, 0.8);
    }

    // Colisión con paletas
    checkAdvancedPaddleCollisions();

    // Puntos cuando la pelota sale de la mesa
    if (gameState.ballPosition.y <= -5) {
        scorePoint('player');
    } else if (gameState.ballPosition.y >= 105) {
        scorePoint('opponent');
    }
}

function checkAdvancedPaddleCollisions() {
    const ballX = gameState.ballPosition.x;
    const ballY = gameState.ballPosition.y;

    // Colisión con paleta del jugador (área MUY generosa)
    if (ballY >= 75 && ballY <= 99 && gameState.lastHitBy !== 'player') {
        const paddleX = gameState.playerPaddlePos.x;
        const paddleY = gameState.playerPaddlePos.y;

        // Área de colisión súper generosa
        const distanceX = Math.abs(ballX - paddleX);
        const distanceY = Math.abs(ballY - paddleY);

        if (distanceX <= 18 && distanceY <= 12) { // Área mucho más grande
            handlePlayerHit(ballX, ballY, paddleX, paddleY);
        }
    }

    // Colisión con paleta del oponente (área generosa pero no tanto)
    if (ballY >= 1 && ballY <= 25 && gameState.lastHitBy !== 'opponent') {
        const paddleX = gameState.opponentPaddlePos.x;
        const paddleY = gameState.opponentPaddlePos.y;

        // Área de colisión generosa para el oponente
        const distanceX = Math.abs(ballX - paddleX);
        const distanceY = Math.abs(ballY - paddleY);

        if (distanceX <= 15 && distanceY <= 10) {
            handleOpponentHit(ballX, ballY, paddleX, paddleY);
        }
    }
}

function handlePlayerHit(ballX, ballY, paddleX, paddleY) {
    const hitOffset = (ballX - paddleX) / 18; // Normalizado con área más grande

    // Golpe más fluido y directo hacia el oponente
    const hitPower = 2.0; // Potencia aumentada para mejor fluidez
    
    // Dirección directa hacia el oponente (arriba = negativo en Y)
    const targetX = paddleX + (hitOffset * 30); // Dirección horizontal basada en donde golpeas
    const directionX = (targetX - ballX) * 0.03;
    const directionY = -hitPower; // Siempre hacia arriba (oponente)
    
    gameState.ballVelocity.x = directionX;
    gameState.ballVelocity.y = directionY;

    // Spin mínimo
    gameState.ballSpin.topspin = -0.05;
    gameState.ballSpin.sidespin = hitOffset * 0.1;

    gameState.lastHitBy = 'player';
    gameState.rallyCount++;

    // Efectos visuales mejorados
    showImpactEffect(ballX, ballY, 1.2);

    // Efecto de golpe en la pelota
    const ball = document.getElementById('gameBall');
    ball.classList.add('hit-effect');
    setTimeout(() => ball.classList.remove('hit-effect'), 200);

    // Crear partículas en el impacto
    for (let i = 0; i < 5; i++) {
        setTimeout(() => createBallParticle(ballX, ballY), i * 20);
    }

    // Feedback positivo
    if (gameState.rallyCount > 3) {
        showNotification('¡Rally! ' + gameState.rallyCount + ' golpes', '#27ae60');
    }
}

function handleOpponentHit(ballX, ballY, paddleX, paddleY) {
    const ballSpeed = Math.sqrt(gameState.ballVelocity.x ** 2 + gameState.ballVelocity.y ** 2);
    const hitOffset = (ballX - paddleX) / 12;
    const verticalOffset = (ballY - paddleY) / 8;

    // Golpe del oponente más fluido y directo hacia el jugador
    const hitPower = 1.8;
    
    // Dirección hacia el jugador (abajo = positivo en Y)
    const targetX = paddleX + (hitOffset * 25);
    const directionX = (targetX - ballX) * 0.025;
    const directionY = hitPower; // Siempre hacia abajo (jugador)
    
    // Agregar variación según dificultad
    let errorX = 0;
    if (gameState.difficulty === 'easy') {
        errorX = (Math.random() - 0.5) * 0.8;
    } else if (gameState.difficulty === 'medium') {
        errorX = (Math.random() - 0.5) * 0.4;
    } else {
        errorX = (Math.random() - 0.5) * 0.2;
    }
    
    gameState.ballVelocity.x = directionX + errorX;
    gameState.ballVelocity.y = directionY;

    // Spin mínimo
    gameState.ballSpin.topspin = 0.05;
    gameState.ballSpin.sidespin = hitOffset * 0.1;

    gameState.lastHitBy = 'opponent';
    gameState.rallyCount++;

    showImpactEffect(ballX, ballY);
}

function updateOpponentAI() {
    const ballX = gameState.ballPosition.x;
    const ballY = gameState.ballPosition.y;
    const paddleX = gameState.opponentPaddlePos.x;
    const paddleY = gameState.opponentPaddlePos.y;

    // IA más fluida y reactiva
    let aiSpeed = 2.5;
    let errorRate = 0.3;

    switch (gameState.difficulty) {
        case 'easy':
            aiSpeed = 1.8;
            errorRate = 0.5;
            break;
        case 'medium':
            aiSpeed = 2.8;
            errorRate = 0.3;
            break;
        case 'hard':
            aiSpeed = 3.5;
            errorRate = 0.15;
            break;
    }

    // Saque automático
    if (gameState.gamePhase === 'serve' && gameState.serverSide === 'opponent') {
        setTimeout(() => {
            const targetX = 40 + Math.random() * 20;
            executeServe('opponent', targetX);
        }, 1000);
        return;
    }

    // Movimiento reactivo cuando la pelota viene hacia el oponente
    if (gameState.gamePhase === 'rally' && gameState.ballVelocity.y < 0) {
        // Predecir posición de la pelota
        let targetX = ballX;
        
        // Predicción simple basada en velocidad
        if (ballY > 30) {
            targetX = ballX + (gameState.ballVelocity.x * 5);
        }

        // Agregar error según dificultad
        if (Math.random() < errorRate) {
            targetX += (Math.random() - 0.5) * 25;
        }

        // Limitar objetivo
        targetX = Math.max(10, Math.min(90, targetX));

        // Movimiento más fluido y rápido
        const horizontalDiff = targetX - paddleX;
        if (Math.abs(horizontalDiff) > 1) {
            const moveSpeed = Math.min(aiSpeed, Math.abs(horizontalDiff) * 0.3);
            gameState.opponentPaddlePos.x += Math.sign(horizontalDiff) * moveSpeed;
        }

        // Posición vertical adaptativa
        const targetY = 12;
        const verticalDiff = targetY - paddleY;
        if (Math.abs(verticalDiff) > 0.5) {
            gameState.opponentPaddlePos.y += Math.sign(verticalDiff) * 0.5;
        }

        // Limitar posición
        gameState.opponentPaddlePos.x = Math.max(5, Math.min(95, gameState.opponentPaddlePos.x));
        gameState.opponentPaddlePos.y = Math.max(8, Math.min(20, gameState.opponentPaddlePos.y));
    }
}

function decideOpponentStrategy() {
    // Decidir si atacar o defender basado en la situación
    let attackChance = 0.3;

    // Más agresivo en dificultad alta
    if (gameState.difficulty === 'hard') attackChance = 0.6;
    else if (gameState.difficulty === 'medium') attackChance = 0.4;

    // Más agresivo si el rally es largo
    if (gameState.rallyCount > 5) attackChance += 0.2;

    // Más agresivo si la pelota viene lenta
    const ballSpeed = Math.sqrt(gameState.ballVelocity.x ** 2 + gameState.ballVelocity.y ** 2);
    if (ballSpeed < 2) attackChance += 0.3;

    return Math.random() < attackChance;
}

function getOpponentPower() {
    switch (gameState.difficulty) {
        case 'easy': return 0.8 + Math.random() * 0.3;
        case 'medium': return 1.0 + Math.random() * 0.4;
        case 'hard': return 1.2 + Math.random() * 0.5;
        default: return 1.0;
    }
}

function updateVisualPositions() {
    // Actualizar pelota con efectos más llamativos
    const ball = document.getElementById('gameBall');
    ball.style.left = gameState.ballPosition.x + '%';
    ball.style.top = gameState.ballPosition.y + '%';

    // Calcular velocidad de la pelota
    const ballSpeed = Math.sqrt(gameState.ballVelocity.x ** 2 + gameState.ballVelocity.y ** 2);

    // Efecto de altura más visible
    const heightScale = 1 + (gameState.ballHeight * 0.03);
    ball.style.transform = `translate(-50%, -50%) scale(${heightScale})`;

    // Agregar clases según velocidad para efectos visuales
    ball.classList.remove('speed-1', 'speed-2', 'speed-3', 'moving', 'spinning');

    if (ballSpeed > 0.5) {
        ball.classList.add('moving');

        if (ballSpeed > 3) {
            ball.classList.add('speed-3');
        } else if (ballSpeed > 2) {
            ball.classList.add('speed-2');
        } else if (ballSpeed > 1) {
            ball.classList.add('speed-1');
        }

        // Efecto de spin si hay rotación
        if (Math.abs(gameState.ballSpin.topspin) > 0.2 || Math.abs(gameState.ballSpin.sidespin) > 0.2) {
            ball.classList.add('spinning');
        }

        // Crear partículas cuando va rápido
        if (ballSpeed > 2.5 && Math.random() > 0.7) {
            createBallParticle(gameState.ballPosition.x, gameState.ballPosition.y);
        }
    }

    // Brillo según velocidad
    const glowIntensity = Math.min(ballSpeed * 5, 25);
    ball.style.boxShadow = `0 0 ${glowIntensity}px rgba(255, 255, 255, 0.9), 0 5px 15px rgba(0, 0, 0, 0.3)`;

    // Detectar si pasa por la red
    if (Math.abs(gameState.ballPosition.y - 50) < 2) {
        ball.classList.add('net-pass');
        setTimeout(() => ball.classList.remove('net-pass'), 300);
    }

    // Actualizar paleta del jugador con efectos
    const playerPaddle = document.getElementById('playerPaddle');
    playerPaddle.style.left = gameState.playerPaddlePos.x + '%';
    playerPaddle.style.bottom = (100 - gameState.playerPaddlePos.y) + '%';

    // Efecto de movimiento más suave
    const playerVelX = gameState.playerPaddlePos.x - (gameState.lastPlayerPos?.x || gameState.playerPaddlePos.x);
    const playerRotation = Math.max(-15, Math.min(15, playerVelX * 3));
    playerPaddle.style.transform = `translateX(-50%) rotateZ(${playerRotation}deg)`;

    // Brillo en la paleta del jugador cuando está cerca de la pelota
    const distanceToPlayer = Math.sqrt(
        Math.pow(gameState.ballPosition.x - gameState.playerPaddlePos.x, 2) +
        Math.pow(gameState.ballPosition.y - gameState.playerPaddlePos.y, 2)
    );

    if (distanceToPlayer < 20) {
        playerPaddle.style.filter = 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.8))';
    } else {
        playerPaddle.style.filter = 'none';
    }

    // Actualizar paleta del oponente
    const opponentPaddle = document.getElementById('opponentPaddle');
    opponentPaddle.style.left = gameState.opponentPaddlePos.x + '%';
    opponentPaddle.style.top = gameState.opponentPaddlePos.y + '%';

    const opponentVelX = gameState.opponentPaddlePos.x - (gameState.lastOpponentPos?.x || gameState.opponentPaddlePos.x);
    const opponentRotation = Math.max(-15, Math.min(15, opponentVelX * 3));
    opponentPaddle.style.transform = `translateX(-50%) rotateZ(${opponentRotation}deg)`;

    // Guardar posiciones anteriores
    gameState.lastPlayerPos = { ...gameState.playerPaddlePos };
    gameState.lastOpponentPos = { ...gameState.opponentPaddlePos };
}

// Crear partículas de la pelota
function createBallParticle(x, y) {
    const particlesContainer = document.getElementById('ballParticles');
    if (!particlesContainer) return;

    const particle = document.createElement('div');
    particle.className = 'ball-particle';
    particle.style.left = x + '%';
    particle.style.top = y + '%';

    // Posición aleatoria alrededor de la pelota
    const offsetX = (Math.random() - 0.5) * 10;
    const offsetY = (Math.random() - 0.5) * 10;
    particle.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

    particlesContainer.appendChild(particle);

    // Eliminar después de la animación
    setTimeout(() => {
        particlesContainer.removeChild(particle);
    }, 500);
}

function showImpactEffect(x, y, intensity = 1) {
    const effect = document.getElementById('impactEffect');
    effect.style.left = x + '%';
    effect.style.top = y + '%';
    effect.classList.remove('active');

    // Variar el tamaño del efecto según la intensidad
    effect.style.transform = `translate(-50%, -50%) scale(${intensity})`;

    setTimeout(() => {
        effect.classList.add('active');
    }, 10);

    // Vibración sutil en dispositivos móviles
    if (navigator.vibrate && intensity > 1.2) {
        navigator.vibrate(50);
    }
}

function scorePoint(scorer) {
    // Animación de punto con parpadeo del marcador
    animateScoreFlash(scorer);

    if (scorer === 'player') {
        gameState.playerScore++;
        showNotification('¡PUNTO!', '#27ae60');
    } else {
        gameState.opponentScore++;
        showNotification('Punto del oponente', '#e74c3c');
    }

    // Animación de la pelota regresando al centro
    animateBallToCenter();

    updateGameUI();

    // Cambiar servidor cada 2 puntos
    const totalPoints = gameState.playerScore + gameState.opponentScore;
    if (totalPoints % 2 === 0) {
        gameState.serverSide = gameState.serverSide === 'player' ? 'opponent' : 'player';
    }

    // Verificar si alguien ganó el set (5 puntos)
    if (gameState.playerScore >= 5 || gameState.opponentScore >= 5) {
        endSet(scorer);
        return;
    }

    // Preparar siguiente saque
    setTimeout(() => {
        prepareServe();
        showServeInstructions();
    }, 2000);
}

function animateScoreFlash(scorer) {
    const scoreElement = scorer === 'player'
        ? document.getElementById('playerScore')
        : document.getElementById('opponentScore');

    scoreElement.classList.add('score-flash');
    setTimeout(() => {
        scoreElement.classList.remove('score-flash');
    }, 600);
}

function animateBallToCenter() {
    const ball = document.getElementById('gameBall');
    ball.classList.add('ball-return-center');

    setTimeout(() => {
        ball.classList.remove('ball-return-center');
    }, 1500);
}

function endSet(winner) {
    if (winner === 'player') {
        gameState.playerSets++;
        showNotification(`¡Ganaste el Set ${gameState.currentSet}!`, '#27ae60');
    } else {
        gameState.opponentSets++;
        showNotification(`Perdiste el Set ${gameState.currentSet}`, '#e74c3c');
    }

    gameState.playerScore = 0;
    gameState.opponentScore = 0;
    gameState.currentSet++;

    updateGameUI();

    // Verificar si alguien ganó el match (2 sets)
    if (gameState.playerSets >= 2 || gameState.opponentSets >= 2) {
        setTimeout(() => {
            endGame(gameState.playerSets > gameState.opponentSets ? 'player' : 'opponent');
        }, 1500);
        return;
    }

    // Continuar con el siguiente set
    setTimeout(() => {
        prepareServe();
        showServeInstructions();
    }, 2500);
}

function endGame(winner) {
    gameState.isPlaying = false;
    cancelAnimationFrame(gameState.gameLoop);

    // Mostrar resultado con modal mejorado
    const resultOverlay = document.getElementById('resultOverlay');
    const resultTitle = document.getElementById('resultTitle');
    const finalScore = document.getElementById('finalScore');
    const gameRewards = document.getElementById('gameRewards');

    if (winner === 'player') {
        resultTitle.innerHTML = '🏆 ¡Ganaste el juego!';
        resultTitle.style.color = '#27ae60';
        resultOverlay.classList.add('victory');
        resultOverlay.classList.remove('defeat');

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
        resultTitle.innerHTML = '😢 Perdiste, intenta de nuevo';
        resultTitle.style.color = '#e74c3c';
        resultOverlay.classList.add('defeat');
        resultOverlay.classList.remove('victory');

        playerData.gamesPlayed++;
        addExperience(5); // Consolación

        gameRewards.innerHTML = '<span>+5 EXP</span>';

        updatePlayerDisplay();
        savePlayerData();
    }

    finalScore.textContent = `Sets: ${gameState.playerSets} - ${gameState.opponentSets}`;
    resultOverlay.style.display = 'flex';

    // Animación de entrada del modal
    setTimeout(() => {
        resultOverlay.classList.add('show-modal');
    }, 100);
}

function updateGameUI() {
    document.getElementById('playerScore').textContent = gameState.playerScore;
    document.getElementById('opponentScore').textContent = gameState.opponentScore;
    document.getElementById('playerSets').textContent = gameState.playerSets;
    document.getElementById('opponentSets').textContent = gameState.opponentSets;

    // Mostrar información del set actual
    const setInfo = document.getElementById('currentSet');
    setInfo.textContent = `Set ${gameState.currentSet} (Tú: ${gameState.playerScore} - ${gameState.opponentScore} Oponente)`;
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
    if (gameState.gameLoop) {
        cancelAnimationFrame(gameState.gameLoop);
    }

    // Limpiar event listeners
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);

    // Ocultar todas las pantallas del juego
    document.getElementById('gameInterface').style.display = 'none';
    document.getElementById('pauseOverlay').style.display = 'none';
    document.getElementById('resultOverlay').style.display = 'none';

    // Mostrar interfaz principal
    document.getElementById('mainInterface').style.display = 'flex';

    // Actualizar display por si ganó monedas
    updatePlayerDisplay();
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