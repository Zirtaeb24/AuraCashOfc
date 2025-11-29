// dashboard.js
class DashboardManager {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadKPIs();
        await this.loadLastTransactions();
        await this.loadBadges();
    }

    async loadKPIs() {
        // Carregar transações do mês atual
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        try {
            const transacoes = await app.apiCall('/transacoes', { method: 'GET' });
            const transacoesMes = transacoes.filter(t => {
                const data = new Date(t.date);
                return data >= firstDay && data <= lastDay;
            });

            const receitas = transacoesMes.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const despesas = transacoesMes.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            const saldo = receitas - despesas;

            document.getElementById('kpiIncome').textContent = Utils.formatCurrency(receitas);
            document.getElementById('kpiExpense').textContent = Utils.formatCurrency(despesas);
            document.getElementById('kpiBalance').textContent = Utils.formatCurrency(saldo);
        } catch (error) {
            console.error('Erro ao carregar KPIs:', error);
        }
    }

    async loadLastTransactions() {
        try {
            const transacoes = await app.apiCall('/transacoes', { method: 'GET' });
            const lastFive = transacoes.slice(-5).reverse(); // Últimas 5, mais recente primeiro

            const tbody = document.querySelector('#lastTx tbody');
            tbody.innerHTML = lastFive.map(t => `
                <tr>
                    <td>${Utils.formatDate(t.date)}</td>
                    <td>${t.type === 'income' ? 'Receita' : 'Despesa'}</td>
                    <td>${t.categoryName || 'Sem categoria'}</td>
                    <td>${Utils.formatCurrency(t.amount)}</td>
                    <td>${t.desc || '-'}</td>
                </tr>
            `).join('') || '<tr><td colspan="5">Nenhuma transação</td></tr>';
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
        }
    }

    async loadBadges() {
        // Exemplo de medalhas
        const badges = [
            { name: 'Primeira Transação', earned: true },
            { name: 'Economizador', earned: false },
            { name: 'Metas Batidas', earned: false }
        ];

        const badgesContainer = document.getElementById('badges');
        badgesContainer.innerHTML = badges.map(badge => `
            <span class="badge" style="background: ${badge.earned ? 'var(--primary)' : '#ccc'}">
                ${badge.name}
            </span>
        `).join('');
    }
}

if (document.getElementById('kpiIncome')) {
    new DashboardManager();
}