import time
import logging
from datetime import datetime
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from src.driver import WhatsAppDriver
from src.database import DatabaseManager

class OnlineTracker(WhatsAppDriver):
    def __init__(self):
        super().__init__()
        self.db = DatabaseManager()
        self.current_status = {"state": "idle", "message": "", "remaining": 0}
        self.is_tracking = False

    def update_status(self, state, message, remaining=0, phone_number=None, contact_name=None, extra=None, start_time=None, end_time=None):
        self.current_status = {
            "state": state,
            "message": message,
            "remaining": remaining,
            "phone_number": phone_number,
            "contact_name": contact_name,
            "start_time": start_time,
            "end_time": end_time,
            **(extra or {})
        }

    def stop_tracking(self):
        """Stops the current tracking session."""
        self.is_tracking = False
        self.update_status("cancelled", "Takip iptal ediliyor...", 0)

    def get_current_status(self):
        return self.current_status

    def track_user(self, user_id: int, phone_number: str, start_time_str: str, end_time_str: str):
        """
        Tracks the online status of a user between start_time and end_time.
        Times should be in ISO format or HH:MM string (assuming today).
        """
        if not self.validate_driver():
            logging.error("Driver could not be initialized.")
            return {"status": "error", "message": "Driver could not be initialized"}

        # Parse times
        now = datetime.now()
        try:
            # Try parsing as full ISO first
            start_dt = datetime.fromisoformat(start_time_str)
            end_dt = datetime.fromisoformat(end_time_str)
        except ValueError:
            # Fallback to HH:MM for today
            try:
                st_time = datetime.strptime(start_time_str, "%H:%M").time()
                et_time = datetime.strptime(end_time_str, "%H:%M").time()
                start_dt = datetime.combine(now.date(), st_time)
                end_dt = datetime.combine(now.date(), et_time)
                
                if end_dt < start_dt:
                    end_dt = end_dt.replace(day=now.day + 1)
            except Exception as e:
                 logging.error(f"Time parse error: {e}")
                 return {"status": "error", "message": "Invalid time format"}

        duration_seconds = (end_dt - start_dt).total_seconds()
        if duration_seconds <= 0:
             return {"status": "error", "message": "End time must be after start time"}

        logging.info(f"Scheduled tracking for {phone_number} from {start_dt} to {end_dt}.")
        print(f"Takip Planlandı: {phone_number} | {start_dt.strftime('%H:%M')} -> {end_dt.strftime('%H:%M')}")
        
        # Prepare start/end strings for UI
        fmt_start = start_dt.strftime('%H:%M')
        fmt_end = end_dt.strftime('%H:%M')

        # PREPARING
        self.is_tracking = True
        self.update_status("preparing", "Hazırlık yapılıyor...", 0, phone_number, start_time=fmt_start, end_time=fmt_end)

        # 1. Open Chat & Check Login IMMEDIATELY
        contact_name = None
        try:
            print("WhatsApp Web açılıyor...")
            self.driver.set_page_load_timeout(30)
            self.driver.get(f"https://web.whatsapp.com/send?phone={phone_number}")
            
            try:
                self.driver.switch_to.window(self.driver.window_handles[0])
            except: pass
            
            print("Giriş kontrol ediliyor...")
            login_wait_start = datetime.now()
            while not self.is_logged_in():
                if not self.is_tracking:
                    return {"status": "cancelled"}
                
                if (datetime.now() - login_wait_start).total_seconds() > 60:
                     self.update_status("preparing", "Lütfen QR kodu okutun!", 0, phone_number, start_time=fmt_start, end_time=fmt_end)
                time.sleep(1)
            
            print("Giriş başarılı. Sohbet yükleniyor...")
            WebDriverWait(self.driver, 60).until(
                EC.presence_of_element_located((By.XPATH, '//div[@contenteditable="true"][@data-tab="10"]'))
            )
            print("Sohbet açıldı.")
            
            try:
                name_element = self.driver.find_element(By.XPATH, '//header//div[@role="button"]//span[@dir="auto"]')
                contact_name = name_element.text
                print(f"Kişi Adı Tespit Edildi: {contact_name}")
            except:
                print("Kişi adı alınamadı, numara kullanılacak.")
                
        except Exception as e:
            logging.error(f"Failed to open chat: {e}")
            self.update_status("error", "Sohbet açılamadı", 0, phone_number, start_time=fmt_start, end_time=fmt_end)
            return {"status": "error", "message": f"Chat could not be opened: {str(e)}"}

        # 2. Wail for Start Time
        wait_seconds = (start_dt - datetime.now()).total_seconds()
        if wait_seconds > 0:
            print(f"Başlangıç saatine {int(wait_seconds)} saniye var. Bekleniyor...")
            self.update_status("planned", f"Analiz Bekleniyor...", int(wait_seconds), phone_number, contact_name, start_time=fmt_start, end_time=fmt_end)
            
            while datetime.now() < start_dt:
                if not self.is_tracking:
                    print("Takip bekleme sırasında iptal edildi.")
                    self.update_status("cancelled", "Takip iptal edildi", 0, phone_number, contact_name, start_time=fmt_start, end_time=fmt_end)
                    return {"status": "cancelled"}
                
                rem = (start_dt - datetime.now()).total_seconds()
                self.update_status("planned", f"Analiz Bekleniyor...", int(rem), phone_number, contact_name, start_time=fmt_start, end_time=fmt_end)
                time.sleep(1)
        
        print("İzleme başlıyor...")

        # 3. Monitoring Loop
        online_intervals = []
        events = []
        current_online_start = None
        current_state = "OFFLINE"
        
        try:
            while datetime.now() < end_dt and self.is_tracking:
                remaining = (end_dt - datetime.now()).total_seconds()
                if remaining <= 0:
                    print("Süre doldu.")
                    break

                self.update_status("running", f"Takip ediliyor...", int(remaining), phone_number, contact_name, extra={"sub_state": current_state}, start_time=fmt_start, end_time=fmt_end)
                
                # Retry getting contact name if needed
                if not contact_name or "tıklayın" in contact_name.lower():
                    try:
                        selectors = ['//header//div[@role="button"]//span[@dir="auto"]', '//header//div[@role="button"]//span[contains(@class, "title")]']
                        for sel in selectors:
                            try:
                                el = self.driver.find_element(By.XPATH, sel)
                                if el.text and "tıklayın" not in el.text.lower():
                                    contact_name = el.text
                                    break
                            except: continue
                    except: pass

                try:
                    # Detect State
                    new_state = "OFFLINE"
                    try:
                        header = self.driver.find_element(By.TAG_NAME, "header")
                        status_text = header.text.lower()
                        
                        if "ses kaydediliyor" in status_text:
                            new_state = "RECORDING"
                        elif "yazıyor" in status_text:
                            new_state = "TYPING"
                        elif "çevrimiçi" in status_text or "online" in status_text:
                            new_state = "ONLINE"
                    except: 
                        pass 
                    
                    is_active = new_state != "OFFLINE"
                    timestamp = datetime.now().isoformat()

                    # State Change Events
                    if new_state != current_state:
                        if current_state == "TYPING": events.append({"time": timestamp, "type": "TYPING_END"})
                        elif current_state == "RECORDING": events.append({"time": timestamp, "type": "RECORDING_END"})
                        
                        if new_state == "TYPING": events.append({"time": timestamp, "type": "TYPING_START"})
                        elif new_state == "RECORDING": events.append({"time": timestamp, "type": "RECORDING_START"})
                        
                        print(f"[{datetime.now().strftime('%H:%M:%S')}] State Change: {current_state} -> {new_state}")
                        current_state = new_state

                    # Online Interval Logic
                    if is_active:
                        if not current_online_start:
                            current_online_start = datetime.now()
                            print(f"[{datetime.now().strftime('%H:%M:%S')}] [ONLINE] Çevrimiçi")
                            events.append({"time": timestamp, "type": "ONLINE"})
                    else:
                        if current_online_start:
                            interval = {
                                "start": current_online_start.isoformat(),
                                "end": datetime.now().isoformat(),
                                "duration": (datetime.now() - current_online_start).total_seconds()
                            }
                            if interval['duration'] > 1:
                                online_intervals.append(interval)
                                print(f"[{datetime.now().strftime('%H:%M:%S')}] [OFFLINE] Çevrimdışı (Süre: {interval['duration']:.1f}s)")
                                events.append({"time": timestamp, "type": "OFFLINE"})
                            current_online_start = None
                            
                except Exception as e:
                    pass
                
                time.sleep(1)
                
            if current_online_start:
                interval = {
                    "start": current_online_start.isoformat(),
                    "end": datetime.now().isoformat(),
                    "duration": (datetime.now() - current_online_start).total_seconds()
                }
                online_intervals.append(interval)

        except KeyboardInterrupt:
            print("Takip manuel olarak durduruldu.")
        
        if not self.is_tracking:
            self.update_status("cancelled", "Takip iptal edildi", 0, phone_number, contact_name, start_time=fmt_start, end_time=fmt_end)
            return {"status": "cancelled"}

        # 4. Save Results
        total_duration = sum(i['duration'] for i in online_intervals)
        
        self.db.save_tracking_record(
            user_id=user_id,
            phone_number=phone_number,
            start_time=start_dt.isoformat(),
            end_time=datetime.now().isoformat(),
            duration=int(total_duration),
            intervals=online_intervals,
            status="completed",
            contact_name=contact_name,
            events=events
        )
        
        self.update_status("completed", "Takip tamamlandı", 0, phone_number, contact_name, start_time=fmt_start, end_time=fmt_end)
        print(f"Takip Tamamlandı. Toplam Çevrimiçi Süre: {total_duration:.1f} saniye")
        return {
            "status": "completed",
            "phone_number": phone_number,
            "total_duration": total_duration,
            "intervals": online_intervals,
            "contact_name": contact_name
        }

if __name__ == "__main__":
    # Test
    tracker = OnlineTracker()
    tracker.load_whatsapp()
    # tracker.track_user("905551234567", 1) 
