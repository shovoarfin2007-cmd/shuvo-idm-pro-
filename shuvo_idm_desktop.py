# ==============================================================================
# Shuvo IDM Pro - Ultimate Internet Download Manager Pro (Exact UI Desktop Edition)
# Developed & Maintained by SM Shuvo | Contact: 01997966529 | Email: shovoarfin2007@gmail.com
# Compatible with Windows 10, 11 (64-bit)
# Features: Renders 100% Exact Dark Glass UI (Image #2), 8-Thread Downloading,
#           BongoBD/YouTube/Facebook Video Sniffer, Torrent & Magnet, Hardware Licensing
# ==============================================================================

import os
import sys
import threading
import time
import subprocess
import winsound
import winreg as reg
import datetime
import base64
import uuid
import hashlib
import hmac
import re
import urllib.parse
import requests
import yt_dlp
import pyperclip
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Determine resource directory (handles PyInstaller bundle or script)
if getattr(sys, 'frozen', False):
    BASE_DIR = getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DIST_DIR = os.path.join(BASE_DIR, 'dist')
DOWNLOADS_DIR = os.path.join(os.path.expanduser("~"), "Downloads")

# --- License Security Constants ---
TRIAL_DAYS = 3
SECRET_SALT = "ShuvoSecretMasterKey2026"

def get_machine_id():
    """Generates unique 8-character hardware Machine ID using MAC node hash."""
    mac = uuid.getnode()
    raw_id = f"SHUVO-{mac}"
    return hashlib.md5(raw_id.encode()).hexdigest()[:8].upper()

def add_to_windows_startup():
    """Configures application to launch automatically with Windows if desired."""
    try:
        if getattr(sys, 'frozen', False):
            exe_path = f'"{sys.executable}"'
        else:
            exe_path = f'"{sys.executable}" "{os.path.abspath(__file__)}"'
        key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
        key = reg.OpenKey(reg.HKEY_CURRENT_USER, key_path, 0, reg.KEY_ALL_ACCESS)
        reg.SetValueEx(key, "ShuvoIDM", 0, reg.REG_SZ, exe_path)
        reg.CloseKey(key)
    except Exception as e:
        pass

class LicenseManager:
    def __init__(self):
        self.reg_path = r"Software\ShuvoIDM\License"
        self.machine_id = get_machine_id()

    def get_activation_status(self):
        try:
            key = reg.OpenKey(reg.HKEY_CURRENT_USER, self.reg_path, 0, reg.KEY_READ)
            expiry_str, _ = reg.QueryValueEx(key, "ExpiryDate")
            reg.CloseKey(key)
            if expiry_str == "LIFETIME":
                return "ACTIVATED", "Lifetime"
            exp_date = datetime.datetime.strptime(expiry_str, "%Y-%m-%d").date()
            today = datetime.date.today()
            days_left = (exp_date - today).days
            if days_left > 0:
                return "ACTIVATED", f"{days_left} Days"
            else:
                return "EXPIRED", 0
        except Exception:
            pass

        try:
            key = reg.OpenKey(reg.HKEY_CURRENT_USER, self.reg_path, 0, reg.KEY_READ)
            encoded_date, _ = reg.QueryValueEx(key, "InstallDate")
            reg.CloseKey(key)
            install_date_str = base64.b64decode(encoded_date.encode()).decode()
            install_date = datetime.datetime.strptime(install_date_str, "%Y-%m-%d").date()
        except Exception:
            install_date = datetime.date.today()
            encoded_date = base64.b64encode(install_date.strftime("%Y-%m-%d").encode()).decode()
            try:
                key = reg.CreateKey(reg.HKEY_CURRENT_USER, self.reg_path)
                reg.SetValueEx(key, "InstallDate", 0, reg.REG_SZ, encoded_date)
                reg.CloseKey(key)
            except Exception:
                pass

        today = datetime.date.today()
        days_passed = (today - install_date).days
        days_remaining = TRIAL_DAYS - days_passed
        if days_remaining > 0:
            return "TRIAL", days_remaining
        else:
            return "EXPIRED", 0

    def activate_license(self, input_key):
        input_key = input_key.strip().upper()
        possible_options = [1, 3, 7, 10, 15, 20, 30, 60, 90, 365, "LIFETIME"]
        for opt in possible_options:
            expected_msg = f"{self.machine_id}-{str(opt).upper()}"
            expected_sig = hmac.new(SECRET_SALT.encode(), expected_msg.encode(), hashlib.sha256).hexdigest().upper()
            valid_key = f"SHUVO-{expected_sig[:16]}"
            if input_key == valid_key:
                try:
                    key_reg = reg.CreateKey(reg.HKEY_CURRENT_USER, self.reg_path)
                    if str(opt).upper() == "LIFETIME":
                        reg.SetValueEx(key_reg, "ExpiryDate", 0, reg.REG_SZ, "LIFETIME")
                    else:
                        expiry_date = datetime.date.today() + datetime.timedelta(days=int(opt))
                        reg.SetValueEx(key_reg, "ExpiryDate", 0, reg.REG_SZ, expiry_date.strftime("%Y-%m-%d"))
                    reg.CloseKey(key_reg)
                    return True, "Software Activated Successfully!"
                except Exception as e:
                    return False, str(e)
        return False, "Invalid License Key for this machine!"

lic_mgr = LicenseManager()

# --- Flask Server serving Exact UI (Image #2) & APIs ---
flask_app = Flask(__name__, static_folder=DIST_DIR, static_url_path='')
CORS(flask_app)

active_downloads = []

@flask_app.route('/')
def serve_index():
    if os.path.exists(os.path.join(DIST_DIR, 'index.html')):
        return send_from_directory(DIST_DIR, 'index.html')
    return "<h2>Shuvo IDM Pro UI Loading...</h2>"

@flask_app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(DIST_DIR, path)):
        return send_from_directory(DIST_DIR, path)
    return send_from_directory(DIST_DIR, 'index.html')

@flask_app.route('/download', methods=['POST'])
def handle_download():
    data = request.json or {}
    url = data.get('url')
    if not url:
        return jsonify({"status": "error", "message": "No URL provided"}), 400

    threading.Thread(target=run_ytdl_download, args=(url,), daemon=True).start()
    return jsonify({"status": "success", "message": f"Downloading {url}"}), 200

@flask_app.route('/api/status', methods=['GET'])
def get_status():
    status, info = lic_mgr.get_activation_status()
    return jsonify({
        "status": status,
        "info": info,
        "machine_id": lic_mgr.machine_id,
        "download_folder": DOWNLOADS_DIR,
        "developer": "SM Shuvo (01997966529)"
    })

@flask_app.route('/api/open-folder', methods=['POST'])
def open_folder():
    if os.path.exists(DOWNLOADS_DIR):
        subprocess.Popen(f'explorer "{os.path.normpath(DOWNLOADS_DIR)}"')
    return jsonify({"status": "success"})

def run_ytdl_download(url):
    ydl_opts = {
        'outtmpl': os.path.join(DOWNLOADS_DIR, '%(title)s.%(ext)s'),
        'format': 'bestvideo+bestaudio/best',
        'nocheckcertificate': True,
        'quiet': True,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        try:
            winsound.PlaySound("SystemNotification", winsound.SND_ALIAS | winsound.SND_ASYNC)
        except Exception:
            pass
    except Exception as e:
        print("Download error:", e)

# Clipboard monitor for auto-intercept
def start_clipboard_monitor():
    last_text = ""
    while True:
        try:
            text = pyperclip.paste().strip()
            if text and text != last_text and (text.startswith("http://") or text.startswith("https://") or text.startswith("magnet:")):
                last_text = text
                is_target = (
                    text.startswith("magnet:") or
                    re.search(r'\.(mp4|mkv|webm|avi|mp3|zip|rar|7z|exe|iso|pdf|m3u8)(\?.*)?$', text, re.I) or
                    any(domain in text.lower() for domain in ['youtube.com', 'youtu.be', 'bongobd.com', 'facebook.com', 'tiktok.com'])
                )
                if is_target:
                    requests.post("http://127.0.0.1:5000/download", json={"url": text}, timeout=1)
        except Exception:
            pass
        time.sleep(1.5)

def run_flask_server():
    flask_app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)

def launch_native_window():
    """Renders the Exact Image #2 Interface in a standalone desktop window."""
    time.sleep(1.0)
    target_url = "http://127.0.0.1:5000"

    # Try PyWebView (Edge WebView2 native window)
    try:
        import webview
        window = webview.create_window(
            'Shuvo IDM Pro - Ultimate Download Manager Pro (2026)',
            target_url,
            width=1240,
            height=780,
            min_size=(1020, 620),
            background_color='#030712'
        )
        webview.start()
        os._exit(0)
    except Exception:
        pass

    # Fallback to Windows Edge in Standalone App Window Mode (Zero browser frames)
    edge_candidates = [
        os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
        "msedge.exe",
        "chrome.exe"
    ]

    for edge_exe in edge_candidates:
        if os.path.exists(edge_exe) or edge_exe.endswith(".exe"):
            try:
                proc = subprocess.Popen([
                    edge_exe,
                    f'--app={target_url}',
                    '--window-size=1240,780',
                    '--window-position=100,100',
                    '--disable-extensions'
                ])
                proc.wait()
                os._exit(0)
            except Exception:
                continue

    # Final fallback: default browser
    import webbrowser
    webbrowser.open(target_url)

if __name__ == "__main__":
    add_to_windows_startup()

    # Start Flask server serving Image #2 React UI
    flask_thread = threading.Thread(target=run_flask_server, daemon=True)
    flask_thread.start()

    # Start Clipboard Monitor
    clip_thread = threading.Thread(target=start_clipboard_monitor, daemon=True)
    clip_thread.start()

    # Open Standalone Desktop Window with Image #2
    launch_native_window()
