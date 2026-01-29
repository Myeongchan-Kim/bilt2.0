from http.server import BaseHTTPRequestHandler
import json
import os
import google.generativeai as genai

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
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)

        try:
            body = json.loads(post_data.decode('utf-8'))
            message = body.get('message', '')
            context = body.get('context', {})
            history = body.get('history', [])

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
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
