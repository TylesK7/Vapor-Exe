/**
 * VAPOR.EXE - VAPOR-BOT
 * Módulo do assistente virtual
 */

(function() {
    const tips = {
        hero: [
            "Bem-vindo ao Vapor.exe! Clique em 'Iniciar Investigação' para começar.",
            "Use os controles de acessibilidade no canto para ajustar som, animações e contraste."
        ],
        choice: [
            "Aparência não é segurança. O que parece inofensivo pode esconder riscos.",
            "Sua primeira impressão pode ser influenciada pelo visual. Reflita sobre isso."
        ],
        cards: [
            "Clique nos cards para revelar o que está por trás da aparência.",
            "O 'Modo Realidade' mostra palavras que geralmente ficam escondidas."
        ],
        scanner: [
            "Analise cada afirmação com cuidado. Nem tudo que parece verdade é.",
            "Meia verdade também é uma forma de desinformação."
        ],
        firewall: [
            "Identifique as técnicas de persuasão usadas em cada frase.",
            "Marketing e pressão social são formas comuns de influência."
        ],
        influence: [
            "Ajuste os sliders para ver como cada fator influencia a percepção.",
            "Quanto mais bonito parece, mais fácil é esquecer de questionar."
        ],
        simulator: [
            "Pense em como você reagiria em situações reais.",
            "Questionar é sinal de consciência crítica."
        ],
        body: [
            "Clique nas áreas do corpo para entender os impactos.",
            "A nicotina pode afetar o cérebro, criando dependência."
        ],
        game: [
            "Use as setas ou os botões para mover o personagem.",
            "Desvie dos obstáculos para chegar à escolha consciente!"
        ],
        trash: [
            "Arraste cada item para a lixeira correta.",
            "Cigarros eletrônicos geram lixo eletrônico que precisa de descarte adequado."
        ],
        timeline: [
            "Veja como a percepção mudou ao longo do tempo.",
            "Da fumaça ao neon: a evolução da aparência."
        ],
        mindmap: [
            "Explore todas as conexões do tema.",
            "Cada aspecto está interligado no problema."
        ],
        quiz: [
            "Responda com base no que aprendeu durante a investigação.",
            "Lembre-se: aparência não é evidência."
        ],
        ranking: [
            "Salve seu nome para aparecer no ranking!",
            "Compare sua pontuação com outros participantes."
        ],
        certificate: [
            "Baixe seu certificado de participação!",
            "Compartilhe com amigos e espalhe a consciência."
        ],
        share: [
            "Escolha uma frase e compartilhe nas redes sociais.",
            "Informação é prevenção."
        ]
    };

    const explanations = {
        hero: "O Vapor.exe é uma experiência digital de investigação sobre cigarro eletrônico e cigarro convencional.",
        choice: "Esta seção mostra como a aparência pode influenciar nossa percepção de perigo.",
        cards: "Os cards revelam a diferença entre propaganda e realidade.",
        scanner: "O Scanner de Mentiras testa sua capacidade de identificar informações falsas.",
        firewall: "O Firewall da Consciência ensina a reconhecer técnicas de manipulação.",
        influence: "O Medidor mostra como diferentes fatores podem influenciar sua percepção.",
        simulator: "O Simulador apresenta situações reais para você refletir sobre suas escolhas.",
        body: "O Raio-X do Corpo mostra como substâncias inaladas podem afetar diferentes sistemas.",
        game: "O mini-game representa a jornada de escapar das influências negativas.",
        trash: "Esta seção ensina sobre o impacto ambiental do descarte incorreto.",
        timeline: "A Linha do Tempo mostra a evolução da percepção sobre esses produtos.",
        mindmap: "O Mapa Mental conecta todos os aspectos relacionados ao tema.",
        quiz: "O Quiz Final testa seus conhecimentos adquiridos na investigação.",
        ranking: "O Ranking mostra as melhores pontuações da feira.",
        certificate: "O Certificado comprova sua participação na experiência.",
        share: "Compartilhe frases de conscientização com seus amigos."
    };

    let currentSection = 'hero';
    let isOpen = false;

    function initBot() {
        const botIcon = document.getElementById('botIcon');
        const botPanel = document.getElementById('botPanel');
        const botClose = document.getElementById('botClose');
        const botBtns = document.querySelectorAll('.bot-btn');
        
        if (botIcon) {
            botIcon.addEventListener('click', toggleBot);
        }
        
        if (botClose) {
            botClose.addEventListener('click', closeBot);
        }
        
        botBtns.forEach(btn => {
            btn.addEventListener('click', () => handleBotAction(btn.dataset.action));
        });
        
        // Track current section based on scroll
        setupSectionTracking();
        
        // Show welcome message after delay
        setTimeout(() => {
            showBotMessage("Olá! Sou o VAPOR-BOT. Estou aqui para guiar sua investigação. Clique em mim se precisar de ajuda!");
        }, 5000);
    }

    function toggleBot() {
        const botPanel = document.getElementById('botPanel');
        const vaporBot = document.getElementById('vaporBot');
        
        isOpen = !isOpen;
        
        if (isOpen) {
            botPanel.classList.add('active');
            vaporBot.classList.add('open');
            if (window.sounds && window.sounds.click) window.sounds.click();
        } else {
            closeBot();
        }
    }

    function closeBot() {
        const botPanel = document.getElementById('botPanel');
        const vaporBot = document.getElementById('vaporBot');
        
        isOpen = false;
        botPanel.classList.remove('active');
        vaporBot.classList.remove('open');
    }

    function handleBotAction(action) {
        if (window.sounds && window.sounds.click) window.sounds.click();
        
        switch(action) {
            case 'tip':
                showTip();
                break;
            case 'explain':
                showExplanation();
                break;
            case 'progress':
                showProgress();
                break;
        }
    }

    function showTip() {
        const sectionTips = tips[currentSection] || tips.hero;
        const randomTip = sectionTips[Math.floor(Math.random() * sectionTips.length)];
        showBotMessage(randomTip);
    }

    function showExplanation() {
        const explanation = explanations[currentSection] || explanations.hero;
        showBotMessage(explanation);
    }

    function showProgress() {
        const VaporApp = window.VaporApp || {};
        const progress = VaporApp.progress || 0;
        const completed = Object.values(VaporApp.sectionsCompleted || {}).filter(v => v).length;
        const total = Object.keys(VaporApp.sectionsCompleted || {}).length || 12;
        const quizScore = VaporApp.quizScore || 0;
        
        let message = `Progresso: ${progress}% concluído (${completed}/${total} seções). `;
        
        if (progress === 100) {
            message += `Você completou tudo! Pontuação no quiz: ${quizScore} pts. Parabéns!`;
        } else if (progress >= 75) {
            message += `Excelente progresso! Você está quase lá!`;
        } else if (progress >= 50) {
            message += `Bom trabalho! Continue investigando!`;
        } else {
            message += `Continue explorando as seções!`;
        }
        
        showBotMessage(message);
    }
    
    // Update bot when progress changes
    function updateBotOnProgress() {
        const VaporApp = window.VaporApp || {};
        const progress = VaporApp.progress || 0;
        const completed = Object.values(VaporApp.sectionsCompleted || {}).filter(v => v).length;
        
        if (completed > 0 && isOpen) {
            showProgress();
        }
    }
    
    // Export for external use
    window.updateBotOnProgress = updateBotOnProgress;

    function showBotMessage(message) {
        const botContent = document.getElementById('botContent');
        if (botContent) {
            botContent.innerHTML = `<p class="bot-message">${message}</p>`;
        }
    }

    function setupSectionTracking() {
        const sections = [
            { id: 'heroSection', name: 'hero' },
            { id: 'choiceSection', name: 'choice' },
            { id: 'cardsSection', name: 'cards' },
            { id: 'scannerSection', name: 'scanner' },
            { id: 'firewallSection', name: 'firewall' },
            { id: 'influenceSection', name: 'influence' },
            { id: 'simulatorSection', name: 'simulator' },
            { id: 'bodySection', name: 'body' },
            { id: 'gameSection', name: 'game' },
            { id: 'trashSection', name: 'trash' },
            { id: 'timelineSection', name: 'timeline' },
            { id: 'mindmapSection', name: 'mindmap' },
            { id: 'quizSection', name: 'quiz' },
            { id: 'rankingSection', name: 'ranking' },
            { id: 'certificateSection', name: 'certificate' },
            { id: 'shareSection', name: 'share' }
        ];
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = sections.find(s => s.id === entry.target.id);
                    if (section) {
                        currentSection = section.name;
                    }
                }
            });
        }, { threshold: 0.3 });
        
        sections.forEach(section => {
            const el = document.getElementById(section.id);
            if (el) observer.observe(el);
        });
    }

    // Add CSS for bot
    const style = document.createElement('style');
    style.textContent = `
        .vapor-bot {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        }
        .bot-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, var(--primary-blue), var(--primary-purple));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }
        .bot-icon:hover {
            transform: scale(1.1);
            box-shadow: var(--glow-blue);
        }
        .bot-icon i {
            font-size: 1.8rem;
            color: white;
        }
        .bot-pulse {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: var(--primary-blue);
            animation: botPulse 2s infinite;
            z-index: -1;
        }
        @keyframes botPulse {
            0% { transform: scale(1); opacity: 0.5; }
            100% { transform: scale(1.5); opacity: 0; }
        }
        .bot-panel {
            position: absolute;
            bottom: 70px;
            right: 0;
            width: 300px;
            background: var(--bg-card);
            border: var(--border-glow);
            border-radius: 15px;
            backdrop-filter: blur(10px);
            display: none;
            overflow: hidden;
        }
        .bot-panel.active {
            display: block;
            animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .bot-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: rgba(0, 240, 255, 0.1);
            border-bottom: var(--border-subtle);
        }
        .bot-name {
            font-family: var(--font-display);
            font-size: 1rem;
            color: var(--primary-blue);
        }
        .bot-close {
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            font-size: 1rem;
            transition: color 0.3s ease;
        }
        .bot-close:hover {
            color: var(--neon-red);
        }
        .bot-content {
            padding: 20px;
            min-height: 80px;
        }
        .bot-message {
            color: var(--text-secondary);
            font-size: 0.95rem;
            line-height: 1.6;
        }
        .bot-actions {
            display: flex;
            gap: 10px;
            padding: 15px;
            border-top: var(--border-subtle);
        }
        .bot-btn {
            flex: 1;
            padding: 10px;
            background: var(--bg-glass);
            border: var(--border-subtle);
            color: var(--text-primary);
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.75rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            transition: all 0.3s ease;
        }
        .bot-btn:hover {
            border-color: var(--primary-blue);
            background: rgba(0, 240, 255, 0.1);
        }
        .bot-btn i {
            font-size: 1rem;
            color: var(--primary-blue);
        }
    `;
    document.head.appendChild(style);

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', initBot);
})();
