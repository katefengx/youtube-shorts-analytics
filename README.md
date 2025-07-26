# YouTube Shorts Analytics Dashboard

A comprehensive analytics dashboard for YouTube Shorts performance, built with Flask backend and React frontend.

## Features

### Dashboard Analytics

- **Real-time Statistics**: Average views, likes, and comments calculated from actual Shorts data
- **Content Analysis**: Hashtag and emoji usage statistics
- **Performance Insights**: Top performing Shorts with view counts
- **Interactive Visualizations**: Scatter plots showing relationships between caption features and performance
- **Data-driven Insights**: All analytics are processed in Python and served via REST API

### Key Metrics

- **Average Views**: 88.4K across all Shorts
- **Average Likes**: 5.6K per Short
- **Average Comments**: 36 per Short
- **Hashtag Usage**: 44.6% of Shorts use hashtags (avg 4.0 per video)
- **Emoji Usage**: 44.8% of Shorts use emojis (avg 1.3 per video)

## Data Processing

All analytics are preprocessed in Python using the `processed_shorts.csv` dataset, which includes:

- Video metadata (ID, title, publish date)
- Performance metrics (views, likes, comments)
- Content features (hashtags, emojis, capitalization, sentiment)
- Temporal analysis (posting frequency, time patterns)

## API Endpoints

- `GET /api/dashboard_data` - Returns processed dashboard statistics
- `GET /api/shorts_data` - Returns raw Shorts data
- `GET /dashboard` - Serves the React dashboard

## Setup and Running

1. **Backend Setup**:

   ```bash
   pip install -r requirements.txt
   python app.py
   ```

2. **Frontend Setup**:

   ```bash
   cd dashboard
   npm install
   npm run build
   cp -r dist/* ../static/dashboard/
   ```

3. **Access Dashboard**:
   - Open `http://localhost:5001/dashboard` in your browser
   - The dashboard will automatically load real data from `processed_shorts.csv`

## Data Sources

The dashboard connects to `data/processed_shorts.csv` which contains 1,289 Shorts with comprehensive analytics including:

- Performance metrics (views, likes, comments)
- Content analysis (hashtags, emojis, sentiment)
- Temporal patterns (posting frequency, time analysis)
- Engagement correlations

## Architecture

- **Backend**: Flask API with pandas data processing
- **Frontend**: React TypeScript with real-time data fetching
- **Data**: CSV-based with Python preprocessing
- **Visualization**: Custom CSS-based charts and graphs

## Verification

Run the verification script to ensure data accuracy:

```bash
python verify_dashboard_data.py
```

This will compare the API output with direct CSV calculations to ensure consistency.
