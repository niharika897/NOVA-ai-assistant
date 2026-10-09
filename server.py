"""
NOVA Chatbot - Local Server
Zero-dependency Python HTTP Server to serve the NOVA Chatbot web interface locally.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        print("=" * 60)
        print(f"✨ NOVA Chatbot is active and running!")
        print(f"👉 Local URL: {url}")
        print(f"🧠 Emotion Engine: Active")
        print(f"🌐 Google Services: Ready (Configurable via Settings UI)")
        print("=" * 60)
        print("Press Ctrl+C to stop the server.\n")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down NOVA server. Goodbye!")
            httpd.server_close()

if __name__ == "__main__":
    run()
