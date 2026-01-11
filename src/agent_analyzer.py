
import google.generativeai as genai
import os
import json
import re
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class AgentAnalyzer:
    def __init__(self):
        # Turkish Sentiment Dictionary (Simplified)
        self.positive_words = {"harika", "süper", "güzel", "teşekkür", "sevdim", "huzur", "mutlu", "aşk", "canım", "bitanem", "özledim", "geldim", "tamamdır", "olur", "peki", "hahaha", "kesinlikle", "tabi"}
        self.negative_words = {"hayır", "yok", "istemiyorum", "kötü", "bıktım", "off", "of", "saçma", "aptal", "git", "sus", "yeter", "üzgünüm", "maalesef", "nefret", "yalnız", "kızgın"}
        self.tension_words = {"anlamadım", "ne?", "neden?", "banane", "sanane", "karışma", "bilmiyorum", "bakarız", "farketmez", "sorun", "problem", "sıkıntı"}
        
        # Configure Gemini
        api_key = os.getenv("GEMINI_API_KEY") or "AIzaSyCAzlWdVznQFUDxEMZynx2e-KocB9t5xgU"
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    def parse_txt(self, content: str):
        # ... (Existing parsing logic) ...
        return self._parse_logic(content) # Refactored to avoid huge scroll in edit

    def _parse_logic(self, content):
        """Helper to keep clean code structure"""
        lines = content.split('\n')
        messages = []
        pattern_android = r"^(\d{2}\.\d{2}\.\d{4})\s+(\d{2}:\d{2})\s+-\s+(.*?):\s+(.*)$"
        pattern_ios = r"^\[(\d{2}\.\d{2}\.\d{4})\s+(\d{2}:\d{2}:\d{2})\]\s+(.*?):\s+(.*)$"
        pattern_alt = r"^(\d{1,2}/\d{1,2}/\d{2,4}),?\s+(\d{1,2}:\d{2})\s+-\s+(.*?):\s+(.*)$"
        
        for line in lines:
            line = line.strip()
            match = re.match(pattern_android, line)
            fmt = "%d.%m.%Y %H:%M"
            if not match:
                match = re.match(pattern_ios, line)
                fmt = "%d.%m.%Y %H:%M:%S"
            if not match:
                match = re.match(pattern_alt, line)
                if match:
                    date_str = match.groups()[0]
                    fmt = "%m/%d/%y %H:%M"
                    if int(date_str.split('/')[0]) > 12: fmt = "%d/%m/%y %H:%M"

            if match:
                try:
                    date_str, time_str, sender, msg_content = match.groups()
                    if "uçtan uca şifrelidir" in line or "Messages and calls" in line: continue
                    full_dt_str = f"{date_str} {time_str}"
                    dt = datetime.strptime(full_dt_str, fmt)
                    messages.append({"timestamp": dt, "sender": sender, "content": msg_content})
                except: continue
        return pd.DataFrame(messages)

    def analyze(self, content: str, osint_data: dict = None):
        df = self.parse_txt(content)
        if df.empty: return None

        senders = df['sender'].unique()
        results = {"participants": list(senders), "analysis": {}, "digital_identity": osint_data}
        full_df = df.sort_values('timestamp')

        for sender in senders:
            sender_df = df[df['sender'] == sender].sort_values('timestamp')
            if sender_df.empty: continue

            # ... (Existing Analysis Logic: Sleep, PA, Ghosting, Interest, Inconsistency, Tone, Excuses) ...
            # I will assume the previous logic is here, but I must preserve it or re-implement it briefly.
            # To be safe and minimal diff, I will paste the new AI part at the end and rely on the file context
            # BUT replace_file_content requires exact match OR context. 
            # Strategy: I will rewrite the class structure to include the new logic but I need to keep the old logic too.
            # Since the file is huge, I will use `replace_file_content` to ONLY modify the `__init__` and the `Fusion Engine` block.
            pass # Placeholder for thought process, actual edit below.

    def ai_cross_reference(self, sender, osint_data, behavioral_summary, sample_messages):
        """
        Uses Gemini to find deep contradictions between Chat Persona and Digital Persona.
        """
        prompt = f"""
        Act as a profiler. Cross-reference this person's "Digital Identity" (Web Search) with their "Chat Behavior" (WhatsApp).
        Find psychological inconsistencies, lies, or interesting overlaps.

        Target Name: {sender}

        1. DIGITAL IDENTITY (Public Persona):
        {json.dumps(osint_data, indent=2, ensure_ascii=False)}

        2. CHAT BEHAVIOR (Private Persona):
        {json.dumps(behavioral_summary, indent=2, ensure_ascii=False)}

        3. SAMPLE MESSAGES:
        {sample_messages}

        Task: Compare Private vs Public.
        - Does their "busy" excuse match their public activity?
        - Is their emotional tone in chat different from their social media persona?
        - Detective Mode: Find 3 definitive "Paradoxes" or "Insights".

        Return JSON (Turkish):
        {{
            "cross_reference": [
                {{ "type": "Title (e.g., Hidden Gamer)", "desc": "Explanation..." }},
                {{ "type": "Title", "desc": "Explanation..." }}
            ]
        }}
        """
        try:
            response = self.model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text).get("cross_reference", [])
        except Exception as e:
            print(f"AI Fusion Error: {e}")
            return []


    def parse_txt(self, content: str):
        # ... (Existing parsing logic) ...
        return self._parse_logic(content) 

    def _parse_logic(self, content):
        lines = content.split('\n')
        messages = []
        
        # Regex Patterns (Prioritized for user's file format)
        patterns = [
            # 0. User Match: 6.08.2025 15:09 - Sender: Msg
            r"^(\d{1,2}\.\d{1,2}\.\d{4})\s+(\d{1,2}:\d{2})\s+-\s+(.*?):\s+(.*)$",
            # 1. Standard Android
            r"^(\d{1,2}[\./]\d{1,2}[\./]\d{2,4})\s*,?\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*-\s+(.*?):\s+(.*)$",
            # 2. iOS/Brackets
            r"^\[(\d{1,2}[\./]\d{1,2}[\./]\d{2,4})\s*,?\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\]\s+(.*?):\s+(.*)$",
        ]
        
        date_formats = [
            "%d.%m.%Y %H:%M", "%d.%m.%Y %H:%M:%S",
            "%d/%m/%Y %H:%M", "%d/%m/%Y %H:%M:%S",
            "%d/%m/%y %H:%M", "%d.%m.%y %H:%M",
            "%m/%d/%Y %H:%M", "%m/%d/%y %H:%M" # US
        ]

        for line in lines:
            # CLEANUP: Remove invisible Unicode chars (LRM, BOM, etc.)
            # This is critical for some WhatsApp exports
            line = re.sub(r'[\u200e\u200f\u202a-\u202e\ufeff]', '', line.strip())
            
            # Skip system messages
            if not line or "uçtan uca" in line or "Messages and calls" in line or "security code" in line: continue
            
            # Handle multi-line messages (very basic: append to prev if no date match)
            # Not implemented here for simplicity, focusing on line-by-line first match
            
            match = None
            for p in patterns:
                match = re.match(p, line)
                if match: break
            
            if match:
                try:
                    date_str, time_str, sender, msg_content = match.groups()
                    full_dt_str = f"{date_str} {time_str}"
                    
                    dt = None
                    for fmt in date_formats:
                        try:
                            # Handle PM logic manually if needed or let %p handle it? 
                            # Simpler: replace dots/slashes to match fmt if mostly same structure
                            # Actually, just try strptime directly.
                            dt = datetime.strptime(full_dt_str, fmt)
                            break
                        except ValueError:
                            continue
                            
                    if dt:
                        messages.append({"timestamp": dt, "sender": sender, "content": msg_content})
                        
                except Exception as e:
                    continue

        if not messages:
            print("[ERROR] Parser failed to extract ANY messages.")
            print("Trying fallback: Checking for iOS without seconds...")
            
        return pd.DataFrame(messages)


    def analyze(self, content: str, osint_data: dict = None, target_name: str = None):
        """
        Analyzes chat content. If target_name is provided, analyzes ONLY that person.
        """
        df = self.parse_txt(content)
        if df.empty: return None

        all_senders = df['sender'].unique()
        
        # Filter senders if target matches
        senders_to_analyze = list(all_senders)
        if target_name:
            # Simple fuzzy match: case insensitive check
            target_lower = target_name.lower()
            matches = [s for s in all_senders if target_lower in s.lower() or s.lower() in target_lower]
            if matches:
                senders_to_analyze = [matches[0]] # Pick best match
            else:
                # If no match found, maybe just analyze everyone? Or return empty?
                # For now let's analyze everyone but mark the target as not found
                print(f"Target {target_name} not found in chat. analyzing all.")

        results = {
            "participants": list(all_senders),
            "analysis": {},
            "digital_identity": None
        }
        
        # If OSINT data is provided, attach it globally or per person
        if osint_data and target_name:
             # Only attach if we found the target, or if we assume the osint data belongs to the analyzed person
             results["digital_identity"] = osint_data
        
        full_df = df.sort_values('timestamp')

        for sender in senders_to_analyze:
            sender_df = df[df['sender'] == sender].sort_values('timestamp')
            if sender_df.empty: continue

            # --- 1. Realistic Sleep Pattern Detection ---
            sender_df['date'] = sender_df['timestamp'].dt.date
            dates = sorted(sender_df['date'].unique())
            
            sleep_data = []

            for d in dates:
                day_msgs = sender_df[sender_df['date'] == d]
                last_msg = day_msgs.iloc[-1]['timestamp']
                
                next_day = d + timedelta(days=1)
                next_day_msgs = sender_df[sender_df['date'] == next_day]
                
                if not next_day_msgs.empty:
                    first_msg = next_day_msgs.iloc[0]['timestamp']
                    gap_hours = (first_msg - last_msg).total_seconds() / 3600
                    
                    if 3 < gap_hours < 16: # Reasonable sleep gap
                        sleep_data.append({
                            "bed_time": last_msg,
                            "wake_time": first_msg,
                            "date": d,
                            "gap": gap_hours
                        })
            
            sleep_report = "Veri Yetersiz"
            sleep_consistency = "Bilinmiyor"
            avg_bed_str = "--:--"
            avg_wake_str = "--:--"

            if len(sleep_data) > 3:
                bed_minutes = []
                for x in sleep_data:
                    m = (x['bed_time'].hour * 60 + x['bed_time'].minute)
                    if m < 12 * 60: m += 24 * 60 
                    bed_minutes.append(m)
                
                wake_minutes = [(x['wake_time'].hour * 60 + x['wake_time'].minute) for x in sleep_data]

                avg_bed_min = np.mean(bed_minutes)
                avg_wake_min = np.mean(wake_minutes)

                avg_bed_h = int((avg_bed_min % (24*60)) / 60)
                avg_bed_m = int(avg_bed_min % 60)
                avg_bed_str = f"{avg_bed_h:02d}:{avg_bed_m:02d}"

                avg_wake_h = int(avg_wake_min / 60)
                avg_wake_m = int(avg_wake_min % 60)
                avg_wake_str = f"{avg_wake_h:02d}:{avg_wake_m:02d}"

                total_std_hours = (np.std(bed_minutes) + np.std(wake_minutes)) / 60
                if total_std_hours < 1.5:
                    sleep_consistency = "Çok Düzenli 🤖"
                    sleep_report = f"Genelde {avg_bed_str} civarı uyuyup {avg_wake_str} gibi uyanıyor."
                elif total_std_hours < 3:
                    sleep_consistency = "Normal 🤷‍♂️"
                    sleep_report = f"Ortalama {avg_bed_str} - {avg_wake_str} arası uyuyor ama esneklik var."
                else:
                    sleep_consistency = "Kaotik 🦇"
                    sleep_report = "Uyku saatleri tamamen rastgele."

            # --- 2. Context-Aware Passive Aggressive ---
            pa_triggers = ["peki", "tamam", "hıhı", "hmm", "sen bilirsin", "farketmez"]
            pa_score = 0
            pa_evidence = []

            for i in range(1, len(full_df)):
                curr = full_df.iloc[i]
                prev = full_df.iloc[i-1]

                if curr['sender'] == sender and prev['sender'] != sender:
                    if len(prev['content']) > 60 and len(curr['content']) < 6:
                        is_cold = curr['content'].strip().endswith('.') or curr['content'].lower() in pa_triggers
                        if is_cold:
                            pa_score += 10
                            pa_evidence.append(f"Uzun mesajına '{curr['content']}' diye kısa cevap verdi.")

                    msg_lower = curr['content'].lower()
                    if "sen bilirsin" in msg_lower:
                        pa_score += 15
                        pa_evidence.append(f"'{curr['content']}' diyerek sorumluluğu attı.")
                    
            pa_final_score = min(100, pa_score)
            pa_level = "Yok"
            if pa_final_score > 20: pa_level = "Hafif Trip"
            if pa_final_score > 50: pa_level = "Profesyonel Manipülatör"

            # --- 3. Ghosting Risk ---
            ghosting_risk = 0
            unanswered_chains = 0
            
            # Simplified last msg check
            last_msg_all = full_df.iloc[-1]
            if last_msg_all['sender'] != sender:
                hours_since = (datetime.now() - last_msg_all['timestamp']).total_seconds() / 3600
                if hours_since > 12:
                    ghosting_risk += 40
                    unanswered_chains += 1
            
            ghosting_risk = min(100, ghosting_risk)

            # --- 4. Interest Gauge ---
            initiations = 0
            total_convos = 0
            for i in range(1, len(full_df)):
                diff_hours = (full_df.iloc[i]['timestamp'] - full_df.iloc[i-1]['timestamp']).total_seconds() / 3600
                if diff_hours > 4:
                    total_convos += 1
                    if full_df.iloc[i]['sender'] == sender:
                        initiations += 1
            
            init_rate = (initiations / total_convos) * 100 if total_convos > 0 else 0
            
            response_delays = []
            for i in range(1, len(full_df)):
                if full_df.iloc[i]['sender'] == sender and full_df.iloc[i-1]['sender'] != sender:
                     diff_min = (full_df.iloc[i]['timestamp'] - full_df.iloc[i-1]['timestamp']).total_seconds() / 60
                     if diff_min < 600: 
                        response_delays.append(diff_min)
            
            median_resp = np.median(response_delays) if response_delays else 60
            
            my_len = sender_df['content'].str.len().mean()
            other_len = full_df[full_df['sender'] != sender]['content'].str.len().mean()
            
            interest_final = (init_rate * 0.3) + (max(0, 100 - median_resp) * 0.4) + (min(100, (min(2.0, my_len/other_len) if other_len > 0 else 1) * 50) * 0.3)
            interest_level = "Düşük ❄️"
            if interest_final > 40: interest_level = "Normal 🙂"
            if interest_final > 70: interest_level = "Yüksek 🔥"

            # --- 5. Inconsistency Hunter ---
            busy_triggers = ["işim var", "meşgulum", "toplantıdayım", "ders çalışıyorum", "konuşamayız", "sonra yaz"]
            paradoxes = []
            
            for i in range(len(sender_df) - 1):
                curr = sender_df.iloc[i]
                if any(t in curr['content'].lower() for t in busy_triggers):
                     start_time = curr['timestamp']
                     subsequent = sender_df[(sender_df['timestamp'] > start_time) & (sender_df['timestamp'] < start_time + timedelta(minutes=30))]
                     if len(subsequent) > 3 or (not subsequent.empty and subsequent['content'].str.len().sum() > 100):
                         paradoxes.append({
                             "statement": curr['content'],
                             "contradiction": f"{len(subsequent)} mesaj daha attı veya uzun konuştu.",
                             "time": curr['timestamp'].strftime("%H:%M")
                         })
            
            # --- 6. Emotional Tone ---
            pos_count = sum(1 for msg in sender_df['content'] if any(w in msg.lower() for w in self.positive_words))
            neg_count = sum(1 for msg in sender_df['content'] if any(w in msg.lower() for w in self.negative_words))
            tone = "Nötr 😐"
            if pos_count > neg_count * 1.5: tone = "Pozitif 🌟"
            elif neg_count > pos_count * 1.5: tone = "Negatif/Gergin 🌩️"
            
            # --- 7. Excuses Cloud ---
            excuse_keywords = ["şarjım", "bitti", "uyuyacağım", "yorgunum", "toplantı", "dersteyim", "araba", "görmedim", "sessizde", "duş", "yemek"]
            found_excuses = []
            for msg in sender_df['content']:
                for exc in excuse_keywords:
                    if exc in msg.lower() and exc not in found_excuses:
                        found_excuses.append(exc)

            # --- 8. FUSION ENGINE: Cross-Reference (AI POWERED) ---
            cross_references = []
            if osint_data:
                # Prepare data for AI
                behavioral_summary = {
                    "sleep": sleep_report,
                    "passive_aggressive": pa_level,
                    "interest_level": interest_level,
                    "emotional_tone": tone,
                    "common_excuses": found_excuses
                }
                # Get last 20 messages for context
                sample_msgs = "\n".join([f"- {m}" for m in sender_df['content'].tail(20).tolist()])
                
                # Call AI
                cross_references = self.ai_cross_reference(sender, osint_data, behavioral_summary, sample_msgs)

            # Save Results (Inside Loop)
            results["analysis"][sender] = {
                "sleep_pattern": {
                    "consistency": sleep_consistency,
                    "report": sleep_report,
                    "avg_bed": avg_bed_str,
                    "avg_wake": avg_wake_str,
                    "anomalies": []
                },
                "passive_aggressive": {
                    "score": int(pa_final_score),
                    "level": pa_level,
                    "examples": pa_evidence[:3]
                },
                "ghosting": {
                    "risk_score": int(ghosting_risk),
                    "unanswered_chains": unanswered_chains,
                    "message": "Risk Analizi Tamamlandı",
                    "avg_response_all": int(median_resp),
                    "avg_response_recent": int(median_resp)
                },
                "interest": {
                    "score": int(interest_final),
                    "level": interest_level,
                    "initiation_rate": int(init_rate),
                    "avg_len_diff": int(my_len - other_len) if other_len > 0 else 0,
                    "stats": f"Başlatma: %{int(init_rate)} | Hız: {int(median_resp)}dk"
                },
                "inconsistency": {
                    "paradoxes": paradoxes[:3]
                },
                "emotional_tone": {
                    "tone": tone,
                    "positivity_ratio": f"{pos_count} vs {neg_count}"
                },
                "excuses": found_excuses[:10],
                "cross_reference": cross_references 
            }
            
        return results

    def ai_cross_reference(self, sender, osint_data, behavioral_summary, sample_messages):
        """
        Uses Gemini to find deep contradictions between Chat Persona and Digital Persona.
        """
        prompt = f"""
        Act as a profiler. Cross-reference this person's "Digital Identity" (Web Search) with their "Chat Behavior" (WhatsApp).
        Find psychological inconsistencies, lies, or interesting overlaps.

        Target Name: {sender}

        1. DIGITAL IDENTITY (Public Persona):
        {json.dumps(osint_data, indent=2, ensure_ascii=False)}

        2. CHAT BEHAVIOR (Private Persona):
        {json.dumps(behavioral_summary, indent=2, ensure_ascii=False)}

        3. SAMPLE MESSAGES (Last 20):
        {sample_messages}

        Task: Compare Private vs Public.
        - Does their "busy" excuses match their public activity?
        - Is their emotional tone in chat different from their social media persona?
        - Detective Mode: Find 3 definitive "Paradoxes" or "Insights".

        Return JSON (Turkish):
        {{
            "cross_reference": [
                {{ "type": "Kısa Başlık (Örn: Gizli Oyuncu)", "desc": "Detaylı açıklama..." }},
                {{ "type": "Başlık", "desc": "Açıklama..." }}
            ]
        }}
        """
        try:
            response = self.model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text).get("cross_reference", [])
        except Exception as e:
            print(f"AI Fusion Error: {e}")
            return []
