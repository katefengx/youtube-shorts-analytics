#!/usr/bin/env python3
import pandas as pd
import sys

def check_csv_format(csv_path):
    """Check if a CSV file has the correct format for generate_sub_peaks.py"""
    
    try:
        # Try to read the CSV
        df = pd.read_csv(csv_path)
        print(f"✅ Successfully read CSV file: {csv_path}")
        print(f"📊 File has {len(df)} rows and {len(df.columns)} columns")
        print(f"📋 Columns: {df.columns.tolist()}")
        
        # Check for required columns (first two columns)
        if len(df.columns) < 2:
            print(f"❌ Not enough columns. Need at least 2, got {len(df.columns)}")
            print("💡 The CSV should have at least 2 columns: first for dates, second for metric values")
            return False
        
        date_col = df.columns[0]
        metric_col = df.columns[1]
        
        print(f"✅ Found columns: '{date_col}' (dates) and '{metric_col}' (metric values)")
        
        # Check data types
        try:
            df[date_col] = pd.to_datetime(df[date_col])
            print(f"✅ Date column '{date_col}' can be parsed as datetime")
        except Exception as e:
            print(f"❌ Date column '{date_col}' cannot be parsed: {e}")
            return False
        
        try:
            df[metric_col] = pd.to_numeric(df[metric_col])
            print(f"✅ Metric column '{metric_col}' can be parsed as numeric")
        except Exception as e:
            print(f"❌ Metric column '{metric_col}' cannot be parsed: {e}")
            return False
        
        # Show sample data
        print(f"\n📅 Sample data (first 5 rows):")
        print(df[[date_col, metric_col]].head())
        
        # Check for any issues
        if df[metric_col].isnull().any():
            print(f"⚠️  Warning: Some {metric_col} values are null/missing")
        
        if df[date_col].isnull().any():
            print(f"⚠️  Warning: Some {date_col} values are null/missing")
        
        print("\n✅ CSV format looks good for generate_sub_peaks.py!")
        return True
        
    except Exception as e:
        print(f"❌ Error reading CSV file: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python check_csv_format.py your_file.csv")
        sys.exit(1)
    
    csv_path = sys.argv[1]
    success = check_csv_format(csv_path)
    
    if not success:
        print("\n🔧 To fix this:")
        print("1. Make sure your CSV has at least 2 columns")
        print("2. First column should contain dates in a format like: YYYY-MM-DD or MM/DD/YYYY")
        print("3. Second column should contain numeric metric values")
        print("4. Remove any empty rows or invalid data")
        sys.exit(1) 