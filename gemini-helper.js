// Gemini Helper - Copy equation context to clipboard for use with Gemini AI

class GeminiHelper {
    constructor() {
        this.lastCopiedContent = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Main copy to Gemini button in header
        document.getElementById('copyToGeminiBtn')?.addEventListener('click', () => {
            this.copyCurrentContext();
        });

        // Copy problem button in game
        document.getElementById('copyProblemBtn')?.addEventListener('click', () => {
            this.copyCurrentContext();
        });

        // Copy again button in modal
        document.getElementById('copyAgainBtn')?.addEventListener('click', () => {
            this.copyToClipboard(this.lastCopiedContent);
            this.showCopyConfirmation();
        });

        // Close modal
        document.querySelector('#geminiModal .btn-close')?.addEventListener('click', () => {
            this.closeModal();
        });

        // Click outside to close
        document.getElementById('geminiModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'geminiModal') {
                this.closeModal();
            }
        });

        // Quick prompts
        document.querySelectorAll('.quick-prompt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const promptType = e.target.dataset.prompt;
                this.copyWithPrompt(promptType);
            });
        });
    }

    copyCurrentContext() {
        // Get current equation and context
        let content = this.buildContextMessage();

        // Copy to clipboard
        this.copyToClipboard(content);

        // Store for re-copy
        this.lastCopiedContent = content;

        // Show modal with copied content
        this.showModal(content);
    }

    buildContextMessage() {
        let message = `🎓 7th Grade Pre-Algebra Help Request\n`;
        message += `Standard: FL MA.8.AR.2.1 (Multi-step equations with variables on both sides)\n\n`;

        // Add current equation if in game
        if (window.gameController && window.gameController.currentEquation) {
            const eq = window.gameController.currentEquation;
            const level = window.gameController.currentLevelInfo;

            message += `📝 Current Problem:\n`;
            message += `Equation: ${eq.equation}\n`;
            message += `Concept: ${eq.concept}\n`;
            if (level) {
                message += `Level: ${level.name}\n`;
                message += `Description: ${level.description}\n`;
            }
            message += `\n`;

            // Add student progress
            message += `📊 Progress:\n`;
            message += `Current Question: ${window.gameController.currentQuestion}/${window.gameController.currentLevelInfo.totalQuestions}\n`;
            message += `Correct Answers: ${window.gameController.correctAnswers}\n`;
            message += `Streak: ${window.gameController.streak}\n`;
            message += `\n`;

        } else {
            message += `ℹ️ No equation currently active. Start a level to get specific help!\n\n`;
        }

        message += `❓ How to help:\n`;
        message += `Please guide me through solving this equation using the learning friction approach:\n`;
        message += `1. Don't give me the answer directly\n`;
        message += `2. Break it down into small steps\n`;
        message += `3. Ask me questions to help me think\n`;
        message += `4. Check my understanding frequently\n`;
        message += `5. Use simple language for 7th graders\n`;
        message += `6. Be encouraging and positive!\n`;

        return message;
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback method
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err2) {
                document.body.removeChild(textArea);
                alert('Failed to copy to clipboard. Please copy manually.');
                return false;
            }
        }
    }

    showModal(content) {
        // Show the modal
        document.getElementById('geminiModal').classList.add('active');

        // Display the copied content
        const contentDiv = document.getElementById('copiedContent');
        contentDiv.innerHTML = `
            <h4>📋 Copied to Clipboard:</h4>
            <pre style="background: #f5f7fa; padding: 1rem; border-radius: 8px; max-height: 200px; overflow-y: auto; font-size: 0.9rem;">${this.escapeHtml(content)}</pre>
        `;

        // Show confirmation
        this.showCopyConfirmation();
    }

    showCopyConfirmation() {
        // Visual feedback
        const modal = document.getElementById('geminiModal');
        modal.style.animation = 'none';
        setTimeout(() => {
            modal.style.animation = 'slideIn 0.3s ease';
        }, 10);

        // Could add a toast notification here
        console.log('✅ Content copied to clipboard!');
    }

    closeModal() {
        document.getElementById('geminiModal').classList.remove('active');
    }

    copyWithPrompt(promptType) {
        let baseContent = this.lastCopiedContent || this.buildContextMessage();

        // Add specific prompt based on type
        let additionalPrompt = '';
        switch(promptType) {
            case 'explain':
                additionalPrompt = '\n\nCan you explain the concept behind this equation in simple terms?';
                break;
            case 'steps':
                additionalPrompt = '\n\nCan you guide me through the steps to solve this, without giving me the answer?';
                break;
            case 'similar':
                additionalPrompt = '\n\nCan you give me 3 similar practice problems with this concept?';
                break;
            case 'mistakes':
                additionalPrompt = '\n\nWhat are common mistakes students make with this type of equation?';
                break;
        }

        const fullContent = baseContent + additionalPrompt;
        this.copyToClipboard(fullContent);

        // Update display
        this.lastCopiedContent = fullContent;
        this.showModal(fullContent);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.geminiHelper = new GeminiHelper();
});
