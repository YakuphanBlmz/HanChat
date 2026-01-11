import sqlite3
import json
import logging
import os
import hashlib
from typing import List, Any
from src.models import Message
from datetime import datetime

# Try importing psycopg2 for Postgres support
try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    psycopg2 = None

class DatabaseManager:
    def __init__(self, db_path="data/whatsapp.db"):
        self.db_path = db_path
        self.db_url = os.getenv("DATABASE_URL")
        self.data_dir = os.path.dirname(db_path)
        
        # Determine DB Type
        if self.db_url:
            self.db_type = 'postgres'
            if not psycopg2:
                logging.warning("DATABASE_URL is set but psycopg2 is not installed. Falling back to SQLite.")
                self.db_type = 'sqlite'
        else:
            self.db_type = 'sqlite'
            # Ensure data directory exists for SQLite
            if self.data_dir and not os.path.exists(self.data_dir):
                os.makedirs(self.data_dir, exist_ok=True)

        self.init_db()
        self.init_tracking_db()
        self.init_users_db()
        self.init_contact_db()

    def get_connection(self):
        """Returns a database connection based on configured type."""
        if self.db_type == 'postgres':
            try:
                conn = psycopg2.connect(self.db_url)
                return conn
            except Exception as e:
                logging.error(f"Postgres Connection Failed: {e}")
                raise e
        else:
            return sqlite3.connect(self.db_path)

    def _execute(self, cursor, query: str, params: tuple = ()):
        """Executes a query, handling placeholder differences."""
        if self.db_type == 'postgres':
            # Convert SQLite ? placeholders to Postgres %s
            query = query.replace('?', '%s')
            cursor.execute(query, params)
        else:
            cursor.execute(query, params)

    def init_users_db(self):
        """Initializes the users table."""
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            
            if self.db_type == 'postgres':
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS users (
                        id SERIAL PRIMARY KEY,
                        username TEXT UNIQUE,
                        email TEXT UNIQUE,
                        hashed_password TEXT,
                        created_at TEXT,
                        is_admin BOOLEAN DEFAULT FALSE
                    )
                ''')
            else:
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE,
                        email TEXT UNIQUE,
                        hashed_password TEXT,
                        created_at TEXT,
                        is_admin BOOLEAN DEFAULT 0
                    )
                ''')
            
            # Migration: Add is_admin if not exists
            if self.db_type == 'postgres':
                cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name='users'")
                columns = [row[0] for row in cursor.fetchall()]
                if "is_admin" not in columns:
                    cursor.execute("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE")
            else:
                cursor.execute("PRAGMA table_info(users)")
                columns = [info[1] for info in cursor.fetchall()]
                if "is_admin" not in columns:
                    cursor.execute("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0")
            
            conn.commit()
        except Exception as e:
            print(f"Init Users DB Error: {e}")
        finally:
            conn.close()

    def init_db(self):
        """Initializes the messages table."""
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            
            # Table Creation
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS messages (
                    id TEXT PRIMARY KEY,
                    user_id INTEGER,
                    sender TEXT,
                    content TEXT,
                    timestamp TEXT,
                    type TEXT,
                    is_group BOOLEAN
                    -- Foreign key logic handled loosely or added via ALTER if needed to keep simple
                )
            ''')
            
            # Indexes (Syntax is mostly compatible)
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages (user_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages (timestamp)')

            # Schema Migration for user_id (Check columns)
            try:
                if self.db_type == 'sqlite':
                    cursor.execute("PRAGMA table_info(messages)")
                    columns = [info[1] for info in cursor.fetchall()]
                    if "user_id" not in columns:
                        cursor.execute("ALTER TABLE messages ADD COLUMN user_id INTEGER")
                        cursor.execute('CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages (user_id)')
                else: 
                    # Postgres column check
                    cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name='messages'")
                    columns = [row[0] for row in cursor.fetchall()]
                    if "user_id" not in columns:
                        cursor.execute("ALTER TABLE messages ADD COLUMN user_id INTEGER")
                        cursor.execute('CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages (user_id)')
            except Exception as e:
                print(f"Migration warning: {e}")

            conn.commit()
        except Exception as e:
            print(f"Init Messages DB Error: {e}")
        finally:
            conn.close()

    def save_message(self, msg: Message, user_id: int):
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            
            if not msg.id:
                unique_str = f"{msg.sender}{msg.content}{msg.timestamp}"
                msg.id = hashlib.md5(unique_str.encode()).hexdigest()

            if self.db_type == 'postgres':
                query = '''
                    INSERT INTO messages (id, user_id, sender, content, timestamp, type, is_group)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                '''
                cursor.execute(query, (msg.id, user_id, msg.sender, msg.content, msg.timestamp.isoformat(), msg.type, msg.is_group))
            else:
                query = '''
                    INSERT OR IGNORE INTO messages (id, user_id, sender, content, timestamp, type, is_group)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                '''
                cursor.execute(query, (msg.id, user_id, msg.sender, msg.content, msg.timestamp.isoformat(), msg.type, msg.is_group))
            
            rows_affected = cursor.rowcount
            conn.commit()
            return rows_affected > 0 # Rowcount might be -1 in some drivers if no count, but usually fine
        except Exception as e:
            logging.error(f"Error saving message: {e}")
            return False
        finally:
            conn.close()

    def get_messages(self, user_id: int, sender_filter: str = None) -> List[dict]:
        conn = self.get_connection()
        try:
            # Set Row Factory for SQLite, use DictCursor for Pg
            if self.db_type == 'sqlite':
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
            else:
                cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            if sender_filter:
                self._execute(cursor, "SELECT * FROM messages WHERE user_id = ? AND sender = ? ORDER BY timestamp", (user_id, sender_filter))
            else:
                self._execute(cursor, "SELECT * FROM messages WHERE user_id = ? ORDER BY timestamp", (user_id,))
                
            rows = cursor.fetchall()
            if self.db_type == 'sqlite':
                return [dict(row) for row in rows]
            return [dict(row) for row in rows] # RealDictCursor returns dict-like objects
        except Exception as e:
            print(f"Get Messages Error: {e}")
            return []
        finally:
            conn.close()

    def init_tracking_db(self):
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            
            if self.db_type == 'postgres':
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS online_history (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER,
                        phone_number TEXT,
                        contact_name TEXT,
                        start_time TEXT,
                        end_time TEXT,
                        duration_seconds INTEGER,
                        online_intervals TEXT,
                        events TEXT,
                        status TEXT
                    )
                ''')
            else:
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS online_history (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER,
                        phone_number TEXT,
                        contact_name TEXT,
                        start_time TEXT,
                        end_time TEXT,
                        duration_seconds INTEGER,
                        online_intervals TEXT,
                        events TEXT,
                        status TEXT,
                        FOREIGN KEY (user_id) REFERENCES users (id)
                    )
                ''')
            
            # Indexes
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_history_user_id ON online_history (user_id)')
            conn.commit()
        except Exception as e:
            print(f"Init Tracking DB Error: {e}")
        finally:
            conn.close()

    def init_contact_db(self):
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            
            if self.db_type == 'postgres':
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS contact_messages (
                        id SERIAL PRIMARY KEY,
                        name TEXT,
                        surname TEXT,
                        email TEXT,
                        subject TEXT,
                        message TEXT,
                        timestamp TEXT
                    )
                ''')
            else:
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS contact_messages (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT,
                        surname TEXT,
                        email TEXT,
                        subject TEXT,
                        message TEXT,
                        timestamp TEXT
                    )
                ''')
            
            conn.commit()
        except Exception as e:
            print(f"Init Contact DB Error: {e}")
        finally:
            conn.close()

    def save_contact_message(self, name, surname, email, subject, message):
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            query = '''
                INSERT INTO contact_messages (name, surname, email, subject, message, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            '''
            self._execute(cursor, query, (name, surname, email, subject, message, datetime.now().isoformat()))
            conn.commit()
            return True
        except Exception as e:
            print(f"Error saving contact message: {e}")
            return False
        finally:
            conn.close()

    def save_tracking_record(self, user_id, phone_number, start_time, end_time, duration, intervals, status, contact_name=None, events=None):
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            if events is None: events = []
            
            query = '''
                INSERT INTO online_history 
                (user_id, phone_number, contact_name, start_time, end_time, duration_seconds, online_intervals, events, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            '''
            self._execute(cursor, query, (user_id, phone_number, contact_name, start_time, end_time, duration, json.dumps(intervals), json.dumps(events), status))
            
            conn.commit()
            return True
        except Exception as e:
            print(f"Error saving tracking record: {e}")
            return False
        finally:
            conn.close()

    def get_tracking_history(self, user_id: int):
        conn = self.get_connection()
        try:
            if self.db_type == 'sqlite':
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
            else:
                cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            self._execute(cursor, 'SELECT * FROM online_history WHERE user_id = ? ORDER BY start_time DESC', (user_id,))
            rows = cursor.fetchall()
            
            history = []
            for row in rows:
                d = dict(row)
                # Parse JSON fields
                for field in ['online_intervals', 'events']:
                    if d.get(field):
                        try:
                            if isinstance(d[field], str):
                                d[field] = json.loads(d[field])
                        except:
                            d[field] = []
                    else:
                        d[field] = []
                history.append(d)
            
            return history
        except Exception as e:
            print(f"Error fetching history: {e}")
            return []
        finally:
            conn.close()

    def delete_tracking_record(self, record_id: int, user_id: int):
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            self._execute(cursor, "DELETE FROM online_history WHERE id = ? AND user_id = ?", (record_id, user_id))
            conn.commit()
            return True
        except Exception as e:
            print(f"Error deleting record: {e}")
            return False
        finally:
            conn.close()

    def create_user(self, username, email, hashed_password):
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            query = '''
                INSERT INTO users (username, email, hashed_password, created_at)
                VALUES (?, ?, ?, ?)
            '''
            self._execute(cursor, query, (username, email, hashed_password, datetime.now().isoformat()))
            conn.commit()
            return True
        except Exception as e:
            # Handle IntegrityError for both drivers generically
            if "UNIQUE constraint" in str(e) or "duplicate key" in str(e):
                return False
            print(f"Error creating user: {e}")
            return False
        finally:
            conn.close()

    def get_user(self, username):
        conn = self.get_connection()
        try:
            if self.db_type == 'sqlite':
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
            else:
                cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                
            self._execute(cursor, "SELECT * FROM users WHERE username = ?", (username,))
            row = cursor.fetchone()
            if row:
                return dict(row)
            return None
        except Exception as e:
            print(f"Get User Error: {e}")
            return None
        finally:
            conn.close()

    def get_user_by_email(self, email):
        conn = self.get_connection()
        try:
            if self.db_type == 'sqlite':
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
            else:
                cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                
            self._execute(cursor, "SELECT * FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            if row:
                return dict(row)
            return None
        except Exception as e:
            print(f"Get User By Email Error: {e}")
            return None
        finally:
            conn.close()

    def update_password(self, email, new_hashed_password):
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            query = "UPDATE users SET hashed_password = ? WHERE email = ?"
            self._execute(cursor, query, (new_hashed_password, email))
            conn.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print(f"Update Password Error: {e}")
            return False
        finally:
            conn.close()

    def get_all_users(self) -> List[dict]:
        conn = self.get_connection()
        try:
            if self.db_type == 'sqlite':
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
            else:
                cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            self._execute(cursor, "SELECT id, username, email, created_at, is_admin FROM users ORDER BY id DESC")
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        except Exception as e:
            print(f"Get All Users Error: {e}")
            return []
        finally:
            conn.close()

    def delete_user(self, user_id: int):
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            self._execute(cursor, "DELETE FROM users WHERE id = ?", (user_id,))
            conn.commit()
            return True
        except Exception as e:
            print(f"Delete User Error: {e}")
            return False
        finally:
            conn.close()

