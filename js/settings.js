// js/settings.js - CORRIGIDO
class SettingsManager {
    constructor() {
        this.profileForm = document.getElementById('profileForm');
        this.securityForm = document.querySelector('.grid.grid-2 form');
        this.preferencesForm = document.querySelector('form:last-of-type');
        
        // Verificar se elementos existem antes de inicializar
        if (this.profileForm || this.securityForm || this.preferencesForm) {
            this.init();
        }
    }

    async init() {
        this.setupForms();
        await this.loadUserProfile();
    }

    setupForms() {
        // Verificar cada form antes de adicionar evento
        if (this.profileForm) {
            this.profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updateProfile();
            });
        }

        if (this.securityForm) {
            this.securityForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updatePassword();
            });
        }

        if (this.preferencesForm) {
            this.preferencesForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updatePreferences();
            });
        }
    }

    async loadUserProfile() {
        if (app && app.currentUser) {
            const user = app.currentUser;
            document.getElementById('userName').value = user.name || '';
            document.getElementById('userEmail').value = user.email || '';
            document.getElementById('userIncome').value = user.income || '';
        }
    }

    async updateProfile() {
        const formData = new FormData(this.profileForm);
        const profile = {
            name: formData.get('name'),
            email: formData.get('email'),
            income: parseFloat(formData.get('income'))
        };

        Utils.showLoading();
        try {
            const updatedUser = await app.apiCall('/profile', {
                method: 'PUT',
                body: JSON.stringify(profile)
            });

            app.setCurrentUser({ ...app.currentUser, ...updatedUser });
            Utils.showMessage('Perfil atualizado com sucesso!', 'success');
        } catch (error) {
            Utils.showMessage('Erro ao atualizar perfil', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    async updatePassword() {
        const formData = new FormData(this.securityForm);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');

        if (!currentPassword || !newPassword) {
            Utils.showMessage('Preencha todos os campos', 'error');
            return;
        }

        if (newPassword.length < 4) {
            Utils.showMessage('A nova senha deve ter pelo menos 4 caracteres', 'error');
            return;
        }

        Utils.showLoading();
        try {
            await app.apiCall('/password', {
                method: 'PUT',
                body: JSON.stringify({ currentPassword, newPassword })
            });

            this.securityForm.reset();
            Utils.showMessage('Senha alterada com sucesso!', 'success');
        } catch (error) {
            Utils.showMessage('Erro ao alterar senha', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    async updatePreferences() {
        const formData = new FormData(this.preferencesForm);
        const preferences = {
            notifications: formData.get('notifications') === 'on',
            monthlyReports: formData.get('monthlyReports') === 'on',
            currency: formData.get('currency'),
            language: formData.get('language')
        };

        Utils.showLoading();
        try {
            await app.apiCall('/preferences', {
                method: 'PUT',
                body: JSON.stringify(preferences)
            });

            Utils.showMessage('Preferências salvas com sucesso!', 'success');
        } catch (error) {
            Utils.showMessage('Erro ao salvar preferências', 'error');
        } finally {
            Utils.hideLoading();
        }
    }
}

// Inicializar apenas se estiver na página de configurações
if (document.getElementById('profileForm')) {
    new SettingsManager();
}