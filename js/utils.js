// js/utils.js - Funções utilitárias
class Utils {
    // Formatar moeda
    static formatCurrency(value, currency = 'BRL') {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency
        }).format(value);
    }

    // Formatar data
    static formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    // Validar email
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Validar CPF (validação simples)
    static validateCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        if (cpf.length !== 11) return false;
        
        // Validação básica de CPF
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        return true;
    }

    // Mostrar loading
    static showLoading() {
        let loader = document.getElementById('globalLoader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'globalLoader';
            loader.innerHTML = `
                <div style="text-align: center">
                    <div>Carregando...</div>
                </div>
            `;
            loader.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--primary);
                color: white;
                padding: 20px 30px;
                border-radius: 10px;
                z-index: 9999;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(loader);
        }
        loader.style.display = 'block';
    }

    // Esconder loading
    static hideLoading() {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    // Mostrar mensagem
    static showMessage(message, type = 'info', duration = 3000) {
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            z-index: 9999;
            font-weight: bold;
            max-width: 300px;
            word-wrap: break-word;
        `;

        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        messageEl.style.background = colors[type] || colors.info;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, duration);
    }

    // Gerar ID único
    static generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }
}