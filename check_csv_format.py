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
        
        # Check for required columns
        required_columns = ["Date", "Subscribers"]
        missing_columns = []
        
        for col in required_columns:
            if col not in df.columns:
                missing_columns.append(col)
        
        if missing_columns:
            print(f"❌ Missing required columns: {missing_columns}")
            print("💡 The CSV should have columns: 'Date' and 'Subscribers'")
            return False
        else:
            print("✅ All required columns found!")
        
        # Check data types
        try:
            df["Date"] = pd.to_datetime(df["Date"])
            print("✅ Date column can be parsed as datetime")
        except Exception as e:
            print(f"❌ Date column cannot be parsed: {e}")
            return False
        
        try:
            df["Subscribers"] = pd.to_numeric(df["Subscribers"])
            print("✅ Subscribers column can be parsed as numeric")
        except Exception as e:
            print(f"❌ Subscribers column cannot be parsed: {e}")
            return False
        
        # Show sample data
        print("\n📅 Sample data (first 5 rows):")
        print(df[["Date", "Subscribers"]].head())
        
        # Check for any issues
        if df["Subscribers"].isnull().any():
            print("⚠️  Warning: Some subscriber values are null/missing")
        
        if df["Date"].isnull().any():
            print("⚠️  Warning: Some date values are null/missing")
        
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
        print("1. Make sure your CSV has columns named exactly 'Date' and 'Subscribers'")
        print("2. Date should be in a format like: YYYY-MM-DD or MM/DD/YYYY")
        print("3. Subscribers should be numeric values")
        print("4. Remove any empty rows or invalid data")
        sys.exit(1) 