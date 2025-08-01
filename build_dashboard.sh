#!/bin/bash

echo "🔄 Building dashboard..."
cd dashboard && npm run build && cd ..

echo "🧹 Cleaning up old bundle files..."
rm -f static/dashboard/assets/index-*.js
rm -f static/dashboard/assets/index-*.css
rm -f static/dashboard/index.html

echo "📁 Copying new bundle files..."
cp -r dashboard/dist/assets/* static/dashboard/assets/
cp dashboard/dist/index.html static/dashboard/

echo "📝 Updating main index.html with predictable bundle references..."
echo "JS Bundle: index.js"
echo "CSS Bundle: index.css"

# Update the JavaScript bundle reference in the script check
sed -i '' "s|script\[src\*=\"index-[^\"]*\.js\"\]|script[src*=\"index.js\"]|g" static/index.html

# Update the JavaScript bundle reference in the script src
sed -i '' "s|script.src = \"/static/dashboard/assets/index-[^\"]*\.js\"|script.src = \"/dashboard/assets/index.js\"|g" static/index.html

# Update the CSS bundle reference
sed -i '' "s|cssLink.href = \"/static/dashboard/assets/index-[^\"]*\.css\"|cssLink.href = \"/dashboard/assets/index.css\"|g" static/index.html

echo "✅ Dashboard build complete!"
echo "🎯 New bundles: index.js, index.css" 