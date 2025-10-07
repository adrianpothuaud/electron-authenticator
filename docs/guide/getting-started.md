# Premiers pas

## Interface principale

Après avoir configuré votre mot de passe principal, vous arriverez sur l'interface principale d'Electron Authenticator.

### Vue d'ensemble

L'interface est composée de :
- **Barre de recherche** : Pour trouver rapidement vos comptes
- **Liste des comptes** : Tous vos services 2FA configurés
- **Boutons d'action** : Ajouter, modifier, supprimer des comptes
- **Indicateur de temps** : Temps restant avant expiration du code

## Ajouter votre premier compte

### Méthode 1 : QR Code

1. Cliquez sur **"Ajouter un compte"**
2. Sélectionnez **"Scanner QR Code"**
3. Autorisez l'accès à la caméra si demandé
4. Pointez la caméra vers le QR code affiché par le service
5. Le compte sera automatiquement ajouté

### Méthode 2 : Clé secrète manuelle

1. Cliquez sur **"Ajouter un compte"**
2. Sélectionnez **"Saisie manuelle"**
3. Remplissez les informations :
   - **Nom du service** (ex: Gmail, GitHub)
   - **Nom du compte** (ex: votre email)
   - **Clé secrète** (fournie par le service)
4. Cliquez sur **"Ajouter"**

::: tip Où trouver la clé secrète ?
La plupart des services affichent la clé secrète à côté du QR code lors de la configuration 2FA. Cherchez un texte comme "Clé secrète", "Secret key" ou une longue chaîne de caractères.
:::

## Utiliser les codes d'authentification

### Générer un code

Les codes sont générés automatiquement et se renouvellent toutes les 30 secondes.

1. **Trouvez votre service** dans la liste
2. **Copiez le code** en cliquant dessus
3. **Collez le code** dans le champ d'authentification du service

### Indicateur de temps

Une barre de progression ou un compteur indique le temps restant avant expiration du code :
- **Vert** : Plus de 20 secondes restantes
- **Orange** : Entre 10 et 20 secondes
- **Rouge** : Moins de 10 secondes (nouveau code bientôt disponible)

## Organiser vos comptes

### Recherche

Utilisez la barre de recherche en haut pour trouver rapidement un compte :
- Tapez le nom du service (ex: "gmail")
- Ou le nom du compte (ex: votre email)

### Tri et groupement

Les comptes sont automatiquement triés par :
1. Fréquence d'utilisation
2. Ordre alphabétique

### Favoris

Marquez vos comptes les plus utilisés comme favoris pour les afficher en haut de la liste.

## Sauvegarde et sécurité

### Sauvegarde automatique

Vos données sont automatiquement sauvegardées localement et chiffrées avec votre mot de passe principal.

### Emplacement des données

- **Windows** : `%APPDATA%/Electron Authenticator/`
- **macOS** : `~/Library/Application Support/Electron Authenticator/`
- **Linux** : `~/.config/Electron Authenticator/`

::: warning Sauvegarde manuelle
Il est recommandé de sauvegarder régulièrement vos données. Vous pouvez exporter vos comptes depuis les paramètres de l'application.
:::

## Paramètres de l'application

Accédez aux paramètres via le menu ou le raccourci `Ctrl/Cmd + ,` :

- **Thème** : Clair ou sombre
- **Démarrage automatique** : Lancer au démarrage du système
- **Notifications** : Alertes pour les codes expirés
- **Sécurité** : Délai de verrouillage automatique

---

**Prochaine étape** : [Configuration avancée →](/guide/configuration)