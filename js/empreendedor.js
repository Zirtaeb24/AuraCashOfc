// empreendedor.js
class EmpreendedorManager {
    constructor() {
        this.matForm = document.getElementById('matForm');
        this.matTable = document.getElementById('matTable');
        this.prodForm = document.getElementById('prodForm');
        this.matUses = document.getElementById('matUses');
        this.init();
    }

    async init() {
        this.setupForms();
        await this.loadMateriais();
    }

    setupForms() {
        this.matForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveMaterial();
        });

        this.prodForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.calcularCusto();
        });

        document.getElementById('addUse').addEventListener('click', (e) => {
            e.preventDefault();
            this.addMaterialUseRow();
        });
    }

    addMaterialUseRow() {
        const row = document.createElement('div');
        row.className = 'useRow';
        row.innerHTML = `
            <select name="materialId" required>
                <option value="">Selecione o material</option>
            </select>
            <input type="number" name="qtyUsed" step="0.0001" placeholder="Qtd usada" required>
            <button class="btn btn-danger" onclick="this.parentElement.remove()">X</button>
        `;
        this.matUses.appendChild(row);
        this.loadMateriaisIntoSelect(row.querySelector('select'));
    }

    async loadMateriais() {
        try {
            const materiais = await app.apiCall('/materiais', { method: 'GET' });
            this.renderMateriais(materiais);
        } catch (error) {
            console.error('Erro ao carregar materiais:', error);
        }
    }

    async loadMateriaisIntoSelect(selectElement) {
        try {
            const materiais = await app.apiCall('/materiais', { method: 'GET' });
            selectElement.innerHTML = `
                <option value="">Selecione o material</option>
                ${materiais.map(mat => `<option value="${mat.id}">${mat.name}</option>`).join('')}
            `;
        } catch (error) {
            console.error('Erro ao carregar materiais no select:', error);
        }
    }

    renderMateriais(materiais) {
        const tbody = this.matTable.querySelector('tbody');
        tbody.innerHTML = materiais.map(mat => `
            <tr>
                <td>${mat.name}</td>
                <td>${Utils.formatCurrency(mat.totalValue)}</td>
                <td>${mat.qty}</td>
                <td>${Utils.formatCurrency(mat.totalValue / mat.qty)}</td>
            </tr>
        `).join('') || '<tr><td colspan="4">Nenhum material cadastrado.</td></tr>';
    }

    async saveMaterial() {
        const formData = new FormData(this.matForm);
        const material = {
            name: formData.get('name'),
            totalValue: parseFloat(formData.get('totalValue')),
            qty: parseFloat(formData.get('qty'))
        };

        try {
            await app.apiCall('/materiais', {
                method: 'POST',
                body: JSON.stringify(material)
            });

            this.matForm.reset();
            await this.loadMateriais();
            Utils.showMessage('Material salvo com sucesso!', 'success');
        } catch (error) {
            Utils.showMessage('Erro ao salvar material', 'error');
        }
    }

    async calcularCusto() {
        const formData = new FormData(this.prodForm);
        const productName = formData.get('name');
        const materialUses = Array.from(this.matUses.querySelectorAll('.useRow')).map(row => {
            const materialId = row.querySelector('select').value;
            const qtyUsed = parseFloat(row.querySelector('input').value);
            return { materialId, qtyUsed };
        });

        // Calcular custo total
        let custoTotal = 0;
        for (const use of materialUses) {
            const material = await app.apiCall(`/materiais/${use.materialId}`, { method: 'GET' });
            const custoUnitario = material.totalValue / material.qty;
            custoTotal += custoUnitario * use.qtyUsed;
        }

        const resultDiv = document.getElementById('result');
        const resultContent = document.getElementById('resultContent');
        resultContent.innerHTML = `
            <p><strong>Produto:</strong> ${productName}</p>
            <p><strong>Custo total:</strong> ${Utils.formatCurrency(custoTotal)}</p>
        `;
        resultDiv.style.display = 'block';
    }
}

if (document.getElementById('matForm')) {
    new EmpreendedorManager();
}