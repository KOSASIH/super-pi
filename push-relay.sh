#!/bin/bash
# ==============================================================================
# SUPER-PI: SECURE GITHUB AUTHENTICATION & PUSH RELAY
# ==============================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

cd ~/super-pi || { echo "Directory not found."; exit 1; }

echo -e "\n${CYAN}==========================================================================${NC}"
echo -e "${CYAN} SECURE GITHUB PUSH RELAY INITIATED ${NC}"
echo -e "${CYAN}==========================================================================${NC}\n"

# Prompt for credentials
read -p "Enter your GitHub Username (e.g., Ze0ro99): " GITHUB_USER
echo -e "${YELLOW}Note: When you paste your invisible token, nothing will show on screen for security.${NC}"
read -sp "Enter your GitHub Personal Access Token (PAT): " GITHUB_TOKEN
echo -e "\n"

# Get the current automated branch name
CURRENT_BRANCH=$(git branch --show-current)

echo -e "${YELLOW}[INFO] Establishing secure HTTPS uplink to GitHub...${NC}"
echo -e "${YELLOW}[INFO] Pushing branch: $CURRENT_BRANCH...${NC}"

# Execute Secure Push
if git push "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/Ze0ro99/super-pi.git" "$CURRENT_BRANCH"; then
    echo -e "\n${GREEN}==========================================================================${NC}"
    echo -e "${GREEN} [SUCCESS] PAYLOAD DELIVERED SUCCESSFULLY TO GITHUB! ${NC}"
    echo -e "${GREEN}==========================================================================${NC}"
    echo -e "Your unified ecosystem is now safely backed up."
    echo -e "Click below to seamlessly create your Pull Request:"
    echo -e "${CYAN}https://github.com/Ze0ro99/super-pi/pull/new/$CURRENT_BRANCH${NC}\n"
else
    echo -e "\n${RED}[ERROR] Secure upload rejected. Please verify that your token is correct and has 'repo' permissions.${NC}"
fi
