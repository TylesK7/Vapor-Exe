/**
 * VAPOR.EXE - Ranking
 * Módulo de ranking da feira
 */

(function() {
    const STORAGE_KEY = 'vaporRanking';

    function initRanking() {
        const btnSave = document.getElementById('btnSaveScore');
        const btnClear = document.getElementById('btnClearRanking');
        const btnContinue = document.getElementById('btnContinueRanking');
        
        if (btnSave) {
            btnSave.addEventListener('click', saveScore);
        }
        
        if (btnClear) {
            btnClear.addEventListener('click', clearRanking);
        }
        
        if (btnContinue) {
            btnContinue.addEventListener('click', () => {
                document.getElementById('certificateSection').scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        // Load existing ranking
        loadRanking();
    }

    function saveScore() {
        const nameInput = document.getElementById('playerName');
        const name = nameInput?.value.trim();
        
        if (!name) {
            Swal.fire({
                title: 'Nome necessário',
                text: 'Por favor, digite seu nome ou apelido.',
                icon: 'warning',
                background: '#0a0a0f',
                color: '#ffffff',
                confirmButtonColor: '#00f0ff'
            });
            return;
        }
        
        const score = window.VaporApp?.quizScore || 0;
        
        // Get existing ranking
        let ranking = getRanking();
        
        // Add new entry
        ranking.push({
            name: name,
            score: score,
            date: new Date().toISOString()
        });
        
        // Sort by score (descending)
        ranking.sort((a, b) => b.score - a.score);
        
        // Keep only top 10
        ranking = ranking.slice(0, 10);
        
        // Save
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ranking));
        
        // Update display
        loadRanking();
        
        // Store name for certificate
        window.VaporApp = window.VaporApp || {};
        window.VaporApp.playerName = name;
        
        // Update certificate name
        const certificateName = document.getElementById('certificateName');
        if (certificateName) {
            certificateName.textContent = name;
        }
        
        // Hide input
        document.getElementById('rankingInput').style.display = 'none';
        
        if (window.sounds && window.sounds.success) window.sounds.success();
        
        Swal.fire({
            title: 'Pontuação salva!',
            text: 'Seu nome foi adicionado ao ranking.',
            icon: 'success',
            background: '#0a0a0f',
            color: '#ffffff',
            confirmButtonColor: '#00f0ff',
            timer: 2000,
            showConfirmButton: false
        });
    }

    function getRanking() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    }

    function loadRanking() {
        const ranking = getRanking();
        const entriesContainer = document.getElementById('rankingEntries');
        
        if (!entriesContainer) return;
        
        if (ranking.length === 0) {
            entriesContainer.innerHTML = '<div class="ranking-empty">Nenhuma pontuação registrada ainda.</div>';
            return;
        }
        
        entriesContainer.innerHTML = ranking.map((entry, index) => `
            <div class="ranking-entry ${index < 3 ? 'top-' + (index + 1) : ''}">
                <span class="ranking-position">${index + 1}</span>
                <span class="ranking-name">${escapeHtml(entry.name)}</span>
                <span class="ranking-score">${entry.score} pts</span>
            </div>
        `).join('');
    }

    function clearRanking() {
        Swal.fire({
            title: 'Limpar ranking?',
            text: 'Esta ação não pode ser desfeita.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff0055',
            cancelButtonColor: '#666',
            confirmButtonText: 'Sim, limpar',
            cancelButtonText: 'Cancelar',
            background: '#0a0a0f',
            color: '#ffffff'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem(STORAGE_KEY);
                loadRanking();
                
                // Show input again
                document.getElementById('rankingInput').style.display = 'block';
                
                Swal.fire({
                    title: 'Ranking limpo!',
                    icon: 'success',
                    background: '#0a0a0f',
                    color: '#ffffff',
                    confirmButtonColor: '#00f0ff',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Add CSS for ranking
    const style = document.createElement('style');
    style.textContent = `
        .ranking-entry {
            display: grid;
            grid-template-columns: 50px 1fr 80px;
            align-items: center;
            padding: 15px 20px;
            background: var(--bg-glass);
            border: var(--border-subtle);
            border-radius: 10px;
            margin-bottom: 10px;
            transition: all 0.3s ease;
        }
        .ranking-entry:hover {
            border-color: var(--primary-blue);
        }
        .ranking-entry.top-1 {
            background: linear-gradient(90deg, rgba(255, 215, 0, 0.1), transparent);
            border-color: gold;
        }
        .ranking-entry.top-2 {
            background: linear-gradient(90deg, rgba(192, 192, 192, 0.1), transparent);
            border-color: silver;
        }
        .ranking-entry.top-3 {
            background: linear-gradient(90deg, rgba(205, 127, 50, 0.1), transparent);
            border-color: #cd7f32;
        }
        .ranking-position {
            font-family: var(--font-display);
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--primary-blue);
        }
        .top-1 .ranking-position { color: gold; }
        .top-2 .ranking-position { color: silver; }
        .top-3 .ranking-position { color: #cd7f32; }
        .ranking-name {
            font-size: 1.1rem;
        }
        .ranking-score {
            font-family: var(--font-mono);
            color: var(--primary-purple);
            text-align: right;
        }
        .ranking-empty {
            text-align: center;
            color: var(--text-muted);
            padding: 40px;
        }
    `;
    document.head.appendChild(style);

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', initRanking);
})();
