/**
 * VAPOR.EXE - Quiz Final
 * Módulo do quiz de conhecimento
 */

(function() {
    const questions = [
        {
            question: "Cigarro eletrônico é apenas vapor d'água?",
            options: ["Não", "Sim"],
            correct: 0,
            explanation: "O aerossol contém nicotina, partículas finas e compostos químicos."
        },
        {
            question: "Sabor doce significa menos risco?",
            options: ["Não", "Sim"],
            correct: 0,
            explanation: "Sabor não tem relação com segurança. Pode até mascarar riscos."
        },
        {
            question: "Aparência moderna significa segurança?",
            options: ["Não", "Sim"],
            correct: 0,
            explanation: "Design não altera o impacto das substâncias no corpo."
        },
        {
            question: "Pressão social pode influenciar escolhas?",
            options: ["Sim", "Não"],
            correct: 0,
            explanation: "A pressão do grupo é um dos principais fatores de influência."
        },
        {
            question: "O cigarro convencional é o único problema?",
            options: ["Não", "Sim"],
            correct: 0,
            explanation: "Ambos os produtos merecem atenção e investigação crítica."
        },
        {
            question: "Ausência de cheiro forte elimina riscos?",
            options: ["Não", "Sim"],
            correct: 0,
            explanation: "Muitas substâncias nocivas são inodoras."
        },
        {
            question: "Design pode diminuir a percepção de perigo?",
            options: ["Sim", "Não"],
            correct: 0,
            explanation: "Aparência atrativa pode criar falsa sensação de segurança."
        },
        {
            question: "Produtos eletrônicos também podem gerar lixo?",
            options: ["Sim", "Não"],
            correct: 0,
            explanation: "Baterias, plásticos e circuitos precisam de descarte adequado."
        },
        {
            question: "Informação ajuda na prevenção?",
            options: ["Sim", "Não"],
            correct: 0,
            explanation: "Conhecimento é essencial para tomar decisões conscientes."
        },
        {
            question: "Popularidade é prova de segurança?",
            options: ["Não", "Sim"],
            correct: 0,
            explanation: "Algo ser popular não significa que é seguro."
        }
    ];

    let currentQuestion = 0;
    let score = 0;

    function initQuiz() {
        const quizOptions = document.getElementById('quizOptions');
        if (!quizOptions) return;
        
        // Setup initial question
        renderQuestion();
        
        // Continue button
        const btnContinue = document.getElementById('btnContinueQuiz');
        if (btnContinue) {
            btnContinue.addEventListener('click', () => {
                document.getElementById('rankingSection').scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    function renderQuestion() {
        const question = questions[currentQuestion];
        const questionText = document.getElementById('questionText');
        const quizOptions = document.getElementById('quizOptions');
        const quizProgress = document.getElementById('quizProgress');
        const progressFill = document.getElementById('quizProgressFill');
        
        if (questionText) {
            questionText.textContent = question.question;
        }
        
        if (quizProgress) {
            quizProgress.textContent = `Pergunta ${currentQuestion + 1}/${questions.length}`;
        }
        
        if (progressFill) {
            progressFill.style.width = `${((currentQuestion) / questions.length) * 100}%`;
        }
        
        if (quizOptions) {
            quizOptions.innerHTML = question.options.map((option, index) => 
                `<button class="quiz-option" data-answer="${index}">${option}</button>`
            ).join('');
            
            // Attach listeners
            quizOptions.querySelectorAll('.quiz-option').forEach(btn => {
                btn.addEventListener('click', () => handleAnswer(parseInt(btn.dataset.answer)));
            });
        }
    }

    function handleAnswer(answerIndex) {
        const question = questions[currentQuestion];
        const isCorrect = answerIndex === question.correct;
        
        if (isCorrect) {
            score++;
            if (window.sounds && window.sounds.success) window.sounds.success();
        } else {
            if (window.sounds && window.sounds.error) window.sounds.error();
        }
        
        // Show feedback
        Swal.fire({
            title: isCorrect ? 'Correto!' : 'Incorreto!',
            text: question.explanation,
            icon: isCorrect ? 'success' : 'error',
            background: '#0a0a0f',
            color: '#ffffff',
            confirmButtonColor: '#00f0ff',
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            currentQuestion++;
            
            if (currentQuestion >= questions.length) {
                completeQuiz();
            } else {
                renderQuestion();
            }
        });
    }

    function completeQuiz() {
        document.getElementById('quizQuestion').style.display = 'none';
        document.querySelector('.quiz-progress').style.display = 'none';
        document.getElementById('quizComplete').style.display = 'block';
        
        const quizScore = document.getElementById('quizScore');
        const quizResultTitle = document.getElementById('quizResultTitle');
        const quizResultText = document.getElementById('quizResultText');
        
        if (quizScore) quizScore.textContent = score;
        
        let title, text;
        
        if (score <= 3) {
            title = "Continue investigando!";
            text = "Você ainda está vendo só o neon. Volte e investigue melhor.";
        } else if (score <= 6) {
            title = "Bom progresso!";
            text = "Você começou a enxergar através da névoa. Continue questionando.";
        } else if (score <= 9) {
            title = "Excelente!";
            text = "Você desbloqueou o modo consciência. Boa investigação.";
        } else {
            title = "Perfeito!";
            text = "Sistema concluído. Você saiu da névoa.";
        }
        
        if (quizResultTitle) quizResultTitle.textContent = title;
        if (quizResultText) quizResultText.textContent = text;
        
        // Store score for ranking
        window.VaporApp = window.VaporApp || {};
        window.VaporApp.quizScore = score;
        
        if (window.markSectionComplete) window.markSectionComplete('quiz');
        
        // Update overall progress
        const progressFill = document.getElementById('quizProgressFill');
        if (progressFill) {
            progressFill.style.width = '100%';
        }
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', initQuiz);
})();
