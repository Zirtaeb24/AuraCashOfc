// js/transacoes.js - Gerenciamento de transações
class TransacoesManager {
    constructor() {
        this.form = document.getElementById('txForm');
        this.table = document.getElementById('txTable');
        this.categorias = []; // Inicializa como array vazio
        this.init();
    }

    async init() {
        this.setupForm();
        await this.loadCategorias(); // Primeiro carrega categorias
        await this.loadTransacoes(); // Depois carrega transações
    }

    setupForm() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveTransacao();
        });

        document.getElementById('txType').addEventListener('change', (e) => {
            this.filterCategoriasByType(e.target.value);
        });
    }

    async loadCategorias() {
        try {
            this.categorias = await app.apiCall('/categorias', { method: 'GET' });
            this.filterCategoriasByType('expense');
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            this.categorias = []; // Garante que seja array em caso de erro
        }
    }

    filterCategoriasByType(type) {
        const select = document.getElementById('txCategory');
        const categoriasFiltradas = this.categorias.filter(cat => cat.type === type);
        
        select.innerHTML = categoriasFiltradas.map(cat => 
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('') || '<option value="">Nenhuma categoria disponível</option>';
    }

    async saveTransacao() {
        const formData = new FormData(this.form);
        const transacao = {
            type: formData.get('type'),
            categoryId: parseInt(formData.get('categoryId')),
            amount: parseFloat(formData.get('amount')),
            date: formData.get('date'),
            desc: formData.get('desc'),
            receipt: formData.get('receipt')?.name || null
        };

        if (!transacao.amount || !transacao.date) {
            Utils.showMessage('Preencha valor e data', 'error');
            return;
        }

        Utils.showLoading();
        try {
            await app.apiCall('/transacoes', {
                method: 'POST',
                body: JSON.stringify(transacao)
            });

            this.form.reset();
            app.setCurrentDate();
            await this.loadTransacoes();
            Utils.showMessage('Transação salva com sucesso!', 'success');
        } catch (error) {
            Utils.showMessage('Erro ao salvar transação', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    async loadTransacoes() {
        try {
            const transacoes = await app.apiCall('/transacoes', { method: 'GET' });
            this.renderTransacoes(transacoes);
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
        }
    }

    renderTransacoes(transacoes) {
        const tbody = this.table.querySelector('tbody');
        
        if (transacoes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="small">Nenhuma transação encontrada</td></tr>';
            return;
        }

        transacoes.sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = transacoes.map(transacao => {
            // Garantir que this.categorias é um array antes de usar find
            const categoria = this.categorias ? this.categorias.find(c => c.id === transacao.categoryId) : null;
            return `
                <tr>
                    <td>${Utils.formatDate(transacao.date)}</td>
                    <td>
                        <span class="badge" style="background: ${transacao.type === 'income' ? 'var(--ok)' : 'var(--danger)'}">
                            ${transacao.type === 'income' ? 'Receita' : 'Despesa'}
                        </span>
                    </td>
                    <td>${categoria?.name || 'Sem categoria'}</td>
                    <td style="color: ${transacao.type === 'income' ? 'var(--ok)' : 'var(--danger)'}; font-weight: bold">
                        ${Utils.formatCurrency(transacao.amount)}
                    </td>
                    <td>${transacao.desc || '-'}</td>
                    <td>${transacao.receipt ? '📎' : '-'}</td>
                    <td>
                        <button class="btn btn-danger" onclick="transacoesManager.deleteTransacao(${transacao.id})" style="padding: 5px 10px; font-size: 12px;">
                            Apagar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async deleteTransacao(id) {
        if (!confirm('Tem certeza que deseja apagar esta transação?')) {
            return;
        }

        Utils.showLoading();
        try {
            await app.apiCall(`/transacoes/${id}`, { method: 'DELETE' });
            await this.loadTransacoes();
            Utils.showMessage('Transação apagada com sucesso!', 'success');
        } catch (error) {
            Utils.showMessage('Erro ao apagar transação', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    async limparTodasTransacoes() {
        if (!confirm('ATENÇÃO: Isso irá apagar TODAS as transações. Tem certeza?')) {
            return;
        }

        Utils.showLoading();
        try {
            const transacoes = await app.apiCall('/transacoes', { method: 'GET' });
            
            for (const transacao of transacoes) {
                await app.apiCall(`/transacoes/${transacao.id}`, { method: 'DELETE' });
            }
            
            await this.loadTransacoes();
            Utils.showMessage('Todas as transações foram apagadas!', 'success');
        } catch (error) {
            Utils.showMessage('Erro ao apagar transações', 'error');
        } finally {
            Utils.hideLoading();
        }
    }
}

if (document.getElementById('txForm')) {
    window.transacoesManager = new TransacoesManager();
}