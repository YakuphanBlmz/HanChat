import os
import time
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

# Configure logging
os.makedirs('logs', exist_ok=True)
logging.basicConfig(
    filename='logs/app.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class WhatsAppDriver:
    def __init__(self, user_data_dir="chrome_profile"):
        """
        Initialize the WhatsApp Driver with a persistent Chrome profile.
        
        Args:
            user_data_dir (str): Directory to store Chrome user data (cookies, sessions).
        """
        self.user_data_dir = os.path.abspath(user_data_dir)
        self.driver = None
        self.setup_driver()

    def setup_driver(self):
        """Sets up the Chrome WebDriver with necessary options."""
        options = Options()
        
        # Determine if running in Docker (Remote) or Local
        selenium_url = os.getenv("SELENIUM_URL")
        
        if selenium_url:
            # Docker / Remote Mode
            logging.info(f"Connecting to Remote WebDriver at {selenium_url}...")
            # Customize for Selenium container paths if needed, but usually default profile is structured differently.
            # faster loading strategies
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--headless=new") # Optional: Run headless if no UI needed
        else:
            # Local Mode
            options.add_argument(f"user-data-dir={self.user_data_dir}")
        
        options.add_argument("--start-maximized")
        options.add_argument("--disable-infobars")
        options.add_argument("--disable-extensions")
        
        # Anti-detection (Basic)
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)

        try:
            if selenium_url:
                self.driver = webdriver.Remote(
                    command_executor=selenium_url,
                    options=options
                )
            else:
                logging.info("Initializing Local Chrome Driver...")
                service = Service(ChromeDriverManager().install())
                self.driver = webdriver.Chrome(service=service, options=options)
                
            logging.info("Chrome Driver initialized successfully.")
        except Exception as e:
            logging.error(f"Failed to initialize Chrome Driver: {e}")
            raise e

    def load_whatsapp(self):
        """Loads WhatsApp Web and waits for the user to scan QR code if necessary."""
        if not self.driver:
            logging.error("Driver not initialized.")
            return

        logging.info("Loading WhatsApp Web...")
        self.driver.get("https://web.whatsapp.com")
        
        print("WhatsApp Web açılıyor...")
        print("Lütfen QR kodu okutun (eğer giriş yapılmadıysa).")
        print("Programın kapanmaması için bu pencereyi kapatmayın.")

    def close(self):
        """Closes the browser."""
        if self.driver:
            logging.info("Closing Chrome Driver...")
            self.driver.quit()
            self.driver = None

    def is_logged_in(self):
        """Checks if the user is logged into WhatsApp Web."""
        if not self.driver:
            return False
        try:
            # Check for multiple elements that indicate login
            selectors = [
                (By.ID, "pane-side"),
                (By.XPATH, '//div[@id="side"]'),
                (By.XPATH, '//div[@data-testid="chat-list"]'),
                (By.XPATH, '//canvas[@aria-label="Scan me!"]') # If this exists, we are NOT logged in
            ]
            
            for by, val in selectors:
                try:
                    el = self.driver.find_element(by, val)
                    if "Scan me!" in val: # QR code found -> Not logged in
                        return False
                    return True # Chat list found -> Logged in
                except:
                    continue
            
            # If we are on the chat page directly (e.g. /send?phone=...), "pane-side" might not be visible immediately
            # Check for the main chat input or header
            try:
                self.driver.find_element(By.XPATH, '//div[@contenteditable="true"]')
                return True
            except: pass

            return False
        except:
            return False

    def validate_driver(self):
        """Checks if the driver is alive and responsive. Restarts if not."""
        if self.driver:
            try:
                # Try to get window handles to check if session is active
                handles = self.driver.window_handles
                if not handles:
                    raise Exception("No active windows found")
                return True
            except Exception as e:
                logging.warning(f"Driver appears dead: {e}. Restarting...")
                self.close()
        
        # If we are here, driver is None or was closed. Restart.
        try:
            self.setup_driver()
            return True
        except Exception as e:
            logging.error(f"Failed to restart driver: {e}")
            return False

if __name__ == "__main__":
    # Test execution
    bot = WhatsAppDriver()
    bot.load_whatsapp()
    
    # Keep alive for testing
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        bot.close()
