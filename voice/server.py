"""Jarvis voice server.

Serves the voice page at http://localhost:8340 and relays what you say to Claude.
Your browser does the listening (speech-to-text) and the talking (text-to-speech);
this server only holds your API key and talks to the Claude API.

Run:  python voice/server.py
"""

import json
import os
import pathlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import anthropic

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parent
PORT = int(os.environ.get("JARVIS_PORT", "8340"))
MODEL = os.environ.get("JARVIS_MODEL", "claude-opus-5-5")
EFFORT = os.environ.get("JARVIS_EFFORT", "low")
MAX_TURNS = 30

client = anthropic.Anthropic()

PERSONA = """You are Jarvis, the user's voice assistant and business partner. They are \
talking to you out loud and hear your reply through a speaker.

How to speak:
- Latency-sensitive; begin your visible answer immediately.
- Keep replies short: one to four sentences unless they ask for detail.
- Plain spoken English only. No markdown, bullet points, headings, emoji, URLs or code; \
they will be read aloud. Say numbers the way a person would.
- Be direct and a little dry, like a capable butler who is also a sharp operator. \
Call them "sir" only if they ask you to.
- If you need something from them, ask one question at a time.

What you know about their business is below. It comes from files in their money-maker \
repo. Use it when it is relevant, and say so plainly if something is missing."""


def business_context():
    """Read the Jarvis memory files so the voice assistant knows the plan."""
    parts = []
    for name in ("PROMPT.md", "jarvis/profile.md", "jarvis/scorecard.md", "jarvis/log.md"):
        path = REPO / name
        if path.exists():
            parts.append(f"<file name=\"{name}\">\n{path.read_text()[:12000]}\n</file>")
    return "\n\n".join(parts)


def clean_history(raw):
    """Keep only well-formed user/assistant turns, ending on a user turn."""
    turns = [
        {"role": t["role"], "content": str(t["content"])}
        for t in raw
        if isinstance(t, dict) and t.get("role") in ("user", "assistant") and str(t.get("content", "")).strip()
    ][-MAX_TURNS:]
    while turns and turns[0]["role"] != "user":
        turns.pop(0)
    if not turns or turns[-1]["role"] != "user":
        raise ValueError("The conversation must end with something you said.")
    return turns


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path not in ("/", "/index.html"):
            self.send_error(404)
            return
        body = (HERE / "index.html").read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != "/api/chat":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            turns = clean_history(json.loads(self.rfile.read(length) or b"{}").get("messages", []))
        except (ValueError, json.JSONDecodeError) as e:
            self.send_error(400, str(e))
            return

        # Stream plain text back as Claude writes it, so the page can start speaking early.
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()

        def write(text):
            self.wfile.write(text.encode())
            self.wfile.flush()

        try:
            with client.beta.messages.stream(
                model=MODEL,
                max_tokens=4000,
                betas=["server-side-fallback-2026-07-01"],
                fallbacks="default",
                output_config={"effort": EFFORT},
                system=[
                    {"type": "text", "text": PERSONA},
                    {"type": "text", "text": business_context(), "cache_control": {"type": "ephemeral"}},
                ],
                messages=turns,
            ) as stream:
                for text in stream.text_stream:
                    write(text)
                if stream.get_final_message().stop_reason == "refusal":
                    write("I can't help with that one.")
        except (anthropic.AuthenticationError, TypeError):
            # TypeError: the SDK found no API key at all.
            write("My API key isn't working. Check ANTHROPIC_API_KEY and restart me.")
        except anthropic.RateLimitError:
            write("I'm being rate limited. Give me a moment and try again.")
        except anthropic.APIStatusError as e:
            write(f"The Claude API returned an error, status {e.status_code}.")
        except anthropic.APIConnectionError:
            write("I can't reach the Claude API. Check your internet connection.")
        except (BrokenPipeError, ConnectionResetError):
            pass  # The page stopped listening (you interrupted me).

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    if not (os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN")):
        print("Warning: ANTHROPIC_API_KEY is not set. Get a key at https://console.anthropic.com/settings/keys")
    print(f"Jarvis is listening at http://localhost:{PORT}  (model: {MODEL}). Open it in Chrome, Edge or Safari.")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
