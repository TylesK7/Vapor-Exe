/**
 * VAPOR.EXE - Certificate
 * Módulo de geração de certificado PDF
 */

(function() {
    function initCertificate() {
        const btnDownload = document.getElementById('btnDownloadCert');
        
        if (btnDownload) {
            btnDownload.addEventListener('click', generateCertificate);
        }
    }

    function generateCertificate() {
        const { jsPDF } = window.jspdf;
        
        if (!jsPDF) {
            Swal.fire({
                title: 'Erro',
                text: 'Não foi possível gerar o certificado. Tente novamente.',
                icon: 'error',
                background: '#0a0a0f',
                color: '#ffffff',
                confirmButtonColor: '#00f0ff'
            });
            return;
        }
        
        const playerName = window.VaporApp?.playerName || 'Participante';
        const currentDate = new Date().toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        // Create PDF
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Background
        doc.setFillColor(10, 10, 15);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Border
        doc.setDrawColor(0, 240, 255);
        doc.setLineWidth(2);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
        
        // Inner border
        doc.setDrawColor(191, 0, 255);
        doc.setLineWidth(0.5);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);
        
        // Decorative corners
        doc.setDrawColor(0, 240, 255);
        doc.setLineWidth(1);
        // Top left
        doc.line(10, 25, 25, 25);
        doc.line(25, 10, 25, 25);
        // Top right
        doc.line(pageWidth - 25, 10, pageWidth - 25, 25);
        doc.line(pageWidth - 25, 25, pageWidth - 10, 25);
        // Bottom left
        doc.line(10, pageHeight - 25, 25, pageHeight - 25);
        doc.line(25, pageHeight - 25, 25, pageHeight - 10);
        // Bottom right
        doc.line(pageWidth - 25, pageHeight - 25, pageWidth - 10, pageHeight - 25);
        doc.line(pageWidth - 25, pageHeight - 25, pageWidth - 25, pageHeight - 10);
        
        // Title decoration
        doc.setFillColor(0, 240, 255);
        doc.circle(pageWidth / 2, 35, 8, 'F');
        doc.setFillColor(10, 10, 15);
        doc.circle(pageWidth / 2, 35, 6, 'F');
        doc.setFillColor(191, 0, 255);
        doc.circle(pageWidth / 2, 35, 3, 'F');
        
        // Certificate title
        doc.setTextColor(0, 240, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('CERTIFICADO', pageWidth / 2, 55, { align: 'center' });
        
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('CERTIFICADO DE PARTICIPAÇÃO', pageWidth / 2, 68, { align: 'center' });
        
        // Subtitle
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Esta pessoa concluiu a experiência', pageWidth / 2, 85, { align: 'center' });
        
        // Project name
        doc.setTextColor(191, 0, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('VAPOR.EXE', pageWidth / 2, 100, { align: 'center' });
        
        doc.setTextColor(255, 0, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'italic');
        doc.text('Quando o perigo ganha design', pageWidth / 2, 110, { align: 'center' });
        
        // Participant name
        doc.setTextColor(0, 240, 255);
        doc.setFontSize(32);
        doc.setFont('helvetica', 'bold');
        doc.text(playerName, pageWidth / 2, 135, { align: 'center' });
        
        // Underline
        const nameWidth = doc.getTextWidth(playerName);
        doc.setDrawColor(0, 240, 255);
        doc.setLineWidth(0.5);
        doc.line((pageWidth - nameWidth) / 2, 138, (pageWidth + nameWidth) / 2, 138);
        
        // Description
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        const description = 'Durante a atividade, aprendeu sobre cigarro eletrônico, cigarro convencional,';
        const description2 = 'influência social, percepção de risco, saúde, meio ambiente e conscientização.';
        
        doc.text(description, pageWidth / 2, 155, { align: 'center' });
        doc.text(description2, pageWidth / 2, 162, { align: 'center' });
        
        // Footer
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(10);
        doc.text('Feira de Ciências', pageWidth / 2 - 40, pageHeight - 30, { align: 'center' });
        doc.text(currentDate, pageWidth / 2 + 40, pageHeight - 30, { align: 'center' });
        
        // Separator
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.3);
        doc.line(pageWidth / 2 - 80, pageHeight - 35, pageWidth / 2 - 80, pageHeight - 25);
        doc.line(pageWidth / 2 + 80, pageHeight - 35, pageWidth / 2 + 80, pageHeight - 25);
        
        // Bottom message
        doc.setTextColor(0, 255, 136);
        doc.setFontSize(9);
        doc.text('"Informação é prevenção"', pageWidth / 2, pageHeight - 18, { align: 'center' });
        
        // Save PDF
        doc.save(`certificado_vapor_exe_${playerName.replace(/\s+/g, '_')}.pdf`);
        
        if (window.sounds && window.sounds.achievement) window.sounds.achievement();
        
        Swal.fire({
            title: 'Certificado gerado!',
            text: 'O download do PDF foi iniciado.',
            icon: 'success',
            background: '#0a0a0f',
            color: '#ffffff',
            confirmButtonColor: '#00f0ff',
            timer: 2000,
            showConfirmButton: false
        });
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', initCertificate);
})();
