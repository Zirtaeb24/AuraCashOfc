// js/auth.js - Gerenciamento de login e cadastro
class AuthManager {
    constructor() {
        this.setupLogin();
        this.setupCadastro();
        this.initDefaultData();
    }

    setupLogin() {
        const loginForm = document.querySelector('form[action="#"]');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.login();
            });
        }
    }

    setupCadastro() {
        const cadastroForm = document.querySelector('.cadastrar-form');
        if (cadastroForm) {
            cadastroForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.cadastrar();
            });
        }
    }

    async login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            Utils.showMessage('Preencha todos os campos', 'error');
            return;
        }

        Utils.showLoading();
        try {
            // Substituir pela chamada real da API
            const user = await this.mockLogin(email, password);
            app.setCurrentUser(user);
            Utils.showMessage('Login realizado com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = 'pages/tdashboard.html';
            }, 1000);
        } catch (error) {
            Utils.showMessage('Login falhou: ' + error.message, 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    async cadastrar() {
        const formData = new FormData(document.querySelector('.cadastrar-form'));
        const userData = {
            name: formData.get('name'),
            cpf: formData.get('cpf'),
            income: parseFloat(formData.get('income')),
            aid: formData.get('aid') === 'on',
            email: formData.get('email'),
            password: formData.get('password')
        };

        // Validações
        if (!userData.name || !userData.cpf || !userData.income || !userData.email || !userData.password) {
            Utils.showMessage('Preencha todos os campos obrigatórios', 'error');
            return;
        }

        if (!Utils.validateEmail(userData.email)) {
            Utils.showMessage('Email inválido', 'error');
            return;
        }

        if (!Utils.validateCPF(userData.cpf)) {
            Utils.showMessage('CPF inválido', 'error');
            return;
        }

        if (userData.income <= 0) {
            Utils.showMessage('Renda mensal deve ser maior que zero', 'error');
            return;
        }

        Utils.showLoading();
        try {
            // Substituir pela chamada real da API
            const user = await this.mockCadastro(userData);
            app.setCurrentUser(user);

            // Inicializar dados padrão para o novo usuário (apenas categorias)
            this.initUserDefaultData(user.id);

            Utils.showMessage('Cadastro realizado com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = 'pages/tdashboard.html';
            }, 1000);
        } catch (error) {
            Utils.showMessage('Cadastro falhou: ' + error.message, 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    // Mock functions - substituir por API real depois
    async mockLogin(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Usuário demo para teste
                if (email === 'demo@auracash.com' && password === '1234') {
                    resolve({
                        id: 1,
                        email,
                        name: 'Usuário Demo',
                        token: 'demo-token',
                        income: 3000
                    });
                }
                // Verificar se é um usuário cadastrado no localStorage
                else {
                    const users = JSON.parse(localStorage.getItem('auraCash_users') || '[]');
                    const user = users.find(u => u.email === email && u.password === password);
                    if (user) {
                        resolve({
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            token: 'user-token',
                            income: user.income
                        });
                    } else {
                        reject(new Error('Email ou senha incorretos'));
                    }
                }
            }, 1000);
        });
    }

    async mockCadastro(userData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Verificar se email já existe
                const users = JSON.parse(localStorage.getItem('auraCash_users') || '[]');
                const existingUser = users.find(u => u.email === userData.email);

                if (existingUser) {
                    reject(new Error('Email já cadastrado'));
                    return;
                }

                // Criar novo usuário
                const newUser = {
                    id: Date.now(),
                    ...userData,
                    createdAt: new Date().toISOString()
                };

                users.push(newUser);
                localStorage.setItem('auraCash_users', JSON.stringify(users));

                resolve({
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    income: newUser.income,
                    token: 'new-user-token'
                });
            }, 1500);
        });
    }

    // Inicializar dados padrão para novo usuário (APENAS CATEGORIAS - SEM TRANSAÇÕES)
    initDefaultCategories() {
        // Verificar se já existem categorias para o usuário atual
        const categorias = JSON.parse(localStorage.getItem('auraCash_categorias') || '[]');
        const categoriasDoUsuario = categorias.filter(cat => cat.userId === this.currentUser.id);

        if (categoriasDoUsuario.length === 0) {
            console.log('Criando categorias padrão para o usuário...');

            const defaultCategories = [
                // DESPESAS
                { id: 1, name: '🏠 Moradia', type: 'expense', userId: this.currentUser.id },
                { id: 2, name: '🍽️ Alimentação', type: 'expense', userId: this.currentUser.id },
                { id: 3, name: '🚗 Transporte', type: 'expense', userId: this.currentUser.id },
                { id: 4, name: '💊 Saúde', type: 'expense', userId: this.currentUser.id },
                { id: 5, name: '🎓 Educação', type: 'expense', userId: this.currentUser.id },
                { id: 6, name: '🎉 Lazer', type: 'expense', userId: this.currentUser.id },
                { id: 7, name: '🛍️ Compras', type: 'expense', userId: this.currentUser.id },
                { id: 8, name: '💸 Outras Despesas', type: 'expense', userId: this.currentUser.id },

                // RECEITAS
                { id: 9, name: '💰 Salário', type: 'income', userId: this.currentUser.id },
                { id: 10, name: '💼 Freelance', type: 'income', userId: this.currentUser.id },
                { id: 11, name: '📈 Investimentos', type: 'income', userId: this.currentUser.id },
                { id: 12, name: '💎 Outras Receitas', type: 'income', userId: this.currentUser.id }
            ];

            // Adicionar às categorias existentes
            const todasCategorias = [...categorias, ...defaultCategories];
            localStorage.setItem('auraCash_categorias', JSON.stringify(todasCategorias));
        }
    }

    // Inicializar dados padrão na primeira execução
    initDefaultData() {
        // Criar usuário demo se não existir
        const users = JSON.parse(localStorage.getItem('auraCash_users') || '[]');
        const demoUserExists = users.some(u => u.email === 'demo@auracash.com');

        if (!demoUserExists) {
            const demoUser = {
                id: 1,
                name: 'Usuário Demo',
                email: 'demo@auracash.com',
                password: '1234',
                cpf: '12345678900',
                income: 3000,
                aid: false,
                createdAt: new Date().toISOString()
            };
            users.push(demoUser);
            localStorage.setItem('auraCash_users', JSON.stringify(users));

            // Inicializar dados para o usuário demo (apenas categorias)
            this.initUserDefaultData(1);
        }
    }
}

// Inicializar apenas nas páginas de login/cadastro
if (document.querySelector('form[action="#"]') || document.querySelector('.cadastrar-form')) {
    new AuthManager();
}