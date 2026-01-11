import pandas as pd
import sqlite3
import nltk
from nltk.corpus import stopwords
from collections import Counter
import emoji
import logging
from typing import Dict, List, Tuple
import os

# Download NLTK data (quietly)
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

class ChatAnalyzer:
    def __init__(self, user_id: int, db_path="data/whatsapp.db"):
        self.db_path = db_path
        self.user_id = user_id
        self.df = None

    def load_data(self, contact_name: str = None) -> bool:
        """Loads data from SQLite into a Pandas DataFrame."""
        try:
            conn = sqlite3.connect(self.db_path)
            query = "SELECT * FROM messages WHERE user_id = ?"
            params = (self.user_id,)
            
            if contact_name:
                pass 

            self.df = pd.read_sql_query(query, conn, params=params)
            conn.close()

            if self.df.empty:
                logging.warning("No data found in database.")
                return False

            # Preprocessing
            # Use 'mixed' format to handle ISO strings safely
            self.df['timestamp'] = pd.to_datetime(self.df['timestamp'], format='mixed')
            self.df['hour'] = self.df['timestamp'].dt.hour
            self.df['date'] = self.df['timestamp'].dt.date
            
            return True
        except Exception as e:
            logging.error(f"Error loading data: {e}")
            return False

    def get_basic_stats(self) -> Dict:
        """Returns basic statistics about the chat."""
        if self.df is None: return {}

        total_messages = len(self.df)
        senders = self.df['sender'].value_counts().to_dict()
        
        # Most active day
        active_day = self.df['date'].value_counts().idxmax()
        
        return {
            "total_messages": total_messages,
            "senders": senders,
            "most_active_day": active_day
        }

    def get_hourly_activity(self, df=None) -> Dict[int, int]:
        """Returns message count per hour (0-23)."""
        target_df = df if df is not None else self.df
        if target_df is None: return {}
        return target_df['hour'].value_counts().sort_index().to_dict()

    def get_top_words(self, limit=10, df=None) -> List[Tuple[str, int]]:
        """Returns the most frequent words, excluding stopwords."""
        target_df = df if df is not None else self.df
        if target_df is None: return []

        text = " ".join(target_df['content'].dropna().astype(str).tolist()).lower()
        
        # Tokenization (simple split for now, can be improved with nltk.word_tokenize)
        words = text.split()
        
        # Remove stopwords
        stop_words = set(stopwords.words('turkish'))
        # Add custom stopwords
        custom_stops = {'bir', 'bu', 'ne', 've', 'için', 'çok', 'ama', 'de', 'da', 'o', 'ben', 'sen', 'şu', 'var', 'yok', 'mı', 'mi', 'mu', 'mü'}
        stop_words.update(custom_stops)
        
        filtered_words = [w for w in words if w.isalnum() and w not in stop_words and len(w) > 2]
        
        return Counter(filtered_words).most_common(limit)

    def get_emoji_stats(self, limit=5, df=None) -> List[Tuple[str, int]]:
        """Returns the most frequently used emojis."""
        target_df = df if df is not None else self.df
        if target_df is None: return []

        all_text = "".join(target_df['content'].dropna().astype(str).tolist())
        emoji_list = [c for c in all_text if c in emoji.EMOJI_DATA]
        
        return Counter(emoji_list).most_common(limit)

    def get_daily_activity(self):
        """Returns daily message counts for time series plot."""
        if self.df is None: return pd.Series()
        return self.df.groupby('date').size()

    def get_heatmap_data(self):
        """Returns a pivot table for Day of Week vs Hour."""
        if self.df is None: return pd.DataFrame()
        
        df_heat = self.df.copy()
        df_heat['day_of_week'] = df_heat['timestamp'].dt.day_name()
        
        # Order days
        days_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        df_heat['day_of_week'] = pd.Categorical(df_heat['day_of_week'], categories=days_order, ordered=True)
        
        return df_heat.pivot_table(index='day_of_week', columns='hour', values='id', aggfunc='count', fill_value=0)

    def get_sender_stats(self):
        """Returns detailed stats per sender."""
        if self.df is None: return pd.DataFrame()
        
        stats = self.df.groupby('sender').agg({
            'id': 'count',
            'content': lambda x: sum(len(str(s)) for s in x) / len(x) # Avg length
        }).rename(columns={'id': 'Message Count', 'content': 'Avg Length'})
        
        return stats.sort_values('Message Count', ascending=False)

    def get_sender_analysis(self, sender_name: str) -> Dict:
        """Returns detailed analysis for a specific sender."""
        if self.df is None: return {}
        
        # Filter by sender (case-insensitive partial match for better UX)
        # But for exact stats, let's try exact match first, then partial.
        # Actually, let's stick to exact match from the list for now, or partial if user types.
        # Let's do case-insensitive substring match.
        mask = self.df['sender'].str.contains(sender_name, case=False, na=False)
        sender_df = self.df[mask]
        
        if sender_df.empty:
            return None

        total_messages = len(sender_df)
        avg_len = sum(len(str(s)) for s in sender_df['content']) / total_messages if total_messages > 0 else 0
        
        # Reuse existing methods with filtered df
        top_words = self.get_top_words(limit=10, df=sender_df)
        top_emojis = self.get_emoji_stats(limit=5, df=sender_df)
        hourly = self.get_hourly_activity(df=sender_df)
        
        # Most active day for this person
        active_day = sender_df['date'].value_counts().idxmax() if not sender_df.empty else "-"

        return {
            "name": sender_name, # Return the query name or the most common actual name?
            "total_messages": total_messages,
            "avg_length": avg_len,
            "most_active_day": active_day,
            "top_words": top_words,
            "top_emojis": top_emojis,
            "hourly_activity": hourly
        }
