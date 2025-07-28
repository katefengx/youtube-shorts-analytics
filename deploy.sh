#!/bin/bash

echo "🚀 Deploying to GitHub Pages..."

# Build the dashboard
echo "📦 Building dashboard..."
cd dashboard && npm run build && cd ..

# Create docs directory
echo "📁 Creating docs directory..."
rm -rf docs
mkdir -p docs

# Copy built files
echo "📋 Copying files..."
cp -r dashboard/dist/* docs/
cp static/index.html docs/
cp static/script.js docs/
cp static/style.css docs/
cp static/config.js docs/
cp -r static/assets docs/

# Create a simple index.html for GitHub Pages
echo "📝 Creating GitHub Pages index..."
cat > docs/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube Shorts Analytics</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Your existing HTML content will be here -->
    <script src="config.js"></script>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script src="script.js"></script>
</body>
</html>
EOF

echo "✅ Deployment files ready in docs/ directory!"
echo "📝 Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Navigate to Settings > Pages"
echo "3. Set Source to 'Deploy from a branch'"
echo "4. Select branch: main, folder: /docs"
echo "5. Click Save"
echo ""
echo "🌐 Your site will be available at: https://yourusername.github.io/your-repo-name/" 