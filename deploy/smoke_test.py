#!/usr/bin/env python3
"""
Pollipop — Automated Live Deployment Smoke Test
Usage:
    python3 deploy/smoke_test.py <SERVICE_URL>

Optional Environment Variables (set BOTH or neither):
    SMOKE_EMAIL     Email of a seeded account (e.g. owner1@pollipop.local)
    SMOKE_PASSWORD  Password for the account above

Checks:
    1. GET /api/health -> HTTP 200 and JSON status == "ok"
    2. GET /api/ready  -> HTTP 200 and JSON status == "ready", db == "connected"
    3. GET /           -> HTTP 200 and HTML contains Pollipop SPA root
    4. Optional Auth   -> POST /api/auth/login -> GET /api/auth/me -> POST /api/auth/logout
"""

import http.cookiejar
import json
import os
import sys
import urllib.error
import urllib.request


TIMEOUT_SECONDS = 15


def build_opener() -> urllib.request.OpenerDirector:
    cookie_jar = http.cookiejar.CookieJar()
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))


def request(
    opener: urllib.request.OpenerDirector,
    url: str,
    method: str = "GET",
    payload: dict | None = None,
) -> tuple[int, str]:
    headers = {"Accept": "application/json, text/html"}
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with opener.open(req, timeout=TIMEOUT_SECONDS) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        return exc.code, body


def main() -> int:
    if len(sys.argv) < 2 or not sys.argv[1].strip():
        print("Usage: python3 deploy/smoke_test.py <SERVICE_URL>", file=sys.stderr)
        return 2

    base_url = sys.argv[1].rstrip("/")
    opener = build_opener()

    print(f"Running Pollipop smoke tests against: {base_url}")

    # 1. Health check
    status, body = request(opener, f"{base_url}/api/health")
    if status != 200:
        print(f"FAIL: GET /api/health returned HTTP {status}: {body}", file=sys.stderr)
        return 1
    health = json.loads(body)
    if health.get("status") != "ok":
        print(f"FAIL: GET /api/health unexpected payload: {health}", file=sys.stderr)
        return 1
    print("PASS: GET /api/health (HTTP 200, status=ok)")

    # 2. Readiness / Database check
    status, body = request(opener, f"{base_url}/api/ready")
    if status != 200:
        print(f"FAIL: GET /api/ready returned HTTP {status}: {body}", file=sys.stderr)
        return 1
    ready = json.loads(body)
    if ready.get("status") != "ready" or ready.get("db") != "connected":
        print(f"FAIL: GET /api/ready unexpected payload: {ready}", file=sys.stderr)
        return 1
    print("PASS: GET /api/ready (HTTP 200, db=connected)")

    # 3. Frontend HTML check
    status, body = request(opener, f"{base_url}/")
    if status != 200 or ("Pollipop" not in body and 'id="root"' not in body):
        print(f"FAIL: GET / returned HTTP {status} without Pollipop SPA HTML", file=sys.stderr)
        return 1
    print("PASS: GET / (HTTP 200, Pollipop SPA HTML served)")

    # 4. Optional authenticated login flow check
    smoke_email = os.environ.get("SMOKE_EMAIL", "").strip()
    smoke_password = os.environ.get("SMOKE_PASSWORD", "").strip()

    if smoke_email and smoke_password:
        status, body = request(
            opener,
            f"{base_url}/api/auth/login",
            method="POST",
            payload={"email": smoke_email, "password": smoke_password},
        )
        if status != 200:
            print(f"FAIL: POST /api/auth/login returned HTTP {status}", file=sys.stderr)
            return 1

        status, body = request(opener, f"{base_url}/api/auth/me")
        if status != 200:
            print(f"FAIL: GET /api/auth/me returned HTTP {status}", file=sys.stderr)
            return 1
        me = json.loads(body)
        if me.get("user", {}).get("email", "").lower() != smoke_email.lower():
            print("FAIL: GET /api/auth/me email mismatch", file=sys.stderr)
            return 1

        status, _ = request(opener, f"{base_url}/api/auth/logout", method="POST")
        if status != 200:
            print(f"FAIL: POST /api/auth/logout returned HTTP {status}", file=sys.stderr)
            return 1
        print("PASS: Optional auth smoke check (login -> /api/auth/me -> logout)")
    elif smoke_email or smoke_password:
        print(
            "FAIL: Set BOTH SMOKE_EMAIL and SMOKE_PASSWORD or neither.",
            file=sys.stderr,
        )
        return 1
    else:
        print("SKIP: Optional auth smoke check (SMOKE_EMAIL/SMOKE_PASSWORD not set)")

    print("All Pollipop smoke checks passed!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
