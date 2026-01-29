from http.server import BaseHTTPRequestHandler
import json
import os
from urllib.parse import parse_qs, urlparse

TRANSLATIONS_PATH = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'translations.json')


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            parsed = urlparse(self.path)
            query = parse_qs(parsed.query)
            lang = query.get('lang', ['en'])[0]

            with open(TRANSLATIONS_PATH, 'r', encoding='utf-8') as f:
                all_translations = json.load(f)

            result = {}
            for key, values in all_translations.items():
                if lang in values:
                    result[key] = values[lang]
                elif 'en' in values:
                    result[key] = values['en']

            self._send_json(result)

        except FileNotFoundError:
            self._send_error(404, 'Translations file not found')
        except Exception as e:
            self._send_error(500, str(e))

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def _send_json(self, data):
        self.send_response(200)
        self._send_cors_headers()
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def _send_error(self, code, message):
        self.send_response(code)
        self._send_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'error': message}).encode('utf-8'))

    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
