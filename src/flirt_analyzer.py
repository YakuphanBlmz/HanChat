import re
from collections import Counter
import emoji
from datetime import datetime
import pandas as pd
import numpy as np

class FlirtAnalyzer:
    def __init__(self):
        pass

    def parse_txt(self, content: str):
        """Parses the raw text content of a WhatsApp export."""
        lines = content.split('\n')
        messages = []
        
        # Regex for "dd.mm.yyyy HH:MM - Sender: Message"
        pattern = r"^(\d{2}\.\d{2}\.\d{4})\s+(\d{2}:\d{2})\s+-\s+(.*?):\s+(.*)$"
        
        for line in lines:
            line = line.strip()
            match = re.match(pattern, line)
            if match:
                date_str, time_str, sender, msg_content = match.groups()
                
                if "uçtan uca şifrelidir" in line: continue
                
                try:
                    dt = datetime.strptime(f"{date_str} {time_str}", "%d.%m.%Y %H:%M")
                    messages.append({
                        "timestamp": dt,
                        "sender": sender,
                        "content": msg_content
                    })
                except:
                    continue
                    
        return pd.DataFrame(messages)

    def analyze(self, content: str):
        df = self.parse_txt(content)
        if df.empty:
            return None

        senders = df['sender'].unique()
        if len(senders) != 2:
            # Flirt mode is best for 2 people, but let's handle it gracefully
            pass

        results = {
            "participants": list(senders),
            "analysis": {}
        }

        # --- 1. Balance of Love ---
        total_msgs = len(df)
        total_words = sum(len(str(m).split()) for m in df['content'])
        
        balance = {}
        for sender in senders:
            s_df = df[df['sender'] == sender]
            s_msgs = len(s_df)
            s_words = sum(len(str(m).split()) for m in s_df['content'])
            
            balance[sender] = {
                "msg_percent": round((s_msgs / total_msgs) * 100, 1) if total_msgs > 0 else 0,
                "word_percent": round((s_words / total_words) * 100, 1) if total_words > 0 else 0,
                "msg_count": s_msgs,
                "word_count": s_words
            }

        # --- 2. Initiation & Eagerness ---
        # Sort by time
        df = df.sort_values('timestamp')
        
        response_times = {s: [] for s in senders}
        initiations = {s: 0 for s in senders}
        
        # Initiation: First msg after > 6 hours gap
        for i in range(1, len(df)):
            prev = df.iloc[i-1]
            curr = df.iloc[i]
            
            diff_hours = (curr['timestamp'] - prev['timestamp']).total_seconds() / 3600
            
            if diff_hours > 6:
                initiations[curr['sender']] += 1
                
            if curr['sender'] != prev['sender']:
                diff_min = (curr['timestamp'] - prev['timestamp']).total_seconds() / 60
                if diff_min < 60 * 12: # Ignore huge gaps for response time
                    response_times[curr['sender']].append(diff_min)

        eagerness = {}
        for sender in senders:
            times = response_times[sender]
            median_resp = np.median(times) if times else 0
            
            score = "Normal"
            if median_resp < 2: score = "Anlık 🔥"
            elif median_resp < 10: score = "Hızlı ⚡"
            elif median_resp < 60: score = "Normal 👍"
            else: score = "Ağırdan Alıyor 🐢"
            
            eagerness[sender] = {
                "median_response_min": int(median_resp),
                "score": score,
                "initiation_count": initiations[sender]
            }

        # --- 3. Night Owls (00:00 - 05:00) ---
        night_talks = len(df[(df['timestamp'].dt.hour >= 0) & (df['timestamp'].dt.hour < 5)])
        
        # --- 4. Routine Check ---
        morning_keywords = ["günaydın", "tünaydın", "sabahlar"]
        night_keywords = ["iyi geceler", "allah rahatlık", "tatlı rüyalar"]
        
        routines = {s: {"morning": 0, "night": 0} for s in senders}
        
        for _, row in df.iterrows():
            msg = str(row['content']).lower()
            sender = row['sender']
            
            if any(k in msg for k in morning_keywords):
                routines[sender]["morning"] += 1
            if any(k in msg for k in night_keywords):
                routines[sender]["night"] += 1

        # --- 5. Emoji Decoder ---
        romantic_emojis = ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "😘", "😍", "🥰", "😻", "💍", "🌹"]
        
        emoji_stats = {s: {} for s in senders}
        
        for _, row in df.iterrows():
            sender = row['sender']
            msg = str(row['content'])
            found = [c for c in msg if c in romantic_emojis]
            for e in found:
                emoji_stats[sender][e] = emoji_stats[sender].get(e, 0) + 1
                
        # Top 3 romantic emojis per person
        top_emojis = {}
        for sender in senders:
            top_emojis[sender] = sorted(emoji_stats[sender].items(), key=lambda x: x[1], reverse=True)[:3]

        # --- 6. Compliment Detector ---
        compliments = ["güzelsin", "yakışıklısın", "tatlısın", "harikasın", "mükemmelsin", "özledim", "seviyorum", "aşkım", "bebeğim", "bitanem", "hayatım"]
        compliment_counts = {s: 0 for s in senders}
        
        for _, row in df.iterrows():
            msg = str(row['content']).lower()
            sender = row['sender']
            if any(c in msg for c in compliments):
                compliment_counts[sender] += 1

        # --- 7. Language Style Matching (LSM) ---
        # Jaccard Similarity of unique words
        words_by_sender = {s: set() for s in senders}
        for _, row in df.iterrows():
            words = set(str(row['content']).lower().split())
            words_by_sender[row['sender']].update(words)
            
        lsm_score = 0
        if len(senders) == 2:
            s1, s2 = list(senders)
            w1 = words_by_sender[s1]
            w2 = words_by_sender[s2]
            intersection = len(w1.intersection(w2))
            union = len(w1.union(w2))
            lsm_score = int((intersection / union) * 100) if union > 0 else 0

        # --- 8. Sentiment Fluctuation (Simplified) ---
        # Positive words vs Negative words over time (grouped by week)
        positive_words = ["güzel", "iyi", "harika", "süper", "sevdim", "evet", "tamam", "hahaha", "lol", "aşk", "canım"]
        negative_words = ["kötü", "hayır", "yok", "olmaz", "nefret", "aptal", "salak", "bıktım", "üzgün"]
        
        df['week'] = df['timestamp'].dt.to_period('W').apply(lambda r: r.start_time)
        weekly_sentiment = []
        
        for week, group in df.groupby('week'):
            text = " ".join(group['content'].astype(str)).lower()
            pos = sum(text.count(w) for w in positive_words)
            neg = sum(text.count(w) for w in negative_words)
            score = pos - neg
            weekly_sentiment.append({"date": week.strftime("%Y-%m-%d"), "score": score})

        # --- 9. Zodiac Guess (Heuristic) ---
        # Based on element keywords
        elements = {
            "Fire (Koç, Aslan, Yay)": ["ben", "istiyorum", "hemen", "şimdi", "harika", "süper", "enerji", "parti"],
            "Earth (Boğa, Başak, Oğlak)": ["para", "iş", "plan", "yemek", "ev", "uyku", "sakin", "garanti"],
            "Air (İkizler, Terazi, Kova)": ["neden", "nasıl", "belki", "konuşalım", "fikir", "arkadaş", "gezmek", "yeni"],
            "Water (Yengeç, Akrep, Balık)": ["hissediyorum", "üzüldüm", "kırıldım", "rüya", "aşk", "sevgi", "aile", "deniz"]
        }
        
        zodiac_guess = {}
        for sender in senders:
            text = " ".join(df[df['sender'] == sender]['content'].astype(str)).lower()
            scores = {k: 0 for k in elements}
            for elem, keywords in elements.items():
                for k in keywords:
                    scores[elem] += text.count(k)
            
            best_match = max(scores, key=scores.get)
            zodiac_guess[sender] = best_match

        # --- Final Result Compilation ---
        results["analysis"] = {
            "balance": balance,
            "eagerness": eagerness,
            "night_talks": night_talks,
            "routines": routines,
            "top_emojis": top_emojis,
            "compliments": compliment_counts,
            "compatibility_score": min(100, lsm_score + 40), # Boost LSM a bit for display
            "sentiment_timeline": weekly_sentiment,
            "zodiac_guesses": zodiac_guess
        }
        
        return results
