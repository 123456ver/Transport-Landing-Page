#!/bin/bash
echo "🚀 SwiftLink Kenya - Render Deploy Helper"
echo "=========================================="
echo ""
echo "PREREQUISITES:"
echo "  1. GitHub account"
echo "  2. Render.com account (free at render.com)"
echo "  3. Git installed locally"
echo ""

if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - SwiftLink Kenya transport website"
fi

echo ""
echo "📤 NEXT STEPS:"
echo "   1. Create a new repo on GitHub (don't initialize with README)"
echo "   2. Run these commands:"
echo ""
echo "      git remote add origin https://github.com/YOUR_USERNAME/kenyatransport.git"
echo "      git branch -M main"
echo "      git push -u origin main"
echo ""
echo "   3. Go to https://dashboard.render.com/blueprints"
echo "   4. Click 'New Blueprint Instance'"
echo "   5. Connect your GitHub repo"
echo "   6. Render will read render.yaml and deploy all 3 services automatically"
echo ""
