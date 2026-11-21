#!/usr/bin/env python3
"""Offline unit tests for deploy/smoke_test.py using a local mock HTTP server."""

import http.server
import json
import os
import subprocess
import sys
import threading
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SMOKE_SCRIPT = REPO_ROOT / "deploy" / "smoke_test.py"


class MockState:
    ready_status = 200
    ready_payload = {"status": "ready", "db": "connected"}


class MockPollipopHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        return  # Keep unittest output clean

    def _send_json(self, code: int, payload: dict, extra_headers: dict | None = None):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        if extra_headers:
            for k, v in extra_headers.items():
                self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/health":
            self._send_json(200, {"status": "ok", "service": "Pollipop API"})
        elif self.path == "/api/ready":
            self._send_json(MockState.ready_status, MockState.ready_payload)
        elif self.path == "/":
            html = b'<!doctype html><html><title>Pollipop</title><body><div id="root"></div></body></html>'
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(html)))
            self.end_headers()
            self.wfile.write(html)
        elif self.path == "/api/auth/me":
            cookie = self.headers.get("Cookie", "")
            if "pollipop_sid=mock-session-id" in cookie:
                self._send_json(200, {"user": {"email": "student1@pollipop.local", "role": "RESPONDENT"}})
            else:
                self._send_json(401, {"error": {"code": "UNAUTHORIZED"}})
        else:
            self._send_json(404, {"error": {"code": "NOT_FOUND"}})

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
        if self.path == "/api/auth/login":
            data = json.loads(raw)
            if data.get("email") == "student1@pollipop.local" and data.get("password") == "TestPass123!":
                self._send_json(
                    200,
                    {"user": {"email": "student1@pollipop.local", "role": "RESPONDENT"}},
                    {"Set-Cookie": "pollipop_sid=mock-session-id; Path=/; HttpOnly"},
                )
            else:
                self._send_json(401, {"error": {"code": "INVALID_CREDENTIALS"}})
        elif self.path == "/api/auth/logout":
            self._send_json(200, {"message": "ok"})
        else:
            self._send_json(404, {"error": {"code": "NOT_FOUND"}})


class TestSmokeScript(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = http.server.HTTPServer(("127.0.0.1", 0), MockPollipopHandler)
        cls.port = cls.server.server_address[1]
        cls.base_url = f"http://127.0.0.1:{cls.port}"
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        MockState.ready_status = 200
        MockState.ready_payload = {"status": "ready", "db": "connected"}

    def _run_smoke(self, extra_env: dict | None = None) -> subprocess.CompletedProcess:
        env = os.environ.copy()
        env.pop("SMOKE_EMAIL", None)
        env.pop("SMOKE_PASSWORD", None)
        if extra_env:
            env.update(extra_env)
        return subprocess.run(
            [sys.executable, str(SMOKE_SCRIPT), self.base_url],
            env=env,
            capture_output=True,
            text=True,
            check=False,
        )

    def test_public_endpoints_pass(self):
        res = self._run_smoke()
        self.assertEqual(res.returncode, 0, msg=res.stderr)
        self.assertIn("PASS: GET /api/health", res.stdout)
        self.assertIn("PASS: GET /api/ready", res.stdout)
        self.assertIn("PASS: GET /", res.stdout)

    def test_optional_low_privilege_auth_passes(self):
        res = self._run_smoke(
            {"SMOKE_EMAIL": "student1@pollipop.local", "SMOKE_PASSWORD": "TestPass123!"}
        )
        self.assertEqual(res.returncode, 0, msg=res.stderr)
        self.assertIn("PASS: Optional auth smoke check", res.stdout)

    def test_readiness_failure_returns_nonzero(self):
        MockState.ready_status = 503
        MockState.ready_payload = {"status": "not_ready", "db": "disconnected"}
        res = self._run_smoke()
        self.assertNotEqual(res.returncode, 0)
        self.assertIn("FAIL: GET /api/ready", res.stderr)

    def test_partial_smoke_credentials_rejected(self):
        res = self._run_smoke({"SMOKE_EMAIL": "student1@pollipop.local"})
        self.assertNotEqual(res.returncode, 0)
        self.assertIn("Set BOTH SMOKE_EMAIL and SMOKE_PASSWORD", res.stderr)


if __name__ == "__main__":
    unittest.main()
