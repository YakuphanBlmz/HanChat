from src.analyzer import ChatAnalyzer
import os

print(f"Current working directory: {os.getcwd()}")
print(f"Checking for database at: data/whatsapp.db")

if os.path.exists("data/whatsapp.db"):
    print("Database file found.")
else:
    print("ERROR: Database file NOT found.")

try:
    analyzer = ChatAnalyzer()
    success = analyzer.load_data()
    if success:
        print(f"Data loaded successfully. Rows: {len(analyzer.df)}")
        print(analyzer.get_basic_stats())
    else:
        print("Failed to load data (analyzer returned False).")
except Exception as e:
    print(f"Exception during loading: {e}")
