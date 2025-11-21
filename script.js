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
    totalScore: 0,
    ownedBalls: [1], // IDs de pelotas compradas (empieza con pelota clásica)
    selectedBall: 1,   // ID de la pelota actualmente seleccionada
    ownedPaddles: [11], // IDs de paletas compradas (empieza con paleta clásica)
    selectedPaddle: 11,  // ID de la paleta actualmente seleccionada
    ownedTables: [21], // IDs de mesas compradas (empieza con mesa clásica)
    selectedTable: 21  // ID de la mesa actualmente seleccionada
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

    // Actualizar estadísticas en la página principal
    updatePlayerStats();

    // Actualizar barra de experiencia
    updateExperienceBar();
}

function updatePlayerStats() {
    // Actualizar estadísticas si los elementos existen
    const gamesPlayedElement = document.getElementById('gamesPlayedStat');
    const gamesWonElement = document.getElementById('gamesWonStat');
    const winRateElement = document.getElementById('winRateStat');

    if (gamesPlayedElement) {
        gamesPlayedElement.textContent = playerData.gamesPlayed;
    }

    if (gamesWonElement) {
        gamesWonElement.textContent = playerData.gamesWon;
    }

    if (winRateElement) {
        const winRate = playerData.gamesPlayed > 0
            ? Math.round((playerData.gamesWon / playerData.gamesPlayed) * 100)
            : 0;
        winRateElement.textContent = winRate + '%';
    }
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
    no
    showNotification('Personalización - Próximamente', '#9b59b6');
}

// Variable global para almacenar los puntos del set
let setPoints = 11; // Por defecto 11 puntos (estándar)

function showOptions() {
    document.getElementById('mainInterface').style.display = 'none';
    document.getElementById('optionsPanel').style.display = 'block';
}

function closeOptions() {
    document.getElementById('optionsPanel').style.display = 'none';
    document.getElementById('mainInterface').style.display = 'flex';
}

function selectSetPoints(points) {
    setPoints = points;
    
    // Actualizar botones activos
    document.querySelectorAll('.set-option-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[data-points="${points}"]`).classList.add('active');
    
    // Mostrar notificación
    showNotification(`Set configurado a ${points} puntos`, '#00ff88');
    
    // Guardar en localStorage
    localStorage.setItem('setPoints', points);
}

// Cargar configuración guardada al iniciar
function loadGameSettings() {
    const savedPoints = localStorage.getItem('setPoints');
    if (savedPoints) {
        setPoints = parseInt(savedPoints);
        // Actualizar botón activo
        setTimeout(() => {
            document.querySelectorAll('.set-option-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const activeBtn = document.querySelector(`[data-points="${setPoints}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }
        }, 100);
    }
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
            { id: 1, name: 'Pelota Clásica', price: 0, icon: '⚪', color: '#ffffff', cssClass: 'ball-classic' },
            { id: 2, name: 'Pelota Neón', price: 50, icon: '🟢', color: '#00ff88', cssClass: 'ball-neon' },
            { id: 3, name: 'Pelota Fuego', price: 100, icon: '🔴', color: '#ff4444', cssClass: 'ball-fire' },
            { id: 4, name: 'Pelota Arcoíris', price: 150, icon: '🌈', color: 'rainbow', cssClass: 'ball-rainbow' },
            { id: 5, name: 'Pelota Diamante', price: 300, icon: '💎', color: '#00ccff', cssClass: 'ball-diamond' },
            { id: 6, name: 'Pelota Dorada', price: 200, icon: '🟡', color: '#ffd700', cssClass: 'ball-gold' },
            { id: 7, name: 'Pelota Púrpura', price: 120, icon: '🟣', color: '#8a2be2', cssClass: 'ball-purple' },
            { id: 8, name: 'Pelota Cibernética', price: 250, icon: '🔵', color: '#00ffff', cssClass: 'ball-cyber' },
            { id: 9, name: 'Pelota Lava', price: 180, icon: '🟠', color: '#ff6600', cssClass: 'ball-lava' },
            { id: 10, name: 'Pelota Galaxia', price: 400, icon: '🌌', color: 'galaxy', cssClass: 'ball-galaxy' }
        ],
        paletas: [
            { id: 11, name: 'Paleta Clásica', price: 0, icon: '🏓', color: null, cssClass: 'paddle-classic' },
            { id: 12, name: 'Paleta Pro', price: 200, icon: '🏓', color: '#4ecdc4', cssClass: 'paddle-pro' },
            { id: 13, name: 'Paleta Carbono', price: 400, icon: '🏓', color: '#2c2c2c', cssClass: 'paddle-carbon' },
            { id: 14, name: 'Paleta Titanio', price: 600, icon: '🏓', color: '#c0c0c0', cssClass: 'paddle-titanium' },
            { id: 15, name: 'Paleta Neón', price: 250, icon: '🏓', color: '#00ff88', cssClass: 'paddle-neon' },
            { id: 16, name: 'Paleta Fuego', price: 300, icon: '🏓', color: '#ff4444', cssClass: 'paddle-fire' },
            { id: 17, name: 'Paleta Dorada', price: 350, icon: '🏓', color: '#ffd700', cssClass: 'paddle-gold' },
            { id: 18, name: 'Paleta Arcoíris', price: 450, icon: '🏓', color: 'rainbow', cssClass: 'paddle-rainbow' },
            { id: 19, name: 'Paleta Diamante', price: 500, icon: '🏓', color: '#00ccff', cssClass: 'paddle-diamond' },
            { id: 20, name: 'Paleta Galaxia', price: 700, icon: '🏓', color: 'galaxy', cssClass: 'paddle-galaxy' }
        ],
        mesas: [
            { id: 21, name: 'Mesa Clásica', price: 0, icon: 'table-icon-classic', color: '#008f39', cssClass: 'table-classic' },
            { id: 22, name: 'Mesa Rosada', price: 300, icon: 'table-icon-pink', color: '#ff69b4', cssClass: 'table-pink' },
            { id: 23, name: 'Mesa Naranja', price: 400, icon: 'table-icon-orange', color: '#ff8c00', cssClass: 'table-orange' },
            { id: 24, name: 'Mesa de Fuego', price: 600, icon: 'table-icon-fire', color: '#ff4400', cssClass: 'table-fire' },
            { id: 25, name: 'Mesa Marrón', price: 350, icon: 'table-icon-brown', color: '#8b4513', cssClass: 'table-brown' },
            { id: 26, name: 'Mesa Azul', price: 450, icon: 'table-icon-blue', color: '#1e90ff', cssClass: 'table-blue' },
            { id: 27, name: 'Mesa Púrpura', price: 500, icon: 'table-icon-purple', color: '#8a2be2', cssClass: 'table-purple' },
            { id: 28, name: 'Mesa Dorada', price: 700, icon: '�', color: 'rainbow', cssClass: 'table-rainbow' },
            { id: 29, name: 'Mesa Neón', price: 800, icon: '�', color: '#00ff88', cssClass: 'table-neon' },
            { id: 30, name: 'Mesa Arcoíris', price: 1000, icon: 'table-icon-rainbow', color: 'rainbow', cssClass: 'table-rainbow' }
        ]
    };

    const items = shopData[category] || [];

    // Marcar items como comprados según el inventario del jugador
    if (category === 'pelotas') {
        items.forEach(item => {
            item.owned = playerData.ownedBalls.includes(item.id);
            item.selected = playerData.selectedBall === item.id;
        });
    } else if (category === 'paletas') {
        items.forEach(item => {
            item.owned = playerData.ownedPaddles.includes(item.id);
            item.selected = playerData.selectedPaddle === item.id;
        });
    } else if (category === 'mesas') {
        items.forEach(item => {
            item.owned = playerData.ownedTables.includes(item.id);
            item.selected = playerData.selectedTable === item.id;
        });
    }

    return items;
}

function createShopItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'shop-item-card';

    let buttonHtml = '';

    if (item.hasOwnProperty('color')) { // Es una pelota o paleta personalizable
        if (item.selected) {
            buttonHtml = `<button class="selected-btn" disabled>✓ EQUIPADA</button>`;
        } else if (item.owned) {
            // Determinar si es pelota, paleta o mesa por el ID
            if (item.id <= 10) {
                buttonHtml = `<button class="equip-btn" onclick="equipBall(${item.id}, '${item.name}')">EQUIPAR</button>`;
            } else if (item.id <= 20) {
                buttonHtml = `<button class="equip-btn" onclick="equipPaddle(${item.id}, '${item.name}')">EQUIPAR</button>`;
            } else {
                buttonHtml = `<button class="equip-btn" onclick="equipTable(${item.id}, '${item.name}')">EQUIPAR</button>`;
            }
        } else {
            // Determinar si es pelota, paleta o mesa por el ID
            if (item.id <= 10) {
                buttonHtml = `<button class="purchase-btn" onclick="purchaseBall(${item.id}, '${item.name}', ${item.price})">COMPRAR</button>`;
            } else if (item.id <= 20) {
                buttonHtml = `<button class="purchase-btn" onclick="purchasePaddle(${item.id}, '${item.name}', ${item.price})">COMPRAR</button>`;
            } else {
                buttonHtml = `<button class="purchase-btn" onclick="purchaseTable(${item.id}, '${item.name}', ${item.price})">COMPRAR</button>`;
            }
        }
    } else { // Otros items sin personalización
        if (item.owned) {
            buttonHtml = `<button class="purchase-btn owned" disabled>COMPRADO</button>`;
        } else {
            buttonHtml = `<button class="purchase-btn" onclick="purchaseItem(${item.id}, '${item.name}', ${item.price})">COMPRAR</button>`;
        }
    }

    itemDiv.innerHTML = `
        <div class="item-icon-large ${item.icon.startsWith('table-icon') ? item.icon : ''}">${item.icon.startsWith('table-icon') ? '' : item.icon}</div>
        <h3 class="item-name">${item.name}</h3>
        <div class="item-price">${item.price === 0 ? 'GRATIS' : item.price + ' 🪙'}</div>
        ${buttonHtml}
    `;

    return itemDiv;
}

function purchaseBall(ballId, ballName, price) {
    if (price === 0) {
        // Pelota gratuita, agregar al inventario
        if (!playerData.ownedBalls.includes(ballId)) {
            playerData.ownedBalls.push(ballId);
        }
        showNotification('¡Pelota gratuita obtenida!', '#00ff88');
    } else {
        // Verificar si tiene suficientes monedas
        if (playerData.coins < price) {
            showNotification('¡No tienes suficientes monedas!', '#e74c3c');
            return;
        }

        // Realizar compra
        playerData.coins -= price;
        playerData.ownedBalls.push(ballId);

        showNotification(`¡${ballName} comprada por ${price} monedas!`, '#3498db');
    }

    // Guardar datos y actualizar displays
    savePlayerData();
    updatePlayerDisplay();
    updateShopCurrency();

    // Recargar items de la tienda para actualizar botones
    loadShopItems('pelotas');
}

function equipBall(ballId, ballName) {
    playerData.selectedBall = ballId;
    savePlayerData();

    showNotification(`¡${ballName} equipada!`, '#27ae60');

    // Recargar items para actualizar botones
    loadShopItems('pelotas');

    // Aplicar el cambio visual en el juego si está activo
    if (gameState.isPlaying) {
        applyBallStyle();
    }
}

function purchasePaddle(paddleId, paddleName, price) {
    if (price === 0) {
        // Paleta gratuita, agregar al inventario
        if (!playerData.ownedPaddles.includes(paddleId)) {
            playerData.ownedPaddles.push(paddleId);
        }
        showNotification('¡Paleta gratuita obtenida!', '#00ff88');
    } else {
        // Verificar si tiene suficientes monedas
        if (playerData.coins < price) {
            showNotification('¡No tienes suficientes monedas!', '#e74c3c');
            return;
        }

        // Realizar compra
        playerData.coins -= price;
        playerData.ownedPaddles.push(paddleId);

        showNotification(`¡${paddleName} comprada por ${price} monedas!`, '#3498db');
    }

    // Guardar datos y actualizar displays
    savePlayerData();
    updatePlayerDisplay();
    updateShopCurrency();

    // Recargar items de la tienda para actualizar botones
    loadShopItems('paletas');
}

function equipPaddle(paddleId, paddleName) {
    playerData.selectedPaddle = paddleId;
    savePlayerData();

    showNotification(`¡${paddleName} equipada!`, '#27ae60');

    // Recargar items para actualizar botones
    loadShopItems('paletas');

    // Aplicar el cambio visual en el juego si está activo
    if (gameState.isPlaying) {
        applyPaddleStyle();
    }
}

function purchaseTable(tableId, tableName, price) {
    if (price === 0) {
        // Mesa gratuita, agregar al inventario
        if (!playerData.ownedTables.includes(tableId)) {
            playerData.ownedTables.push(tableId);
        }
        showNotification('¡Mesa gratuita obtenida!', '#00ff88');
    } else {
        // Verificar si tiene suficientes monedas
        if (playerData.coins < price) {
            showNotification('¡No tienes suficientes monedas!', '#e74c3c');
            return;
        }

        // Realizar compra
        playerData.coins -= price;
        playerData.ownedTables.push(tableId);

        showNotification(`¡${tableName} comprada por ${price} monedas!`, '#3498db');
    }

    // Guardar datos y actualizar displays
    savePlayerData();
    updatePlayerDisplay();
    updateShopCurrency();

    // Recargar items de la tienda para actualizar botones
    loadShopItems('mesas');
}

function equipTable(tableId, tableName) {
    playerData.selectedTable = tableId;
    savePlayerData();

    showNotification(`¡${tableName} equipada!`, '#27ae60');

    // Recargar items para actualizar botones
    loadShopItems('mesas');

    // Aplicar el cambio visual en el juego si está activo
    if (gameState.isPlaying) {
        applyTableStyle();
    }
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
    
    // Actualizar información del set con los puntos configurados
    const setInfo = document.getElementById('currentSet');
    if (setInfo) {
        setInfo.textContent = `Juego a ${setPoints} puntos (Tú: 0 - 0 Oponente)`;
    }

    // Inicializar botón de pausa
    const pauseBtn = document.querySelector('.pause-btn');
    if (pauseBtn) {
        pauseBtn.innerHTML = '⏸️';
        pauseBtn.title = 'Pausar juego';
    }

    // Configurar controles
    setupGameControls();

    // Aplicar estilo de pelota personalizada
    initializeBallStyle();

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
        gameState.ballPosition = { x: 50, y: 75 };
        gameState.playerPaddlePos = { x: 50, y: 85 };
    } else {
        gameState.ballPosition = { x: 50, y: 25 };
        gameState.opponentPaddlePos = { x: 50, y: 15 };
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
    // No mostrar instrucciones de saque para juego más fluido
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

    // Movimiento completo (horizontal y vertical) controlado por el usuario
    const targetX = Math.max(2, Math.min(98, x));
    const targetY = Math.max(60, Math.min(95, y));

    // Movimiento suave y directo sin animaciones automáticas
    gameState.playerPaddlePos.x += (targetX - gameState.playerPaddlePos.x) * 0.95;
    gameState.playerPaddlePos.y += (targetY - gameState.playerPaddlePos.y) * 0.95;
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    // Movimiento completo (horizontal y vertical) controlado por el usuario
    const targetX = Math.max(2, Math.min(98, x));
    const targetY = Math.max(60, Math.min(95, y));

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
    // Control deshabilitado - solo usar mouse
    // Las paletas se controlan únicamente con el mouse para mejor precisión
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

    // Puntos cuando la pelota sale de la mesa (solo una vez por punto)
    if (gameState.gamePhase === 'rally') {
        if (gameState.ballPosition.y <= -5) {
            gameState.gamePhase = 'point'; // Evitar múltiples puntos
            scorePoint('player');
        } else if (gameState.ballPosition.y >= 105) {
            gameState.gamePhase = 'point'; // Evitar múltiples puntos
            scorePoint('opponent');
        }
    }
}

function checkAdvancedPaddleCollisions() {
    const ballX = gameState.ballPosition.x;
    const ballY = gameState.ballPosition.y;

    // Colisión con paleta del jugador (área EXTRA generosa)
    if (ballY >= 60 && ballY <= 100 && gameState.lastHitBy !== 'player') {
        const paddleX = gameState.playerPaddlePos.x;
        const paddleY = gameState.playerPaddlePos.y;

        // Área de colisión generosa pero no automática
        const distanceX = Math.abs(ballX - paddleX);
        const distanceY = Math.abs(ballY - paddleY);

        if (distanceX <= 30 && distanceY <= 20) { // Área grande pero controlable
            handlePlayerHit(ballX, ballY, paddleX, paddleY);
        }
    }

    // Colisión con paleta del oponente (área generosa pero no tanto)
    if (ballY >= 1 && ballY <= 25 && gameState.lastHitBy !== 'opponent') {
        const paddleX = gameState.opponentPaddlePos.x;
        const paddleY = gameState.opponentPaddlePos.y;

        // Área de colisión MUY PEQUEÑA para el oponente (muy difícil para él)
        const distanceX = Math.abs(ballX - paddleX);
        const distanceY = Math.abs(ballY - paddleY);

        if (distanceX <= 10 && distanceY <= 6) {
            handleOpponentHit(ballX, ballY, paddleX, paddleY);
        }
    }
}

function handlePlayerHit(ballX, ballY, paddleX, paddleY) {
    const hitOffset = (ballX - paddleX) / 18; // Normalizado con área más grande

    // Golpe más suave y controlable
    const hitPower = 1.5; // Potencia reducida para mejor control

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

    // Golpe del oponente MUY débil
    const hitPower = 1.1;

    // Dirección hacia el jugador (abajo = positivo en Y)
    const targetX = paddleX + (hitOffset * 25);
    const directionX = (targetX - ballX) * 0.025;
    const directionY = hitPower; // Siempre hacia abajo (jugador)

    // Agregar MUCHA variación según dificultad
    let errorX = 0;
    if (gameState.difficulty === 'easy') {
        errorX = (Math.random() - 0.5) * 1.2;
    } else if (gameState.difficulty === 'medium') {
        errorX = (Math.random() - 0.5) * 0.8;
    } else {
        errorX = (Math.random() - 0.5) * 0.5;
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

    // IA extremadamente fácil de vencer
    let aiSpeed = 1.2;
    let errorRate = 0.7;

    switch (gameState.difficulty) {
        case 'easy':
            aiSpeed = 0.8;
            errorRate = 0.85;
            break;
        case 'medium':
            aiSpeed = 1.5;
            errorRate = 0.7;
            break;
        case 'hard':
            aiSpeed = 2.2;
            errorRate = 0.5;
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

        // Agregar error según dificultad (más error = más fácil para el jugador)
        if (Math.random() < errorRate) {
            targetX += (Math.random() - 0.5) * 50; // Error MUY grande
        }
        
        // Agregar error adicional aleatorio constante
        targetX += (Math.random() - 0.5) * 20;

        // Limitar objetivo
        targetX = Math.max(10, Math.min(90, targetX));

        // Movimiento horizontal suave hacia la pelota (sin zig-zag)
        const horizontalDiff = targetX - paddleX;
        if (Math.abs(horizontalDiff) > 2) {
            const moveSpeed = Math.min(aiSpeed * 0.8, Math.abs(horizontalDiff) * 0.2);
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

    // Agregar clases según velocidad para efectos visuales (sin spinning para evitar temblor)
    ball.classList.remove('speed-1', 'speed-2', 'speed-3', 'moving');

    if (ballSpeed > 0.5) {
        ball.classList.add('moving');

        if (ballSpeed > 3) {
            ball.classList.add('speed-3');
        } else if (ballSpeed > 2) {
            ball.classList.add('speed-2');
        } else if (ballSpeed > 1) {
            ball.classList.add('speed-1');
        }

        // Crear partículas cuando va rápido (menos frecuente para suavidad)
        if (ballSpeed > 2.8 && Math.random() > 0.85) {
            createBallParticle(gameState.ballPosition.x, gameState.ballPosition.y);
        }
    }

    // Efecto de brillo eliminado

    // Detectar si pasa por la red
    if (Math.abs(gameState.ballPosition.y - 50) < 2) {
        ball.classList.add('net-pass');
        setTimeout(() => ball.classList.remove('net-pass'), 300);
    }

    // Actualizar paleta del jugador con efectos
    const playerPaddle = document.getElementById('playerPaddle');
    playerPaddle.style.left = gameState.playerPaddlePos.x + '%';
    playerPaddle.style.top = gameState.playerPaddlePos.y + '%';

    // Mantener paleta estable sin rotación
    playerPaddle.style.transform = `translateX(-50%)`;

    // Sin efectos de brillo en las paletas
    playerPaddle.style.filter = 'none';

    // Actualizar paleta del oponente
    const opponentPaddle = document.getElementById('opponentPaddle');
    opponentPaddle.style.left = gameState.opponentPaddlePos.x + '%';
    opponentPaddle.style.top = gameState.opponentPaddlePos.y + '%';

    // Mantener paleta del oponente estable sin rotación
    opponentPaddle.style.transform = `translateX(-50%)`;

    // Posiciones estables sin efectos de rotación
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

    // Verificar si alguien ganó el juego (setPoints con diferencia de 2)
    if ((gameState.playerScore >= setPoints || gameState.opponentScore >= setPoints) &&
        Math.abs(gameState.playerScore - gameState.opponentScore) >= 2) {
        // Solo terminar si el que acaba de anotar es quien tiene setPoints+ puntos
        if ((scorer === 'player' && gameState.playerScore >= setPoints) ||
            (scorer === 'opponent' && gameState.opponentScore >= setPoints)) {
            endSet(scorer);
            return;
        }
    }

    // Mostrar deuce si están cerca del límite
    const deucePoint = setPoints - 1;
    if (gameState.playerScore >= deucePoint && gameState.opponentScore >= deucePoint) {
        if (Math.abs(gameState.playerScore - gameState.opponentScore) < 2) {
            showNotification('¡DEUCE! - Necesitas 2 puntos de ventaja', '#f39c12');
        }
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
    // Ahora endSet es realmente endGame (termina el juego completo)
    endGame(winner);
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

    finalScore.textContent = `Puntuación Final: ${gameState.playerScore} - ${gameState.opponentScore}`;
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

    // Mostrar información del juego actual
    const setInfo = document.getElementById('currentSet');
    setInfo.textContent = `Juego a ${setPoints} puntos (Tú: ${gameState.playerScore} - ${gameState.opponentScore} Oponente)`;
}

// Funciones de control del juego
function pauseGame() {
    console.log('pauseGame llamada, isPlaying:', gameState.isPlaying, 'isPaused:', gameState.isPaused);

    if (!gameState.isPlaying) return;

    if (gameState.isPaused) {
        // Reanudar juego
        console.log('Reanudando juego...');
        gameState.isPaused = false;

        const pauseOverlay = document.getElementById('pauseOverlay');
        if (pauseOverlay) {
            pauseOverlay.style.display = 'none';
            console.log('Overlay ocultado');
        } else {
            console.log('ERROR: No se encontró pauseOverlay');
        }

        gameState.lastTime = performance.now();
        gameState.gameLoop = requestAnimationFrame(gameLoop);
        console.log('Loop reiniciado');

        // Cambiar icono del botón a pausa
        const pauseBtn = document.querySelector('.pause-btn');
        if (pauseBtn) {
            pauseBtn.innerHTML = '⏸️';
            pauseBtn.title = 'Pausar juego';
            console.log('Botón cambiado a pausa');
        }
    } else {
        // Pausar juego
        console.log('Pausando juego...');
        gameState.isPaused = true;

        const pauseOverlay = document.getElementById('pauseOverlay');
        if (pauseOverlay) {
            pauseOverlay.style.display = 'flex';
            console.log('Overlay mostrado');
        } else {
            console.log('ERROR: No se encontró pauseOverlay');
        }

        // Cambiar icono del botón a play
        const pauseBtn = document.querySelector('.pause-btn');
        if (pauseBtn) {
            pauseBtn.innerHTML = '▶️';
            pauseBtn.title = 'Reanudar juego';
            console.log('Botón cambiado a play');
        }
    }
}

function continueGame() {
    console.log('Continuando juego desde overlay...');
    if (gameState.isPlaying && gameState.isPaused) {
        gameState.isPaused = false;
        document.getElementById('pauseOverlay').style.display = 'none';
        gameState.lastTime = performance.now();
        gameState.gameLoop = requestAnimationFrame(gameLoop);

        // Cambiar icono del botón de pausa de vuelta a pausa
        const pauseBtn = document.querySelector('.pause-btn');
        if (pauseBtn) {
            pauseBtn.innerHTML = '⏸️';
            pauseBtn.title = 'Pausar juego';
        }

        console.log('Juego reanudado');
    }
}

function abandonGame() {
    console.log('Abandonando juego...');
    // Detener el juego completamente
    gameState.isPlaying = false;
    gameState.isPaused = false;

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

    // Mostrar interfaz principal (entrada principal)
    document.getElementById('mainInterface').style.display = 'flex';

    console.log('Regresado a la entrada principal');
}

function resumeGame() {
    // Mantener función original para compatibilidad
    continueGame();
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

    // Cargar configuración del juego
    loadGameSettings();

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
    
    const optionsPanel = document.getElementById('optionsPanel');
    if (optionsPanel) {
        optionsPanel.style.display = 'none';
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

// ===== SISTEMA DE PERSONALIZACIÓN DE PELOTAS =====
function applyBallStyle() {
    const ball = document.getElementById('gameBall');
    if (!ball) return;

    // Obtener datos de la pelota seleccionada
    const selectedBallData = getShopItemsByCategory('pelotas').find(item => item.id === playerData.selectedBall);
    if (!selectedBallData) return;

    // Limpiar clases anteriores
    ball.className = 'ball';

    // Aplicar nueva clase CSS
    ball.classList.add(selectedBallData.cssClass);

    // Aplicar color directo si no es un efecto especial
    if (selectedBallData.color && selectedBallData.color !== 'rainbow' && selectedBallData.color !== 'galaxy') {
        ball.style.backgroundColor = selectedBallData.color;
    }
}

function applyPaddleStyle() {
    const playerPaddle = document.getElementById('playerPaddle');
    const opponentPaddle = document.getElementById('opponentPaddle');

    if (!playerPaddle || !opponentPaddle) return;

    // Obtener datos de la paleta seleccionada
    const selectedPaddleData = getShopItemsByCategory('paletas').find(item => item.id === playerData.selectedPaddle);
    if (!selectedPaddleData) return;

    // Limpiar clases anteriores
    playerPaddle.className = 'paddle player-paddle';
    opponentPaddle.className = 'paddle opponent-paddle';

    // Aplicar nueva clase CSS
    playerPaddle.classList.add(selectedPaddleData.cssClass);
    opponentPaddle.classList.add(selectedPaddleData.cssClass);

    // Aplicar color directo si no es un efecto especial
    if (selectedPaddleData.color && selectedPaddleData.color !== 'rainbow' && selectedPaddleData.color !== 'galaxy') {
        playerPaddle.style.backgroundColor = selectedPaddleData.color;
        opponentPaddle.style.backgroundColor = selectedPaddleData.color;
    }
}

function applyTableStyle() {
    const gameTable = document.getElementById('gameTable');
    const tableContainer = document.getElementById('gameTableContainer');

    if (!gameTable) return;

    // Obtener datos de la mesa seleccionada
    const selectedTableData = getShopItemsByCategory('mesas').find(item => item.id === playerData.selectedTable);
    if (!selectedTableData) return;

    // Limpiar clases anteriores
    gameTable.className = 'table';
    if (tableContainer) {
        tableContainer.className = 'table-container';
    }

    // Aplicar nueva clase CSS
    gameTable.classList.add(selectedTableData.cssClass);
    if (tableContainer) {
        tableContainer.classList.add(selectedTableData.cssClass + '-container');
    }

    // Forzar color verde estándar para la mesa clásica
    const tableSurface = document.querySelector('.table-surface-game');
    if (selectedTableData.id === 21 && tableSurface) {
        tableSurface.style.backgroundColor = '#008f39';
        gameTable.style.backgroundColor = '#008f39';
    } else if (selectedTableData.color &&
        selectedTableData.color !== 'rainbow' &&
        selectedTableData.color !== 'galaxy' &&
        selectedTableData.color !== 'hologram') {
        if (tableSurface) {
            tableSurface.style.backgroundColor = selectedTableData.color;
        }
        gameTable.style.backgroundColor = selectedTableData.color;
    }
}

function initializeBallStyle() {
    // Aplicar estilo de pelota al iniciar el juego
    setTimeout(() => {
        applyBallStyle();
        applyPaddleStyle();
        applyTableStyle();
    }, 100);
}

// FORZAR MESA VERDE - FUNCIÓN SIMPLE
function forceGreenTable() {
    const tableSurface = document.querySelector('.table-surface-game');
    if (tableSurface) {
        tableSurface.style.setProperty('background-color', '#008f39', 'important');
    }
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', forceGreenTable);

// Ejecutar después de que se apliquen los estilos de la mesa
setTimeout(forceGreenTable, 2000);