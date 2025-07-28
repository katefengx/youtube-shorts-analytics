# YouTube Shorts Analytics - Deployment Guide

This guide explains how to deploy your YouTube Shorts Analytics application to GitHub Pages with a separate backend.

## Architecture

- **Frontend**: React dashboard served from GitHub Pages
- **Backend**: Flask API server (needs separate deployment)
- **Communication**: Frontend makes API calls to backend

## Frontend Deployment (GitHub Pages)

### 1. Enable GitHub Pages

1. Go to your GitHub repository
2. Navigate to Settings > Pages
3. Set Source to "GitHub Actions"
4. The workflow will automatically deploy when you push to main

### 2. Update Backend URL

Before deploying, update the backend URL in these files:

- `dashboard/src/config.ts` - Update `production.apiBaseUrl`
- `static/config.js` - Update `production.apiBaseUrl`

Replace `https://your-backend-url.com` with your actual backend URL.

### 3. Deploy

```bash
# Commit and push your changes
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

The GitHub Actions workflow will automatically:

1. Build the React dashboard
2. Copy static files to docs/
3. Deploy to GitHub Pages

Your site will be available at: `https://yourusername.github.io/your-repo-name/`

## Backend Deployment Options

Since your Flask backend needs to process YouTube API data, you have several deployment options:

### Option 1: Railway (Recommended for beginners)

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Set environment variables:
   - `API_KEY`: Your YouTube API key
4. Deploy

### Option 2: Render

1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your repository
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `python app.py`
6. Add environment variables

### Option 3: Heroku

1. Create a `Procfile`:
   ```
   web: python app.py
   ```
2. Deploy using Heroku CLI or GitHub integration

### Option 4: DigitalOcean App Platform

1. Go to DigitalOcean App Platform
2. Connect your repository
3. Configure as a Python app
4. Set environment variables

## Environment Variables

Your backend needs these environment variables:

```bash
API_KEY=your_youtube_api_key_here
```

## CORS Configuration

The Flask app already has CORS enabled, but make sure your backend allows requests from your GitHub Pages domain:

```python
# In app.py
CORS(app, origins=["https://yourusername.github.io"])
```

## Testing

1. **Local Development**:

   - Frontend: `cd dashboard && npm run dev`
   - Backend: `python app.py`
   - Both will use localhost URLs

2. **Production**:
   - Frontend: GitHub Pages URL
   - Backend: Your deployed backend URL
   - Frontend will automatically detect environment and use correct URLs

## Troubleshooting

### CORS Errors

- Ensure your backend allows requests from your GitHub Pages domain
- Check that the backend URL is correct in config files

### API Key Issues

- Make sure your YouTube API key is set in the backend environment
- Verify the API key has the necessary permissions

### Build Failures

- Check GitHub Actions logs for build errors
- Ensure all dependencies are in package.json

## Security Notes

- Never commit your API key to the repository
- Use environment variables for sensitive data
- Consider rate limiting for your API endpoints
