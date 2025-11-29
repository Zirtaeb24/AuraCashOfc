// compartilhada.js
class CompartilhadaManager {
    constructor() {
        this.newSharedForm = document.getElementById('newShared');
        this.joinSharedForm = document.getElementById('joinShared');
        this.list = document.getElementById('list');
        this.init();
    }

    async init() {
        this.setupForms();
        await this.loadSharedAccounts();
    }

    setupForms() {
        this.newSharedForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createSharedAccount();
        });

        this.joinSharedForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.joinSharedAccount();
        });
    }

    async createSharedAccount() {
        const formData = new FormData(this.newSharedForm);
        const account = {
            name: formData.get('name')
        };

        try {
            await app.apiCall('/shared-accounts', {
                method: 'POST',
                body: JSON.stringify(account)
            });

            this.newSharedForm.reset();
            await this.loadSharedAccounts();
            Utils.showMessage('Conta compartilhada criada!', 'success');
        } catch (error) {
            Utils.showMessage('Erro ao criar conta compartilhada', 'error');
        }
    }

    async joinSharedAccount() {
        const formData = new FormData(this.joinSharedForm);
        const sharedId = formData.get('id');

        try {
            await app.apiCall(`/shared-accounts/${sharedId}/join`, {
                method: 'POST'
            });

            this.joinSharedForm.reset();
            await this.loadSharedAccounts();
            Utils.showMessage('Entrou na conta compartilhada!', 'success');
        } catch (error) {
            Utils.showMessage('Erro ao entrar na conta compartilhada', 'error');
        }
    }

    async loadSharedAccounts() {
        try {
            const accounts = await app.apiCall('/shared-accounts', { method: 'GET' });
            this.renderSharedAccounts(accounts);
        } catch (error) {
            console.error('Erro ao carregar contas compartilhadas:', error);
        }
    }

    renderSharedAccounts(accounts) {
        this.list.innerHTML = accounts.map(account => `
            <div class="card" style="margin: 10px 0; padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center">
                    <div>
                        <strong>${account.name}</strong> 
                        <span class="small">ID: ${account.id}</span>
                    </div>
                    <div class="small">Membros: ${account.membersCount}</div>
                </div>
                <button onclick="compartilhadaManager.openAccount('${account.id}')" class="btn btn-primary">Abrir</button>
            </div>
        `).join('') || '<div class="small">Você não participa de nenhuma conta compartilhada.</div>';
    }

    openAccount(accountId) {
        // Aqui você pode abrir a conta compartilhada em uma nova página ou modal
        Utils.showMessage(`Abrindo conta ${accountId}`, 'info');
    }
}

let compartilhadaManager;
if (document.getElementById('newShared')) {
    compartilhadaManager = new CompartilhadaManager();
}