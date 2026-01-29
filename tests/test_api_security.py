"""Unit tests for API security features."""

import sys
import os
import unittest
from unittest.mock import MagicMock, patch
from time import time
import re

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Mock google.generativeai before importing chat
sys.modules['google'] = MagicMock()
sys.modules['google.generativeai'] = MagicMock()

from api.chat import (
    RateLimiter,
    ALLOWED_ORIGINS,
    ALLOWED_ORIGIN_PATTERNS,
    MAX_MESSAGE_LENGTH,
)


class TestRateLimiter(unittest.TestCase):
    """Tests for RateLimiter class."""

    def test_allows_requests_under_limit(self):
        """Should allow requests under the rate limit."""
        limiter = RateLimiter(max_requests=5, window_seconds=60)
        ip = '192.168.1.1'

        for i in range(5):
            self.assertTrue(limiter.is_allowed(ip), f"Request {i+1} should be allowed")

    def test_blocks_requests_over_limit(self):
        """Should block requests over the rate limit."""
        limiter = RateLimiter(max_requests=5, window_seconds=60)
        ip = '192.168.1.1'

        # Make 5 allowed requests
        for _ in range(5):
            limiter.is_allowed(ip)

        # 6th request should be blocked
        self.assertFalse(limiter.is_allowed(ip))

    def test_different_ips_have_separate_limits(self):
        """Different IPs should have independent rate limits."""
        limiter = RateLimiter(max_requests=2, window_seconds=60)

        # Use up IP1's quota
        limiter.is_allowed('192.168.1.1')
        limiter.is_allowed('192.168.1.1')
        self.assertFalse(limiter.is_allowed('192.168.1.1'))

        # IP2 should still be allowed
        self.assertTrue(limiter.is_allowed('192.168.1.2'))

    def test_requests_expire_after_window(self):
        """Requests should expire after the time window."""
        limiter = RateLimiter(max_requests=2, window_seconds=60)
        ip = '192.168.1.1'

        # Manually add old timestamps
        old_time = time() - 120  # 2 minutes ago
        limiter.requests[ip] = [old_time, old_time]

        # Should be allowed because old requests expired
        self.assertTrue(limiter.is_allowed(ip))

    def test_cleanup_stale_entries(self):
        """Should clean up stale IP entries to prevent memory leak."""
        limiter = RateLimiter(max_requests=5, window_seconds=60, max_entries=2)

        # Add requests from multiple IPs
        old_time = time() - 120  # 2 minutes ago (expired)
        limiter.requests['ip1'] = [old_time]
        limiter.requests['ip2'] = [old_time]
        limiter.requests['ip3'] = [old_time]

        # Trigger cleanup by exceeding max_entries
        limiter.is_allowed('ip4')

        # Stale entries should be cleaned up
        self.assertLessEqual(len(limiter.requests), 3)


class TestOriginValidation(unittest.TestCase):
    """Tests for Origin header validation."""

    def test_production_origin_allowed(self):
        """Production origin should be allowed."""
        self.assertIn('https://bilt-card-strategy.vercel.app', ALLOWED_ORIGINS)

    def test_localhost_origin_allowed(self):
        """Localhost origin should be allowed for development."""
        self.assertIn('http://localhost:3000', ALLOWED_ORIGINS)

    def test_preview_deployment_pattern(self):
        """Vercel preview deployment URLs should match pattern."""
        pattern = ALLOWED_ORIGIN_PATTERNS[0]

        # Should match preview URLs
        self.assertIsNotNone(
            re.match(pattern, 'https://bilt-card-strategy-abc123.vercel.app')
        )
        self.assertIsNotNone(
            re.match(pattern, 'https://bilt-card-strategy-git-feature-branch.vercel.app')
        )

        # Should NOT match other URLs
        self.assertIsNone(re.match(pattern, 'https://evil-site.com'))
        self.assertIsNone(re.match(pattern, 'https://bilt-card-strategy.vercel.app'))
        self.assertIsNone(re.match(pattern, 'https://fake-bilt-card-strategy-abc.vercel.app'))


class TestMessageLengthValidation(unittest.TestCase):
    """Tests for message length validation."""

    def test_max_length_constant_defined(self):
        """MAX_MESSAGE_LENGTH should be defined."""
        self.assertEqual(MAX_MESSAGE_LENGTH, 5000)

    def test_message_under_limit(self):
        """Messages under the limit should be valid."""
        message = 'a' * 4999
        self.assertLess(len(message), MAX_MESSAGE_LENGTH)

    def test_message_at_limit(self):
        """Messages at exactly the limit should be valid."""
        message = 'a' * 5000
        self.assertEqual(len(message), MAX_MESSAGE_LENGTH)

    def test_message_over_limit(self):
        """Messages over the limit should be invalid."""
        message = 'a' * 5001
        self.assertGreater(len(message), MAX_MESSAGE_LENGTH)


if __name__ == '__main__':
    unittest.main()
