import re
from collections import Counter
import emoji
from datetime import datetime
import pandas as pd

class FunAnalyzer:
    def __init__(self):
        pass

    def parse_txt(self, content: str):
        """Parses the raw text content of a WhatsApp export."""
        lines = content.split('\n')
        messages = []
        
        # Pattern 1: Android/Standard "19.04.2024 08:28 - Sender: Msg"
        # Supports ., /, - in date and : or . in time
        p1 = r"^(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\s+(\d{1,2}[:.]\d{2})\s+-\s+(.*?):\s+(.*)$"
        
        # Pattern 2: iOS/Brackets "[19.04.2024 08:28:15] Sender: Msg"
        p2 = r"^\[(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\s+(\d{1,2}[:.]\d{2}(?::\d{2})?)\]\s+(.*?):\s+(.*)$"
        
        # Pattern 3: US Style "4/19/24, 08:28 - Sender: Msg"
        p3 = r"^(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}),\s+(\d{1,2}[:.]\d{2})\s+-\s+(.*?):\s+(.*)$"

        last_msg = None

        for line in lines:
            line = line.strip()
            # Skip empty lines (unless inside a message? usually empty lines are just empty)
            if not line: continue
            
            # Check for Left-To-Right Mark (LRM) hidden char often found in iOS exports
            line = line.replace('\u200e', '')

            match = None
            detected_fmt = None
            
            # Try patterns
            m1 = re.match(p1, line)
            if m1: 
                match = m1
                detected_fmt = "std"
            else:
                m2 = re.match(p2, line)
                if m2:
                    match = m2
                    detected_fmt = "ios"
                else:
                    m3 = re.match(p3, line)
                    if m3:
                        match = m3
                        detected_fmt = "us"
            
            if not match and len(line) > 10 and line[0].isdigit():
                 msg = f"DEBUG: Line failed to match regex: {line[:50]}...\n"
                 print(msg)
                 try:
                     log_path = r"c:\Users\Yakuphan\Desktop\HanChat\debug_log.txt"
                     with open(log_path, "a", encoding="utf-8") as f:
                         f.write(msg)
                 except: pass

            if match:
                date_str, time_str, sender, msg_content = match.groups()
                
                # Filter out system messages
                if "uçtan uca şifrelidir" in line or "Messages and calls are end-to-end encrypted" in line:
                    continue
                
                # Parse Date/Time
                dt = None
                try:
                    # Normalize separators
                    date_temp = date_str.replace('/', '.').replace('-', '.')
                    time_temp = time_str.replace('.', ':')
                    
                    # Truncate seconds if present in iOS pattern for consistency
                    if len(time_temp) > 5: time_temp = time_temp[:5]
                    
                    # Handle 2-digit years
                    parts = date_temp.split('.')
                    if len(parts[2]) == 2: parts[2] = "20" + parts[2]
                    date_temp = ".".join(parts)
                    
                    # Try DMY first, then MDY if fails (or strictly based on detected format if needed)
                    # For now, assume DMY as it is standard in TR.
                    dt = datetime.strptime(f"{date_temp} {time_temp}", "%d.%m.%Y %H:%M")
                except:
                    # Fallback try MDY
                    try:
                        dt = datetime.strptime(f"{date_temp} {time_temp}", "%m.%d.%Y %H:%M") 
                    except:
                        # If date parse fails, treat as simple line or skip
                        continue

                last_msg = {
                    "timestamp": dt,
                    "sender": sender,
                    "content": msg_content
                }
                messages.append(last_msg)
            
            else:
                # No timestamp => Continuation of previous message
                if last_msg:
                    last_msg["content"] += "\n" + line

        return pd.DataFrame(messages)

    def analyze(self, content: str):
        try:
            df = self.parse_txt(content)
            if df.empty:
                raise ValueError("Parsed DataFrame is empty")

            # Basic Stats
            total_messages = len(df)
            senders = df['sender'].unique()
            
            # --- Constants & Helpers ---
            laugh_patterns = ["haha", "sjsj", "asda", "ksks", "kdkd", "qwe", "kıhkıh"]
            # Removed "abi", "kanka", "lan", "la" (lan/la moved to aggressive if used aggressively, but removed from general slang to avoid noise)
            slang_words = ["oğlum", "bro", "kardo", "moruk", "aq", "mk", "amk", "siktir", "hassiktir", "yavşak", "piç", "göt", "mal", "salak", "gerizekalı"]
            positive_words = ["güzel", "harika", "süper", "muhteşem", "tebrik", "sevdim", "aşk", "canım", "bebeğim", "iyi", "başarılı", "mutlu", "sağol", "teşekkür"]
            negative_words = ["kötü", "berbat", "iğrenç", "nefret", "hayır", "yok", "olmaz", "saçma", "aptal", "üzgün", "kızgın", "bıktım", "yeter"]
            manipulative_words = ["ama", "fakat", "lakin", "aslında", "bence", "zorunda", "lazım", "gerek", "kırıldım", "üzdün", "ayıp", "hani", "söz", "güven", "beklerdim"]

            results = {
                "total_messages": total_messages,
                "participants": list(senders),
                "stats": {}
            }

            # Pre-calculate response times
            # List of (timestamp, sender)
            time_sender_list = list(zip(df['timestamp'], df['sender']))
            response_times = {s: [] for s in senders}
            fast_replies = {s: 0 for s in senders}
            
            for i in range(1, len(time_sender_list)):
                t1, s1 = time_sender_list[i-1]
                t2, s2 = time_sender_list[i]
                
                if s1 != s2:
                    diff = (t2 - t1).total_seconds()
                    if diff < 60 * 60 * 4: # Ignore gaps larger than 4 hours
                        response_times[s2].append(diff)
                        if diff <= 5:
                            fast_replies[s2] += 1

            for sender in senders:
                sender_df = df[df['sender'] == sender]
                msgs = sender_df['content'].astype(str).tolist()
                timestamps = sender_df['timestamp'].tolist()
                
                # Word Analysis
                all_text = " ".join(msgs).lower()
                words = [w for w in all_text.split() if len(w) > 2]
                word_counts = Counter(words).most_common(10)
                unique_word_count = len(set(words))
                
                # Emoji Analysis
                emojis = [c for c in all_text if c in emoji.EMOJI_DATA]
                emoji_counts = Counter(emojis).most_common(5)
                
                # Detailed Collections
                found_slang = [w for w in words if w in slang_words]
                found_manipulative = [w for w in words if w in manipulative_words]
                found_positive = [w for w in words if w in positive_words]
                found_negative = [w for w in negative_words]
                
                # Metric Calculations
                
                # Helper: Check for "Random Smash" (Laughter)
                def is_random_smash(msg):
                    if len(msg) < 4: return False
                    msg_lower = msg.lower()
                    
                    # 1. Check for "random" characters (w, q, x) which are rare in Turkish but common in smash
                    if any(c in msg_lower for c in "wqx"):
                        return True
                        
                    # 2. Check for common smash keys (middle row + others)
                    smash_chars = set("asdfghjklşi")
                    content_chars = set(msg_lower)
                    
                    # If mostly composed of smash chars
                    if content_chars.issubset(smash_chars.union(set("weqrtyuopğüxcvbnmöç"))):
                        vowels = sum(1 for c in msg_lower if c in "aeıioöuü")
                        # Increased threshold: Turkish words usually have ~40-50% vowels. 
                        # Smashes like "MFLAMDWÖSÖ" have fewer or irregular patterns.
                        if vowels / len(msg) < 0.35: 
                            return True
                            
                    # 3. Check for repeating patterns (e.g. "asdasd")
                    if len(set(msg_lower)) < 5 and len(msg) > 8:
                        return True
                        
                    return False

                # Helper: Check for IBAN
                def is_iban(msg):
                    return "TR" in msg and sum(c.isdigit() for c in msg) > 10

                # Helper: Clean URL for length
                def clean_length(msg):
                    no_url = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', msg)
                    return len(no_url.strip())

                laugh_count = sum(1 for m in msgs if any(l in m.lower() for l in laugh_patterns) or is_random_smash(m))
                
                # Refined Aggression Logic
                aggressive_words = ["lan", "la", "aq", "mk", "amk", "siktir", "hassiktir", "yavşak", "piç", "göt", "mal", "salak", "gerizekalı", "aptal", "kes", "sus"]
                
                shout_msgs = []
                for m in msgs:
                    is_aggressive = False
                    
                    # 1. CAPS LOCK (excluding smash/IBAN/URL)
                    if m.isupper() and len(m) > 4:
                        if not is_random_smash(m) and not is_iban(m) and not m.startswith("http"):
                            is_aggressive = True
                    
                    # 2. Aggressive Words
                    if any(w in m.lower().split() for w in aggressive_words):
                        is_aggressive = True
                        
                    # 3. Multiple Exclamations (!!)
                    if "!!" in m:
                        is_aggressive = True
                        
                    if is_aggressive:
                        shout_msgs.append(m)
                        
                shout_count = len(shout_msgs)
                
                question_count = sum(1 for m in msgs if "?" in m and "http" not in m)
                pure_question_count = sum(1 for m in msgs if m.strip() == "?")
                pure_exclaim_count = sum(1 for m in msgs if m.strip() == "!")
                media_count = sum(1 for m in msgs if "<Medya dahil edilmedi>" in m or "<Media omitted>" in m)
                deleted_count = sum(1 for m in msgs if "bu mesajı sildiniz" in m.lower() or "bu mesaj silindi" in m.lower())
                gif_count = sum(1 for m in msgs if "gif dahil edilmedi" in m.lower())
                
                # Slang & Sentiment
                slang_count = len(found_slang)
                pos_score = len(found_positive)
                neg_score = len(found_negative)
                sentiment_score = pos_score - neg_score
                manipulative_count = len(found_manipulative)
                
                # Message Lengths (Cleaned)
                max_msg = max(msgs, key=clean_length) if msgs else ""
                max_msg_len = clean_length(max_msg)
                avg_len = sum(clean_length(m) for m in msgs) / len(msgs) if msgs else 0
                
                # Time Metrics
                night_owl_count = sum(1 for t in timestamps if 0 <= t.hour < 4)
                early_bird_count = sum(1 for t in timestamps if 6 <= t.hour < 9)
                
                # Call Metrics
                call_count = sum(1 for m in msgs if "görüntülü arama" in m.lower() or "sesli arama" in m.lower())

                # Response Time (Avg already calcd)
                avg_response = 0
                if response_times[sender]:
                    avg_response = sum(response_times[sender]) / len(response_times[sender])

                results["stats"][sender] = {
                    "message_count": len(msgs),
                    "avg_length": round(avg_len, 1),
                    "top_words": [{"text": w, "value": c} for w, c in word_counts],
                    "top_emojis": [{"emoji": e, "count": c} for e, c in emoji_counts],
                    "fun_metrics": {
                        "laugh_count": laugh_count,
                        "shout_count": shout_count,
                        "question_count": question_count,
                        "media_count": media_count,
                        "emoji_count": len(emojis),
                        "night_owl_count": night_owl_count,
                        "early_bird_count": early_bird_count,
                        "avg_len": avg_len,
                        "slang_count": slang_count,
                        "unique_word_count": unique_word_count,
                        "deleted_count": deleted_count,
                        "max_msg_len": max_msg_len,
                        "call_count": call_count,
                        "pure_question_count": pure_question_count,
                        "pure_exclaim_count": pure_exclaim_count,
                        "sentiment_score": sentiment_score,
                        "manipulative_count": manipulative_count,
                        "avg_response_time": round(avg_response / 60, 1), # Minutes
                        "fast_reply_count": fast_replies[sender],
                        "gif_count": gif_count,
                        "emotionless_score": len(emojis) + shout_count, # Lower is "better" for emotionless
                        # Details for UI
                        "details": {
                            "slang_words": Counter(found_slang).most_common(5),
                            "manipulative_words": Counter(found_manipulative).most_common(5),
                            "shout_examples": shout_msgs[:3],
                            "question_examples": [m for m in msgs if "?" in m and "http" not in m][:3],
                            "max_msg_content": max_msg[:100] + "..." if len(max_msg) > 100 else max_msg,
                            "sentiment_breakdown": {"pos": pos_score, "neg": neg_score}
                        },
                        # Chart Data
                        "hourly_distribution": [sum(1 for t in timestamps if t.hour == h) for h in range(24)],
                        "sentiment_counts": {"pos": pos_score, "neg": neg_score, "neu": len(words) - pos_score - neg_score}
                    }
                }
                
            # Determine "Titles"
            titles = {}
            
            def set_title(key, metric, description_template, detail_key=None, reverse=False):
                try:
                    if reverse:
                        winner = min(senders, key=lambda s: results["stats"][s]["fun_metrics"][metric])
                    else:
                        winner = max(senders, key=lambda s: results["stats"][s]["fun_metrics"][metric])
                    
                    stats = results["stats"][winner]["fun_metrics"]
                    value = stats[metric]
                    
                    # Special formatting for time
                    val_display = value
                    if metric == "avg_response_time":
                        val_display = f"{value} dk"
                    
                    if value > 0 or (reverse and value >= 0):
                        title_obj = {
                            "winner": winner,
                            "value": val_display,
                            "description": description_template.format(val_display),
                            "details": stats.get("details", {})
                        }
                        if detail_key:
                            title_obj["detail_type"] = detail_key
                        
                        titles[key] = title_obj
                except:
                    pass

            set_title("Neşeli 😆", "laugh_count", "{} kez güldü")
            set_title("Agresif ve Coşkulu 📢", "shout_count", "{} kez coştu/yükseldi", "shout_examples")
            set_title("Meraklı 🧐", "question_count", "{} soru sordu")
            set_title("Medya Patronu 📸", "media_count", "{} medya paylaştı")
            set_title("Emoji Canavarı 😍", "emoji_count", "{} emoji kullandı")
            set_title("Gece Kuşu 🦉", "night_owl_count", "Gece 00-04 arası {} mesaj")
            set_title("Erkenci Kuş ☀️", "early_bird_count", "Sabah 06-09 arası {} mesaj")
            set_title("Romancı 📚", "avg_len", "Ortalama {} karakter")
            set_title("Argo Kralı 🤬", "slang_count", "{} argo kelime", "slang_words")
            set_title("Kelime Hazinesi 🧠", "unique_word_count", "{} farklı kelime")
            set_title("Gizemli Ajan 🕵️", "deleted_count", "{} mesaj sildi")
            set_title("Destan Yazan 📜", "max_msg_len", "Tek mesajda {} karakter", "max_msg_content")
            set_title("Telefon Sapığı 📞", "call_count", "{} arama")
            set_title("Sorgu Hakimi ⚖️", "pure_question_count", "{} kez sadece '?' attı")
            set_title("Heyecanlı ‼️", "pure_exclaim_count", "{} kez sadece '!' attı")
            set_title("Pozitif İnsan 🌈", "sentiment_score", "Duygu puanı: {}", "sentiment_breakdown")
            set_title("Manipülatör 🎭", "manipulative_count", "{} manipülatif kelime", "manipulative_words")
            set_title("Hızlı Silahşör 🤠", "fast_reply_count", "{} kez 5sn altı cevap")
            set_title("Bekleten 🐢", "avg_response_time", "Ortalama {} cevap süresi")
            set_title("GIF Ustası 👾", "gif_count", "{} GIF")
            set_title("Robot 🤖", "emotionless_score", "En az duygu belirtisi ({})", reverse=True)
                
            results["titles"] = titles
            
            return results

        except Exception as e:
            # Catch-all for any crash in analysis/pandas/regex
            import traceback
            tb = traceback.format_exc()
            return {
                "total_messages": 0,
                "participants": ["DEBUG"],
                "stats": {
                    "DEBUG": {
                        "message_count": 0, "avg_length": 0, "top_words": [], "top_emojis": [], "fun_metrics": { "laugh_count": 0, "shout_count": 0, "question_count": 0, "media_count": 0, "emoji_count": 0, "night_owl_count": 0, "early_bird_count": 0, "avg_len": 0, "slang_count": 0, "unique_word_count": 0, "deleted_count": 0, "max_msg_len": 0, "call_count": 0, "pure_question_count": 0, "pure_exclaim_count": 0, "sentiment_score": 0, "manipulative_count": 0, "avg_response_time": 0, "fast_reply_count": 0, "gif_count": 0, "emotionless_score": 0, "details": {}, "hourly_distribution": [0]*24, "sentiment_counts": {"pos": 0, "neg": 0, "neu": 0} }
                    }
                },
                "titles": {
                    "Analysis CRASHED 🚨": {
                        "winner": "Error",
                        "value": str(e),
                        "description": "Please show this to support.",
                        "details": {}
                    },
                    "Traceback 🐛": {
                        "winner": "Debug",
                        "value": "Log",
                        "description": tb[-200:], # Last 200 chars of traceback
                        "details": {}
                    },
                    "File Content Snippet 📄": {
                        "winner": "Input",
                        "value": f"{len(content)} chars",
                        "description": f"First 100: {content[:100]!r}",
                        "details": {}
                    }
                }
            }
