// Preload script pour l'application native
const { contextBridge, ipcRenderer } = require('electron');

// Exposer les APIs sécurisées au renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Gestion des comptes
    saveAccounts: (accounts) => ipcRenderer.invoke('save-accounts', accounts),
    loadAccounts: () => ipcRenderer.invoke('load-accounts'),
    
    // Import/Export
    exportAccounts: (accounts, format) => ipcRenderer.invoke('export-accounts', accounts, format),
    importAccounts: () => ipcRenderer.invoke('import-accounts'),
    
    // Génération TOTP
    generateTOTP: (account) => ipcRenderer.invoke('generate-totp', account),
    
    // Presse-papiers
    copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
});

// Exposer des informations utiles
contextBridge.exposeInMainWorld('appInfo', {
    platform: process.platform,
    version: process.versions.electron
});