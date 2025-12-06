#!/usr/bin/env python3
"""
Fast launcher for YOU CAISSE PRO
Optimized startup script for rapid application launch
"""

import subprocess
import time
import sys
import os
from pathlib import Path

class YourCaisseLauncher:
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.backend_path = self.base_path / "backend"
        self.frontend_path = self.base_path / "frontend"
        
    def cleanup_processes(self):
        """Kill existing Node processes"""
        print("🧹 Cleaning up existing processes...")
        if sys.platform == "win32":
            os.system("taskkill /F /IM node.exe /T 2>nul")
        else:
            os.system("pkill -f node")
        time.sleep(2)
    
    def start_backend(self):
        """Start the backend server"""
        print("🚀 Starting Backend server...")
        if sys.platform == "win32":
            subprocess.Popen(
                ["powershell", "-NoExit", "-Command", 
                 f"cd '{self.backend_path}'; npm run dev"],
                shell=False
            )
        else:
            subprocess.Popen(
                ["bash", "-c", f"cd {self.backend_path} && npm run dev"],
                shell=False
            )
        time.sleep(5)
    
    def start_frontend(self):
        """Start the frontend server"""
        print("🎨 Starting Frontend server...")
        if sys.platform == "win32":
            subprocess.Popen(
                ["powershell", "-NoExit", "-Command",
                 f"cd '{self.frontend_path}'; npm run dev"],
                shell=False
            )
        else:
            subprocess.Popen(
                ["bash", "-c", f"cd {self.frontend_path} && npm run dev"],
                shell=False
            )
    
    def launch(self):
        """Launch both servers"""
        print("\n" + "="*60)
        print("  YOU CAISSE PRO - Fast Launch")
        print("="*60 + "\n")
        
        self.cleanup_processes()
        self.start_backend()
        self.start_frontend()
        
        print("\n" + "="*60)
        print("✅ Servers are starting!")
        print("="*60)
        print("\n📍 Backend:  http://localhost:3001")
        print("📍 Frontend: http://localhost:5173")
        print("\n🌐 Network: http://192.168.47.102:5173")
        print("\n⏳ Full startup takes ~5-7 seconds")
        print("="*60 + "\n")

if __name__ == "__main__":
    launcher = YourCaisseLauncher()
    try:
        launcher.launch()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
