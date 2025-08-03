#!/usr/bin/env python3
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import emoji
from textblob import TextBlob
import re

def generate_mock_processed_shorts():
    """Generate mock processed_shorts.csv with proper format and data"""
    
    # Set random seed for reproducibility
    np.random.seed(42)
    random.seed(42)
    
    # Generate 30 days of data with realistic posting patterns
    start_date = datetime(2024, 1, 1)
    end_date = datetime(2024, 1, 30)
    
    # Create realistic posting schedule (more posts on weekdays)
    posting_days = []
    current_date = start_date
    while current_date <= end_date:
        # More likely to post on weekdays (Monday-Friday)
        if current_date.weekday() < 5:  # Monday = 0, Friday = 4
            if random.random() < 0.8:  # 80% chance on weekdays
                posting_days.append(current_date)
        else:  # Weekend
            if random.random() < 0.4:  # 40% chance on weekends
                posting_days.append(current_date)
        current_date += timedelta(days=1)
    
    # Generate mock data
    data = []
    video_id_counter = 1
    
    for post_date in posting_days:
        # Generate realistic view counts (higher on weekdays)
        base_views = 15000 if post_date.weekday() < 5 else 12000
        view_count = int(np.random.normal(base_views, base_views * 0.3))
        view_count = max(view_count, 1000)  # Minimum 1000 views
        
        # Generate likes (typically 1-3% of views)
        like_rate = np.random.uniform(0.01, 0.03)
        like_count = int(view_count * like_rate)
        
        # Generate comments (typically 0.1-0.5% of views)
        comment_rate = np.random.uniform(0.001, 0.005)
        comment_count = int(view_count * comment_rate)
        
        # Generate duration (30-60 seconds for Shorts)
        duration_seconds = random.randint(30, 60)
        
        # Generate realistic titles with hashtags and emojis
        titles = [
            "Amazing sunset view! 🌅 #nature #beautiful",
            "Cooking tutorial for beginners 👨‍🍳 #cooking #tutorial",
            "Morning workout routine 💪 #fitness #workout",
            "Travel vlog from Paris 🇫🇷 #travel #adventure",
            "Quick makeup tutorial 💄 #beauty #makeup",
            "Study tips for students 📚 #study #education",
            "Pet compilation 🐕 #pets #cute",
            "Tech review of new phone 📱 #tech #review",
            "Dance challenge 🕺 #dance #challenge",
            "Life hacks you need to know 💡 #lifehacks #tips",
            "Gaming highlights 🎮 #gaming #highlights",
            "Fashion haul 👗 #fashion #style",
            "Music cover 🎵 #music #cover",
            "Comedy skit 😂 #comedy #funny",
            "DIY project tutorial 🔧 #diy #crafts"
        ]
        
        title = random.choice(titles)
        
        # Calculate engagement rate
        engagement_rate = (comment_count * 0.7842535737762139 + like_count * 0.21574642622378612) / view_count
        
        # Process title for features
        has_hashtags = '#' in title
        hashtag_count = title.count('#')
        has_emojis = emoji.emoji_count(title) > 0
        emoji_count = emoji.emoji_count(title)
        
        # Clean title (remove hashtags)
        clean_title = re.sub(r'#\S+', '', title).strip()
        
        # Calculate sentiment
        blob = TextBlob(clean_title)
        sentiment_polarity = blob.sentiment.polarity
        sentiment = 'positive' if sentiment_polarity > 0 else 'negative' if sentiment_polarity < 0 else 'neutral'
        
        # Calculate word count
        num_words = len(clean_title.split())
        
        # Format dates
        published_at = post_date.replace(hour=random.randint(8, 20), minute=random.randint(0, 59))
        date = post_date.date()
        time = published_at.time()
        hour = published_at.hour
        day_of_week = post_date.strftime('%A')  # Full day name
        
        data.append({
            'video_id': f'video_{video_id_counter:03d}',
            'title': title,
            'published_at': published_at.isoformat() + 'Z',
            'date': str(date),
            'time': str(time),
            'hour': hour,
            'duration_seconds': duration_seconds,
            'view_count': view_count,
            'like_count': like_count,
            'comment_count': comment_count,
            'engagement_rate': engagement_rate,
            'has_hashtags': has_hashtags,
            'hashtag_count': hashtag_count,
            'has_emojis': has_emojis,
            'emoji_count': emoji_count,
            'clean_title': clean_title,
            'num_words': num_words,
            'sentiment_polarity': sentiment_polarity,
            'sentiment': sentiment,
            'day_of_week': day_of_week
        })
        
        video_id_counter += 1
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Save to CSV
    df.to_csv('data/processed_shorts.csv', index=False)
    print(f"Generated {len(df)} mock Shorts records")
    print(f"Date range: {df['date'].min()} to {df['date'].max()}")
    print(f"Total views: {df['view_count'].sum():,}")
    print(f"Average views: {df['view_count'].mean():,.0f}")
    print(f"Posting schedule: {df['day_of_week'].value_counts().to_dict()}")
    print(f"Average views per day: {df.groupby('day_of_week')['view_count'].mean().to_dict()}")

if __name__ == "__main__":
    generate_mock_processed_shorts() 