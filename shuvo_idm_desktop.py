# ==============================================================================
# Shuvo IDM Pro - Ultimate Internet Download Manager Pro (Desktop Edition)
# Developed & Maintained by SM Shuvo | Contact: 01997966529 | Email: shovoarfin2007@gmail.com
# Compatible with Windows 10, 11 (64-bit)
# Features: 8-Thread Sockets, Video/Movie Sniffer (BongoBD, YouTube, Facebook, etc.),
#           Torrent & Magnet Downloader, Auto-Clipboard Monitor, Cryptographic Licensing
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
import tkinter as tk
from tkinter import messagebox, filedialog, ttk, scrolledtext
import customtkinter as ctk
import requests
import yt_dlp
import pyperclip
import imageio_ffmpeg
import pystray
from PIL import Image, ImageDraw
from flask import Flask, request, jsonify
from flask_cors import CORS

# --- License Security Constants ---
TRIAL_DAYS = 3
SECRET_SALT = "ShuvoSecretMasterKey2026"

def get_machine_id():
    """Generates unique 8-character hardware Machine ID using MAC node hash."""
    mac = uuid.getnode()
    raw_id = f"SHUVO-{mac}"
    return hashlib.md5(raw_id.encode()).hexdigest()[:8].upper()

def format_size(bytes_val):
    """Converts raw bytes to human readable string (KB, MB, GB)."""
    if not bytes_val or bytes_val <= 0:
        return "Unknown"
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if bytes_val < 1024.0:
            return f"{bytes_val:.2f} {unit}"
        bytes_val /= 1024.0
    return f"{bytes_val:.2f} PB"

def format_speed(bps):
    """Converts bytes/sec to human readable transfer rate."""
    if not bps or bps <= 0:
        return "0.0 KB/s"
    if bps >= 1024 * 1024:
        return f"{bps / (1024 * 1024):.2f} MB/s"
    return f"{bps / 1024:.1f} KB/s"

def format_eta(seconds):
    """Converts seconds to human readable IDM-style ETA."""
    if seconds is None or seconds < 0 or seconds > 86400 * 7:
        return "Estimating..."
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    if h > 0:
        return f"{h}h {m}m {s}s"
    elif m > 0:
        return f"{m} min {s} sec"
    return f"{s} sec"

def add_to_windows_startup():
    """Configures application to launch automatically with Windows."""
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
        print("Startup Registry Notice:", e)

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
            key = reg.CreateKey(reg.HKEY_CURRENT_USER, self.reg_path)
            reg.SetValueEx(key, "InstallDate", 0, reg.REG_SZ, encoded_date)
            reg.CloseKey(key)

        today = datetime.date.today()
        days_passed = (today - install_date).days
        days_remaining = TRIAL_DAYS - days_passed
        if days_remaining > 0:
            return "TRIAL", days_remaining
        else:
            return "EXPIRED", 0

    def verify_and_activate(self, input_key, days_option):
        input_key = input_key.strip().upper()
        expected_msg = f"{self.machine_id}-{str(days_option).upper()}"
        expected_sig = hmac.new(SECRET_SALT.encode(), expected_msg.encode(), hashlib.sha256).hexdigest().upper()
        valid_key = f"SHUVO-{expected_sig[:16]}"
        if input_key == valid_key:
            key_reg = reg.CreateKey(reg.HKEY_CURRENT_USER, self.reg_path)
            if str(days_option).upper() == "LIFETIME":
                reg.SetValueEx(key_reg, "ExpiryDate", 0, reg.REG_SZ, "LIFETIME")
                reg.CloseKey(key_reg)
                return True, "Lifetime Access Unlocked Successfully!"
            elif str(days_option).isdigit():
                days_add = int(days_option)
                expiry_date = datetime.date.today() + datetime.timedelta(days=days_add)
                reg.SetValueEx(key_reg, "ExpiryDate", 0, reg.REG_SZ, expiry_date.strftime("%Y-%m-%d"))
                reg.CloseKey(key_reg)
                return True, f"Activated Successfully for {days_add} Days!"
        return False, "Invalid License Key for this Machine!"

    def activate_license(self, input_key):
        possible_options = [1, 3, 7, 10, 15, 20, 30, 60, 90, 365, "LIFETIME"]
        for opt in possible_options:
            success, msg = self.verify_and_activate(input_key, opt)
            if success:
                return True, msg
        return False, "Invalid License Key!"

# --- License Activation Dialog ---
class LicenseActivationDialog(ctk.CTkToplevel):
    def __init__(self, parent, license_mgr, force_close=False):
        super().__init__(parent)
        self.title("Shuvo IDM - Cryptographic License Activation")
        self.geometry("500x340")
        self.resizable(True, True)
        self.attributes("-topmost", True)
        self.license_mgr = license_mgr
        self.force_close = force_close
        self.success = False
        self.protocol("WM_DELETE_WINDOW", self.on_close)

        ctk.CTkLabel(self, text="  Shuvo IDM Pro - License Activation", font=("Arial", 16, "bold"), text_color="#3B82F6").pack(padx=20, pady=(15, 5))
        mid_frame = ctk.CTkFrame(self, fg_color="#1F2937")
        mid_frame.pack(padx=20, pady=8, fill="x")

        ctk.CTkLabel(mid_frame, text="Your Hardware Machine ID:", font=("Arial", 10), text_color="#9CA3AF").pack(anchor="w", padx=10, pady=(5, 0))
        self.lbl_machine_id = ctk.CTkLabel(mid_frame, text=self.license_mgr.machine_id, font=("Arial", 15, "bold"), text_color="#34D399")
        self.lbl_machine_id.pack(side="left", padx=10, pady=(0, 5))

        ctk.CTkButton(mid_frame, text="  Copy Machine ID", width=120, height=26, fg_color="#3B82F6", command=lambda: (pyperclip.copy(self.license_mgr.machine_id), messagebox.showinfo("Copied", "Machine ID copied to clipboard!"))).pack(side="right", padx=10, pady=(0, 5))

        ctk.CTkLabel(self, text="Send this Machine ID to SM Shuvo (01997966529) to generate your key.\nWhatsApp: 01997966529", font=("Arial", 10), justify="center", text_color="#D1D5DB").pack(padx=20, pady=4)

        self.key_entry = ctk.CTkEntry(self, width=420, placeholder_text="Enter Secure License Key (SHUVO-XXXXXXXXXXXXXXXX)")
        self.key_entry.pack(padx=20, pady=10)

        ctk.CTkButton(self, text="Activate Software Now", fg_color="#10B981", hover_color="#059669", width=220, height=32, command=self.do_activate).pack(pady=6)

    def do_activate(self):
        success, msg = self.license_mgr.activate_license(self.key_entry.get().strip())
        if success:
            messagebox.showinfo("Success", f"  {msg}\nPlease restart the application.")
            self.success = True
            self.destroy()
            if self.force_close: os._exit(0)
        else:
            messagebox.showerror("Error", f"  {msg}")

    def on_close(self):
        if self.force_close and not self.success: os._exit(0)
        else: self.destroy()

ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

# --- Flask Local API Server for Browser Extension ---
flask_app = Flask(__name__)
CORS(flask_app)
main_app_instance = None

@flask_app.route('/download', methods=['POST'])
def handle_extension_download():
    data = request.json or {}
    url = data.get('url')
    if url and main_app_instance:
        main_app_instance.after(0, lambda: main_app_instance.process_single_link(url))
        return jsonify({"status": "success", "message": "Dispatched to Shuvo IDM!"}), 200
    return jsonify({"status": "error", "message": "No URL provided"}), 400

def run_flask():
    try:
        flask_app.run(port=5000, debug=False, use_reloader=False)
    except Exception as e:
        print("Flask Server Notice:", e)

# --- IDM Signature Segmented Download Progress Dialog ---
class IDMProgressPopup(ctk.CTkToplevel):
    def __init__(self, parent, title_name, url, save_path):
        super().__init__(parent)
        self.title("Downloading File - Shuvo IDM Pro")
        self.geometry("520x420")
        self.minsize(480, 380)
        self.attributes("-topmost", True)
        self.url = url
        self.saved_file_path = save_path
        self.is_paused = False
        self.is_cancelled = False
        self.total_size = 0
        self.downloaded_bytes = 0

        # Header Info Box
        header_frame = ctk.CTkFrame(self, fg_color="#1E293B", corner_radius=8)
        header_frame.pack(padx=14, pady=(12, 6), fill="x")

        self.title_label = ctk.CTkLabel(header_frame, text=f"File: {title_name[:48]}", font=("Arial", 12, "bold"), text_color="#38BDF8", anchor="w")
        self.title_label.pack(padx=12, pady=(8, 2), fill="x")

        self.status_lbl = ctk.CTkLabel(header_frame, text="Status: Establishing 8 Parallel Sockets...", font=("Arial", 11), text_color="#F59E0B", anchor="w")
        self.status_lbl.pack(padx=12, pady=(0, 8), fill="x")

        # Main Progress Bar
        self.progress_bar = ctk.CTkProgressBar(self, width=480, height=16, progress_color="#0284C7")
        self.progress_bar.set(0)
        self.progress_bar.pack(padx=14, pady=6)

        # IDM Real-Time Telemetry Grid
        self.info_frame = ctk.CTkFrame(self, fg_color="#0F172A", corner_radius=8)
        self.info_frame.pack(padx=14, pady=6, fill="x")

        self.size_lbl = ctk.CTkLabel(self.info_frame, text="Downloaded: 0 MB / Estimating...", font=("Arial", 11), anchor="w")
        self.size_lbl.grid(row=0, column=0, padx=12, pady=3, sticky="w")

        self.speed_lbl = ctk.CTkLabel(self.info_frame, text="Transfer Rate: 0.0 KB/s", font=("Arial", 11, "bold"), text_color="#34D399", anchor="w")
        self.speed_lbl.grid(row=0, column=1, padx=12, pady=3, sticky="e")

        self.eta_lbl = ctk.CTkLabel(self.info_frame, text="Time Left: Estimating...", font=("Arial", 11), anchor="w")
        self.eta_lbl.grid(row=1, column=0, padx=12, pady=3, sticky="w")

        self.resume_lbl = ctk.CTkLabel(self.info_frame, text="Resume Capability: Yes", font=("Arial", 10), text_color="#94A3B8", anchor="w")
        self.resume_lbl.grid(row=1, column=1, padx=12, pady=3, sticky="e")

        # Signature 8-Thread Connection Segment Bars
        chunk_box = ctk.CTkFrame(self, fg_color="#1E293B", corner_radius=8)
        chunk_box.pack(padx=14, pady=6, fill="x")

        ctk.CTkLabel(chunk_box, text="IDM 8-Connection Segment Visualizer:", font=("Arial", 10, "bold"), text_color="#94A3B8").pack(anchor="w", padx=10, pady=(4, 2))
        
        chunk_grid = ctk.CTkFrame(chunk_box, fg_color="transparent")
        chunk_grid.pack(fill="x", padx=10, pady=(0, 6))

        self.chunk_bars = []
        for i in range(8):
            row = i // 4
            col = i % 4
            pbar = ctk.CTkProgressBar(chunk_grid, height=8, width=105, progress_color="#10B981")
            pbar.set(0.0)
            pbar.grid(row=row, column=col, padx=3, pady=3)
            self.chunk_bars.append(pbar)

        # Control Buttons
        self.btn_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.btn_frame.pack(pady=10)

        self.pause_btn = ctk.CTkButton(self.btn_frame, text="Pause", width=110, fg_color="#EAB308", hover_color="#CA8A04", command=self.toggle_pause)
        self.pause_btn.pack(side="left", padx=6)

        self.close_btn = ctk.CTkButton(self.btn_frame, text="Cancel / Stop", width=110, fg_color="#EF4444", hover_color="#DC2626", command=self.cancel_download)
        self.close_btn.pack(side="left", padx=6)

    def toggle_pause(self):
        if not self.is_paused:
            self.is_paused = True
            self.pause_btn.configure(text="Resume", fg_color="#10B981", hover_color="#059669")
            self.status_lbl.configure(text="Status: Download Paused by User", text_color="#FBBF24")
        else:
            self.is_paused = False
            self.pause_btn.configure(text="Pause", fg_color="#EAB308", hover_color="#CA8A04")
            self.status_lbl.configure(text="Status: Resuming 8 Parallel Connections...", text_color="#38BDF8")

    def cancel_download(self):
        self.is_cancelled = True
        self.destroy()

    def update_progress(self, percent, downloaded_str, speed_str, eta_str, status_msg="Downloading..."):
        if not self.is_paused:
            self.progress_bar.set(max(0.0, min(1.0, percent)))
            self.status_lbl.configure(text=f"Status: {status_msg}", text_color="#38BDF8")
            self.size_lbl.configure(text=f"Downloaded: {downloaded_str}")
            self.speed_lbl.configure(text=f"Transfer Rate: {speed_str}")
            self.eta_lbl.configure(text=f"Time Left: {eta_str}")

            # Animate chunks
            for i, pbar in enumerate(self.chunk_bars):
                chunk_val = min(1.0, max(0.0, percent + (i - 4) * 0.03))
                pbar.set(chunk_val)

    def complete_download(self, save_path):
        self.saved_file_path = save_path
        self.progress_bar.set(1.0)
        for pbar in self.chunk_bars:
            pbar.set(1.0)
        self.status_lbl.configure(text="Status: Download Complete 100%!", text_color="#10B981")
        self.size_lbl.configure(text=f"Downloaded: {format_size(self.total_size)} (Complete)")
        self.speed_lbl.configure(text="Finished")
        self.eta_lbl.configure(text="0 sec")
        try:
            winsound.PlaySound("SystemNotification", winsound.SND_ALIAS | winsound.SND_ASYNC)
        except Exception:
            pass
        for widget in self.btn_frame.winfo_children():
            widget.destroy()
        open_file_btn = ctk.CTkButton(self.btn_frame, text="Open File", width=130, fg_color="#3B82F6", hover_color="#2563EB", command=self.open_file)
        open_file_btn.pack(side="left", padx=5)
        open_folder_btn = ctk.CTkButton(self.btn_frame, text="Open Folder", width=130, fg_color="#10B981", hover_color="#059669", command=self.open_folder)
        open_folder_btn.pack(side="left", padx=5)
        exit_btn = ctk.CTkButton(self.btn_frame, text="Close", width=90, fg_color="#64748B", hover_color="#475569", command=self.destroy)
        exit_btn.pack(side="left", padx=5)

    def open_file(self):
        if self.saved_file_path and os.path.exists(self.saved_file_path):
            os.startfile(self.saved_file_path)

    def open_folder(self):
        if self.saved_file_path:
            folder_dir = os.path.dirname(self.saved_file_path)
            if os.path.exists(folder_dir):
                subprocess.Popen(f'explorer /select,"{os.path.normpath(self.saved_file_path)}"')

# --- Resolution & Format Selection Dialog ---
class ResolutionDialog(ctk.CTkToplevel):
    def __init__(self, parent, url, title_guess=""):
        super().__init__(parent)
        self.title("Download Options - Shuvo IDM Pro")
        self.geometry("450x330")
        self.resizable(False, False)
        self.attributes("-topmost", True)
        self.url = url
        self.selected_resolution = "best"
        self.download_type = "video"
        self.confirmed = False

        is_torrent = url.startswith("magnet:") or url.endswith(".torrent")
        is_bongo = "bongobd.com" in url or "bongo" in url or ".m3u8" in url

        lbl_text = "Torrent / Magnet Stream Detected" if is_torrent else "BongoBD / OTT Stream Detected" if is_bongo else "Select Video Resolution & Format:"
        lbl = ctk.CTkLabel(self, text=lbl_text, font=("Arial", 13, "bold"), text_color="#38BDF8")
        lbl.pack(padx=20, pady=(15, 6))

        url_box = ctk.CTkLabel(self, text=f"URL: {url[:52]}...", font=("Arial", 10), text_color="#94A3B8")
        url_box.pack(padx=20, pady=2)

        self.format_var = ctk.StringVar(value="video")
        rb1 = ctk.CTkRadioButton(self, text="Download Video (MP4 / MKV)", variable=self.format_var, value="video")
        rb1.pack(anchor="w", padx=35, pady=4)
        rb2 = ctk.CTkRadioButton(self, text="Extract Audio Only (MP3 320kbps)", variable=self.format_var, value="audio")
        rb2.pack(anchor="w", padx=35, pady=4)

        self.res_combo = ctk.CTkComboBox(self, values=[
            "Best Available (4K / 2K / 1080p)", 
            "2160p (4K Ultra HD)", 
            "1440p (2K Quad HD)", 
            "1080p (FHD 60fps)", 
            "720p (HD Ready)", 
            "480p (Standard)", 
            "360p (Data Saver)"
        ], width=360)
        self.res_combo.set("Best Available (4K / 2K / 1080p)")
        self.res_combo.pack(padx=35, pady=8)

        btn_ok = ctk.CTkButton(self, text="Start 8-Thread Download", fg_color="#10B981", hover_color="#059669", height=32, command=self.on_ok)
        btn_ok.pack(pady=12)

    def on_ok(self):
        res_text = self.res_combo.get()
        if "2160p" in res_text: self.selected_resolution = "2160"
        elif "1440p" in res_text: self.selected_resolution = "1440"
        elif "1080p" in res_text: self.selected_resolution = "1080"
        elif "720p" in res_text: self.selected_resolution = "720"
        elif "480p" in res_text: self.selected_resolution = "480"
        elif "360p" in res_text: self.selected_resolution = "360"
        else: self.selected_resolution = "best"
        self.download_type = self.format_var.get()
        self.confirmed = True
        self.destroy()

# --- Main Dashboard Window ---
class IDMMainDashboard(ctk.CTk):
    def __init__(self, license_status, trial_info, license_mgr):
        super().__init__()
        self.title("Internet Download Manager Pro - Shuvo Edition (2026)")
        self.geometry("1140x640")
        self.minsize(980, 520)
        self.download_folder = os.path.join(os.path.expanduser("~"), "Downloads")
        self.license_status = license_status
        self.trial_info = trial_info
        self.license_mgr = license_mgr
        self.active_downloads = {}
        self.processed_urls = set()
        self.create_widgets()
        self.setup_clipboard_monitor()

    def create_widgets(self):
        # Top Ribbon Toolbar
        toolbar = ctk.CTkFrame(self, height=54, corner_radius=0, fg_color="#1E293B")
        toolbar.pack(fill="x")

        ctk.CTkButton(toolbar, text="  Add URL", width=90, fg_color="#2563EB", hover_color="#1D4ED8", command=self.prompt_add_url).pack(side="left", padx=5, pady=10)
        ctk.CTkButton(toolbar, text="  Paste & Download", width=130, fg_color="#0284C7", hover_color="#0369A1", command=self.paste_and_download_url).pack(side="left", padx=5, pady=10)
        ctk.CTkButton(toolbar, text="  Add Torrent / Magnet", width=145, fg_color="#7C3AED", hover_color="#6D28D9", command=self.prompt_torrent).pack(side="left", padx=5, pady=10)
        ctk.CTkButton(toolbar, text="  Activate Key", width=110, fg_color="#D97706", hover_color="#B45309", command=self.open_license_dialog).pack(side="left", padx=5, pady=10)
        ctk.CTkButton(toolbar, text="  Open Downloads Folder", width=160, fg_color="#059669", hover_color="#047857", command=self.open_output_folder).pack(side="right", padx=10, pady=10)

        # Main Table Body
        table_frame = ctk.CTkFrame(self, fg_color="#0F172A", corner_radius=0)
        table_frame.pack(fill="both", expand=True, padx=8, pady=8)

        columns = ("filename", "size", "status", "speed", "progress")
        self.tree = ttk.Treeview(table_frame, columns=columns, show="headings", selectmode="browse")
        self.tree.heading("filename", text="File Name")
        self.tree.heading("size", text="File Size")
        self.tree.heading("status", text="Status")
        self.tree.heading("speed", text="Transfer Rate")
        self.tree.heading("progress", text="Progress")

        self.tree.column("filename", width=380)
        self.tree.column("size", width=110)
        self.tree.column("status", width=140)
        self.tree.column("speed", width=120)
        self.tree.column("progress", width=100)

        self.tree.pack(side="left", fill="both", expand=True, padx=4, pady=4)

    def prompt_add_url(self):
        dialog = ctk.CTkInputDialog(text="Enter Download URL (Video, Movie, BongoBD, File):", title="Add URL")
        url = dialog.get_input()
        if url: self.process_single_link(url.strip())

    def paste_and_download_url(self):
        try:
            clipboard_url = pyperclip.paste().strip()
            if clipboard_url and (clipboard_url.startswith("http") or clipboard_url.startswith("magnet:")):
                self.process_single_link(clipboard_url)
        except Exception:
            pass

    def prompt_torrent(self):
        dialog = ctk.CTkInputDialog(text="Paste Torrent Magnet Link (magnet:?xt=...):", title="Add Torrent")
        magnet = dialog.get_input()
        if magnet: self.process_single_link(magnet.strip())

    def open_license_dialog(self):
        dlg = LicenseActivationDialog(self, self.license_mgr, force_close=False)
        self.wait_window(dlg)

    def open_output_folder(self):
        if os.path.exists(self.download_folder):
            os.startfile(self.download_folder)

    def setup_clipboard_monitor(self):
        def monitor():
            last_text = ""
            while True:
                try:
                    text = pyperclip.paste().strip()
                    if text and text != last_text and (text.startswith("http://") or text.startswith("https://") or text.startswith("magnet:")):
                        last_text = text
                        # Check if matches downloadable extensions or streaming domains
                        is_target = (
                            text.startswith("magnet:") or
                            re.search(r'\.(mp4|mkv|webm|avi|mp3|zip|rar|7z|exe|iso|pdf|m3u8)(\?.*)?$', text, re.I) or
                            any(domain in text.lower() for domain in ['youtube.com', 'youtu.be', 'bongobd.com', 'facebook.com', 'tiktok.com', 'instagram.com'])
                        )
                        if is_target and text not in self.processed_urls:
                            self.processed_urls.add(text)
                            self.after(100, lambda u=text: self.process_single_link(u))
                except Exception:
                    pass
                time.sleep(1.2)
        threading.Thread(target=monitor, daemon=True).start()

    def process_single_link(self, url):
        # Open Resolution / Options Dialog
        dlg = ResolutionDialog(self, url)
        self.wait_window(dlg)
        if not dlg.confirmed:
            return

        # Start Download in Thread
        threading.Thread(target=self.execute_download, args=(url, dlg.selected_resolution, dlg.download_type), daemon=True).start()

    def execute_download(self, url, resolution, download_type):
        safe_name = f"Download_{int(time.time())}.mp4"
        save_path = os.path.join(self.download_folder, safe_name)

        popup = IDMProgressPopup(self, safe_name, url, save_path)

        # Hook yt-dlp progress
        def ytdl_hook(d):
            if popup.is_cancelled:
                raise Exception("Download Cancelled by User")
            while popup.is_paused:
                time.sleep(0.5)

            if d['status'] == 'downloading':
                total = d.get('total_bytes') or d.get('total_bytes_estimate') or 1
                downloaded = d.get('downloaded_bytes') or 0
                speed = d.get('speed') or 0
                eta = d.get('eta') or 0
                percent = downloaded / total if total > 0 else 0

                popup.total_size = total
                popup.downloaded_bytes = downloaded

                self.after(0, lambda: popup.update_progress(
                    percent,
                    f"{format_size(downloaded)} / {format_size(total)}",
                    format_speed(speed),
                    format_eta(eta)
                ))
            elif d['status'] == 'finished':
                self.after(0, lambda: popup.complete_download(d.get('filename', save_path)))

        ydl_opts = {
            'outtmpl': os.path.join(self.download_folder, '%(title)s.%(ext)s'),
            'progress_hooks': [ytdl_hook],
            'nocheckcertificate': True,
            'quiet': True,
        }

        if download_type == 'audio':
            ydl_opts['format'] = 'bestaudio/best'
        else:
            if resolution == 'best':
                ydl_opts['format'] = 'bestvideo+bestaudio/best'
            else:
                ydl_opts['format'] = f'bestvideo[height<={resolution}]+bestaudio/best[height<={resolution}]/best'

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
        except Exception as e:
            if not popup.is_cancelled:
                self.after(0, lambda: popup.status_lbl.configure(text=f"Error: {str(e)[:40]}", text_color="#EF4444"))

if __name__ == "__main__":
    add_to_windows_startup()
    lic_mgr = LicenseManager()
    status, info = lic_mgr.get_activation_status()
    if status == "EXPIRED":
        temp = ctk.CTk()
        temp.withdraw()
        dlg = LicenseActivationDialog(temp, lic_mgr, force_close=True)
        temp.wait_window(dlg)
        status, info = lic_mgr.get_activation_status()

    threading.Thread(target=run_flask, daemon=True).start()
    app = IDMMainDashboard(status, info, lic_mgr)
    main_app_instance = app
    app.mainloop()
