from src.analyzer import ChatAnalyzer
import pandas as pd
import json

def test_backend():
    print("Testing Backend Data Loading...")
    try:
        analyzer = ChatAnalyzer()
        if not analyzer.load_data():
            print("❌ Could not load data (Database might be empty or locked).")
            return

        print(f"✅ Data loaded. Rows: {len(analyzer.df)}")
        
        print("Testing get_basic_stats...")
        stats = analyzer.get_basic_stats()
        print(f"✅ Basic Stats: {stats.keys()}")
        
        print("Testing get_daily_activity...")
        daily = analyzer.get_daily_activity()
        print(f"✅ Daily Activity: {len(daily)} days")
        
        print("Testing get_hourly_activity...")
        hourly = analyzer.get_hourly_activity()
        print(f"✅ Hourly Activity: {len(hourly)} hours")
        
        print("Testing get_sender_stats...")
        senders = analyzer.get_sender_stats()
        print(f"✅ Sender Stats: {len(senders)} senders")
        
        # Check for NaN values which break JSON
        print("Checking for NaN values...")
        if analyzer.df.isnull().values.any():
            print("⚠️ Warning: DataFrame contains NaN values.")
            print(analyzer.df.isnull().sum())
        else:
            print("✅ No NaN values in DataFrame.")

        print("\n🎉 Backend Logic seems OK!")
        print("If this script runs, the issue is likely that the API Server is not running.")
        print("Run 'start_dashboard.bat' to start the server.")

    except Exception as e:
        print(f"❌ CRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_backend()
