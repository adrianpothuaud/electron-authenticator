# API Reference

Electron Authenticator expose une API interne pour les extensions et l'automatisation.

::: warning API Expérimentale
Cette API est en cours de développement et peut changer dans les futures versions. Elle est principalement destinée aux développeurs avancés.
:::

## Vue d'ensemble

L'API permet d'interagir avec :
- **Gestion des comptes** : Ajouter, modifier, supprimer
- **Génération de codes** : TOTP/HOTP
- **Configuration** : Paramètres utilisateur
- **Sauvegarde** : Export/import de données

## Authentification

Toutes les opérations API nécessitent une authentification préalable.

```javascript
// Authentification avec le mot de passe principal
const auth = await electronAuth.authenticate(masterPassword);
if (!auth.success) {
  throw new Error('Authentification échouée');
}
```

## Endpoints disponibles

### Comptes

#### Lister tous les comptes
```javascript
GET /api/accounts
```

**Réponse :**
```json
{
  "accounts": [
    {
      "id": "uuid-1234",
      "name": "Gmail",
      "account": "user@gmail.com",
      "issuer": "Google",
      "algorithm": "SHA1",
      "digits": 6,
      "period": 30,
      "created_at": "2025-01-01T00:00:00Z",
      "last_used": "2025-01-07T12:30:00Z"
    }
  ]
}
```

#### Ajouter un compte
```javascript
POST /api/accounts
```

**Corps de la requête :**
```json
{
  "name": "GitHub",
  "account": "username",
  "secret": "BASE32SECRET",
  "issuer": "GitHub",
  "algorithm": "SHA1",
  "digits": 6,
  "period": 30
}
```

#### Générer un code TOTP
```javascript
GET /api/accounts/:id/code
```

**Réponse :**
```json
{
  "code": "123456",
  "expires_at": "2025-01-07T12:31:00Z",
  "time_remaining": 25
}
```

### Configuration

#### Obtenir la configuration
```javascript
GET /api/config
```

**Réponse :**
```json
{
  "theme": "dark",
  "auto_lock_timeout": 300,
  "auto_start": true,
  "notifications": true,
  "language": "fr"
}
```

#### Modifier la configuration
```javascript
PUT /api/config
```

**Corps de la requête :**
```json
{
  "theme": "light",
  "auto_lock_timeout": 600
}
```

### Sauvegarde

#### Exporter les données
```javascript
POST /api/backup/export
```

**Corps de la requête :**
```json
{
  "format": "encrypted", // ou "plain" (non recommandé)
  "password": "backup-password"
}
```

**Réponse :**
```json
{
  "backup_data": "base64-encrypted-data",
  "created_at": "2025-01-07T12:30:00Z"
}
```

## SDK JavaScript

### Installation

```bash
npm install electron-authenticator-sdk
```

### Utilisation de base

```javascript
import { ElectronAuthSDK } from 'electron-authenticator-sdk';

const client = new ElectronAuthSDK({
  appPath: '/path/to/electron-authenticator'
});

// Authentification
await client.authenticate('your-master-password');

// Lister les comptes
const accounts = await client.getAccounts();

// Générer un code
const code = await client.generateCode(accounts[0].id);
console.log(`Code: ${code.value} (expire dans ${code.timeRemaining}s)`);

// Ajouter un compte
await client.addAccount({
  name: 'New Service',
  secret: 'JBSWY3DPEHPK3PXP',
  issuer: 'Example Corp'
});
```

### Gestion des erreurs

```javascript
try {
  await client.authenticate('wrong-password');
} catch (error) {
  if (error.code === 'AUTH_FAILED') {
    console.log('Mot de passe incorrect');
  } else if (error.code === 'APP_LOCKED') {
    console.log('Application verrouillée');
  }
}
```

## Webhooks

### Configuration

```javascript
// Configurer un webhook pour les événements
await client.setWebhook({
  url: 'https://your-server.com/webhook',
  events: ['account.added', 'code.generated', 'config.changed'],
  secret: 'webhook-secret'
});
```

### Événements disponibles

#### account.added
```json
{
  "event": "account.added",
  "timestamp": "2025-01-07T12:30:00Z",
  "data": {
    "account_id": "uuid-1234",
    "name": "New Service",
    "issuer": "Example"
  }
}
```

#### code.generated
```json
{
  "event": "code.generated",
  "timestamp": "2025-01-07T12:30:00Z",
  "data": {
    "account_id": "uuid-1234",
    "account_name": "Gmail"
  }
}
```

## Extensions

### Structure d'une extension

```javascript
// manifest.json
{
  "name": "Mon Extension",
  "version": "1.0.0",
  "permissions": ["accounts.read", "codes.generate"],
  "main": "extension.js"
}

// extension.js
class MonExtension {
  async onLoad(api) {
    // Initialisation
    this.api = api;
  }
  
  async onAccountAdded(account) {
    // Réagir à l'ajout d'un compte
    console.log(`Nouveau compte: ${account.name}`);
  }
}

module.exports = MonExtension;
```

### API d'extension

```javascript
// Dans votre extension
const api = this.api;

// Écouter les événements
api.on('account.added', (account) => {
  // Traitement
});

// Accéder aux comptes
const accounts = await api.getAccounts();

// Ajouter des éléments UI
api.addMenuItem({
  label: 'Mon Action',
  click: () => this.handleClick()
});
```

## Limitations et sécurité

### Limitations actuelles
- **Pas d'API réseau** : L'API fonctionne uniquement en local
- **Permissions requises** : L'application doit être déverrouillée
- **Rate limiting** : Maximum 60 requêtes/minute par défaut

### Considérations de sécurité
- Toutes les opérations sont loggées
- Les clés secrètes ne sont jamais exposées via l'API
- Authentification requise pour toutes les opérations sensibles

### Bonnes pratiques
- Toujours valider les entrées utilisateur
- Utiliser HTTPS pour les webhooks
- Stocker les tokens d'accès de manière sécurisée
- Implémenter une gestion d'erreur robuste

---

**Prochaine étape** : [Exemples d'utilisation →](/api/examples)