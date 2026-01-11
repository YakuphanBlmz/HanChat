from src.agent_analyzer import AgentAnalyzer
import pandas as pd
from datetime import datetime, timedelta
import json

# Create dummy chat data
data = """10.12.2024 23:30 - Person A: İyi geceler rüyamda seni göreceğim
10.12.2024 23:31 - Person B: Peki.
11.12.2024 09:00 - Person A: Günaydın, kalktın mı?
11.12.2024 09:05 - Person A: Orada mısın?
11.12.2024 14:00 - Person B: Evet.
11.12.2024 14:01 - Person B: İşim var sonra konuşalım.
11.12.2024 14:10 - Person B: Aslında şöyle bir şey oldu... (uzun hikaye anlatıyor burada baya uzun) (uzun hikaye anlatıyor burada baya uzun)
11.12.2024 14:11 - Person B: Ve sonra bitti.
"""

try:
    analyzer = AgentAnalyzer()
    results = analyzer.analyze(data)

    with open('debug_output.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print("Output written to debug_output.json")
except Exception as e:
    print(f"Error: {e}")
