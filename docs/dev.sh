#!/bin/bash

# Script de développement pour la documentation Electron Authenticator

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'aide
show_help() {
    echo -e "${BLUE}📖 Script de développement - Documentation Electron Authenticator${NC}"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  install     Installer les dépendances"
    echo "  dev         Lancer le serveur de développement"
    echo "  build       Construire le site pour la production"
    echo "  preview     Prévisualiser le build de production"
    echo "  check       Vérifier les liens et la syntaxe"
    echo "  clean       Nettoyer les fichiers de build"
    echo "  help        Afficher cette aide"
    echo ""
    echo "Examples:"
    echo "  $0 dev      # Lance le serveur de développement"
    echo "  $0 build    # Construit le site"
    echo ""
}

# Vérifier que nous sommes dans le bon dossier
check_directory() {
    if [[ ! -f "package.json" ]]; then
        echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis le dossier docs/${NC}"
        exit 1
    fi
}

# Installer les dépendances
install_deps() {
    echo -e "${BLUE}📦 Installation des dépendances...${NC}"
    
    if command -v npm &> /dev/null; then
        npm install
    elif command -v yarn &> /dev/null; then
        yarn install
    else
        echo -e "${RED}❌ Erreur: npm ou yarn requis${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Dépendances installées${NC}"
}

# Lancer le serveur de développement
dev_server() {
    echo -e "${BLUE}🚀 Lancement du serveur de développement...${NC}"
    echo -e "${YELLOW}📍 Le site sera disponible sur http://localhost:5173${NC}"
    echo -e "${YELLOW}📝 Appuyez sur Ctrl+C pour arrêter${NC}"
    echo ""
    
    npm run docs:dev
}

# Construire le site
build_site() {
    echo -e "${BLUE}🔨 Construction du site...${NC}"
    
    npm run docs:build
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✅ Site construit avec succès dans .vitepress/dist/${NC}"
    else
        echo -e "${RED}❌ Erreur lors de la construction${NC}"
        exit 1
    fi
}

# Prévisualiser le build
preview_build() {
    echo -e "${BLUE}👀 Prévisualisation du build...${NC}"
    
    if [[ ! -d ".vitepress/dist" ]]; then
        echo -e "${YELLOW}⚠️  Aucun build trouvé, construction en cours...${NC}"
        build_site
    fi
    
    echo -e "${YELLOW}📍 Prévisualisation disponible sur http://localhost:4173${NC}"
    npm run docs:preview
}

# Vérifier les liens et la syntaxe
check_docs() {
    echo -e "${BLUE}🔍 Vérification de la documentation...${NC}"
    
    # Vérifier la syntaxe markdown
    echo "Vérification de la syntaxe markdown..."
    if command -v markdownlint &> /dev/null; then
        markdownlint **/*.md || echo -e "${YELLOW}⚠️  markdownlint non installé, passage ignoré${NC}"
    else
        echo -e "${YELLOW}⚠️  markdownlint non installé${NC}"
    fi
    
    # Vérifier les liens
    echo "Vérification des liens..."
    if command -v markdown-link-check &> /dev/null; then
        find . -name "*.md" -not -path "./node_modules/*" -not -path "./.vitepress/*" -exec markdown-link-check {} \;
    else
        echo -e "${YELLOW}⚠️  markdown-link-check non installé${NC}"
        echo "Installation: npm install -g markdown-link-check"
    fi
    
    echo -e "${GREEN}✅ Vérification terminée${NC}"
}

# Nettoyer les fichiers de build
clean_build() {
    echo -e "${BLUE}🧹 Nettoyage des fichiers de build...${NC}"
    
    rm -rf .vitepress/dist
    rm -rf .vitepress/cache
    rm -rf node_modules/.vitepress
    
    echo -e "${GREEN}✅ Nettoyage terminé${NC}"
}

# Script principal
main() {
    check_directory
    
    case "${1:-help}" in
        install|i)
            install_deps
            ;;
        dev|d)
            dev_server
            ;;
        build|b)
            build_site
            ;;
        preview|p)
            preview_build
            ;;
        check|c)
            check_docs
            ;;
        clean)
            clean_build
            ;;
        help|h|--help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}❌ Commande inconnue: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Exécuter le script principal
main "$@"