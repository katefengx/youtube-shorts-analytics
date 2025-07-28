#!/bin/bash

echo "🚀 Deploying simple version to GitHub Pages..."

# Create docs directory
echo "📁 Creating docs directory..."
rm -rf docs
mkdir -p docs

# Copy only the basic files (no React dashboard for now)
echo "📋 Copying basic files..."
cp static/index.html docs/
cp static/script.js docs/
cp static/style.css docs/
cp static/config.js docs/

# Create a simple index.html for GitHub Pages
echo "📝 Creating simple GitHub Pages index..."
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
    <div class="container">
        <header>
            <h1>YouTube Shorts Analytics</h1>
            <p>Analyze your YouTube Shorts performance and subscriber growth patterns</p>
        </header>

        <!-- CHANNEL ANALYSIS SECTION -->
        <section class="page channel-analysis" id="channel-section">
            <h2>Channel Analysis</h2>
            <p>Enter your YouTube channel ID to analyze your Shorts performance</p>
            
            <div class="input-group">
                <input type="text" id="channel-input" placeholder="Enter Channel ID (e.g., UC...)" />
                <button id="analyze-btn">Analyze Channel</button>
            </div>
            
            <div id="progress-section" style="display: none;">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <p id="status-text">Analyzing channel...</p>
            </div>
            
            <div class="error-message" id="error-message" style="display: none;"></div>
        </section>

        <!-- CSV UPLOAD SECTION -->
        <section class="page csv-upload" id="csv-section">
            <div id="csv-lock-overlay">
                Please complete the channel analysis above to unlock this section.
            </div>
            <h2>Subscriber Data Upload</h2>
            <p>Upload your subscriber growth CSV to correlate with Shorts performance</p>
            
            <div class="input-group">
                <input type="file" id="csv-input" accept=".csv" />
                <button id="upload-csv-btn">Upload CSV</button>
            </div>
            
            <div class="error-message" id="csv-error-message" style="display: none;"></div>
        </section>

        <!-- DASHBOARD SECTION -->
        <section class="page dashboard" id="dashboard-section">
            <div id="dashboard-lock-overlay">
                Please complete the channel analysis above to unlock this section.
            </div>
            <h2>Shorts Performance Dashboard</h2>
            <p>Interactive dashboard showing your Shorts analytics</p>
            
            <div id="dashboard-root">
                <p style="text-align: center; color: #666; margin-top: 50px;">
                    Dashboard will be loaded here after channel analysis is complete.
                </p>
            </div>
        </section>

        <!-- ANALYSIS PAGE -->
        <section class="page analytics" id="analytics-section">
            <div id="analytics-lock-overlay">
                Please complete both the channel analysis and CSV upload above to unlock this section.
            </div>
            <h2>Shorts & Subscriber Spikes</h2>
            <p class="chart-subtext">
                Hover over the line for subscriber counts by day<br />
                Circle markers include recent Shorts information for that subscriber spike
            </p>

            <!-- Time‐series SVG -->
            <svg id="time-series"></svg>
            <div id="tooltip" class="tooltip"></div>
        </section>
    </div>

    <script src="config.js"></script>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script src="script.js"></script>
</body>
</html>
EOF

echo "✅ Simple deployment files ready in docs/ directory!"
echo "📝 Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Navigate to Settings > Pages"
echo "3. Set Source to 'Deploy from a branch'"
echo "4. Select branch: main, folder: /docs"
echo "5. Click Save"
echo ""
echo "🌐 Your site will be available at: https://yourusername.github.io/your-repo-name/"
echo ""
echo "⚠️  Note: This is a simplified version. You'll need to deploy your Flask backend separately." 