/**
 * VAPOR.EXE - Medidor de Influência
 * Módulo de sliders e gráficos de influência
 */

(function() {
    let chart = null;

    function initInfluenceSliders() {
        const sliders = document.querySelectorAll('.influence-slider');
        
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const id = e.target.id.replace('slider-', '');
                const value = e.target.value;
                
                // Update value display
                const valueDisplay = document.getElementById(`val-${id}`);
                if (valueDisplay) {
                    valueDisplay.textContent = value;
                }
                
                // Update metrics
                updateMetrics();
                
                // Update chart
                updateChart();
            });
        });

        // Initialize chart
        initChart();
        
        // Mark section complete after interaction
        let interacted = false;
        sliders.forEach(slider => {
            slider.addEventListener('change', () => {
                if (!interacted) {
                    interacted = true;
                    setTimeout(() => {
                        if (window.markSectionComplete) window.markSectionComplete('influence');
                    }, 2000);
                }
            });
        });
    }

    function getSliderValues() {
        return {
            color: parseInt(document.getElementById('slider-color')?.value || 50),
            flavor: parseInt(document.getElementById('slider-flavor')?.value || 50),
            led: parseInt(document.getElementById('slider-led')?.value || 50),
            design: parseInt(document.getElementById('slider-design')?.value || 50),
            smell: parseInt(document.getElementById('slider-smell')?.value || 50),
            friends: parseInt(document.getElementById('slider-friends')?.value || 50),
            social: parseInt(document.getElementById('slider-social')?.value || 50),
            science: parseInt(document.getElementById('slider-science')?.value || 50)
        };
    }

    function updateMetrics() {
        const values = getSliderValues();
        
        // Calculate visual influence (design-related factors)
        const visualInfluence = Math.round((values.color + values.led + values.design + values.flavor) / 4);
        
        // Calculate risk perception (inverse of visual + science knowledge)
        const riskPerception = Math.round(Math.max(10, 100 - visualInfluence + (values.science / 2)));
        
        // Calculate critical consciousness
        const socialPressure = (values.friends + values.social) / 2;
        const criticalConsciousness = Math.round(Math.max(10, values.science - (socialPressure / 3)));
        
        // Update displays
        updateMetricDisplay('metricVisual', 'metricVisualValue', visualInfluence);
        updateMetricDisplay('metricRisk', 'metricRiskValue', Math.min(100, riskPerception));
        updateMetricDisplay('metricCritical', 'metricCriticalValue', Math.min(100, criticalConsciousness));
    }

    function updateMetricDisplay(barId, valueId, value) {
        const bar = document.getElementById(barId);
        const valueDisplay = document.getElementById(valueId);
        
        if (bar) bar.style.width = `${value}%`;
        if (valueDisplay) valueDisplay.textContent = `${value}%`;
    }

    function initChart() {
        const ctx = document.getElementById('influenceChart');
        if (!ctx) return;

        const values = getSliderValues();
        
        chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [
                    'Cor',
                    'Sabor',
                    'LED',
                    'Design',
                    'Cheiro',
                    'Amigos',
                    'Redes',
                    'Ciência'
                ],
                datasets: [{
                    label: 'Nível de Influência',
                    data: Object.values(values),
                    backgroundColor: 'rgba(0, 240, 255, 0.2)',
                    borderColor: 'rgba(0, 240, 255, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(191, 0, 255, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(191, 0, 255, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            color: 'rgba(255, 255, 255, 0.5)',
                            backdropColor: 'transparent'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    function updateChart() {
        if (!chart) return;
        
        const values = getSliderValues();
        chart.data.datasets[0].data = Object.values(values);
        chart.update();
    }

    // Simulator section
    const situations = [
        {
            text: 'Você está com amigos e alguém diz: "Relaxa, é só saborzinho."',
            icon: 'fa-users',
            options: [
                { text: 'Aceitar sem perguntar', feedback: 'Aceitar sem questionar pode significar ignorar informações importantes sobre o que está sendo oferecido.' },
                { text: 'Recusar', feedback: 'Recusar é uma escolha válida. Não é preciso justificar a decisão de não participar.' },
                { text: 'Perguntar o que tem dentro', feedback: 'Questionar é sinal de consciência crítica. Buscar informação ajuda a tomar decisões mais informadas.' },
                { text: 'Mudar de assunto', feedback: 'Mudar de assunto pode evitar conflito, mas também pode significar perder a oportunidade de se informar.' }
            ]
        },
        {
            text: 'Você vê um produto colorido com luz neon e sabor de fruta. O que você pensa primeiro?',
            icon: 'fa-lightbulb',
            options: [
                { text: 'Parece seguro', feedback: 'A aparência pode criar uma falsa sensação de segurança. Design atrativo não significa ausência de riscos.' },
                { text: 'Parece bonito, mas eu pesquisaria', feedback: 'Reconhecer a atração visual e ainda assim buscar informação é um sinal de pensamento crítico.' },
                { text: 'Parece só uma moda', feedback: 'Modas podem influenciar comportamentos. Vale questionar se uma tendência é baseada em informação ou apenas em influência social.' },
                { text: 'Não sei', feedback: 'Admitir não saber é honesto. O importante é buscar informação antes de tomar qualquer decisão.' }
            ]
        }
    ];

    let currentSituation = 0;

    function initSimulator() {
        const situationBtns = document.querySelectorAll('.situation-btn');
        
        situationBtns.forEach(btn => {
            btn.addEventListener('click', () => handleSituationChoice(parseInt(btn.dataset.option)));
        });

        const btnContinue = document.getElementById('btnContinueSimulator');
        if (btnContinue) {
            btnContinue.addEventListener('click', () => {
                document.getElementById('bodySection').scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    function handleSituationChoice(optionIndex) {
        const situation = situations[currentSituation];
        const option = situation.options[optionIndex];

        Swal.fire({
            title: 'Reflexão',
            text: option.feedback,
            icon: 'info',
            background: '#0a0a0f',
            color: '#ffffff',
            confirmButtonColor: '#00f0ff',
            confirmButtonText: 'Entendi'
        }).then(() => {
            currentSituation++;
            
            if (currentSituation >= situations.length) {
                completeSimulator();
            } else {
                updateSituationDisplay();
            }
        });
    }

    function updateSituationDisplay() {
        const situation = situations[currentSituation];
        
        const situationNumber = document.querySelector('.situation-number');
        const situationText = document.getElementById('situationText');
        const situationIcon = document.querySelector('.situation-icon i');
        const optionsContainer = document.getElementById('situationOptions');
        
        if (situationNumber) {
            situationNumber.textContent = `Situação ${currentSituation + 1}/${situations.length}`;
        }
        
        if (situationText) {
            situationText.textContent = situation.text;
        }
        
        if (situationIcon) {
            situationIcon.className = `fas ${situation.icon}`;
        }
        
        if (optionsContainer) {
            optionsContainer.innerHTML = situation.options.map((opt, idx) => 
                `<button class="situation-btn" data-option="${idx}">${opt.text}</button>`
            ).join('');
            
            // Re-attach listeners
            optionsContainer.querySelectorAll('.situation-btn').forEach(btn => {
                btn.addEventListener('click', () => handleSituationChoice(parseInt(btn.dataset.option)));
            });
        }
    }

    function completeSimulator() {
        document.getElementById('situationCard').style.display = 'none';
        document.getElementById('simulatorComplete').style.display = 'block';
        
        if (window.markSectionComplete) window.markSectionComplete('simulator');
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        initInfluenceSliders();
        initSimulator();
    });
})();
