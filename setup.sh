#!/usr/bin/env bash
#
# Air Warfare 3D Simulation — Setup Script
#
# This script checks prerequisites, installs dependencies, and starts the dev server.
# Works on macOS, Linux, and Windows (Git Bash / WSL).
#
# Usage:
#   chmod +x setup.sh
#   ./setup.sh
#

set -e

# ── Colors ──────────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC}  $1"; }
success() { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
fail()    { echo -e "${RED}[FAIL]${NC}  $1"; }

# ── Detect OS ───────────────────────────────────────────────────────────────

detect_os() {
  case "$(uname -s)" in
    Darwin*)  OS="mac";;
    Linux*)   OS="linux";;
    MINGW*|MSYS*|CYGWIN*) OS="windows";;
    *)        OS="unknown";;
  esac
}

# ── Header ──────────────────────────────────────────────────────────────────

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║     Air Warfare 3D Simulation — Setup           ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════╝${NC}"
echo ""

detect_os
info "Detected OS: ${BOLD}$OS${NC}"
echo ""

# ── Check Node.js ───────────────────────────────────────────────────────────

REQUIRED_NODE_MAJOR=18

check_node() {
  if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | sed 's/v//')
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
    if [ "$NODE_MAJOR" -ge "$REQUIRED_NODE_MAJOR" ]; then
      success "Node.js v${NODE_VERSION} found (>= v${REQUIRED_NODE_MAJOR} required)"
      return 0
    else
      warn "Node.js v${NODE_VERSION} found, but v${REQUIRED_NODE_MAJOR}+ is required"
      return 1
    fi
  else
    fail "Node.js is not installed"
    return 1
  fi
}

install_node() {
  echo ""
  info "Attempting to install Node.js..."

  if [ "$OS" = "mac" ]; then
    if command -v brew &> /dev/null; then
      info "Installing Node.js via Homebrew..."
      brew install node
    elif command -v nvm &> /dev/null; then
      info "Installing Node.js via nvm..."
      nvm install 20
      nvm use 20
    else
      fail "Neither Homebrew nor nvm found."
      echo ""
      echo -e "  Install Homebrew first:  ${CYAN}/bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"${NC}"
      echo -e "  Then re-run this script."
      echo ""
      exit 1
    fi

  elif [ "$OS" = "linux" ]; then
    if command -v apt-get &> /dev/null; then
      info "Installing Node.js via apt (NodeSource)..."
      curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
      sudo apt-get install -y nodejs
    elif command -v dnf &> /dev/null; then
      info "Installing Node.js via dnf..."
      sudo dnf install -y nodejs
    elif command -v pacman &> /dev/null; then
      info "Installing Node.js via pacman..."
      sudo pacman -S --noconfirm nodejs npm
    elif command -v nvm &> /dev/null; then
      info "Installing Node.js via nvm..."
      nvm install 20
      nvm use 20
    else
      fail "Could not detect package manager (apt, dnf, pacman, nvm)."
      echo ""
      echo -e "  Install Node.js manually: ${CYAN}https://nodejs.org/en/download${NC}"
      echo ""
      exit 1
    fi

  elif [ "$OS" = "windows" ]; then
    if command -v winget &> /dev/null; then
      info "Installing Node.js via winget..."
      winget install OpenJS.NodeJS.LTS
    else
      fail "winget not found."
      echo ""
      echo -e "  Download Node.js from: ${CYAN}https://nodejs.org/en/download${NC}"
      echo ""
      exit 1
    fi

  else
    fail "Unsupported OS. Install Node.js v${REQUIRED_NODE_MAJOR}+ manually: https://nodejs.org"
    exit 1
  fi

  echo ""
  if check_node; then
    return 0
  else
    fail "Node.js installation failed. Install manually: https://nodejs.org"
    exit 1
  fi
}

if ! check_node; then
  install_node
fi

# ── Check npm ───────────────────────────────────────────────────────────────

if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm -v)
  success "npm v${NPM_VERSION} found"
else
  fail "npm is not installed (it should come with Node.js)"
  echo -e "  Try reinstalling Node.js from ${CYAN}https://nodejs.org${NC}"
  exit 1
fi

echo ""

# ── Navigate to project directory ──────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
info "Project directory: ${BOLD}$SCRIPT_DIR${NC}"

# ── Install dependencies ───────────────────────────────────────────────────

echo ""
if [ -d "node_modules" ] && [ -f "node_modules/.package-lock.json" ]; then
  info "node_modules exists. Checking if up to date..."
  npm install --prefer-offline 2>/dev/null && success "Dependencies are up to date" || {
    warn "Updating dependencies..."
    npm install
    success "Dependencies updated"
  }
else
  info "Installing dependencies (this may take 1-2 minutes)..."
  npm install
  success "Dependencies installed"
fi

# ── Verify build ───────────────────────────────────────────────────────────

echo ""
info "Running TypeScript check..."
if npx tsc --noEmit 2>/dev/null; then
  success "TypeScript compilation OK"
else
  warn "TypeScript errors found (the app may still run in dev mode)"
fi

# ── Summary ────────────────────────────────────────────────────────────────

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║              Setup Complete!                     ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}Start the dev server:${NC}"
echo ""
echo -e "    ${CYAN}npm run dev${NC}"
echo ""
echo -e "  ${GREEN}Then open in your browser:${NC}"
echo ""
echo -e "    ${CYAN}http://localhost:5173${NC}"
echo ""
echo -e "  ${GREEN}Other commands:${NC}"
echo -e "    npm run build     Build for production"
echo -e "    npm run preview   Preview production build"
echo -e "    npm run lint      Run linter"
echo ""

# ── Prompt to start ────────────────────────────────────────────────────────

read -rp "$(echo -e "${YELLOW}Start the dev server now? [Y/n]: ${NC}")" START_NOW
START_NOW=${START_NOW:-Y}

if [[ "$START_NOW" =~ ^[Yy]$ ]]; then
  echo ""
  info "Starting development server..."
  echo ""
  npm run dev
fi
