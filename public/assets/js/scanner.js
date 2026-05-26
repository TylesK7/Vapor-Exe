/**
 * VAPOR.EXE - Scanner de Mentiras
 * Módulo do Scanner de afirmações
 */

(function() {
    const statements = [
        {
            text: "Vape é só vapor d'água.",
            correct: "lie",
            explanation: "FARSA. O aerossol do cigarro eletrônico contém nicotina, partículas finas, metais pesados e compostos químicos - não é apenas vapor d'água."
        },
        {
            text: "Se tem sabor doce, é menos perigoso.",
            correct: "lie",
            explanation: "FARSA. Sabor não tem relação com segurança. Sabores doces podem mascarar riscos e aumentar a atração, especialmente para jovens."
        },
        {
            text: "Cigarro convencional é o único problema.",
            correct: "lie",
            explanation: "FARSA. Ambos os produtos merecem atenção. O cigarro eletrônico também apresenta riscos à saúde que ainda estão sendo estudados."
        },
        {
            text: "Não ter cheiro forte significa ser seguro.",
            correct: "lie",
            explanation: "FARSA. A ausência de cheiro forte não elimina riscos. Muitas substâncias nocivas são inodoras."
        },
        {
            text: "Todo mundo usa, então não deve ser tão ruim.",
            correct: "lie",
            explanation: "FARSA. Popularidade não é evidência de segurança. A pressão social pode influenciar escolhas sem base em informação."
        },
        {
            text: "É moderno, então é mais seguro.",
            correct: "lie",
            explanation: "FARSA. Tecnologia e design moderno não garantem segurança. O corpo reage às substâncias, não à aparência do produto."
        },
        {
            text: "Só uma vez não tem problema.",
            correct: "half",
            explanation: "MEIA VERDADE. Uma vez pode parecer inofensivo, mas é assim que muitos hábitos começam. A curiosidade pode levar à repetição."
        },
        {
            text: "Aparência bonita pode diminuir a percepção de risco.",
            correct: "truth",
            explanation: "VERDADE. Estudos mostram que design atrativo pode reduzir a percepção de perigo, tornando as pessoas menos cautelosas."
        }
    ];

    let currentStatement = 0;
    let correct = 0;
    let wrong = 0;

    function initScanner() {
        const scanButtons = document.querySelectorAll('.scan-btn');
        
        scanButtons.forEach(btn => {
            btn.addEventListener('click', () => handleAnswer(btn.dataset.answer));
        });

        // Continue button
        const btnContinue = document.getElementById('btnContinueScanner');
        if (btnContinue) {
            btnContinue.addEventListener('click', () => {
                document.getElementById('firewallSection').scrollIntoView({ behavior: 'smooth' });
            });
        }

        updateDisplay();
    }

    function handleAnswer(answer) {
        const statement = statements[currentStatement];
        const isCorrect = answer === statement.correct;

        if (isCorrect) {
            correct++;
            if (window.sounds && window.sounds.success) window.sounds.success();
        } else {
            wrong++;
            if (window.sounds && window.sounds.error) window.sounds.error();
        }

        // Update score display
        document.getElementById('scannerCorrect').textContent = correct;
        document.getElementById('scannerWrong').textContent = wrong;
        updateAccuracy();

        // Show explanation
        Swal.fire({
            title: isCorrect ? 'Correto!' : 'Incorreto!',
            html: `<p style="text-align: left; font-size: 1rem; line-height: 1.6;">${statement.explanation}</p>`,
            icon: isCorrect ? 'success' : 'error',
            background: '#0a0a0f',
            color: '#ffffff',
            confirmButtonColor: '#00f0ff',
            confirmButtonText: 'Continuar'
        }).then(() => {
            currentStatement++;
            
            if (currentStatement >= statements.length) {
                completeScanner();
            } else {
                updateDisplay();
            }
        });
    }

    function updateDisplay() {
        const statementNumber = document.querySelector('.statement-number');
        const statementText = document.getElementById('statementText');
        
        if (statementNumber) {
            statementNumber.textContent = `${String(currentStatement + 1).padStart(2, '0')}/${String(statements.length).padStart(2, '0')}`;
        }
        
        if (statementText) {
            statementText.textContent = statements[currentStatement].text;
        }
    }

    function updateAccuracy() {
        const total = correct + wrong;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        document.getElementById('scannerAccuracy').textContent = `${accuracy}%`;
    }

    function completeScanner() {
        const total = correct + wrong;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        
        document.getElementById('scannerContent').style.display = 'none';
        document.getElementById('scannerComplete').style.display = 'block';
        document.getElementById('finalAccuracy').textContent = `${accuracy}%`;
        
        if (window.markSectionComplete) window.markSectionComplete('scanner');
        
        // Achievement for 100%
        if (accuracy === 100 && window.unlockAchievement) {
            window.unlockAchievement('scanner-master', 'Mestre do Scanner');
        }
        
        // Achievement for completing
        if (window.unlockAchievement) {
            window.unlockAchievement('myth-hunter', 'Caçador de Mitos');
        }
    }

    // Firewall section
    const firewallPhrases = [
        { text: '"Relaxa, é só saborzinho."', correct: 'falsa-seguranca' },
        { text: '"Todo mundo usa."', correct: 'pressao-social' },
        { text: '"Não parece cigarro."', correct: 'disfarce-visual' },
        { text: '"Tem gosto bom."', correct: 'atracao-sabor' },
        { text: '"É moderno."', correct: 'marketing' },
        { text: '"Não fede."', correct: 'falsa-seguranca' },
        { text: '"É só uma vez."', correct: 'minimizacao' }
    ];

    let currentPhrase = 0;
    let firewallCorrect = 0;

    function initFirewall() {
        const techniqueBtns = document.querySelectorAll('.technique-btn');
        
        techniqueBtns.forEach(btn => {
            btn.addEventListener('click', () => handleFirewallAnswer(btn.dataset.technique));
        });

        const btnContinue = document.getElementById('btnContinueFirewall');
        if (btnContinue) {
            btnContinue.addEventListener('click', () => {
                document.getElementById('influenceSection').scrollIntoView({ behavior: 'smooth' });
            });
        }

        updateFirewallDisplay();
    }

    function handleFirewallAnswer(technique) {
        const phrase = firewallPhrases[currentPhrase];
        const isCorrect = technique === phrase.correct;

        if (isCorrect) {
            firewallCorrect++;
            if (window.sounds && window.sounds.success) window.sounds.success();
            
            Swal.fire({
                title: 'Correto!',
                text: 'Você identificou a técnica de persuasão corretamente.',
                icon: 'success',
                background: '#0a0a0f',
                color: '#ffffff',
                confirmButtonColor: '#00f0ff',
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            if (window.sounds && window.sounds.error) window.sounds.error();
            
            Swal.fire({
                title: 'Tente novamente!',
                text: 'Essa não é a técnica principal usada nessa frase.',
                icon: 'warning',
                background: '#0a0a0f',
                color: '#ffffff',
                confirmButtonColor: '#00f0ff',
                timer: 1500,
                showConfirmButton: false
            });
            return; // Don't advance on wrong answer
        }

        currentPhrase++;
        
        if (currentPhrase >= firewallPhrases.length) {
            completeFirewall();
        } else {
            setTimeout(updateFirewallDisplay, 500);
        }
    }

    function updateFirewallDisplay() {
        const phraseNumber = document.querySelector('.phrase-number');
        const phraseText = document.getElementById('phraseText');
        
        if (phraseNumber) {
            phraseNumber.textContent = `${String(currentPhrase + 1).padStart(2, '0')}/${String(firewallPhrases.length).padStart(2, '0')}`;
        }
        
        if (phraseText) {
            phraseText.textContent = firewallPhrases[currentPhrase].text;
        }
    }

    function completeFirewall() {
        document.querySelector('.firewall-display').style.display = 'none';
        document.getElementById('firewallComplete').style.display = 'block';
        
        if (window.markSectionComplete) window.markSectionComplete('firewall');
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        initScanner();
        initFirewall();
    });
})();
