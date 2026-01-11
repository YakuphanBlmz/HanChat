import sqlite3

db_path = r'c:\Users\Yakuphan\Desktop\HanChat\data\whatsapp.db'
print(f"Connecting to: {db_path}")

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at TEXT
        )
    ''')
    conn.commit()
    print("Users table checked/created.")
    
    # Check if user exists
    cursor.execute("SELECT * FROM users WHERE username = 'WannaCry'")
    user = cursor.fetchone()
    if user:
        print("Found corrupted user:", user)
        # Delete
        cursor.execute("DELETE FROM users WHERE username = 'WannaCry'")
        conn.commit()
        print("User 'WannaCry' deleted successfully.")
    else:
        print("User 'WannaCry' not found (Safe to register).")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
