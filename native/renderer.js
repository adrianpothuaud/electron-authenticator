// Renderer process - Interface utilisateur
class AuthenticatorApp {
    constructor() {
        this.accounts = [];
        this.filteredAccounts = [];
        this.editingAccount = null;
        this.totpIntervals = new Map();
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAccounts();
        this.startTOTPUpdates();
    }

    setupEventListeners() {
        // Boutons d'ajout
        document.getElementById('add-button').addEventListener('click', () => this.showAddModal());
        document.getElementById('add-first-button').addEventListener('click', () => this.showAddModal());
        
        // Import/Export
        document.getElementById('import-button').addEventListener('click', () => this.importAccounts());
        document.getElementById('export-button').addEventListener('click', () => this.showExportModal());
        
        // Recherche
        document.getElementById('search-input').addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Modal compte
        document.getElementById('close-modal').addEventListener('click', () => this.hideModal());
        document.getElementById('cancel-button').addEventListener('click', () => this.hideModal());
        document.getElementById('account-form').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Options avancées
        document.getElementById('toggle-advanced').addEventListener('click', () => this.toggleAdvancedOptions());
        
        // Modal export
        document.getElementById('close-export-modal').addEventListener('click', () => this.hideExportModal());
        document.getElementById('cancel-export-button').addEventListener('click', () => this.hideExportModal());
        document.getElementById('confirm-export-button').addEventListener('click', () => this.exportAccounts());
        
        // Fermer modal en cliquant à l'extérieur
        document.getElementById('account-modal').addEventListener('click', (e) => {
            if (e.target.id === 'account-modal') {
                this.hideModal();
            }
        });
        
        document.getElementById('export-modal').addEventListener('click', (e) => {
            if (e.target.id === 'export-modal') {
                this.hideExportModal();
            }
        });
    }

    async loadAccounts() {
        this.showLoading();
        try {
            const result = await window.electronAPI.loadAccounts();
            if (result.success) {
                this.accounts = result.accounts || [];
                this.applySearchFilter();
                this.renderAccounts();
            } else {
                this.showToast('Erreur lors du chargement des comptes', 'error');
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
            this.showToast('Erreur lors du chargement des comptes', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async saveAccounts() {
        try {
            const result = await window.electronAPI.saveAccounts(this.accounts);
            if (!result.success) {
                this.showToast('Erreur lors de la sauvegarde', 'error');
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error saving accounts:', error);
            this.showToast('Erreur lors de la sauvegarde', 'error');
            return false;
        }
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('empty-state').classList.add('hidden');
        document.getElementById('accounts-container').innerHTML = '';
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    renderAccounts() {
        const container = document.getElementById('accounts-container');
        const emptyState = document.getElementById('empty-state');
        
        if (this.filteredAccounts.length === 0) {
            container.innerHTML = '';
            if (this.accounts.length === 0) {
                emptyState.classList.remove('hidden');
            } else {
                emptyState.classList.add('hidden');
                container.innerHTML = '<div class="no-results">Aucun compte ne correspond à votre recherche.</div>';
            }
            return;
        }
        
        emptyState.classList.add('hidden');
        container.innerHTML = '';
        
        this.filteredAccounts.forEach(account => {
            const accountElement = this.createAccountCard(account);
            container.appendChild(accountElement);
        });
        
        this.updateAllTOTP();
    }

    createAccountCard(account) {
        const card = document.createElement('div');
        card.className = 'account-card';
        card.innerHTML = `
            <div class="account-header">
                <div class="account-info">
                    <h3>${this.escapeHtml(account.service)}</h3>
                    <p>${this.escapeHtml(account.username)}</p>
                </div>
                <div class="account-actions">
                    <button class="action-button copy-secret-button" onclick="app.copySecret('${account.id}')" title="Copier la clé secrète">
                        🔑
                    </button>
                    <button class="action-button edit-button" onclick="app.editAccount('${account.id}')" title="Modifier">
                        ✏️
                    </button>
                    <button class="action-button delete-button" onclick="app.deleteAccount('${account.id}')" title="Supprimer">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="totp-display">
                <div class="totp-code-container">
                    <div class="totp-code" onclick="app.copyCode('${account.id}')" title="Cliquer pour copier">
                        <span id="code-${account.id}">------</span>
                    </div>
                    <button class="clipboard-icon" onclick="app.copyCode('${account.id}')" title="Copier le code">
                        📋
                    </button>
                </div>
                <div class="time-progress">
                    <div class="progress-bar">
                        <div id="progress-${account.id}" class="progress-fill"></div>
                    </div>
                    <div class="time-remaining">
                        <span id="time-${account.id}">--s</span>
                    </div>
                </div>
            </div>
        `;
        return card;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async updateAllTOTP() {
        for (const account of this.filteredAccounts) {
            await this.updateTOTP(account);
        }
    }

    async updateTOTP(account) {
        try {
            const result = await window.electronAPI.generateTOTP(account);
            if (result.success) {
                const codeElement = document.getElementById(`code-${account.id}`);
                const progressElement = document.getElementById(`progress-${account.id}`);
                const timeElement = document.getElementById(`time-${account.id}`);
                
                if (codeElement) {
                    codeElement.textContent = result.code;
                }
                
                if (progressElement && timeElement) {
                    const timeRemaining = result.timeRemaining;
                    const percentage = (timeRemaining / account.period) * 100;
                    
                    progressElement.style.width = `${percentage}%`;
                    timeElement.textContent = `${timeRemaining}s`;
                }
            }
        } catch (error) {
            console.error('Error updating TOTP:', error);
        }
    }

    startTOTPUpdates() {
        // Mettre à jour les codes TOTP toutes les secondes
        setInterval(() => {
            this.updateAllTOTP();
        }, 1000);
    }

    showAddModal() {
        this.editingAccount = null;
        document.getElementById('modal-title').textContent = 'Ajouter un compte';
        document.getElementById('account-form').reset();
        document.getElementById('account-modal').classList.remove('hidden');
    }

    editAccount(accountId) {
        const account = this.accounts.find(a => a.id === accountId);
        if (!account) return;
        
        this.editingAccount = account;
        document.getElementById('modal-title').textContent = 'Modifier le compte';
        
        // Remplir le formulaire
        document.getElementById('service').value = account.service;
        document.getElementById('username').value = account.username;
        document.getElementById('secret').value = account.secret;
        document.getElementById('algorithm').value = account.algorithm;
        document.getElementById('digits').value = account.digits;
        document.getElementById('period').value = account.period;
        
        document.getElementById('account-modal').classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('account-modal').classList.add('hidden');
        this.editingAccount = null;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const accountData = {
            id: this.editingAccount ? this.editingAccount.id : this.generateId(),
            service: formData.get('service').trim(),
            username: formData.get('username').trim(),
            secret: formData.get('secret').replace(/\s/g, '').toUpperCase(),
            algorithm: formData.get('algorithm'),
            digits: parseInt(formData.get('digits')),
            period: parseInt(formData.get('period'))
        };
        
        // Validation
        if (!this.validateAccount(accountData)) {
            return;
        }
        
        if (this.editingAccount) {
            // Modification
            const index = this.accounts.findIndex(a => a.id === this.editingAccount.id);
            if (index !== -1) {
                this.accounts[index] = accountData;
            }
        } else {
            // Ajout
            this.accounts.push(accountData);
        }
        
        const saved = await this.saveAccounts();
        if (saved) {
            this.applySearchFilter();
            this.renderAccounts();
            this.hideModal();
            this.showToast(
                this.editingAccount ? 'Compte modifié avec succès' : 'Compte ajouté avec succès',
                'success'
            );
        }
    }

    validateAccount(account) {
        if (!account.service || !account.username || !account.secret) {
            this.showToast('Veuillez remplir tous les champs obligatoires', 'error');
            return false;
        }
        
        // Validation de la clé secrète (Base32)
        const base32Regex = /^[A-Z2-7]+=*$/;
        if (!base32Regex.test(account.secret)) {
            this.showToast('La clé secrète doit être en format Base32 (A-Z, 2-7)', 'error');
            return false;
        }
        
        return true;
    }

    async deleteAccount(accountId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
            return;
        }
        
        this.accounts = this.accounts.filter(a => a.id !== accountId);
        const saved = await this.saveAccounts();
        
        if (saved) {
            this.applySearchFilter();
            this.renderAccounts();
            this.showToast('Compte supprimé avec succès', 'success');
        }
    }

    async copyCode(accountId) {
        const codeElement = document.getElementById(`code-${accountId}`);
        if (!codeElement) return;
        
        const code = codeElement.textContent;
        if (code === '------') return;
        
        try {
            const result = await window.electronAPI.copyToClipboard(code);
            if (result.success) {
                this.showToast(`Code ${code} copié dans le presse-papiers !`, 'success');
            } else {
                this.showToast('Erreur lors de la copie', 'error');
            }
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            this.showToast('Erreur lors de la copie', 'error');
        }
    }

    async copySecret(accountId) {
        if (!confirm('Êtes-vous sûr de vouloir copier la clé secrète ? Cette information est sensible.')) {
            return;
        }
        
        const account = this.accounts.find(a => a.id === accountId);
        if (!account) return;
        
        try {
            const result = await window.electronAPI.copyToClipboard(account.secret);
            if (result.success) {
                this.showToast('Clé secrète copiée dans le presse-papiers !', 'success');
            } else {
                this.showToast('Erreur lors de la copie', 'error');
            }
        } catch (error) {
            console.error('Error copying secret:', error);
            this.showToast('Erreur lors de la copie', 'error');
        }
    }

    handleSearch(query) {
        this.searchQuery = query.toLowerCase().trim();
        this.applySearchFilter();
        this.renderAccounts();
    }

    applySearchFilter() {
        if (!this.searchQuery) {
            this.filteredAccounts = [...this.accounts];
        } else {
            this.filteredAccounts = this.accounts.filter(account =>
                account.service.toLowerCase().includes(this.searchQuery) ||
                account.username.toLowerCase().includes(this.searchQuery)
            );
        }
    }

    toggleAdvancedOptions() {
        const advancedFields = document.getElementById('advanced-fields');
        const toggleButton = document.getElementById('toggle-advanced');
        
        if (advancedFields.classList.contains('hidden')) {
            advancedFields.classList.remove('hidden');
            toggleButton.textContent = '⚙️ Masquer les options avancées';
        } else {
            advancedFields.classList.add('hidden');
            toggleButton.textContent = '⚙️ Options avancées';
        }
    }

    showExportModal() {
        if (this.accounts.length === 0) {
            this.showToast('Aucun compte à exporter', 'error');
            return;
        }
        document.getElementById('export-modal').classList.remove('hidden');
    }

    hideExportModal() {
        document.getElementById('export-modal').classList.add('hidden');
    }

    async exportAccounts() {
        const selectedFormat = document.querySelector('input[name="export-format"]:checked').value;
        
        try {
            const result = await window.electronAPI.exportAccounts(this.accounts, selectedFormat);
            if (result.success) {
                this.showToast(`Comptes exportés avec succès vers ${result.filePath}`, 'success');
                this.hideExportModal();
            } else {
                this.showToast(`Erreur lors de l'export: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Error exporting accounts:', error);
            this.showToast('Erreur lors de l\'export', 'error');
        }
    }

    async importAccounts() {
        try {
            const result = await window.electronAPI.importAccounts();
            if (result.success && result.accounts.length > 0) {
                // Ajouter les comptes importés à la liste existante
                const newAccounts = result.accounts.filter(importedAccount => 
                    !this.accounts.some(existingAccount => 
                        existingAccount.service === importedAccount.service && 
                        existingAccount.username === importedAccount.username
                    )
                );
                
                if (newAccounts.length > 0) {
                    this.accounts.push(...newAccounts);
                    const saved = await this.saveAccounts();
                    
                    if (saved) {
                        this.applySearchFilter();
                        this.renderAccounts();
                        this.showToast(`${newAccounts.length} compte(s) importé(s) avec succès`, 'success');
                    }
                } else {
                    this.showToast('Aucun nouveau compte à importer', 'info');
                }
            } else if (result.error) {
                this.showToast(`Erreur lors de l'import: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Error importing accounts:', error);
            this.showToast('Erreur lors de l\'import', 'error');
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const messageElement = document.getElementById('toast-message');
        
        messageElement.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');
        
        // Ajouter la classe 'show' après un petit délai pour l'animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Masquer après 3 secondes
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 300);
        }, 3000);
    }
}

// Initialiser l'application quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AuthenticatorApp();
});