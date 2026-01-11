import google.generativeai as genai
import os
import json

class OSINTAgent:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        # Configure Gemini
        api_key = os.getenv("GEMINI_API_KEY") or "AIzaSyCAzlWdVznQFUDxEMZynx2e-KocB9t5xgU"
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    def search_target(self, name: str, handles: dict = None):
        """
        Performs a web search for the target and builds a digital profile using AI.
        handles: {"instagram": "username", "twitter": "username", "linkedin": "username"}
        """
        print(f"[OSINT] Starting scan for: {name}")
        
        digital_profile = {
            "summary": "Veri yok",
            "social_media": {},
            "recent_activity": [],
            "interests": [],
            "career": [],
            "potential_inconsistencies": []
        }

        # 1. Social Media Scans
        queries = [
            f'site:linkedin.com/in "{name}"',
            f'site:instagram.com "{name}"',
            f'site:twitter.com "{name}"',
            f'site:facebook.com "{name}"',
            f'"{name}" kimdir',  # Generic search
        ]

        if handles:
            if handles.get("instagram"): queries.append(f'site:instagram.com "{handles["instagram"]}"')
            if handles.get("twitter"): queries.append(f'site:twitter.com "{handles["twitter"]}"')
            if handles.get("linkedin"): queries.append(f'site:linkedin.com/in "{handles["linkedin"]}"')

        found_links = []
        raw_snippets = []

        try:
            for i, q in enumerate(queries):
                if i > 6: break # Limit queries
                
                print(f"[OSINT] Scanning ({i+1}/{len(queries)}): {q}")
                time.sleep(1.0) 
                
                try:
                    results = list(search(q, num_results=2, advanced=True, sleep_interval=1))
                except Exception as e:
                    print(f"Skipping query {q}: {e}")
                    continue
                
                for res in results:
                    found_links.append(res)
                    raw_snippets.append(f"Source: {res.url}\nTitle: {res.title}\nDescription: {res.description}\n")
                    
                    # Basic URL Mapping
                    if "linkedin.com" in res.url: digital_profile["social_media"]["linkedin"] = res.url
                    elif "instagram.com" in res.url: digital_profile["social_media"]["instagram"] = res.url
                    elif "twitter.com" in res.url: digital_profile["social_media"]["twitter"] = res.url

        except Exception as e:
            print(f"Search warning: {e}")

        # 2. AI Synthesis
        if raw_snippets:
            print("[OSINT] Synthesizing data with Gemini AI...")
            try:
                ai_report = self.synthesize_with_ai(name, raw_snippets)
                # Merge AI data
                digital_profile["summary"] = ai_report.get("summary", digital_profile["summary"])
                digital_profile["career"] = ai_report.get("career", [])
                digital_profile["interests"] = ai_report.get("interests", [])
                digital_profile["recent_activity"] = ai_report.get("recent_activity", [])
                digital_profile["potential_inconsistencies"] = ai_report.get("inconsistencies", [])
            except Exception as e:
                print(f"AI Synthesis failed: {e}")
                digital_profile["summary"] = "AI Analizi başarısız oldu, ham veriler kullanılıyor."

        return digital_profile

    def synthesize_with_ai(self, name, snippets):
        prompt = f"""
        Analyze the following search results for a person named "{name}" and extract a structured "Digital Identity".
        Ignore generic information or results clearly about other people. Focus on SPECIFIC details.

        Search Results:
        {chr(10).join(snippets)}

        Return ONLY a JSON object with this structure (Turkish language):
        {{
            "summary": "A detailed 2-3 sentence summary of who this person seems to be.",
            "career": ["List of job titles", "Companies"],
            "interests": ["List of hobbies", "topics they talk about"],
            "recent_activity": ["Specific recent actions found like 'tweeted about AI'", "attended event X"],
            "inconsistencies": ["Any contradictions found in public data"]
        }}
        """
        response = self.model.generate_content(prompt)
        # Cleanup markdown code blocks if present
        text = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(text)

if __name__ == "__main__":
    agent = OSINTAgent()
    # Test
    # res = agent.search_target("Yakuphan", {"twitter": "yakuphan"}) 
    # print(res)
