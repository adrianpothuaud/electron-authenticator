// Main process - Electron natif avec logique TOTP intégrée
const { app, BrowserWindow, ipcMain, clipboard, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

class NativeAuthenticatorMain {
    constructor() {
        this.mainWindow = null;
        this.dataPath = path.join(os.homedir(), '.authenticator');
        this.ensureDataDirectory();
        this.init();
    }

    ensureDataDirectory() {
        if (!fs.existsSync(this.dataPath)) {
            fs.mkdirSync(this.dataPath, { recursive: true });
        }
    }

    getAccountsFilePath() {
        return path.join(this.dataPath, 'accounts.enc');
    }

    async init() {
        await app.whenReady();
        this.createWindow();
        this.setupIPC();
        
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                this.createWindow();
            }
        });
        
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
    }

    createWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1000,
            height: 700,
            minWidth: 800,
            minHeight: 600,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js'),
            },
            titleBarStyle: process.platform === 'darwin' ? 'default' : 'default',
            movable: true,
            resizable: true,
            show: false
        });

        // Charger l'interface native
        this.mainWindow.loadFile(path.join(__dirname, 'index.html'));
        
        // Afficher la fenêtre une fois chargée
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow.show();
        });

        // Ouvrir DevTools en développement
        if (process.env.NODE_ENV === 'development') {
            this.mainWindow.webContents.openDevTools();
        }
    }

    setupIPC() {
        // Stockage sécurisé des comptes
        ipcMain.handle('save-accounts', async (event, accounts) => {
            try {
                if (!safeStorage.isEncryptionAvailable()) {
                    throw new Error('Encryption not available');
                }
                
                const accountsJSON = JSON.stringify(accounts);
                const encrypted = safeStorage.encryptString(accountsJSON);
                fs.writeFileSync(this.getAccountsFilePath(), encrypted);
                
                return { success: true };
            } catch (error) {
                console.error('Error saving accounts:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });

        // Chargement des comptes
        ipcMain.handle('load-accounts', async (event) => {
            try {
                const filePath = this.getAccountsFilePath();
                if (!fs.existsSync(filePath)) {
                    return { success: true, accounts: [] };
                }
                
                if (!safeStorage.isEncryptionAvailable()) {
                    throw new Error('Encryption not available');
                }
                
                const encrypted = fs.readFileSync(filePath);
                const decrypted = safeStorage.decryptString(encrypted);
                const accounts = JSON.parse(decrypted);
                
                return { success: true, accounts };
            } catch (error) {
                console.error('Error loading accounts:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    accounts: []
                };
            }
        });

        // Génération TOTP native
        ipcMain.handle('generate-totp', async (event, account) => {
            try {
                const code = this.generateTOTP(account);
                const timeRemaining = this.getTimeRemaining(account.period || 30);
                
                return {
                    success: true,
                    code,
                    timeRemaining
                };
            } catch (error) {
                console.error('Error generating TOTP:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    code: '------',
                    timeRemaining: 0
                };
            }
        });

        // Copie dans le presse-papiers
        ipcMain.handle('copy-to-clipboard', async (event, text) => {
            try {
                clipboard.writeText(text);
                return { success: true };
            } catch (error) {
                console.error('Error copying to clipboard:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });

        // Export des comptes
        ipcMain.handle('export-accounts', async (event, accounts, format) => {
            try {
                const { dialog } = require('electron');
                const result = await dialog.showSaveDialog(this.mainWindow, {
                    title: 'Exporter les comptes',
                    defaultPath: `authenticator-backup-${new Date().toISOString().split('T')[0]}.json`,
                    filters: [
                        { name: 'JSON Files', extensions: ['json'] },
                        { name: 'All Files', extensions: ['*'] }
                    ]
                });

                if (result.canceled) {
                    return { success: false, error: 'Export annulé' };
                }

                let exportData;
                if (format === 'google') {
                    // Format compatible Google Authenticator
                    exportData = {
                        version: 1,
                        batch_size: 1,
                        batch_index: 0,
                        batch_id: crypto.randomUUID(),
                        accounts: accounts.map(account => ({
                            secret: account.secret,
                            name: account.username,
                            issuer: account.service,
                            algorithm: account.algorithm,
                            digits: account.digits,
                            period: account.period,
                            type: 'totp'
                        }))
                    };
                } else {
                    // Format natif avec toutes les données
                    exportData = {
                        version: '1.0.0',
                        exported_at: new Date().toISOString(),
                        app: 'electron-authenticator',
                        accounts: accounts
                    };
                }

                fs.writeFileSync(result.filePath, JSON.stringify(exportData, null, 2));
                return { success: true, filePath: result.filePath };
            } catch (error) {
                console.error('Error exporting accounts:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });

        // Import des comptes
        ipcMain.handle('import-accounts', async (event) => {
            try {
                const { dialog } = require('electron');
                const result = await dialog.showOpenDialog(this.mainWindow, {
                    title: 'Importer des comptes',
                    filters: [
                        { name: 'JSON Files', extensions: ['json'] },
                        { name: 'All Files', extensions: ['*'] }
                    ],
                    properties: ['openFile']
                });

                if (result.canceled || result.filePaths.length === 0) {
                    return { success: false, error: 'Import annulé' };
                }

                const fileContent = fs.readFileSync(result.filePaths[0], 'utf8');
                const importData = JSON.parse(fileContent);
                
                let accounts = [];
                
                // Détecter le format et convertir
                if (importData.accounts && Array.isArray(importData.accounts)) {
                    if (importData.version === 1 && importData.batch_size) {
                        // Format Google Authenticator
                        accounts = importData.accounts.map(account => ({
                            id: this.generateId(),
                            service: account.issuer || 'Service importé',
                            username: account.name || 'Utilisateur',
                            secret: account.secret,
                            algorithm: account.algorithm || 'SHA1',
                            digits: account.digits || 6,
                            period: account.period || 30
                        }));
                    } else {
                        // Format natif ou compatible
                        accounts = importData.accounts.map(account => ({
                            id: account.id || this.generateId(),
                            service: account.service || account.issuer || 'Service importé',
                            username: account.username || account.name || 'Utilisateur',
                            secret: account.secret,
                            algorithm: account.algorithm || 'SHA1',
                            digits: account.digits || 6,
                            period: account.period || 30
                        }));
                    }
                }

                return { success: true, accounts };
            } catch (error) {
                console.error('Error importing accounts:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    accounts: []
                };
            }
        });
    }

    // Implémentation TOTP native
    generateTOTP(account) {
        const { secret, algorithm = 'SHA1', digits = 6, period = 30 } = account;
        
        // Décoder la clé secrète Base32
        const key = this.base32Decode(secret);
        
        // Calculer le compteur basé sur le temps
        const counter = Math.floor(Date.now() / 1000 / period);
        
        // Générer le HMAC
        const hmac = crypto.createHmac(algorithm.toLowerCase(), key);
        const counterBuffer = Buffer.allocUnsafe(8);
        counterBuffer.writeBigUInt64BE(BigInt(counter), 0);
        hmac.update(counterBuffer);
        const hash = hmac.digest();
        
        // Extraction dynamique
        const offset = hash[hash.length - 1] & 0xf;
        const code = (
            ((hash[offset] & 0x7f) << 24) |
            ((hash[offset + 1] & 0xff) << 16) |
            ((hash[offset + 2] & 0xff) << 8) |
            (hash[offset + 3] & 0xff)
        ) % Math.pow(10, digits);
        
        return code.toString().padStart(digits, '0');
    }

    getTimeRemaining(period = 30) {
        const now = Math.floor(Date.now() / 1000);
        return period - (now % period);
    }

    // Décodage Base32 simplifié
    base32Decode(encoded) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        
        // Nettoyer et convertir en bits
        encoded = encoded.replace(/[^A-Z2-7]/g, '');
        for (let i = 0; i < encoded.length; i++) {
            const val = alphabet.indexOf(encoded[i]);
            if (val === -1) throw new Error('Invalid base32 character');
            bits += val.toString(2).padStart(5, '0');
        }
        
        // Convertir les bits en bytes
        const bytes = [];
        for (let i = 0; i < bits.length - 7; i += 8) {
            bytes.push(parseInt(bits.substr(i, 8), 2));
        }
        
        return Buffer.from(bytes);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Lancer l'application
new NativeAuthenticatorMain();