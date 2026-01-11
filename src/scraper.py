import time
import logging
from typing import List
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from src.driver import WhatsAppDriver
from src.models import Message
from datetime import datetime

class WhatsAppScraper(WhatsAppDriver):
    def __init__(self):
        super().__init__()

    def open_chat(self, contact_name: str):
        """Searches for a contact and opens the chat."""
        if not self.driver:
            return False

        try:
            logging.info(f"Opening chat with: {contact_name}")
            
            # 1. Find Search Box
            search_box_xpath = '//div[@contenteditable="true"][@data-tab="3"]'
            search_box = WebDriverWait(self.driver, 20).until(
                EC.presence_of_element_located((By.XPATH, search_box_xpath))
            )
            search_box.clear()
            search_box.send_keys(contact_name)
            time.sleep(2)  # Wait for results
            search_box.send_keys(Keys.ENTER)
            time.sleep(2)  # Wait for chat to load
            
            return True
        except Exception as e:
            logging.error(f"Failed to open chat: {e}")
            return False

    def scrape_visible_messages(self, limit=50) -> List[Message]:
        """Scrapes currently visible messages in the chat window."""
        messages = []
        try:
            # Strategy: Find all message containers
            msg_elements = self.driver.find_elements(By.XPATH, '//div[contains(@class, "message-in") or contains(@class, "message-out")]')
            
            # Take only the last 'limit' messages if limit is set
            if limit:
                msg_elements = msg_elements[-limit:]
            
            for elem in msg_elements:
                try:
                    # Extract Text
                    try:
                        text_container = elem.find_element(By.XPATH, './/span[contains(@class, "selectable-text")]')
                        content = text_container.text
                    except:
                        content = "[MEDIA/OTHER]"
                        
                    # Extract Time (Metadata)
                    try:
                        meta_container = elem.find_element(By.XPATH, './/div[@data-pre-plain-text]')
                        meta_text = meta_container.get_attribute("data-pre-plain-text") 
                        # Format: "[14:30, 27.10.2023] Sender Name: "
                        
                        parts = meta_text.strip().split('] ', 1)
                        if len(parts) < 2:
                             parts = meta_text.strip().split(']', 1)
                        
                        if len(parts) >= 2:
                            timestamp_str = parts[0].replace('[', '').strip()
                            sender = parts[1].replace(':', '').strip()
                            
                            # Try multiple formats
                            formats = [
                                "%H:%M, %d.%m.%Y", # 14:30, 27.10.2023
                                "%H:%M, %d/%m/%Y", # 14:30, 27/10/2023
                                "%I:%M %p, %m/%d/%Y", # 02:30 PM, 10/27/2023
                                "%H:%M, %Y-%m-%d" # ISO-like
                            ]
                            
                            timestamp = None
                            for fmt in formats:
                                try:
                                    timestamp = datetime.strptime(timestamp_str, fmt)
                                    break
                                except:
                                    continue
                            
                            if not timestamp:
                                timestamp = datetime.now()
                        else:
                            sender = "Unknown"
                            timestamp = datetime.now()

                    except:
                        sender = "Unknown"
                        timestamp = datetime.now()

                    msg = Message(
                        sender=sender,
                        content=content,
                        timestamp=timestamp
                    )
                    messages.append(msg)
                    
                except Exception as e:
                    continue # Skip malformed messages

            return messages

        except Exception as e:
            logging.error(f"Scraping error: {e}")
            return []

    def recursive_scrape(self, limit=None) -> List[Message]:
        """Scrapes messages while scrolling up to capture full history."""
        logging.info("Starting recursive scrape...")
        print("Derin tarama başlatıldı... (Akıllı Scroll Modu)")
        
        all_messages = {} 
        retries = 0
        max_retries = 30
        
        # Find pane once
        try:
            pane = self.driver.find_element(By.XPATH, '//div[@id="main"]//div[@data-testid="conversation-panel-messages"]')
        except:
            msgs = self.driver.find_elements(By.XPATH, '//div[contains(@class, "message-in") or contains(@class, "message-out")]')
            if msgs:
                pane = msgs[0].find_element(By.XPATH, './..')
            else:
                return []

        print("İPUCU: İşlemi istediğiniz zaman durdurmak ve o ana kadar toplananları kaydetmek için 'CTRL + C' yapabilirsiniz.")

        try:
            while retries < max_retries:
                # 1. Scrape current view
                current_batch = self.scrape_visible_messages(limit=None)
                new_msgs = 0
                for msg in current_batch:
                    key = msg.id if msg.id else f"{msg.sender}_{msg.timestamp}_{msg.content[:20]}"
                    if key not in all_messages:
                        all_messages[key] = msg
                        new_msgs += 1
                
                print(f"Toplam toplanan mesaj: {len(all_messages)} (Yeni: {new_msgs})")
                
                # 2. Check if we are stuck
                if new_msgs == 0:
                    retries += 1
                    print(f"Yeni mesaj bekleniyor... ({retries}/{max_retries})")
                    
                    # Check for top
                    try:
                        pane.find_element(By.XPATH, './/span[contains(text(), "uçtan uca şifrelidir") or contains(text(), "end-to-end encrypted")]')
                        print("Sohbetin başlangıcına ulaşıldı! 🏁")
                        break
                    except:
                        pass
                else:
                    retries = 0 
                
                # 3. Smart Scroll Up
                try:
                    # Gentle Wiggle first
                    self.driver.execute_script("arguments[0].scrollTop = 200;", pane)
                    time.sleep(0.2)
                    self.driver.execute_script("arguments[0].scrollTop = 0;", pane)
                    
                    # Wait for loading spinner or network
                    time.sleep(2.0)
                    
                    # If retrying, use keys as backup
                    if retries > 2:
                        pane.send_keys(Keys.HOME)
                        time.sleep(1)
                        pane.send_keys(Keys.PAGE_UP)
                        time.sleep(1)
                        pane.send_keys(Keys.HOME)
                        time.sleep(2)
                    
                except Exception as e:
                    logging.error(f"Scroll error: {e}")
                    break
                    
                if limit and len(all_messages) >= limit:
                    break
                    
        except KeyboardInterrupt:
            print("\n🛑 İşlem kullanıcı tarafından durduruldu. Şu ana kadar toplanan veriler kaydedilecek.")

        return list(all_messages.values())

    def scrape_all_chats(self, save_callback, deep_scrape=False, limit_per_chat=50):
        """
        Iterates through the chat list and scrapes messages from each chat.
        save_callback: Function to call to save a message (e.g., db.save_message)
        deep_scrape: If True, scrapes full history of each chat.
        """
        logging.info("Starting full chat scrape...")
        print(f"Tam Tarama Modu Başlatılıyor... ({'DERİN' if deep_scrape else 'HIZLI'}) 🕷️")
        
        processed_contacts = set()
        scroll_attempts = 0
        max_scroll_attempts = 50 
        
        try:
            # Locate the side pane
            side_pane = WebDriverWait(self.driver, 20).until(
                EC.presence_of_element_located((By.ID, "pane-side"))
            )
            
            # Wait for items to load
            time.sleep(3)
            
            while scroll_attempts < max_scroll_attempts:
                # Find all chat items currently visible
                # Trying multiple selectors for robustness
                chat_items = side_pane.find_elements(By.XPATH, './/div[@role="listitem"]')
                if not chat_items:
                     chat_items = side_pane.find_elements(By.XPATH, './/div[@role="row"]')
                
                if not chat_items:
                    print("Sohbet listesi bulunamadı. Tekrar deneniyor...")
                    time.sleep(2)
                    chat_items = side_pane.find_elements(By.XPATH, './/div[@role="listitem"]')
                    
                if not chat_items:
                    print("Hala sohbet listesi bulunamadı. Çıkılıyor.")
                    break
                
                new_contacts_found = False
                
                for i in range(len(chat_items)):
                    # Re-find items to avoid stale element exceptions after navigation/scroll
                    # We need to be careful about the selector here too
                    current_items = side_pane.find_elements(By.XPATH, './/div[@role="listitem"]')
                    if not current_items:
                        current_items = side_pane.find_elements(By.XPATH, './/div[@role="row"]')
                        
                    if i >= len(current_items): break
                    
                    item = current_items[i]
                    
                    try:
                        # Click the item
                        item.click()
                        time.sleep(2) # Wait for chat to load
                        
                        # Get header title to know who we are talking to
                        try:
                            header_title = self.driver.find_element(By.XPATH, '//header//div[@role="button"]//span').text
                        except:
                            header_title = "Bilinmeyen"

                        if header_title in processed_contacts:
                            continue
                            
                        print(f"Sıradaki Sohbet: {header_title}")
                        processed_contacts.add(header_title)
                        new_contacts_found = True
                        
                        # Always use recursive scrape logic to ensure we get the target number of messages
                        # If deep_scrape is True, limit is None (fetch all)
                        # If deep_scrape is False, limit is limit_per_chat (fetch last N)
                        target_limit = None if deep_scrape else limit_per_chat
                        
                        print(f"  -> {header_title} taranıyor (Hedef: {'TÜMÜ' if deep_scrape else target_limit} mesaj)...")
                        messages = self.recursive_scrape(limit=target_limit)
                        
                        new_count = 0
                        skipped_count = 0
                        
                        for msg in messages:
                            if msg.sender == "Unknown" and msg.content: 
                                pass
                            if save_callback(msg):
                                new_count += 1
                            else:
                                skipped_count += 1
                                
                        print(f"  -> {new_count} yeni mesaj kaydedildi. ({skipped_count} tekrar atlandı)")
                            
                    except Exception as e:
                        logging.error(f"Error processing chat item: {e}")
                        continue
                
                if not new_contacts_found:
                    scroll_attempts += 1
                    print(f"Yeni sohbet aranıyor... ({scroll_attempts})")
                else:
                    scroll_attempts = 0
                    
                # Scroll down the side pane
                self.driver.execute_script("arguments[0].scrollTop += 500;", side_pane)
                time.sleep(2)
                
        except Exception as e:
            logging.error(f"Full scrape error: {e}")
            print(f"Hata oluştu: {e}")
