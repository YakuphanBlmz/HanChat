import sqlite3
import os

db_path = "data/whatsapp.db"
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit()

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- Tables ---")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
for t in tables:
    print(f"- {t[0]}")

print("\n--- Online History Schema ---")
try:
    cursor.execute("PRAGMA table_info(online_history)")
    cols = cursor.fetchall()
    for c in cols:
        print(c)
except Exception as e:
    print(e)

print("\n--- Online History Records ---")
try:
    cursor.execute("SELECT id, phone_number, start_time, duration_seconds FROM online_history ORDER BY id DESC LIMIT 5")
    rows = cursor.fetchall()
    if rows:
        for r in rows:
            print(r)
    else:
        print("No records found.")
except Exception as e:
    print(e)

conn.close()
