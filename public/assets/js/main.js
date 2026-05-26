/**
 * VAPOR.EXE - Main JavaScript
 * Sistema de Conscientização sobre Cigarro Eletrônico
 */

// ==================== GLOBAL STATE ====================
const VaporApp = {
    progress: 0,
    currentSection: 0,
    achievements: [],
    soundEnabled: true,
    animationsEnabled: true,
    highContrast: false,
    fontSize: 16,
    sectionsCompleted: {
        choice: false,
        cards: false,
        scanner: false,
        firewall: false,
        influence: false,
        simulator: false,
        body: false,
        game: false,
        trash: false,
        timeline: false,
        mindmap: false,
        quiz: false
    }
};

// ==================== SOUND EFFECTS ====================
const sounds = {
    click: null,
    success: null,
    error: null,
    achievement: null,
    scanner: null
};

function initSounds() {
    // Create audio context on user interaction
    document.addEventListener('click', () => {
        if (!sounds.click) {
            // Simple beep sounds using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            sounds.play = (frequency, duration, type = 'sine') => {
                if (!VaporApp.soundEnabled) return;
                
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
            };
            
            sounds.click = () => sounds.play(800, 0.1);
            sounds.success = () => {
                sounds.play(523.25, 0.1);
                setTimeout(() => sounds.play(659.25, 0.1), 100);
                setTimeout(() => sounds.play(783.99, 0.15), 200);
            };
            sounds.error = () => sounds.play(200, 0.3, 'square');
            sounds.achievement = () => {
                sounds.play(523.25, 0.1);
                setTimeout(() => sounds.play(659.25, 0.1), 100);
                setTimeout(() => sounds.play(783.99, 0.1), 200);
                setTimeout(() => sounds.play(1046.50, 0.2), 300);
            };
            sounds.scanner = () => sounds.play(1000, 0.05);
        }
    }, { once: true });
}

// ==================== PARTICLES INITIALIZATION ====================
async function initParticles() {
    await tsParticles.load("particles-js", {
        background: {
            color: { value: "transparent" }
        },
        fpsLimit: 60,
        particles: {
            color: { value: ["#00f0ff", "#bf00ff", "#ff00ff"] },
            links: {
                color: "#00f0ff",
                distance: 150,
                enable: true,
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 0.5,
                direction: "none",
                random: true,
                straight: false,
                outModes: { default: "out" }
            },
            number: {
                density: { enable: true, area: 800 },
                value: 50
            },
            opacity: {
                value: { min: 0.1, max: 0.4 }
            },
            shape: { type: "circle" },
            size: {
                value: { min: 1, max: 3 }
            }
        },
        detectRetina: true
    });
}

// ==================== GSAP ANIMATIONS ====================
function initHeroAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    
    // Boot sequence animation
    const bootLines = document.querySelectorAll('.boot-line');
    bootLines.forEach((line, index) => {
        const delay = parseInt(line.dataset.delay) || index * 500;
        setTimeout(() => {
            gsap.to(line, {
                opacity: 1,
                x: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        }, delay);
    });
    
    // Hero title animation
    setTimeout(() => {
        gsap.to('#heroTitle', {
            opacity: 1,
            duration: 1,
            ease: "power2.out"
        });
    }, 2500);
    
    // Hero quote animation
    setTimeout(() => {
        gsap.to('.hero-quote', {
            opacity: 1,
            duration: 0.8,
            ease: "power2.out"
        });
    }, 3000);
    
    // Start button animation
    setTimeout(() => {
        gsap.to('.btn-start', {
            opacity: 1,
            duration: 0.8,
            ease: "power2.out"
        });
        
        // Remove loading class
        document.body.classList.remove('loading');
    }, 3500);
    
    // Scroll indicator animation
    setTimeout(() => {
        gsap.to('#scrollIndicator', {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out"
        });
    }, 4000);
}

function initScrollAnimations() {
    // Show progress bar after hero
    ScrollTrigger.create({
        trigger: '#choiceSection',
        start: 'top 80%',
        onEnter: () => {
            document.getElementById('progressContainer').classList.add('visible');
        },
        onLeaveBack: () => {
            document.getElementById('progressContainer').classList.remove('visible');
        }
    });
    
    // Timeline items animation
    const timelineItems = document.querySelectorAll('.timeline-item');
    let timelineItemsRevealed = 0;
    timelineItems.forEach((item, index) => {
        ScrollTrigger.create({
            trigger: item,
            start: 'top 80%',
            onEnter: () => {
                item.classList.add('visible');
                timelineItemsRevealed++;
                if (timelineItemsRevealed === timelineItems.length) {
                    if (window.markSectionComplete) window.markSectionComplete('timeline');
                }
            }
        });
    });
    
    // Sections reveal
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        gsap.from(section.querySelector('.section-header'), {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: 'power2.out'
        });
    });
}

// ==================== VANILLA TILT INITIALIZATION ====================
function initTilt() {
    VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
        max: 15,
        speed: 400,
        glare: true,
        "max-glare": 0.2
    });
}

// ==================== PROGRESS TRACKING ====================
function updateProgress() {
    const completedCount = Object.values(VaporApp.sectionsCompleted).filter(v => v).length;
    const totalSections = Object.keys(VaporApp.sectionsCompleted).length;
    VaporApp.progress = Math.round((completedCount / totalSections) * 100);
    
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill && progressText) {
        progressFill.style.width = `${VaporApp.progress}%`;
        progressText.textContent = `Investigação: ${VaporApp.progress}% concluída`;
    }
    
    // Update bot if visible
    if (window.updateBotOnProgress) {
        window.updateBotOnProgress();
    }
}

function markSectionComplete(section) {
    if (!VaporApp.sectionsCompleted[section]) {
        VaporApp.sectionsCompleted[section] = true;
        updateProgress();
        
        if (sounds.success) sounds.success();
    }
}

// ==================== CHOICE SECTION ====================
function initChoiceSection() {
    const choiceButtons = document.querySelectorAll('.choice-btn');
    const choiceResult = document.getElementById('choiceResult');
    const choiceOptions = document.getElementById('choiceOptions');
    
    choiceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (sounds.click) sounds.click();
            
            // Hide options, show result
            choiceOptions.style.display = 'none';
            choiceResult.classList.add('visible');
            
            markSectionComplete('choice');
            
            // GSAP animation
            gsap.from(choiceResult, {
                opacity: 0,
                y: 30,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    });
    
    // Continue button
    const btnContinue = document.getElementById('btnContinueChoice');
    if (btnContinue) {
        btnContinue.addEventListener('click', () => {
            if (sounds.click) sounds.click();
            document.getElementById('cardsSection').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// ==================== FLIP CARDS ====================
function initFlipCards() {
    const flipCards = document.querySelectorAll('.flip-card');
    let flippedCount = 0;
    
    flipCards.forEach(card => {
        card.addEventListener('click', () => {
            if (sounds.click) sounds.click();
            card.classList.toggle('flipped');
            
            if (card.classList.contains('flipped')) {
                flippedCount++;
                if (flippedCount === flipCards.length) {
                    markSectionComplete('cards');
                }
            }
        });
    });
}

// ==================== REALITY MODE ====================
function initRealityMode() {
    const btnReality = document.getElementById('btnReality');
    const realityOverlay = document.getElementById('realityOverlay');
    const btnCloseReality = document.getElementById('btnCloseReality');
    
    if (btnReality && realityOverlay) {
        btnReality.addEventListener('click', () => {
            if (sounds.click) sounds.click();
            realityOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        
        btnCloseReality.addEventListener('click', () => {
            realityOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
}

// ==================== START BUTTON ====================
function initStartButton() {
    const btnStart = document.getElementById('btnStart');
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            if (sounds.click) sounds.click();
            document.getElementById('choiceSection').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// ==================== ACCESSIBILITY CONTROLS ====================
function initAccessibility() {
    const toggleSound = document.getElementById('toggleSound');
    const toggleAnimations = document.getElementById('toggleAnimations');
    const toggleContrast = document.getElementById('toggleContrast');
    const increaseFont = document.getElementById('increaseFont');
    const decreaseFont = document.getElementById('decreaseFont');
    
    toggleSound?.addEventListener('click', () => {
        VaporApp.soundEnabled = !VaporApp.soundEnabled;
        toggleSound.classList.toggle('active', VaporApp.soundEnabled);
        toggleSound.innerHTML = VaporApp.soundEnabled 
            ? '<i class="fas fa-volume-up"></i>' 
            : '<i class="fas fa-volume-mute"></i>';
    });
    
    toggleAnimations?.addEventListener('click', () => {
        VaporApp.animationsEnabled = !VaporApp.animationsEnabled;
        toggleAnimations.classList.toggle('active', !VaporApp.animationsEnabled);
        document.body.classList.toggle('reduce-motion', !VaporApp.animationsEnabled);
    });
    
    toggleContrast?.addEventListener('click', () => {
        VaporApp.highContrast = !VaporApp.highContrast;
        toggleContrast.classList.toggle('active', VaporApp.highContrast);
        document.body.classList.toggle('high-contrast', VaporApp.highContrast);
    });
    
    increaseFont?.addEventListener('click', () => {
        if (VaporApp.fontSize < 20) {
            VaporApp.fontSize += 1;
            document.documentElement.style.fontSize = `${VaporApp.fontSize}px`;
        }
    });
    
    decreaseFont?.addEventListener('click', () => {
        if (VaporApp.fontSize > 12) {
            VaporApp.fontSize -= 1;
            document.documentElement.style.fontSize = `${VaporApp.fontSize}px`;
        }
    });
}

// ==================== ACHIEVEMENTS ====================
function unlockAchievement(achievementId, name) {
    if (VaporApp.achievements.includes(achievementId)) return;
    
    VaporApp.achievements.push(achievementId);
    
    // Update achievement card
    const card = document.querySelector(`[data-achievement="${achievementId}"]`);
    if (card) {
        card.classList.add('unlocked');
        const icon = card.querySelector('.achievement-icon');
        if (icon) icon.classList.remove('locked');
    }
    
    // Show notification
    const notification = document.getElementById('achievementNotification');
    const achievementName = document.getElementById('achievementName');
    
    if (notification && achievementName) {
        achievementName.textContent = name;
        notification.classList.add('show');
        
        if (sounds.achievement) sounds.achievement();
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Save to localStorage
    localStorage.setItem('vaporAchievements', JSON.stringify(VaporApp.achievements));
}

function loadAchievements() {
    const saved = localStorage.getItem('vaporAchievements');
    if (saved) {
        VaporApp.achievements = JSON.parse(saved);
        VaporApp.achievements.forEach(id => {
            const card = document.querySelector(`[data-achievement="${id}"]`);
            if (card) {
                card.classList.add('unlocked');
                const icon = card.querySelector('.achievement-icon');
                if (icon) icon.classList.remove('locked');
            }
        });
    }
}

// ==================== BODY SECTION ====================
function initBodySection() {
    const bodyPoints = document.querySelectorAll('.body-point');
    const bodyModal = document.getElementById('bodyModal');
    const modalClose = document.getElementById('modalClose');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const modalText = document.getElementById('modalText');
    
    const bodyData = {
        brain: {
            icon: '<i class="fas fa-brain"></i>',
            title: 'Área detectada: Cérebro',
            subtitle: 'Tema: dependência, atenção, decisão e controle de impulsos.',
            text: 'A nicotina pode estar ligada à dependência. Por isso, o tema não envolve apenas escolha, mas também hábito, repetição e influência.'
        },
        throat: {
            icon: '<i class="fas fa-head-side-cough"></i>',
            title: 'Área detectada: Boca e Garganta',
            subtitle: 'Tema: contato direto com substâncias inaladas.',
            text: 'Produtos inalados entram em contato direto com regiões sensíveis do corpo.'
        },
        heart: {
            icon: '<i class="fas fa-heartbeat"></i>',
            title: 'Área detectada: Coração',
            subtitle: 'Tema: estímulo e impacto no organismo.',
            text: 'Substâncias estimulantes podem afetar mais do que apenas os pulmões.'
        },
        lungs: {
            icon: '<i class="fas fa-lungs"></i>',
            title: 'Área detectada: Pulmões',
            subtitle: 'Tema: substâncias inaladas e aerossol.',
            text: 'Nem todo risco aparece como fumaça escura. O que é inalado pode afetar o corpo mesmo quando parece invisível.'
        },
        decision: {
            icon: '<i class="fas fa-random"></i>',
            title: 'Área detectada: Tomada de Decisão',
            subtitle: 'Tema: influência social e percepção de risco.',
            text: 'Às vezes, a decisão não é tomada só pela informação, mas pela pressão do ambiente.'
        }
    };
    
    let exploredAreas = new Set();
    
    bodyPoints.forEach(point => {
        point.addEventListener('click', () => {
            const area = point.dataset.area;
            const data = bodyData[area];
            
            if (data && bodyModal) {
                if (sounds.scanner) sounds.scanner();
                
                modalIcon.innerHTML = data.icon;
                modalTitle.textContent = data.title;
                modalSubtitle.textContent = data.subtitle;
                modalText.textContent = data.text;
                
                bodyModal.classList.add('active');
                
                exploredAreas.add(area);
                if (exploredAreas.size === Object.keys(bodyData).length) {
                    markSectionComplete('body');
                    unlockAchievement('body-investigator', 'Investigador do Corpo');
                }
            }
        });
    });
    
    modalClose?.addEventListener('click', () => {
        bodyModal.classList.remove('active');
    });
    
    bodyModal?.addEventListener('click', (e) => {
        if (e.target === bodyModal) {
            bodyModal.classList.remove('active');
        }
    });
}

// ==================== MINDMAP SECTION ====================
function initMindmap() {
    const mindmapNodes = document.querySelectorAll('.mindmap-node');
    const mindmapModal = document.getElementById('mindmapModal');
    const mindmapModalClose = document.getElementById('mindmapModalClose');
    const mindmapModalIcon = document.getElementById('mindmapModalIcon');
    const mindmapModalTitle = document.getElementById('mindmapModalTitle');
    const mindmapModalText = document.getElementById('mindmapModalText');
    let clickedNodes = new Set();
    
    const topicData = {
        design: {
            icon: '<i class="fas fa-paint-brush"></i>',
            title: 'Design',
            text: 'O design moderno e tecnológico pode diminuir a percepção de risco, fazendo o produto parecer mais seguro do que realmente é.'
        },
        sabores: {
            icon: '<i class="fas fa-candy-cane"></i>',
            title: 'Sabores',
            text: 'Sabores doces e frutados tornam o produto mais atrativo, especialmente para jovens, reduzindo a percepção de que pode ser prejudicial.'
        },
        nicotina: {
            icon: '<i class="fas fa-pills"></i>',
            title: 'Nicotina',
            text: 'A nicotina é uma substância que pode causar dependência. Ela está presente tanto no cigarro convencional quanto em muitos cigarros eletrônicos.'
        },
        influencia: {
            icon: '<i class="fas fa-users"></i>',
            title: 'Influência Social',
            text: 'A pressão de amigos e a normalização do uso nas redes sociais podem influenciar decisões sem uma análise crítica dos riscos.'
        },
        marketing: {
            icon: '<i class="fas fa-bullhorn"></i>',
            title: 'Marketing',
            text: 'Estratégias de marketing associam o produto a liberdade, modernidade e estilo de vida, desviando o foco dos possíveis riscos à saúde.'
        },
        ambiente: {
            icon: '<i class="fas fa-leaf"></i>',
            title: 'Meio Ambiente',
            text: 'Cigarros eletrônicos geram lixo eletrônico: baterias, plásticos e componentes que precisam de descarte adequado.'
        },
        legislacao: {
            icon: '<i class="fas fa-gavel"></i>',
            title: 'Legislação',
            text: 'No Brasil, a venda de cigarros eletrônicos é proibida pela ANVISA desde 2009, mas o mercado ilegal ainda existe.'
        },
        saude: {
            icon: '<i class="fas fa-heartbeat"></i>',
            title: 'Saúde',
            text: 'Estudos ainda investigam os efeitos a longo prazo. O que se sabe é que substâncias inaladas podem afetar pulmões, coração e sistema nervoso.'
        },
        percepcao: {
            icon: '<i class="fas fa-eye"></i>',
            title: 'Percepção de Risco',
            text: 'Aparência moderna e ausência de fumaça podem criar uma falsa sensação de segurança, diminuindo o estado de alerta.'
        },
        comparacao: {
            icon: '<i class="fas fa-balance-scale"></i>',
            title: 'Comparação',
            text: 'Comparar cigarro eletrônico com cigarro convencional não significa que um é seguro. Ambos merecem atenção e investigação crítica.'
        }
    };
    
    mindmapNodes.forEach(node => {
        node.addEventListener('click', () => {
            const topic = node.dataset.topic;
            const data = topicData[topic];
            
            if (data && mindmapModal) {
                if (sounds.click) sounds.click();
                
                clickedNodes.add(topic);
                if (clickedNodes.size === mindmapNodes.length) {
                    if (window.markSectionComplete) window.markSectionComplete('mindmap');
                }
                
                mindmapModalIcon.innerHTML = data.icon;
                mindmapModalTitle.textContent = data.title;
                mindmapModalText.textContent = data.text;
                
                mindmapModal.classList.add('active');
            }
        });
    });
    
    mindmapModalClose?.addEventListener('click', () => {
        mindmapModal.classList.remove('active');
    });
    
    mindmapModal?.addEventListener('click', (e) => {
        if (e.target === mindmapModal) {
            mindmapModal.classList.remove('active');
        }
    });
}

// ==================== SHARE SECTION ====================
function initShareSection() {
    const phraseBtns = document.querySelectorAll('.phrase-btn');
    const shareCardPhrase = document.getElementById('shareCardPhrase');
    const btnCopyPhrase = document.getElementById('btnCopyPhrase');
    
    phraseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (sounds.click) sounds.click();
            
            phraseBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const phrase = btn.dataset.phrase;
            if (shareCardPhrase) {
                shareCardPhrase.textContent = `"${phrase}"`;
            }
        });
    });
    
    btnCopyPhrase?.addEventListener('click', () => {
        const activeBtn = document.querySelector('.phrase-btn.active');
        if (activeBtn) {
            const phrase = activeBtn.dataset.phrase;
            navigator.clipboard.writeText(phrase).then(() => {
                if (sounds.success) sounds.success();
                
                Swal.fire({
                    title: 'Copiado!',
                    text: 'Frase copiada para a área de transferência.',
                    icon: 'success',
                    background: '#0a0a0f',
                    color: '#ffffff',
                    confirmButtonColor: '#00f0ff',
                    timer: 2000,
                    showConfirmButton: false
                });
            });
        }
    });
}

// ==================== QR CODE ====================
function initQRCode() {
    const qrContainer = document.getElementById('qrCode');
    if (qrContainer && typeof QRCode !== 'undefined') {
        // Use current URL or a placeholder
        const url = window.location.href;
        
        new QRCode(qrContainer, {
            text: url,
            width: 150,
            height: 150,
            colorDark: "#0a0a0f",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initSounds();
    initParticles();
    initHeroAnimations();
    initScrollAnimations();
    initTilt();
    initStartButton();
    initChoiceSection();
    initFlipCards();
    initRealityMode();
    initAccessibility();
    initBodySection();
    initMindmap();
    initShareSection();
    initQRCode();
    loadAchievements();
    
    // Set certificate date
    const certificateDate = document.getElementById('certificateDate');
    if (certificateDate) {
        certificateDate.textContent = new Date().toLocaleDateString('pt-BR');
    }
    
    // Handle continue button after game completion
    const btnContinueGame = document.getElementById('btnContinueGame');
    if (btnContinueGame) {
        btnContinueGame.addEventListener('click', function() {
            document.getElementById('trashSection').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    console.log('%c VAPOR.EXE ', 'background: linear-gradient(90deg, #00f0ff, #bf00ff); color: white; font-size: 20px; font-weight: bold; padding: 10px 20px;');
    console.log('%c Quando o perigo ganha design ', 'color: #00f0ff; font-size: 14px;');
});

// Export for other modules
window.VaporApp = VaporApp;
window.markSectionComplete = markSectionComplete;
window.unlockAchievement = unlockAchievement;
window.sounds = sounds;
