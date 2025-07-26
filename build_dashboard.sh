#!/bin/bash

echo "🔄 Building dashboard..."
cd dashboard && npm run build && cd ..

echo "🧹 Cleaning up old bundle files..."
rm -f static/dashboard/assets/index-*.js
rm -f static/dashboard/assets/index-*.css
rm -f static/dashboard/index.html

echo "📁 Copying new bundle files..."
cp -r dashboard/dist/assets/* static/dashboard/assets/

echo "🔍 Finding new bundle file names..."
JS_BUNDLE=$(ls static/dashboard/assets/index-*.js | head -1 | xargs basename)
CSS_BUNDLE=$(ls static/dashboard/assets/index-*.css | head -1 | xargs basename)

echo "📝 Updating main index.html with new bundle references..."
echo "JS Bundle: $JS_BUNDLE"
echo "CSS Bundle: $CSS_BUNDLE"

# Update the JavaScript bundle reference in the script check
sed -i '' "s|script\[src\*=\"index-[^\"]*\.js\"\]|script[src*=\"$JS_BUNDLE\"]|g" static/index.html

# Update the JavaScript bundle reference in the script src
sed -i '' "s|script.src = \"/static/dashboard/assets/index-[^\"]*\.js\"|script.src = \"/static/dashboard/assets/$JS_BUNDLE\"|g" static/index.html

# Update the CSS bundle reference
sed -i '' "s|cssLink.href = \"/static/dashboard/assets/index-[^\"]*\.css\"|cssLink.href = \"/static/dashboard/assets/$CSS_BUNDLE\"|g" static/index.html

echo "✅ Dashboard build complete!"
echo "🎯 New bundles: $JS_BUNDLE, $CSS_BUNDLE" 