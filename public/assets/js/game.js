/**
 * VAPOR.EXE - Mini-Game Avançado: Escape da Névoa
 * Módulo do jogo canvas com HP, obstáculos móveis e efeitos sonoros
 */

(function() {
    // ==================== CONSTANTES ====================
    let CANVAS_WIDTH = 600;
    let CANVAS_HEIGHT = 400;
    
    // Ajustar tamanho para mobile
    function adjustCanvasSize() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        const container = canvas.parentElement;
        const maxWidth = Math.min(600, window.innerWidth - 40);
        const aspectRatio = 400 / 600;
        
        CANVAS_WIDTH = maxWidth;
        CANVAS_HEIGHT = Math.round(maxWidth * aspectRatio);
        
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
    }
    const PLAYER_SIZE = 20;
    const PLAYER_SPEED = 4;
    const GOAL_WIDTH = 50;
    const GOAL_HEIGHT = 60;
    const INITIAL_HP = 100;
    const DAMAGE_PER_COLLISION = 15;
    const COLLISION_COOLDOWN = 500; // ms entre danos

    // ==================== ESTADO DO JOGO ====================
    let canvas, ctx;
    let gameRunning = false;
    let gameState = 'menu'; // 'menu', 'playing', 'won', 'lost'
    let gameStartTime = 0;
    let gameTime = 0;
    let collisions = 0;
    let hp = INITIAL_HP;
    let animationId = null;
    let lastCollisionTime = 0;
    let soundEnabled = true;
    let audioContext = null;
    let highScore = null;

    // Carrega high score do localStorage
    try {
        const saved = localStorage.getItem('vaporGameHighScore');
        if (saved) highScore = parseInt(saved);
    } catch(e) {}

    const player = {
        x: 30,
        y: CANVAS_HEIGHT / 2 - PLAYER_SIZE / 2,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
        speed: PLAYER_SPEED
    };

    const goal = {
        x: CANVAS_WIDTH - GOAL_WIDTH - 20,
        y: CANVAS_HEIGHT / 2 - GOAL_HEIGHT / 2,
        width: GOAL_WIDTH,
        height: GOAL_HEIGHT
    };

    const INITIAL_OBSTACLES = [
        { x: 120, y: 50, width: 35, height: 35, label: 'Curiosidade', color: '#bf00ff' },
        { x: 120, y: 310, width: 35, height: 35, label: 'Sabor doce', color: '#ff00ff' },
        { x: 220, y: 140, width: 35, height: 35, label: 'Pressão social', color: '#ff0055' },
        { x: 220, y: 240, width: 35, height: 35, label: 'Propaganda', color: '#bf00ff' },
        { x: 320, y: 70, width: 35, height: 35, label: 'Influencer', color: '#ff00ff' },
        { x: 320, y: 290, width: 35, height: 35, label: '"Só uma vez"', color: '#ff0055' },
        { x: 420, y: 170, width: 35, height: 35, label: 'Design bonito', color: '#bf00ff' },
        { x: 380, y: 100, width: 35, height: 35, label: 'Falsa segurança', color: '#ff00ff' },
        { x: 480, y: 220, width: 35, height: 35, label: 'Vício', color: '#ff0055' }
    ];

    let obstacles = [];

    const keys = {
        up: false,
        down: false,
        left: false,
        right: false
    };

    const obstacleMessages = [
        "A influência te atingiu. Pense antes de seguir o grupo.",
        "O design chamou sua atenção. Aparência não é segurança.",
        "A curiosidade é natural, mas questionar também é.",
        "Sabores podem mascarar riscos. Fique atento!",
        "Pressão social pode influenciar escolhas. Reflita.",
        "A propaganda é persuasiva. Busque informação real.",
        "Influencers nem sempre têm todas as informações.",
        "\"Só uma vez\" pode ser o início de um hábito.",
        "O vício é silencioso. Cuidado com os primeiros passos."
    ];

    // ==================== SISTEMA DE SOM ====================
    function initAudio() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            soundEnabled = false;
        }
    }

    function playSound(frequency, duration, type = 'sine') {
        if (!soundEnabled || !audioContext) return;
        
        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch(e) {}
    }

    function playCollisionSound() {
        playSound(200, 0.2, 'square');
    }

    function playWinSound() {
        playSound(523.25, 0.1);
        setTimeout(() => playSound(659.25, 0.1), 100);
        setTimeout(() => playSound(783.99, 0.1), 200);
        setTimeout(() => playSound(1046.5, 0.2), 300);
    }

    function playLoseSound() {
        playSound(300, 0.15, 'square');
        setTimeout(() => playSound(250, 0.15, 'square'), 150);
        setTimeout(() => playSound(200, 0.3, 'square'), 300);
    }

    // ==================== INICIALIZAÇÃO ====================
    function initializeObstacles() {
        obstacles = INITIAL_OBSTACLES.map((obs, index) => ({
            ...obs,
            originalX: obs.x,
            originalY: obs.y,
            velocityX: (Math.random() - 0.5) * 1.5,
            velocityY: (index % 2 === 0 ? 1 : -1) * (0.8 + Math.random() * 0.7)
        }));
    }

    function initGame() {
        canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        // Ajustar tamanho do canvas para responsividade
        adjustCanvasSize();
        
        ctx = canvas.getContext('2d');
        
        // Inicializa audio
        initAudio();
        
        // Desenha tela inicial
        drawMenu();

        // Start button
        const btnStart = document.getElementById('btnGameStart');
        if (btnStart) {
            btnStart.addEventListener('click', startGame);
        }

        // Continue button
        const btnContinue = document.getElementById('btnContinueGame');
        if (btnContinue) {
            btnContinue.addEventListener('click', () => {
                document.getElementById('trashSection').scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Sound toggle
        const btnSound = document.getElementById('btnGameSound');
        if (btnSound) {
            btnSound.addEventListener('click', () => {
                soundEnabled = !soundEnabled;
                btnSound.innerHTML = soundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
                btnSound.classList.toggle('sound-off', !soundEnabled);
            });
        }

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (gameState !== 'playing') return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    keys.up = true;
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    keys.down = true;
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    keys.left = true;
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    keys.right = true;
                    e.preventDefault();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    keys.up = false;
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    keys.down = false;
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    keys.left = false;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    keys.right = false;
                    break;
            }
        });

        // Mobile controls
        const mobileControls = document.querySelectorAll('.control-btn');
        mobileControls.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const dir = btn.dataset.dir;
                keys[dir] = true;
            });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                const dir = btn.dataset.dir;
                keys[dir] = false;
            });
            
            btn.addEventListener('mousedown', () => {
                const dir = btn.dataset.dir;
                keys[dir] = true;
            });
            
            btn.addEventListener('mouseup', () => {
                const dir = btn.dataset.dir;
                keys[dir] = false;
            });
            
            btn.addEventListener('mouseleave', () => {
                const dir = btn.dataset.dir;
                keys[dir] = false;
            });
        });
    }

    // ==================== CONTROLE DO JOGO ====================
    function startGame() {
        // Resume audio context se necessário
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }

        // Reset game state
        player.x = 30;
        player.y = CANVAS_HEIGHT / 2 - PLAYER_SIZE / 2;
        gameStartTime = Date.now();
        gameTime = 0;
        collisions = 0;
        hp = INITIAL_HP;
        lastCollisionTime = 0;
        gameState = 'playing';
        gameRunning = true;

        // Inicializa obstáculos com movimento
        initializeObstacles();

        // Hide start screen, show controls
        const gameStart = document.getElementById('gameStart');
        const mobileControls = document.getElementById('mobileControls');
        const gameComplete = document.getElementById('gameComplete');
        const gameLost = document.getElementById('gameLost');
        const gameCompleteBackdrop = document.getElementById('gameCompleteBackdrop');
        const gameLostBackdrop = document.getElementById('gameLostBackdrop');
        
        if (gameStart) gameStart.style.display = 'none';
        if (mobileControls) mobileControls.style.display = 'flex';
        if (gameComplete) gameComplete.style.display = 'none';
        if (gameLost) gameLost.style.display = 'none';
        if (gameCompleteBackdrop) gameCompleteBackdrop.style.display = 'none';
        if (gameLostBackdrop) gameLostBackdrop.style.display = 'none';
        
        // Update UI
        updateUI();
        
        // Start game loop
        gameLoop();
    }

    function gameLoop() {
        if (!gameRunning || gameState !== 'playing') return;

        update();
        draw();
        
        animationId = requestAnimationFrame(gameLoop);
    }

    // ==================== ATUALIZAÇÃO ====================
    function updateObstacles() {
        obstacles = obstacles.map(obstacle => {
            let newX = obstacle.x + obstacle.velocityX;
            let newY = obstacle.y + obstacle.velocityY;
            let newVelocityX = obstacle.velocityX;
            let newVelocityY = obstacle.velocityY;

            // Limites horizontais - bouncing
            const minX = Math.max(100, obstacle.originalX - 60);
            const maxX = Math.min(CANVAS_WIDTH - obstacle.width - 30, obstacle.originalX + 60);

            if (newX <= minX || newX >= maxX) {
                newVelocityX = -newVelocityX;
                newX = Math.max(minX, Math.min(maxX, newX));
            }

            // Limites verticais - bouncing
            const minY = Math.max(10, obstacle.originalY - 80);
            const maxY = Math.min(CANVAS_HEIGHT - obstacle.height - 10, obstacle.originalY + 80);

            if (newY <= minY || newY >= maxY) {
                newVelocityY = -newVelocityY;
                newY = Math.max(minY, Math.min(maxY, newY));
            }

            return {
                ...obstacle,
                x: newX,
                y: newY,
                velocityX: newVelocityX,
                velocityY: newVelocityY
            };
        });
    }

    function update() {
        // Move player
        if (keys.up && player.y > 0) player.y -= player.speed;
        if (keys.down && player.y < CANVAS_HEIGHT - player.height) player.y += player.speed;
        if (keys.left && player.x > 0) player.x -= player.speed;
        if (keys.right && player.x < CANVAS_WIDTH - player.width) player.x += player.speed;

        // Atualiza obstáculos (movimento)
        updateObstacles();

        // Check obstacle collisions com cooldown
        const now = Date.now();
        obstacles.forEach((obstacle, index) => {
            if (checkCollision(player, obstacle)) {
                if (now - lastCollisionTime > COLLISION_COOLDOWN) {
                    lastCollisionTime = now;
                    collisions++;
                    hp = Math.max(0, hp - DAMAGE_PER_COLLISION);
                    
                    // Push player back
                    player.x = Math.max(10, player.x - 30);
                    
                    // Show message
                    showGameMessage(obstacleMessages[index % obstacleMessages.length]);
                    
                    playCollisionSound();
                    
                    // Check if lost
                    if (hp <= 0) {
                        loseGame();
                        return;
                    }
                    
                    updateUI();
                }
            }
        });

        // Check goal
        if (checkCollision(player, goal)) {
            winGame();
        }

        // Update time
        gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
        document.getElementById('gameTime').textContent = `${gameTime}s`;
    }

    function checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    function updateUI() {
        const hpEl = document.getElementById('gameHP');
        const hpBarFill = document.getElementById('hpBarFill');
        const collisionsEl = document.getElementById('gameCollisions');
        
        if (hpEl) hpEl.textContent = `${hp}%`;
        if (collisionsEl) collisionsEl.textContent = collisions;
        
        if (hpBarFill) {
            hpBarFill.style.width = `${hp}%`;
            // Muda cor baseado no HP
            if (hp > 50) {
                hpBarFill.style.background = 'linear-gradient(90deg, #00ff88, #00cc6a)';
            } else if (hp > 25) {
                hpBarFill.style.background = 'linear-gradient(90deg, #ffcc00, #ff9900)';
            } else {
                hpBarFill.style.background = 'linear-gradient(90deg, #ff4444, #cc0000)';
                hpBarFill.classList.add('critical');
            }
        }
    }

    // ==================== RENDERIZAÇÃO ====================
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#0a0a12';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw grid
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i < CANVAS_WIDTH; i += 30) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (let i = 0; i < CANVAS_HEIGHT; i += 30) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(CANVAS_WIDTH, i);
            ctx.stroke();
        }

        // Draw obstacles
        obstacles.forEach(obstacle => {
            // Glow effect
            ctx.shadowColor = obstacle.color;
            ctx.shadowBlur = 20;
            
            // Corpo do obstáculo com bordas arredondadas
            ctx.fillStyle = obstacle.color;
            ctx.beginPath();
            roundRect(ctx, obstacle.x, obstacle.y, obstacle.width, obstacle.height, 6);
            ctx.fill();
            
            // Borda
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Reset shadow
            ctx.shadowBlur = 0;
            
            // Label
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(obstacle.label, obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height + 14);
        });

        // Draw goal
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 25;
        
        // Gradiente para o objetivo
        const goalGradient = ctx.createLinearGradient(goal.x, goal.y, goal.x, goal.y + goal.height);
        goalGradient.addColorStop(0, '#00ff88');
        goalGradient.addColorStop(1, '#00cc6a');
        ctx.fillStyle = goalGradient;
        ctx.beginPath();
        roundRect(ctx, goal.x, goal.y, goal.width, goal.height, 8);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        // Texto do objetivo
        ctx.fillStyle = '#0a0a12';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ESCOLHA', goal.x + goal.width / 2, goal.y + 22);
        ctx.fillText('CONSCIENTE', goal.x + goal.width / 2, goal.y + 34);
        
        // Ícone no objetivo
        ctx.font = '16px sans-serif';
        ctx.fillText('🎯', goal.x + goal.width / 2, goal.y + 52);

        // Draw player
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 20;
        
        // Gradiente para o jogador
        const playerGradient = ctx.createRadialGradient(
            player.x + player.width / 2,
            player.y + player.height / 2,
            0,
            player.x + player.width / 2,
            player.y + player.height / 2,
            player.width / 2
        );
        playerGradient.addColorStop(0, '#00f0ff');
        playerGradient.addColorStop(1, '#0088ff');
        ctx.fillStyle = playerGradient;
        
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Borda do jogador
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.shadowBlur = 0;
    }

    function drawMenu() {
        ctx.fillStyle = '#0a0a12';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Grid de fundo
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i < CANVAS_WIDTH; i += 30) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (let i = 0; i < CANVAS_HEIGHT; i += 30) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(CANVAS_WIDTH, i);
            ctx.stroke();
        }
    }

    // Helper para retângulos arredondados
    function roundRect(ctx, x, y, width, height, radius) {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
    }

    // ==================== MENSAGENS ====================
    function showGameMessage(message) {
        const messageEl = document.getElementById('gameMessage');
        const messageText = document.getElementById('gameMessageText');
        
        if (messageEl && messageText) {
            messageText.textContent = message;
            messageEl.style.display = 'block';
            
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 2000);
        }
    }

    // ==================== FIM DO JOGO ====================
    function winGame() {
        gameRunning = false;
        gameState = 'won';
        cancelAnimationFrame(animationId);
        
        playWinSound();
        
        // Salva high score
        if (highScore === null || gameTime < highScore) {
            highScore = gameTime;
            try {
                localStorage.setItem('vaporGameHighScore', highScore.toString());
            } catch(e) {}
        }
        
        document.getElementById('mobileControls').style.display = 'none';
        window.showGameModal('complete');
        document.getElementById('finalTime').textContent = `${gameTime}s`;
        document.getElementById('finalCollisions').textContent = collisions;
        
        // Mostra high score
        const highScoreEl = document.getElementById('highScoreDisplay');
        if (highScoreEl) {
            highScoreEl.textContent = `Melhor tempo: ${highScore}s`;
            highScoreEl.style.display = 'block';
        }
        
        if (window.sounds && window.sounds.achievement) window.sounds.achievement();
        
        if (window.markSectionComplete) window.markSectionComplete('game');
        if (window.unlockAchievement) window.unlockAchievement('fog-escape', 'Saiu da Névoa');
    }

    function loseGame() {
        gameRunning = false;
        gameState = 'lost';
        cancelAnimationFrame(animationId);
        
        playLoseSound();
        
        document.getElementById('mobileControls').style.display = 'none';
        
        const gameLost = document.getElementById('gameLost');
        if (gameLost) {
            window.showGameModal('lost');
        } else {
            // Fallback: mostra no gameComplete com mensagem de derrota
            window.showGameModal('complete');
            const completeTitle = document.querySelector('#gameComplete h3');
            if (completeTitle) {
                completeTitle.textContent = 'A Névoa Venceu...';
                completeTitle.style.color = '#ff4444';
            }
        }
    }

    // Expõe função para reiniciar
    window.restartVaporGame = startGame;

    // Funções para gerenciar modal
    window.showGameModal = function(type = 'complete') {
        const modal = type === 'complete' ? document.getElementById('gameComplete') : document.getElementById('gameLost');
        const backdrop = type === 'complete' ? document.getElementById('gameCompleteBackdrop') : document.getElementById('gameLostBackdrop');
        
        if (modal) modal.style.display = 'flex';
        if (backdrop) backdrop.style.display = 'block';
    };

    window.closeGameModal = function() {
        const gameComplete = document.getElementById('gameComplete');
        const gameLost = document.getElementById('gameLost');
        const gameCompleteBackdrop = document.getElementById('gameCompleteBackdrop');
        const gameLostBackdrop = document.getElementById('gameLostBackdrop');
        const gameStart = document.getElementById('gameStart');
        
        if (gameComplete) gameComplete.style.display = 'none';
        if (gameLost) gameLost.style.display = 'none';
        if (gameCompleteBackdrop) gameCompleteBackdrop.style.display = 'none';
        if (gameLostBackdrop) gameLostBackdrop.style.display = 'none';
        if (gameStart) gameStart.style.display = 'flex';
        
        // Reset game state
        gameRunning = false;
        gameState = 'menu';
    };

    // Fechar modal ao clicar no backdrop
    document.addEventListener('DOMContentLoaded', function() {
        const gameCompleteBackdrop = document.getElementById('gameCompleteBackdrop');
        const gameLostBackdrop = document.getElementById('gameLostBackdrop');
        
        if (gameCompleteBackdrop) {
            gameCompleteBackdrop.addEventListener('click', window.closeGameModal);
        }
        if (gameLostBackdrop) {
            gameLostBackdrop.addEventListener('click', window.closeGameModal);
        }
        
        // Fechar modal com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const gameComplete = document.getElementById('gameComplete');
                const gameLost = document.getElementById('gameLost');
                if (gameComplete && gameComplete.style.display === 'flex') {
                    window.closeGameModal();
                }
                if (gameLost && gameLost.style.display === 'flex') {
                    window.closeGameModal();
                }
            }
        });
    });

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', initGame);
    
    // Ajustar canvas quando a janela redimensiona
    window.addEventListener('resize', () => {
        if (canvas) {
            adjustCanvasSize();
        }
    });
})();
