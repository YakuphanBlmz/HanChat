import re
from datetime import datetime, timedelta
import pandas as pd
from typing import List, Dict, Any

class GhostBuster:
    def __init__(self):
        pass

    def parse_chat_for_verification(self, content: str, sender_name: str) -> List[datetime]:
        """
        Parses chat content and extracts message timestamps for the target sender.
        Assumes standard WhatsApp export format but tries to be robust.
        """
        messages = []
        # Regex for standard WhatsApp timestamp: [dd.mm.yyyy HH:MM:SS] Sender: Message
        # Or dd.mm.yyyy HH:MM - Sender: Message
        # We focus on HH:MM because that's usually the granularity we get
        
        lines = content.split('\n')
        
        # Regex to capture timestamp and sender
        # 1. [14:35:00] Sender:
        # 2. 14:35 - Sender:
        # 3. 14:35, 1.1.2023 - Sender: 
        
        for line in lines:
            try:
                # Remove LRM marks
                line = line.replace('\u200e', '')
                
                # Check if line contains the sender name
                if sender_name not in line:
                    continue
                    
                # Extract time part. This is tricky with various formats.
                # Let's try to find HH:MM pattern
                match = re.search(r'(\d{1,2})[:.](\d{2})', line)
                if match:
                    hour = int(match.group(1))
                    minute = int(match.group(2))
                    
                    # We might not have the exact date in the line if it's the "date header" format
                    # But for verification, we usually cross-reference with the tracking session Date.
                    # For now, let's just store the Time object or a dummy datetime
                    
                    # Better: If we have the tracking session date, we can reconstruct
                    pass 
                    
                # To be safer, let's look for known patterns that definitely indicate a message
                # Pattern: Time ... Sender:
                if f"{sender_name}:" in line:
                    # It's likely a message line.
                    # Extract timestamp from start
                    ts_part = line.split(f"{sender_name}:")[0]
                    # Find HH:MM
                    time_match = re.search(r'(\d{2}):(\d{2})', ts_part)
                    if time_match:
                        messages.append({
                            "hour": int(time_match.group(1)),
                            "minute": int(time_match.group(2)),
                            "original": line
                        })
            except:
                continue
                
        return messages

    def verify_session(self, session_events: List[Dict], chat_content: str, target_name: str, session_date: datetime.date) -> List[Dict]:
        """
        Compares session events (Typing/Recording) with actual chat messages.
        Returns a list of 'Ghost' events.
        """
        ghosts = []
        
        # 1. Parse Chat to get all message times from target
        # We need to filter chat messages that happened ON the session date
        # Parsing the date from chat export can be hard (formats vary). 
        # Strategy: We assume the chat export covers the session period.
        # We will match primarily on TIME (HH:MM).
        
        chat_messages = self.parse_chat_for_verification(chat_content, target_name)
        
        # 2. Analyze Events
        for event in session_events:
            if event['type'] not in ['TYPING_START', 'RECORDING_START']:
                continue
                
            event_time = datetime.fromisoformat(event['time'])
            
            # Check if this event happened on the same date as our target session (mostly yes)
            if event_time.date() != session_date:
                continue
            
            # Look for a message from target within [EventTime, EventTime + 2 mins]
            # Since chat logs usually only have HH:MM, we check if there is a message
            # matching the minute of the event or the next 2 minutes.
            
            found_message = False
            for msg in chat_messages:
                # Check minutes
                # Allow tolerance: Message time could be EventTime minute or +1, +2
                
                # Convert both to minutes from midnight for easier comparison
                event_mins = event_time.hour * 60 + event_time.minute
                msg_mins = msg['hour'] * 60 + msg['minute']
                
                if 0 <= (msg_mins - event_mins) <= 2:
                    found_message = True
                    break
            
            if not found_message:
                ghosts.append({
                    "type": "GHOST_TYPING" if event['type'] == 'TYPING_START' else "GHOST_RECORDING",
                    "time": event['time'],
                    "detail": f"Saat {event_time.strftime('%H:%M')}'de {event['type'] == 'TYPING_START' and 'yazıyor...' or 'ses kaydediliyor...'} görüldü ama mesaj yok."
                })
                
        return ghosts
