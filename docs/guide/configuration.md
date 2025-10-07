# Configuration

## Paramètres généraux

### Thème de l'interface

Personnalisez l'apparence selon vos préférences :

```javascript
// Thèmes disponibles
- Clair (par défaut)
- Sombre
- Automatique (suit le système)
```

### Langue de l'interface

L'application est disponible en :
- Français (par défaut)
- Anglais
- Espagnol

## Paramètres de sécurité

### Verrouillage automatique

Configurez le délai avant verrouillage automatique :
- **Immédiat** : Verrouillage dès que l'application perd le focus
- **1 minute** : Recommandé pour la plupart des utilisateurs
- **5 minutes** : Pour un usage fréquent
- **Jamais** : ⚠️ Non recommandé

### Mot de passe principal

#### Changer le mot de passe

1. Allez dans **Paramètres > Sécurité**
2. Cliquez sur **"Changer le mot de passe"**
3. Saisissez l'ancien mot de passe
4. Définissez le nouveau mot de passe
5. Confirmez le changement

::: danger Attention
Changer le mot de passe re-chiffrera toutes vos données. Assurez-vous de mémoriser le nouveau mot de passe.
:::

### Authentification biométrique

Si votre système le supporte :
- **Windows** : Windows Hello (empreinte, reconnaissance faciale)
- **macOS** : Touch ID
- **Linux** : Empreinte digitale (via libfprint)

## Sauvegarde et synchronisation

### Sauvegarde locale

#### Exporter vos données

1. **Paramètres > Sauvegarde**
2. Cliquez sur **"Exporter"**
3. Choisissez un emplacement sécurisé
4. Le fichier sera chiffré avec votre mot de passe

#### Importer des données

1. **Paramètres > Sauvegarde**
2. Cliquez sur **"Importer"**
3. Sélectionnez votre fichier de sauvegarde
4. Saisissez le mot de passe de déchiffrement

### Formats d'export supportés

- **Natif** : Format propriétaire chiffré (.auth)
- **Standard** : Format JSON chiffré (.json)
- **Google Authenticator** : Import depuis export GA

## Paramètres avancés

### Serveur de synchronisation (optionnel)

Pour synchroniser entre plusieurs appareils :

```yaml
# Configuration serveur personnel
server:
  url: "https://votre-serveur.com/sync"
  token: "votre-token-api"
  chiffrement: "aes-256-gcm"
```

::: warning Auto-hébergement uniquement
Aucun service de synchronisation cloud n'est fourni. Vous devez héberger votre propre serveur.
:::

### Performance

#### Cache des codes

```javascript
// Configuration du cache
cache: {
  pregenerate: true,    // Pré-générer les codes
  cleanup_interval: 60, // Nettoyage toutes les 60s
  max_entries: 1000     // Maximum 1000 entrées en cache
}
```

#### Optimisation mémoire

- **Mode économique** : Réduit l'utilisation RAM
- **Mode performance** : Plus rapide mais consomme plus

## Raccourcis clavier

### Raccourcis globaux

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Ouvrir application | `Ctrl + Alt + A` | `Cmd + Option + A` |
| Verrouiller | `Ctrl + L` | `Cmd + L` |
| Rechercher | `Ctrl + F` | `Cmd + F` |

### Raccourcis dans l'application

| Action | Raccourci |
|--------|-----------|
| Ajouter compte | `Ctrl/Cmd + N` |
| Copier code | `Ctrl/Cmd + C` |
| Paramètres | `Ctrl/Cmd + ,` |
| Quitter | `Ctrl/Cmd + Q` |

## Configuration du système

### Démarrage automatique

#### Windows
```batch
# Ajout au registre pour démarrage auto
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run
```

#### macOS
```bash
# Ajout aux éléments de connexion
~/Library/LaunchAgents/
```

#### Linux
```bash
# Fichier .desktop dans autostart
~/.config/autostart/electron-authenticator.desktop
```

### Protocoles URL personnalisés

L'application peut gérer les liens `otpauth://` :

```
otpauth://totp/Service:account@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Service
```

## Dépannage configuration

### Réinitialisation des paramètres

En cas de problème, réinitialisez la configuration :

1. Fermez l'application
2. Supprimez le dossier de configuration :
   - Windows : `%APPDATA%/Electron Authenticator/config/`
   - macOS : `~/Library/Application Support/Electron Authenticator/config/`
   - Linux : `~/.config/Electron Authenticator/config/`
3. Relancez l'application

::: danger Attention
Cette action réinitialise TOUS les paramètres mais préserve vos comptes 2FA.
:::

---

**Prochaine étape** : [Sécurité →](/guide/security)