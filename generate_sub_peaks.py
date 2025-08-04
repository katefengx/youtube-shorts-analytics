#!/usr/bin/env python3
import pandas as pd
from scipy.signal import find_peaks
import sys

# Usage: python generate_sub_peaks.py sub_day.csv output_sub_peaks.csv

if len(sys.argv) != 3:
    print("Usage: python generate_sub_peaks.py sub_day.csv output_sub_peaks.csv")
    sys.exit(1)

def find_date_column(df):
    """Find the date column with flexible matching"""
    possible_date_cols = []
    for col in df.columns:
        col_lower = col.lower()
        if 'date' in col_lower or 'time' in col_lower:
            possible_date_cols.append(col)
    return possible_date_cols

def find_subscriber_column(df):
    """Find the subscriber column with flexible matching"""
    possible_sub_cols = []
    for col in df.columns:
        col_lower = col.lower()
        if 'subscriber' in col_lower or 'sub' in col_lower or 'followers' in col_lower:
            possible_sub_cols.append(col)
    return possible_sub_cols

try:
    # First try the exact expected format
    try:
        sub_day = pd.read_csv(sys.argv[1], parse_dates=["Date"]).sort_values("Date").set_index("Date")
        series = sub_day["Subscribers"]
        print("Successfully read with exact column names")
    except Exception as e:
        print(f"Could not read with exact column names: {e}")
        
        # Try to read the file and find the right columns
        df = pd.read_csv(sys.argv[1])
        print(f"Available columns: {df.columns.tolist()}")
        
        # Find date column
        date_cols = find_date_column(df)
        if not date_cols:
            print("❌ No date column found. Looking for columns with 'date' or 'time' in the name.")
            sys.exit(1)
        
        # Find subscriber column
        sub_cols = find_subscriber_column(df)
        if not sub_cols:
            print("❌ No subscriber column found. Looking for columns with 'subscriber', 'sub', or 'followers' in the name.")
            sys.exit(1)
        
        # Use the first matching columns
        date_col = date_cols[0]
        sub_col = sub_cols[0]
        
        print(f"Using date column: '{date_col}'")
        print(f"Using subscriber column: '{sub_col}'")
        
        # Try to parse the date column
        try:
            df[date_col] = pd.to_datetime(df[date_col])
        except Exception as e:
            print(f"❌ Could not parse date column '{date_col}': {e}")
            print("Make sure dates are in a recognizable format (YYYY-MM-DD, MM/DD/YYYY, etc.)")
            sys.exit(1)
        
        # Try to parse the subscriber column
        try:
            df[sub_col] = pd.to_numeric(df[sub_col], errors='coerce')
            # Remove rows with NaN values
            df = df.dropna(subset=[sub_col])
        except Exception as e:
            print(f"❌ Could not parse subscriber column '{sub_col}': {e}")
            print("Make sure subscriber values are numeric")
            sys.exit(1)
        
        # Sort by date and set as index
        df = df.sort_values(date_col).set_index(date_col)
        series = df[sub_col]
        
        print(f"✅ Successfully processed {len(series)} data points")
        print(f"Date range: {series.index.min()} to {series.index.max()}")
        print(f"Subscriber range: {series.min():.0f} to {series.max():.0f}")

except Exception as e:
    print(f"❌ Error reading input file: {e}")
    try:
        df = pd.read_csv(sys.argv[1])
        print(f"File has {len(df)} rows and columns: {df.columns.tolist()}")
    except Exception as e2:
        print(f"Could not read file at all: {e2}")
    sys.exit(1)

# Check if we have enough data
if len(series) < 5:
    print(f"❌ Error: Not enough data points. Need at least 5, got {len(series)}")
    sys.exit(1)

# Check if we have any variation in the data
if series.std() == 0:
    print("❌ Error: No variation in subscriber data. Cannot detect peaks.")
    sys.exit(1)

# Try to find peaks with different thresholds
thresholds = [
    series.mean() + series.std(),  # Default threshold
    series.mean() + 0.5 * series.std(),  # Lower threshold
    series.mean() + 0.1 * series.std(),  # Much lower threshold
]

peaks = None
for threshold in thresholds:
    try:
        peaks, props = find_peaks(series, height=threshold, distance=2)
        if len(peaks) > 0:
            print(f"Found {len(peaks)} peaks with threshold {threshold:.0f}")
            break
    except Exception as e:
        print(f"Error with threshold {threshold}: {e}")
        continue

if peaks is None or len(peaks) == 0:
    print("⚠️  Warning: No peaks found. This might mean:")
    print("- The data doesn't have enough variation")
    print("- The data is too short")
    print("- The subscriber growth is too steady")
    # Create an empty file
    empty_df = pd.DataFrame(columns=["date", "value"])
    empty_df.to_csv(sys.argv[2], index=False)
    print("Created empty peaks file.")
else:
    peak_df = pd.DataFrame({
        "date": series.index[peaks],
        "value": series.values[peaks].round().astype(int)
    })
    peak_df.to_csv(sys.argv[2], index=False)
    print(f"✅ Found {len(peaks)} peaks and saved to {sys.argv[2]}")
    print(f"Peak dates: {peak_df['date'].dt.strftime('%Y-%m-%d').tolist()}") 