#!/usr/bin/env python3
"""
No-Cache Development Server
Verhindert Browser-Caching KOMPLETT!
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class NoCacheHTTPRequestHandler(SimpleHTTPRequestHandler):
    """HTTP Handler der Cache komplett deaktiviert"""
    
    def end_headers(self):
        # Cache KOMPLETT deaktivieren
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Schönere Log-Ausgabe
        print(f"[SERVER] {args[0]} - {args[1]}")

if __name__ == '__main__':
    PORT = 9001
    
    print("=" * 60)
    print("🚀 NO-CACHE Development Server")
    print("=" * 60)
    print(f"Port: {PORT}")
    print(f"URL:  http://localhost:{PORT}")
    print("")
    print("✅ Cache-Headers aktiviert:")
    print("   • Cache-Control: no-store, no-cache")
    print("   • Pragma: no-cache")
    print("   • Expires: 0")
    print("")
    print("⚡ Browser lädt IMMER neu!")
    print("=" * 60)
    print("")
    
    server = HTTPServer(('', PORT), NoCacheHTTPRequestHandler)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n🛑 Server gestoppt")
        server.server_close()
