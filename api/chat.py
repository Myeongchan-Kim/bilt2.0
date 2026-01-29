from http.server import BaseHTTPRequestHandler
import json
import os
import re
from time import time
from collections import defaultdict
import google.generativeai as genai

# === Security Configuration ===

# Allowed Origins
ALLOWED_ORIGINS_ENV = os.environ.get('ALLOWED_ORIGINS', '')
ALLOWED_ORIGINS = [
    'https://bilt-card-strategy.vercel.app',
    'http://localhost:3000',
] + [o.strip() for o in ALLOWED_ORIGINS_ENV.split(',') if o.strip()]

# Pattern for Vercel Preview deployments
ALLOWED_ORIGIN_PATTERNS = [
    r'^https://bilt-card-strategy-.*\.vercel\.app$',
]

# Message length limit
MAX_MESSAGE_LENGTH = 5000


class RateLimiter:
    """In-memory rate limiter for basic DoS protection."""

    def __init__(self, max_requests=10, window_seconds=60):
        self.max_requests = max_requests
        self.window = window_seconds
        self.requests = defaultdict(list)

    def is_allowed(self, client_ip):
        now = time()
        # Clean up old requests
        self.requests[client_ip] = [
            t for t in self.requests[client_ip] if now - t < self.window
        ]
        if len(self.requests[client_ip]) >= self.max_requests:
            return False
        self.requests[client_ip].append(now)
        return True


# Global rate limiter instance
rate_limiter = RateLimiter(max_requests=10, window_seconds=60)

SYSTEM_PROMPT = """You are a professional assistant helping with Bilt card selection and reward optimization.

## Bilt Card 2.0 Options (as of January 2026)

### Card Types
1. **Bilt Blue** ($0 annual fee)
   - Welcome bonus: $100 Bilt Cash
   - Everyday spend: 1X points
   - Housing: 0X~1.25X (Housing-only) or max 1X (Flexible)

2. **Bilt Obsidian** ($95 annual fee)
   - Welcome bonus: $200 Bilt Cash
   - Travel: 2X, Dining/Grocery (choose one): 3X, Other: 1X
   - Housing: 0X~1.25X (Housing-only) or max 1X (Flexible)
   - $100 annual hotel credit (semi-annual $50)

3. **Bilt Palladium** ($495 annual fee)
   - Welcome bonus: $300 Bilt Cash + 50,000 points (with $4,000 spend in 3 months) + Gold Elite
   - All everyday spend: 2X points
   - Housing: 0X~1.25X (Housing-only) or max 1X (Flexible)
   - $200 annual Bilt Cash + $400 annual hotel credit (semi-annual $200)

### Reward Options
1. **Housing-only Option**
   - Auto points on housing (0X~1.25X based on Everyday Spend Ratio)
   - Under 25%: 0X (min 250 points guaranteed)
   - 25%~50%: 0.5X
   - 50%~75%: 0.75X
   - 75%~100%: 1X
   - 100%+: 1.25X
   - No Bilt Cash on everyday spend

2. **Flexible Bilt Cash Option**
   - 4% Bilt Cash on everyday spend
   - Unlock housing points at $3 Bilt Cash = 100 points (max 1X)
   - Default option

### Point Value
- Bilt points are worth approximately 1.5~2 cents when transferred to airline miles
- Conservative calculation: 1 point = 1.5 cents

Answer questions helpfully and accurately. If calculator values are provided, give personalized advice based on those values. Keep answers concise."""


class handler(BaseHTTPRequestHandler):
    def _validate_origin(self):
        """Validate Origin header against allowed origins."""
        origin = self.headers.get('Origin', '')
        if not origin:
            return True  # Same-origin requests (no Origin header)

        # Exact match
        if origin in ALLOWED_ORIGINS:
            return True

        # Pattern match (Preview deployments)
        for pattern in ALLOWED_ORIGIN_PATTERNS:
            if re.match(pattern, origin):
                return True

        return False

    def _get_client_ip(self):
        """Get client IP from headers (handles proxies)."""
        forwarded = self.headers.get('X-Forwarded-For', '')
        if forwarded:
            return forwarded.split(',')[0].strip()
        real_ip = self.headers.get('X-Real-IP', '')
        if real_ip:
            return real_ip
        return self.client_address[0] if self.client_address else 'unknown'

    def do_POST(self):
        # Origin validation
        if not self._validate_origin():
            self._send_error(403, 'Origin not allowed')
            return

        # Rate limiting
        client_ip = self._get_client_ip()
        if not rate_limiter.is_allowed(client_ip):
            self._send_error(429, 'Too many requests. Please try again later.')
            return

        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)

        try:
            body = json.loads(post_data.decode('utf-8'))
            message = body.get('message', '')
            context = body.get('context', {})
            history = body.get('history', [])

            # Message length validation
            if len(message) > MAX_MESSAGE_LENGTH:
                self._send_error(400, f'Message too long (max {MAX_MESSAGE_LENGTH} characters)')
                return

            api_key = os.environ.get('GEMINI_API_KEY')
            if not api_key:
                self._send_error(500, 'GEMINI_API_KEY not configured')
                return

            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.0-flash')

            # Use detailed summary if available, otherwise fallback to basic info
            if context.get('summary'):
                context_str = context.get('summary')
            else:
                # Fallback for older clients
                inputs = context.get('inputs', context)
                context_str = f"""[Current User Status]
- Monthly Housing: ${inputs.get('housingCost', inputs.get('housing', 0)):,.0f}
- Monthly Everyday Spend: ${inputs.get('everydaySpend', 0):,.0f}
- Selected Card: {inputs.get('card', 'unknown').capitalize()}
- Selected Option: {inputs.get('option', 'unknown').replace('_', ' ').title()}"""

            full_message = f"{context_str}\n\nUser Question: {message}"

            chat_history = [
                {'role': 'user', 'parts': [SYSTEM_PROMPT]},
                {'role': 'model', 'parts': ['I understand. I will help as a Bilt card specialist.']}
            ]

            for h in history:
                chat_history.append({
                    'role': 'user' if h.get('role') == 'user' else 'model',
                    'parts': [h.get('content', '')]
                })

            chat_history.append({'role': 'user', 'parts': [full_message]})

            response = model.generate_content(
                chat_history,
                generation_config={
                    'temperature': 0.7,
                    'max_output_tokens': 2000
                }
            )

            reply = response.text if response.text else 'No response received.'

            self._send_json({
                'reply': reply,
                'usage': {'tokens': 0}
            })

        except Exception as e:
            self._send_error(500, str(e))

    def do_OPTIONS(self):
        # Origin validation for preflight
        if not self._validate_origin():
            self._send_error(403, 'Origin not allowed')
            return
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def _send_json(self, data):
        self.send_response(200)
        self._send_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def _send_error(self, code, message):
        self.send_response(code)
        self._send_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'error': message}).encode('utf-8'))

    def _send_cors_headers(self):
        origin = self.headers.get('Origin', '')
        # Only set allowed origin if it passes validation
        if origin and self._validate_origin():
            self.send_header('Access-Control-Allow-Origin', origin)
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
