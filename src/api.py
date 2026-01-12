from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import timedelta, datetime
import os
import google.generativeai as genai
from starlette.concurrency import run_in_threadpool

from src.analyzer import ChatAnalyzer
from src.agent_analyzer import AgentAnalyzer
from src.fun_analyzer import FunAnalyzer
from src.flirt_analyzer import FlirtAnalyzer
from src.database import DatabaseManager
from src.models import Message
from src.tracker import OnlineTracker
from src.ghost_buster import GhostBuster
from src.osint_agent import OSINTAgent
from src.auth import (
    create_access_token, 
    get_password_hash, 
    verify_password,
    decode_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

app = FastAPI(title="WIA-Bot API", description="API for HanChat - WhatsApp Intelligence & Automation")

# --- Security & Auth ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    db = DatabaseManager()
    user = db.get_user(username)
    if user is None:
        raise credentials_exception
    if user is None:
        raise credentials_exception
    return user

async def get_current_admin_user(current_user: dict = Depends(get_current_user)):
    if not current_user.get('is_admin'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin yetkisi gerekiyor"
        )
    return current_user

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Auth Endpoints ---
@app.post("/auth/register")
async def register(user_data: dict):
    db = DatabaseManager()
    if not user_data.get('username') or not user_data.get('password') or not user_data.get('email'):
        raise HTTPException(status_code=400, detail="Eksik bilgi")
        
    hashed_password = get_password_hash(user_data['password'])
    success = db.create_user(user_data['username'], user_data['email'], hashed_password)
    if not success:
        raise HTTPException(status_code=400, detail="Kullanıcı adı veya email zaten kayıtlı")
        
    return {"message": "Kayıt başarılı", "status": "success"}

@app.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = DatabaseManager()
    user = db.get_user(form_data.username)
    if not user or not verify_password(form_data.password, user['hashed_password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hatalı kullanıcı adı veya şifre",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['username']}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "username": user['username'],
        "is_admin": user.get('is_admin', False)
    }

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@app.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    db = DatabaseManager()
    user = db.get_user_by_email(request.email)
    
    if not user:
        # Security: Don't reveal if user exists.
        # But for UX in early dev, maybe we do? 
        # Let's stick to generic success message.
        return {"message": "Email adresinize bir sıfırlama linki gönderildi."}
    
    # Generate a short-lived token (24 hours) specifically for reset
    reset_token = create_access_token(
        data={"sub": user['username'], "type": "reset"}, 
        expires_delta=timedelta(hours=24)
    )
    
    from src.email_utils import send_reset_email
    
    sent = send_reset_email(request.email, reset_token)
    
    if sent:
        return {"message": "Email adresinize bir sıfırlama linki gönderildi."}
    else:
        raise HTTPException(status_code=500, detail="Email gönderilemedi.")

class ContactMessage(BaseModel):
    name: str
    surname: str
    email: str
    subject: str
    message: str

@app.post("/contact")
async def contact_form(msg: ContactMessage, background_tasks: BackgroundTasks):
    try:
        # 1. Save to Database
        db = DatabaseManager()
        db_success = db.save_contact_message(msg.name, msg.surname, msg.email, msg.subject, msg.message)
        
        # 2. Send Notification Email (Background Task)
        # Import inside function to avoid circular imports if any, or just keep as is
        from src.email_utils import send_contact_notification
        
        # Run email sending in background so UI doesn't hang
        background_tasks.add_task(send_contact_notification, msg.name, msg.surname, msg.email, msg.subject, msg.message)
        
        if not db_success:
             print("Warning: Failed to save contact message to DB")

        return {"status": "success", "email_queued": True, "db_saved": db_success}
    
    except Exception as e:
        print(f"Contact endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    try:
        payload = decode_access_token(request.token)
        if not payload or payload.get("type") != "reset":
            raise HTTPException(status_code=400, detail="Geçersiz veya süresi dolmuş token.")
            
        username = payload.get("sub")
        db = DatabaseManager()
        user = db.get_user(username)
        
        if not user:
             raise HTTPException(status_code=400, detail="Kullanıcı bulunamadı.")
             
        hashed_password = get_password_hash(request.new_password)
        updated = db.update_password(user['email'], hashed_password)
        
        if updated:
            return {"message": "Şifreniz başarıyla güncellendi."}
        else:
             raise HTTPException(status_code=500, detail="Veritabanı hatası.")
             
    except Exception as e:
        raise HTTPException(status_code=400, detail="İşlem başarısız.")

# --- Admin Endpoints ---
@app.get("/admin/users")
def get_all_users_admin(current_user: dict = Depends(get_current_admin_user)):
    db = DatabaseManager()
    return db.get_all_users()

@app.delete("/admin/users/{user_id}")
def delete_user_admin(user_id: int, current_user: dict = Depends(get_current_admin_user)):
    if user_id == current_user['id']:
        raise HTTPException(status_code=400, detail="Kendinizi silemezsiniz.")
        
    db = DatabaseManager()
    db = DatabaseManager()
    if db.delete_user(user_id):
        return {"status": "success", "message": "Kullanıcı silindi"}
    raise HTTPException(status_code=500, detail="Silme başarısız")

@app.get("/admin/users/{user_id}/messages")
def get_user_messages_admin(user_id: int, current_user: dict = Depends(get_current_admin_user)):
    db = DatabaseManager()
    # reuse existing get_messages logic
    messages = db.get_messages(user_id=user_id)
    return messages

@app.get("/")
def read_root():
    return {"status": "online", "message": "HanChat API is running 🚀"}

# --- Analyzer Dependencies ---
def get_analyzer(current_user: dict = Depends(get_current_user)) -> ChatAnalyzer:
    analyzer = ChatAnalyzer(user_id=current_user['id'])
    # We load data per request for isolation. 
    # Optimization: In high-scale, cache this or don't load all DF.
    analyzer.load_data() 
    return analyzer

# --- Stats Endpoints ---
@app.get("/stats")
def get_stats(analyzer: ChatAnalyzer = Depends(get_analyzer)):
    if analyzer.df is None or analyzer.df.empty:
         # Even if empty, return structure with 0s to prevent FE crash
         return {"total_messages": 0, "senders": {}, "most_active_day": "-"}
    
    stats = analyzer.get_basic_stats()
    def convert(v): return v.item() if hasattr(v, 'item') else v
    return {k: convert(v) for k, v in stats.items()}

@app.get("/activity/daily")
def get_daily_activity(analyzer: ChatAnalyzer = Depends(get_analyzer)):
    daily = analyzer.get_daily_activity()
    if daily.empty: return []
    return [{"date": str(d), "count": int(c)} for d, c in daily.items()]

@app.get("/activity/hourly")
def get_hourly_activity(analyzer: ChatAnalyzer = Depends(get_analyzer)):
    hourly = analyzer.get_hourly_activity()
    return [{"hour": h, "count": int(c)} for h, c in hourly.items()]

@app.get("/heatmap")
def get_heatmap(analyzer: ChatAnalyzer = Depends(get_analyzer)):
    # Re-implement heatmap logic using analyzer's df
    if analyzer.df is None or analyzer.df.empty: return []
    
    df_heat = analyzer.df.copy()
    df_heat['day_of_week'] = df_heat['timestamp'].dt.day_name()
    heatmap_data = []
    grouped = df_heat.groupby(['day_of_week', 'hour']).size().reset_index(name='count')
    
    for _, row in grouped.iterrows():
        heatmap_data.append({
            "day": row['day_of_week'], "hour": int(row['hour']), "value": int(row['count'])
        })
    return heatmap_data

@app.get("/words")
def get_top_words(limit: int = 20, analyzer: ChatAnalyzer = Depends(get_analyzer)):
    words = analyzer.get_top_words(limit)
    return [{"text": w, "value": c} for w, c in words]

@app.get("/emojis")
def get_top_emojis(limit: int = 10, analyzer: ChatAnalyzer = Depends(get_analyzer)):
    emojis = analyzer.get_emoji_stats(limit)
    return [{"emoji": e, "count": c} for e, c in emojis]

@app.get("/senders")
def get_sender_stats(analyzer: ChatAnalyzer = Depends(get_analyzer)):
    stats = analyzer.get_sender_stats()
    if stats.empty: return []
    return [{"name": index, "count": int(row['Message Count']), "avg_len": float(row['Avg Length'])} 
            for index, row in stats.iterrows()]

@app.get("/sender/{name}")
def get_sender_analysis(name: str, analyzer: ChatAnalyzer = Depends(get_analyzer)):
    result = analyzer.get_sender_analysis(name)
    if not result: raise HTTPException(status_code=404, detail="Sender not found")
    
    result['most_active_day'] = str(result['most_active_day'])
    result['hourly_activity'] = [{"hour": h, "count": int(c)} for h, c in result['hourly_activity'].items()]
    result['top_words'] = [{"text": w, "value": c} for w, c in result['top_words']]
    result['top_emojis'] = [{"emoji": e, "count": c} for e, c in result['top_emojis']]
    return result

# --- File Analysis (Uploads) ---
# NOTE: These specialized analyzers (Fun, Agent, Flirt) process the file content directly 
# and return results. They don't necessarily save to DB for long-term storage in this flow yet.
# If they DO save to DB, they need to be updated to accept user_id too.
# For now, let's assume they return instant analysis.

@app.get("/admin/users/{user_id}/uploads")
def get_user_uploads_admin(user_id: int, current_user: dict = Depends(get_current_admin_user)):
    db = DatabaseManager()
    return db.get_user_uploads(user_id)

@app.get("/admin/uploads")
def get_file_uploads_admin(current_user: dict = Depends(get_current_admin_user)):
    db = DatabaseManager()
    return db.get_all_file_uploads()

@app.post("/analyze/file")
async def analyze_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        content = await file.read()
        text = ""
        try: text = content.decode("utf-8")
        except: 
            try: text = content.decode("utf-16")
            except: text = content.decode("latin-1", errors="ignore")
            
        # Log to DB
        try:
            db = DatabaseManager()
            db.log_file_upload(current_user['id'], file.filename, len(content))
        except Exception as db_err:
            print(f"Failed to log file upload: {db_err}")

        print(f"DEBUG: Analyzed File Length: {len(text)}")
        
        # Write to debug_log.txt for agent to see
        try:
            log_dir = "/app/logs"
            os.makedirs(log_dir, exist_ok=True)
            log_path = os.path.join(log_dir, "debug_log.txt")
            with open(log_path, "w", encoding="utf-8") as f:
                f.write(f"File Length: {len(text)}\n")
                f.write(f"First 500 chars:\n{text[:500]}\n")
                f.write("-" * 20 + "\n")
        except Exception as e:
            print(f"Failed to write debug log: {e}")

        fun_analyzer = FunAnalyzer()
        result = fun_analyzer.analyze(text)
        
        # Ensure result is not None
        if not result:
            raise ValueError("Analyzer returned None")
            
        return result

    except Exception as e:
        # GLOBAL FALLBACK: Return 200 with error info so frontend shows it
        import traceback
        tb = traceback.format_exc()
        print(f"CRITICAL API ERROR: {e}")
        return {
            "total_messages": 0,
            "participants": ["SISTEM HATASI"],
            "stats": {
                "SISTEM HATASI": {
                    "message_count": 0, "avg_length": 0, "top_words": [], "top_emojis": [], 
                    "fun_metrics": { "laugh_count": 0, "shout_count": 0, "question_count": 0, "media_count": 0, "emoji_count": 0, "night_owl_count": 0, "early_bird_count": 0, "avg_len": 0, "slang_count": 0, "unique_word_count": 0, "deleted_count": 0, "max_msg_len": 0, "call_count": 0, "pure_question_count": 0, "pure_exclaim_count": 0, "sentiment_score": 0, "manipulative_count": 0, "avg_response_time": 0, "fast_reply_count": 0, "gif_count": 0, "emotionless_score": 0, "details": {}, "hourly_distribution": [0]*24, "sentiment_counts": {"pos": 0, "neg": 0, "neu": 0} }
                }
            },
            "titles": {
                "Analiz Hatası ⚠️": {
                    "winner": "Sistem",
                    "value": "HATA",
                    "description": "Bir şeyler ters gitti.",
                    "details": {}
                },
                "Hata Detayı 📝": {
                    "winner": "Log",
                    "value": str(e),
                    "description": tb[-100:], # Short traceback
                    "details": {}
                }
            }
        }

@app.post("/analyze/agent")
async def analyze_agent_mode(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    content = await file.read()
    try: text = content.decode("utf-8")
    except: text = content.decode("latin-1", errors="ignore") # Simple fallback
        
    agent_analyzer = AgentAnalyzer()
    result = agent_analyzer.analyze(text)
    if not result: raise HTTPException(status_code=400, detail="Could not parse file")
    return result

@app.post("/analyze/flirt")
async def analyze_flirt_mode(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    content = await file.read()
    try: text = content.decode("utf-8")
    except: text = content.decode("latin-1")
        
    flirt_analyzer = FlirtAnalyzer()
    result = flirt_analyzer.analyze(text)
    if not result: raise HTTPException(status_code=400, detail="Could not parse file")
    return result

@app.post("/analyze/ultimate")
async def analyze_ultimate_agent(
    file: UploadFile = File(...), 
    name: str = "Unknown", 
    instagram: Optional[str] = None,
    twitter: Optional[str] = None,
    linkedin: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    content = await file.read()
    try: text = content.decode("utf-8")
    except: text = content.decode("latin-1", errors="ignore")
    
    osint = OSINTAgent()
    handles = {}
    if instagram: handles["instagram"] = instagram
    if twitter: handles["twitter"] = twitter
    if linkedin: handles["linkedin"] = linkedin
    
    try:
        digital_identity = await run_in_threadpool(osint.search_target, name, handles)
        agent_analyzer = AgentAnalyzer()
        result = agent_analyzer.analyze(text, osint_data=digital_identity, target_name=name)
        if not result: raise HTTPException(status_code=400, detail="Could not parse")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- AI & GhostBuster ---
class AIAnalysisRequest(BaseModel):
    stats: Dict[str, Any]
    user_prompt: str
    group_type: Optional[str] = None
    api_key: Optional[str] = None

@app.post("/track/verify/{record_id}")
async def verify_tracking_session(record_id: int, file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        content = await file.read()
        try: text = content.decode("utf-8")
        except: text = content.decode("utf-16", errors="ignore")
            
        db = DatabaseManager()
        # Ensure we only fetch this user's history
        history = db.get_tracking_history(user_id=current_user['id'])
        record = next((r for r in history if r['id'] == record_id), None)
        
        if not record: raise HTTPException(status_code=404, detail="Record not found")
        if not record.get('events'): return {"ghosts": [], "message": "No detailed events found."}
             
        buster = GhostBuster()
        session_date = datetime.fromisoformat(record['start_time']).date()
        target_name = record['contact_name'] or record['phone_number']
        
        ghosts = buster.verify_session(record['events'], text, target_name, session_date)
        return {"ghosts": ghosts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/ai")
async def analyze_with_ai(request: AIAnalysisRequest, current_user: dict = Depends(get_current_user)):
    try:
        api_key = request.api_key or os.getenv("GEMINI_API_KEY")
        print(f"DEBUG: Using API Key: {api_key[:5] if api_key else 'None'}...") # Log partial key
        if not api_key: 
            print("ERROR: GEMINI_API_KEY not found in env or request.")
            raise HTTPException(status_code=400, detail="API Key required")
            
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-3-flash-preview')
        
        participants = request.stats.get("participants", [])
        titles = request.stats.get("titles", {})
        
        summary = f"Sohbet Katılımcıları: {', '.join(participants)}\n"
        for title, data in titles.items(): summary += f"- {title}: {data['winner']} ({data['description']})\n"
        context_intro = f"Grup Türü: {request.group_type}\n" if request.group_type else ""
        
        prompt = f"""
        Aşağıdaki WhatsApp sohbet analiz verilerine ve kullanıcının verdiği bağlama göre, bu kişiler arasındaki ilişkiyi, arkadaşlık seviyesini ve dinamikleri ÇOK EĞLENCELİ, MİZAHİ ve YARATICI bir dille yorumla.

        {context_intro}
        Kullanıcı Bağlamı: {request.user_prompt}
        
        Analiz Verileri:
        {summary}

        Lütfen cevabını şu başlıklar altında, **Markdown** formatında ver:
        1. 🎭 **Genel Grup/İlişki Dinamiği**
        2. 🔮 **Gelecek Tahmini (5 Yıl Sonra)**
        3. 💼 **Rol Dağılımı / Meslek Yakıştırması**
        4. ⭐ **Grup Burcu / Ruhu**
        5. 🎬 **Hangi Film/Dizi Karakterleri?**
        
        Lütfen bol bol emoji kullan ve samimi ol!
        """
        response = model.generate_content(prompt)
        return {"insight": response.text}
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"AI ERROR DETAILS: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")

# --- Tracking System ---
# Global dict to store trackers per user: {user_id: OnlineTracker}
active_trackers: Dict[int, OnlineTracker] = {}

def run_tracking_task(user_id: int, phone: str, start_time: str, end_time: str):
    global active_trackers
    print(f"Background Task Started: Tracking {phone} for User {user_id}")
    try:
        # Create or reuse tracker
        if user_id not in active_trackers:
            print(f"Initializing Tracker for User {user_id}...")
            tracker = OnlineTracker()
            if not tracker.driver:
                 print("Loading WhatsApp Web...")
                 tracker.load_whatsapp()
            active_trackers[user_id] = tracker
        
        tracker = active_trackers[user_id]
        tracker.track_user(user_id=user_id, phone_number=phone, start_time_str=start_time, end_time_str=end_time)
        
    except Exception as e:
        print(f"Tracking failed: {e}")
        if user_id in active_trackers:
             active_trackers[user_id].update_status("error", f"Hata: {str(e)}")

@app.post("/track/start")
async def start_tracking(
    background_tasks: BackgroundTasks, 
    phone: str, 
    start_time: str, 
    end_time: str,
    current_user: dict = Depends(get_current_user)
):
    print(f"DEBUG: Tracking Req: {phone}, {start_time}-{end_time} by {current_user['username']}")
    user_id = current_user['id']
    
    global active_trackers
    if user_id in active_trackers:
        status = active_trackers[user_id].get_current_status()
        if status['state'] in ['running', 'waiting', 'initializing']:
             raise HTTPException(status_code=409, detail="Zaten aktif bir takibiniz var.")

    if not phone or not start_time or not end_time:
        raise HTTPException(status_code=400, detail="Invalid parameters")
        
    background_tasks.add_task(run_tracking_task, user_id, phone, start_time, end_time)
    return {"status": "started", "message": f"Tracking scheduled for {phone}."}

@app.get("/track/status")
def get_tracking_status(current_user: dict = Depends(get_current_user)):
    user_id = current_user['id']
    if user_id in active_trackers:
        return active_trackers[user_id].get_current_status()
    return {"state": "idle", "message": "No active tracker", "remaining": 0}

@app.post("/track/stop")
def stop_tracking(current_user: dict = Depends(get_current_user)):
    user_id = current_user['id']
    if user_id in active_trackers:
        active_trackers[user_id].stop_tracking()
        return {"status": "stopped", "message": "Tracking stopped."}
    return {"status": "error", "message": "No active tracker found."}

@app.get("/track/history")
def get_tracking_history_endpoint(current_user: dict = Depends(get_current_user)):
    db = DatabaseManager()
    return db.get_tracking_history(user_id=current_user['id'])

@app.delete("/track/history/{record_id}")
def delete_tracking_history(record_id: int, current_user: dict = Depends(get_current_user)):
    db = DatabaseManager()
    if db.delete_tracking_record(record_id, user_id=current_user['id']):
        return {"status": "success", "message": "Record deleted"}
    raise HTTPException(status_code=500, detail="Failed to delete record")

@app.post("/track/dismiss")
def dismiss_tracking_notification(current_user: dict = Depends(get_current_user)):
    user_id = current_user['id']
    if user_id in active_trackers:
        active_trackers[user_id].update_status("idle", "", 0)
        return {"status": "dismissed"}
    return {"status": "ignored"}

@app.get("/debug-email-test")
def debug_email_test():
    """
    Temporary endpoint to debug email sending connectivity and credentials.
    Returns detailed logs of the attempt.
    """
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    
    version = "v5 (IPv4 + Port 587)"
    logs = []
    logs.append(f"Debug Endpoint Version: {version}")
    
    # 1. Check Env Vars
    username = os.getenv("MAIL_USERNAME")
    password = os.getenv("MAIL_PASSWORD")
    
    logs.append(f"Env Check: USERNAME={'Set' if username else 'MISSING'}, PASSWORD={'Set' if password else 'MISSING'}")
    
    if not username or not password:
        return {"status": "failed", "logs": logs, "error": "Environment variables missing"}

    # 2. Try Connection
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587
    
    try:
        import socket
        logs.append(f"Resolving {SMTP_SERVER} to IPv4...")
        gmail_ip = socket.gethostbyname(SMTP_SERVER)
        logs.append(f"Resolved IP: {gmail_ip}")
        
        logs.append(f"Connecting to {gmail_ip}:{SMTP_PORT} (forcing IPv4)...")
        
        # Connect to IP using standard SMTP (not SSL initially)
        server = smtplib.SMTP(gmail_ip, SMTP_PORT, timeout=20)
        server.set_debuglevel(1)
        
        logs.append("Connected. Sending STARTTLS...")
        server.starttls()
        logs.append("STARTTLS successful.")
        
        # 3. Try Login
        logs.append(f"Attempting login as {username}...")
        server.login(username, password)
        logs.append("Login successful.")
        
        # 4. Try Send
        msg = MIMEMultipart()
        msg['From'] = username
        msg['To'] = username
        msg['Subject'] = "HanChat Debug Test Email (IPv4 Forced)"
        msg.attach(MIMEText("This is a test email to verify credentials (IPv4 Forced).", 'plain'))
        
        server.send_message(msg)
        logs.append(f"Test email sent to {username}")
        
        server.quit()
        return {"status": "success", "version": version, "logs": logs, "message": "Email sent successfully! check inbox."}
        
    except smtplib.SMTPAuthenticationError as e:
        logs.append(f"AUTH ERROR: {str(e)}")
        return {"status": "failed", "version": version, "logs": logs, "error": "Authentication Failed. Ensure Use App Password.", "details": str(e)}
    except Exception as e:
        logs.append(f"GENERAL ERROR: {str(e)}")
        return {"status": "failed", "version": version, "logs": logs, "error": str(e)}
