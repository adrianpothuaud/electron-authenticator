# Installation

## Prérequis système

- **Windows**: Windows 10 ou plus récent
- **macOS**: macOS 10.14 ou plus récent  
- **Linux**: Ubuntu 18.04+, Fedora 30+, ou distribution équivalente

## Téléchargement

### Releases officielles

Téléchargez la dernière version depuis [GitHub Releases](https://github.com/your-username/electron-authenticator/releases).

::: tip Quelle version choisir ?
- **Windows**: `.exe` pour l'installateur ou `.portable.exe` pour la version portable
- **macOS**: `.dmg` pour l'installation standard
- **Linux**: `.AppImage` pour la version portable ou `.deb`/`.rpm` selon votre distribution
:::

## Installation par plateforme

### Windows

1. Téléchargez le fichier `.exe`
2. Exécutez l'installateur en tant qu'administrateur
3. Suivez les étapes de l'assistant d'installation
4. Lancez l'application depuis le menu Démarrer

### macOS

1. Téléchargez le fichier `.dmg`
2. Ouvrez le fichier DMG
3. Glissez l'application vers le dossier Applications
4. Lancez l'application depuis Launchpad ou Applications

::: warning Sécurité macOS
Si macOS affiche un avertissement de sécurité, allez dans Préférences Système > Sécurité et confidentialité > Général et cliquez sur "Ouvrir quand même".
:::

### Linux

#### AppImage (Recommandé)
1. Téléchargez le fichier `.AppImage`
2. Rendez-le exécutable : `chmod +x Authenticator-*.AppImage`
3. Lancez directement : `./Authenticator-*.AppImage`

#### Debian/Ubuntu (.deb)
```bash
sudo dpkg -i authenticator_*.deb
sudo apt-get install -f  # Si des dépendances manquent
```

#### Fedora/CentOS (.rpm)
```bash
sudo rpm -i authenticator-*.rpm
# ou
sudo dnf install authenticator-*.rpm
```

## Première configuration

1. **Lancez l'application** pour la première fois
2. **Créez un mot de passe principal** sécurisé
3. **Confirmez le mot de passe** 
4. L'application est maintenant prête à être utilisée !

::: danger Important
Le mot de passe principal ne peut pas être récupéré. Assurez-vous de le mémoriser ou de le stocker de manière sécurisée.
:::

## Désinstallation

### Windows
- Via Programmes et fonctionnalités dans le Panneau de configuration
- Ou via Paramètres > Applications

### macOS
- Glissez l'application depuis le dossier Applications vers la Corbeille

### Linux
- **AppImage**: Supprimez simplement le fichier
- **Deb**: `sudo apt remove electron-authenticator`
- **RPM**: `sudo dnm remove electron-authenticator`

---

**Prochaine étape**: [Premiers pas →](/guide/getting-started)