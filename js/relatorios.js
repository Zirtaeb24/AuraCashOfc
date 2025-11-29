// js/relatorios.js - VERSÃO CORRIGIDA E MELHORADA
class RelatoriosManager {
    constructor() {
        this.form = document.querySelector('form');
        this.pieChart = document.getElementById('pieChart');
        this.barChart = document.getElementById('barChart');
        this.init();
    }

    async init() {
        console.log('📊 Inicializando relatórios...');
        this.setupForm();
        await this.loadRelatorios();
    }

    setupForm() {
        if (this.form) {
            this.form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.loadRelatorios();
            });
        }
    }

    async loadRelatorios() {
        try {
            console.log('📈 Carregando dados para relatórios...');
            const transacoes = await app.apiCall('/transacoes', { method: 'GET' });
            const categorias = await app.apiCall('/categorias', { method: 'GET' });
            
            console.log('Transações encontradas:', transacoes.length);
            console.log('Categorias encontradas:', categorias.length);
            
            this.renderPieChart(transacoes, categorias);
            this.renderBarChart(transacoes);
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
            this.pieChart.innerHTML = '<div class="small">Erro ao carregar relatórios.</div>';
            this.barChart.innerHTML = '<div class="small">Erro ao carregar relatórios.</div>';
        }
    }

    renderPieChart(transacoes, categorias) {
        console.log('🎨 Renderizando gráfico de pizza...');
        
        // Filtra despesas do mês atual
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const despesas = transacoes.filter(t => {
            if (t.type !== 'expense') return false;
            
            try {
                const dataTransacao = new Date(t.date);
                return dataTransacao >= firstDay && dataTransacao <= lastDay;
            } catch (e) {
                return false;
            }
        });

        console.log('Despesas do mês:', despesas.length);

        if (despesas.length === 0) {
            this.pieChart.innerHTML = `
                <div class="small">
                    <p>Nenhuma despesa registrada este mês.</p>
                    <p style="color: var(--primary); margin-top: 10px;">
                        💡 <strong>Dica:</strong> Adicione algumas transações de despesa para ver o gráfico!
                    </p>
                </div>
            `;
            return;
        }

        // Agrupa por categoria
        const gastosPorCategoria = {};

        despesas.forEach(despesa => {
            const categoria = categorias.find(c => c.id === despesa.categoryId);
            const nomeCategoria = categoria ? categoria.name : 'Outros';
            gastosPorCategoria[nomeCategoria] = (gastosPorCategoria[nomeCategoria] || 0) + despesa.amount;
        });

        // Cores para as categorias
        const cores = ['#f39a05', '#8450a7', '#7a86ff', '#28a745', '#dc3545', '#ffc107', '#17a2b8'];

        this.pieChart.innerHTML = `
            <h4 style="text-align: center; margin-bottom: 20px;">Despesas por Categoria</h4>
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;">
                ${Object.entries(gastosPorCategoria).map(([categoria, total], index) => `
                    <div style="text-align: center; margin: 10px; min-width: 120px;">
                        <div style="width: 40px; height: 40px; background: ${cores[index % cores.length]}; 
                              border-radius: 50%; display: inline-block; margin-bottom: 8px;"></div>
                        <div><strong>${categoria}</strong></div>
                        <div style="font-size: 14px; color: #666;">${Utils.formatCurrency(total)}</div>
                        <div style="font-size: 12px; color: #999;">
                            ${((total / despesas.reduce((sum, d) => sum + d.amount, 0)) * 100).toFixed(1)}%
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="text-align: center; margin-top: 15px; font-size: 12px; color: #666;">
                Total: ${Utils.formatCurrency(despesas.reduce((sum, d) => sum + d.amount, 0))}
            </div>
        `;
    }

    renderBarChart(transacoes) {
        console.log('📊 Renderizando gráfico de barras...');
        
        // Agrupar por semana: receitas vs despesas (últimas 4 semanas)
        const semanas = {};
        const hoje = new Date();
        
        // Criar últimas 4 semanas
        for (let i = 3; i >= 0; i--) {
            const semanaData = new Date(hoje);
            semanaData.setDate(hoje.getDate() - (i * 7));
            const semanaNum = this.getSemanaDoAno(semanaData);
            semanas[semanaNum] = { receitas: 0, despesas: 0, label: `Sem ${semanaNum}` };
        }

        // Preencher com dados
        transacoes.forEach(t => {
            try {
                const data = new Date(t.date);
                const semana = this.getSemanaDoAno(data);
                
                if (semanas[semana]) {
                    if (t.type === 'income') {
                        semanas[semana].receitas += t.amount;
                    } else {
                        semanas[semana].despesas += t.amount;
                    }
                }
            } catch (e) {
                console.log('Erro ao processar transação:', t);
            }
        });

        const semanasComDados = Object.values(semanas).filter(s => s.receitas > 0 || s.despesas > 0);
        
        if (semanasComDados.length === 0) {
            this.barChart.innerHTML = `
                <div class="small">
                    <p>Nenhuma transação registrada para exibir gráfico.</p>
                    <p style="color: var(--primary); margin-top: 10px;">
                        💡 <strong>Dica:</strong> Adicione transações de receita e despesa para ver o gráfico!
                    </p>
                </div>
            `;
            return;
        }

        const maxValor = Math.max(
            ...semanasComDados.map(s => Math.max(s.receitas, s.despesas)),
            100 // Valor mínimo para o gráfico não ficar vazio
        );

        this.barChart.innerHTML = `
            <h4 style="text-align: center; margin-bottom: 20px;">Receitas vs Despesas (Últimas 4 semanas)</h4>
            <div style="display: flex; align-items: end; justify-content: center; gap: 15px; height: 200px; border-bottom: 1px solid #ccc; padding: 0 20px;">
                ${semanasComDados.map(semana => {
                    const alturaReceitas = (semana.receitas / maxValor) * 150;
                    const alturaDespesas = (semana.despesas / maxValor) * 150;
                    return `
                        <div style="text-align: center; margin: 0 5px;">
                            <div style="display: flex; align-items: end; justify-content: center; height: 150px; gap: 3px;">
                                <div style="background: var(--ok); width: 25px; height: ${alturaReceitas}px; 
                                      border-radius: 3px 3px 0 0;" 
                                     title="Receitas: ${Utils.formatCurrency(semana.receitas)}"></div>
                                <div style="background: var(--danger); width: 25px; height: ${alturaDespesas}px; 
                                      border-radius: 3px 3px 0 0;" 
                                     title="Despesas: ${Utils.formatCurrency(semana.despesas)}"></div>
                            </div>
                            <div style="font-size: 11px; margin-top: 5px; font-weight: bold;">${semana.label}</div>
                            <div style="font-size: 10px; color: #666;">
                                R: ${Utils.formatCurrency(semana.receitas).replace('R$', '').trim()}<br>
                                D: ${Utils.formatCurrency(semana.despesas).replace('R$', '').trim()}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="display: flex; justify-content: center; gap: 20px; margin-top: 15px;">
                <div style="display: flex; align-items: center; gap: 5px;">
                    <span style="background: var(--ok); display: inline-block; width: 12px; height: 12px; border-radius: 2px;"></span>
                    <span style="font-size: 12px;">Receitas</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <span style="background: var(--danger); display: inline-block; width: 12px; height: 12px; border-radius: 2px;"></span>
                    <span style="font-size: 12px;">Despesas</span>
                </div>
            </div>
        `;
    }

    getSemanaDoAno(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
}

// Inicializar na página de relatórios
if (document.getElementById('pieChart')) {
    new RelatoriosManager();
}