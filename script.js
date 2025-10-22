class LoadingScreenController {
    constructor() {
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.loadingText = document.getElementById('loadingText');
        this.paddle = document.getElementById('paddle');
        this.ball = document.getElementById('ball');
        this.menuContainer = document.getElementById('menuContainer');
        this.fadeOverlay = document.getElementById('fadeOverlay');
        
        this.currentProgress = 0;
        this.targetProgress = 0;
        this.isLoading = false;
        this.loadingDuration = 4000; // 4 segundos
        this.animationSpeed = 0.02;
        
        this.dotCount = 0;
        this.lastDotUpdate = 0;
        
        this.init();
    }
    
    init() {
        this.resetLoading();
        this.startLoading();
        this.animateLoadingText();
    }
    
    resetLoading() {
        this.currentProgress = 0;
        this.targetProgress = 0;
        this.updateProgress();
        this.menuContainer.style.display = 'none';
        this.fadeOverlay.classList.remove('active');
    }
    
    startLoading() {
        this.isLoading = true;
        const startTime = Date.now();
        
        const updateProgress = () => {
            if (!this.isLoading) return;
            
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.loadingDuration, 1);
            
            // Usar curva de animación suave
            this.targetProgress = this.easeInOutCubic(progress) * 100;
            
            // Interpolación suave hacia el objetivo
            const diff = this.targetProgress - this.currentProgress;
            this.currentProgress += diff * this.animationSpeed;
            
            this.updateProgress();
            this.updateObjectPositions();
            
            if (progress < 1) {
                requestAnimationFrame(updateProgress);
            } else {
                this.completeLoading();
            }
        };
        
        requestAnimationFrame(updateProgress);
    }
    
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    updateProgress() {
        const roundedProgress = Math.round(this.currentProgress);
        this.progressFill.style.width = `${this.currentProgress}%`;
        this.progressText.textContent = `${roundedProgress}%`;
    }
    
    updateObjectPositions() {
        const progressBarWidth = 400; // Ancho de la barra en píxeles
        const ballPosition = (this.currentProgress / 100) * progressBarWidth;
        const paddlePosition = Math.max(0, ballPosition - 30); // Paleta ligeramente detrás
        
        this.ball.style.left = `${ballPosition}px`;
        this.paddle.style.left = `${paddlePosition - 20}px`;
        
        // Efecto de "golpe" cuando la paleta alcanza la pelota
        if (Math.abs(ballPosition - paddlePosition) < 5 && this.currentProgress > 5) {
            this.addHitEffect();
        }
    }
    
    addHitEffect() {
        // Efecto visual de golpe
        this.paddle.style.transform = 'scale(1.2) rotate(15deg)';
        this.ball.style.transform = 'scale(1.1) translateY(-5px)';
        
        setTimeout(() => {
            this.paddle.style.transform = '';
            this.ball.style.transform = '';
        }, 150);
    }
    
    animateLoadingText() {
        const updateText = () => {
            const now = Date.now();
            if (now - this.lastDotUpdate > 500) {
                this.dotCount = (this.dotCount + 1) % 4;
                const dots = '.'.repeat(this.dotCount);
                this.loadingText.textContent = `Cargando${dots}`;
                this.lastDotUpdate = now;
            }
            
            if (this.isLoading) {
                requestAnimationFrame(updateText);
            }
        };
        
        requestAnimationFrame(updateText);
    }
    
    completeLoading() {
        this.isLoading = false;
        this.currentProgress = 100;
        this.updateProgress();
        this.updateObjectPositions();
        
        // Esperar un momento antes de la transición
        setTimeout(() => {
            this.transitionToMenu();
        }, 800);
    }
    
    transitionToMenu() {
        // Fade out
        this.fadeOverlay.classList.add('active');
        
        setTimeout(() => {
            // Ocultar pantalla de carga y mostrar menú
            document.querySelector('.game-title').style.display = 'none';
            document.querySelector('.progress-container').style.display = 'none';
            document.querySelector('.loading-text').style.display = 'none';
            
            this.menuContainer.style.display = 'block';
            
            // Fade in del menú
            setTimeout(() => {
                this.fadeOverlay.classList.remove('active');
            }, 500);
        }, 1000);
    }
    
    restartLoading() {
        // Mostrar elementos de carga
        document.querySelector('.game-title').style.display = 'block';
        document.querySelector('.progress-container').style.display = 'block';
        document.querySelector('.loading-text').style.display = 'block';
        
        this.init();
    }
}

// Funciones del menú
function startGame() {
    showMessage('¡Iniciando juego!');
    // Aquí iría la lógica para iniciar el juego
}

function showOptions() {
    showMessage('Opciones del juego');
    // Aquí iría la lógica para mostrar opciones
}

function showCredits() {
    showMessage('Créditos: Desarrollado con ❤️');
    // Aquí iría la lógica para mostrar créditos
}

function showMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 2rem;
        border-radius: 10px;
        font-size: 1.5rem;
        z-index: 2000;
        animation: fadeInUp 0.5s ease-out;
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 2000);
}

// Función para reiniciar la carga (útil para testing)
function restartLoading() {
    if (window.loadingController) {
        window.loadingController.restartLoading();
    }
}

// Inicializar cuando la página cargue
document.addEventListener('DOMContentLoaded', () => {
    window.loadingController = new LoadingScreenController();
});

// Reiniciar si se hace focus en la ventana (simula volver a entrar a la escena)
window.addEventListener('focus', () => {
    if (window.loadingController && !window.loadingController.isLoading) {
        // Opcional: reiniciar automáticamente
        // restartLoading();
    }
});

// Agregar controles de teclado para testing
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        restartLoading();
    }
});