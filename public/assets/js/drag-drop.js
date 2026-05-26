/**
 * VAPOR.EXE - Drag and Drop (Lixo Invisível)
 * Módulo de arrastar e soltar para descarte correto
 */

(function() {
    let correctCount = 0;
    const totalItems = 7;

    function initDragDrop() {
        const trashItems = document.querySelectorAll('.trash-item');
        const trashBins = document.querySelectorAll('.trash-bin');
        
        if (!trashItems.length || !trashBins.length) return;

        // Setup drag events for items
        trashItems.forEach(item => {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);
            
            // Touch support
            item.addEventListener('touchstart', handleTouchStart, { passive: false });
            item.addEventListener('touchmove', handleTouchMove, { passive: false });
            item.addEventListener('touchend', handleTouchEnd);
        });

        // Setup drop events for bins
        trashBins.forEach(bin => {
            bin.addEventListener('dragover', handleDragOver);
            bin.addEventListener('dragenter', handleDragEnter);
            bin.addEventListener('dragleave', handleDragLeave);
            bin.addEventListener('drop', handleDrop);
        });

        // Continue button
        const btnContinue = document.getElementById('btnContinueTrash');
        if (btnContinue) {
            btnContinue.addEventListener('click', () => {
                document.getElementById('timelineSection').scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    let draggedItem = null;
    let touchClone = null;
    let touchOffsetX = 0;
    let touchOffsetY = 0;

    function handleDragStart(e) {
        draggedItem = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.dataset.type);
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        draggedItem = null;
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDragEnter(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    }

    function handleDragLeave() {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        if (!draggedItem) return;
        
        const itemType = draggedItem.dataset.type;
        const binType = this.dataset.bin;
        
        if (itemType === binType) {
            // Correct
            handleCorrectDrop(draggedItem);
        } else {
            // Incorrect
            handleIncorrectDrop(draggedItem);
        }
    }

    // Touch handlers for mobile
    function handleTouchStart(e) {
        e.preventDefault();
        draggedItem = this;
        
        const touch = e.touches[0];
        const rect = this.getBoundingClientRect();
        
        touchOffsetX = touch.clientX - rect.left;
        touchOffsetY = touch.clientY - rect.top;
        
        // Create visual clone
        touchClone = this.cloneNode(true);
        touchClone.classList.add('touch-dragging');
        touchClone.style.position = 'fixed';
        touchClone.style.left = `${touch.clientX - touchOffsetX}px`;
        touchClone.style.top = `${touch.clientY - touchOffsetY}px`;
        touchClone.style.width = `${rect.width}px`;
        touchClone.style.zIndex = '9999';
        touchClone.style.pointerEvents = 'none';
        touchClone.style.opacity = '0.8';
        document.body.appendChild(touchClone);
        
        this.classList.add('dragging');
    }

    function handleTouchMove(e) {
        e.preventDefault();
        if (!touchClone) return;
        
        const touch = e.touches[0];
        touchClone.style.left = `${touch.clientX - touchOffsetX}px`;
        touchClone.style.top = `${touch.clientY - touchOffsetY}px`;
        
        // Highlight bin under touch
        const bins = document.querySelectorAll('.trash-bin');
        bins.forEach(bin => {
            const rect = bin.getBoundingClientRect();
            if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                bin.classList.add('drag-over');
            } else {
                bin.classList.remove('drag-over');
            }
        });
    }

    function handleTouchEnd(e) {
        if (!draggedItem || !touchClone) return;
        
        const touch = e.changedTouches[0];
        
        // Find bin under touch
        const bins = document.querySelectorAll('.trash-bin');
        let targetBin = null;
        
        bins.forEach(bin => {
            bin.classList.remove('drag-over');
            const rect = bin.getBoundingClientRect();
            if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                targetBin = bin;
            }
        });
        
        if (targetBin) {
            const itemType = draggedItem.dataset.type;
            const binType = targetBin.dataset.bin;
            
            if (itemType === binType) {
                handleCorrectDrop(draggedItem);
            } else {
                handleIncorrectDrop(draggedItem);
            }
        }
        
        // Clean up
        touchClone.remove();
        touchClone = null;
        draggedItem.classList.remove('dragging');
        draggedItem = null;
    }

    function handleCorrectDrop(item) {
        correctCount++;
        document.getElementById('trashCorrect').textContent = correctCount;
        
        if (window.sounds && window.sounds.success) window.sounds.success();
        
        // Remove item with animation
        item.classList.add('correct');
        setTimeout(() => {
            item.style.display = 'none';
        }, 500);
        
        Swal.fire({
            title: 'Correto!',
            text: 'Esse tipo de material precisa de atenção no descarte.',
            icon: 'success',
            background: '#0a0a0f',
            color: '#ffffff',
            confirmButtonColor: '#00f0ff',
            timer: 1500,
            showConfirmButton: false
        });
        
        // Check completion
        if (correctCount >= totalItems) {
            setTimeout(completeTrash, 1000);
        }
    }

    function handleIncorrectDrop(item) {
        if (window.sounds && window.sounds.error) window.sounds.error();
        
        item.classList.add('shake');
        setTimeout(() => {
            item.classList.remove('shake');
        }, 500);
        
        Swal.fire({
            title: 'Cuidado!',
            text: 'Nem todo lixo pequeno tem impacto pequeno. Tente novamente.',
            icon: 'warning',
            background: '#0a0a0f',
            color: '#ffffff',
            confirmButtonColor: '#00f0ff',
            timer: 1500,
            showConfirmButton: false
        });
    }

    function completeTrash() {
        document.querySelector('.trash-container').innerHTML = `
            <div class="trash-complete" style="display: block;">
                <div class="complete-icon"><i class="fas fa-leaf"></i></div>
                <h3>Descarte Correto!</h3>
                <p>Você aprendeu sobre o impacto ambiental desses produtos.</p>
                <button class="btn-continue" id="btnContinueTrash">Próxima Fase <i class="fas fa-arrow-right"></i></button>
            </div>
        `;
        
        document.getElementById('btnContinueTrash').addEventListener('click', () => {
            document.getElementById('timelineSection').scrollIntoView({ behavior: 'smooth' });
        });
        
        if (window.markSectionComplete) window.markSectionComplete('trash');
        if (window.unlockAchievement) window.unlockAchievement('environment-defender', 'Defensor do Ambiente');
    }

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .trash-item.dragging {
            opacity: 0.5;
            transform: scale(1.05);
        }
        .trash-item.correct {
            background: rgba(0, 255, 136, 0.3) !important;
            border-color: #00ff88 !important;
            transform: scale(0);
            transition: transform 0.3s ease;
        }
        .trash-item.shake {
            animation: shake 0.5s ease;
        }
        .trash-bin.drag-over {
            background: rgba(0, 240, 255, 0.2);
            border-color: #00f0ff;
            transform: scale(1.05);
        }
        .touch-dragging {
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(style);

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', initDragDrop);
})();
