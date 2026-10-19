# Jarvis voice

A Jarvis you talk to out loud and that talks back. It runs on your own computer, in Chrome, Edge or Safari, and knows your money-maker plan (it reads `PROMPT.md` and the `jarvis/` memory files).

```
your voice ──► browser speech recognition ──► voice/server.py ──► Claude API
                                                                    │
your speakers ◄── browser text-to-speech ◄── reply streamed back ◄──┘
```

## Setup (about 5 minutes)

1. **Get a Claude API key** at <https://console.anthropic.com/settings/keys> and add a little credit. This is billed separately from a Claude.ai subscription.
2. **Install Python 3.10+** if you don't have it (<https://www.python.org/downloads/>).
3. **Download this repo and install the one dependency.** In a terminal:
   ```bash
   git clone -b claude/trusting-brown-p6fhbf https://github.com/griffinstoner/money-maker.git
   cd money-maker
   pip install -r voice/requirements.txt
   ```
4. **Start Jarvis with your key:**
   - macOS / Linux:
     ```bash
     export ANTHROPIC_API_KEY=sk-ant-...
     python3 voice/server.py
     ```
   - Windows (PowerShell):
     ```powershell
     $env:ANTHROPIC_API_KEY="sk-ant-..."
     python voice/server.py
     ```
5. **Open <http://localhost:8340> in Chrome** (or Edge or Safari), click the orb, allow the microphone, and talk.

## Using it

- **Click the orb or press Space** to talk. It stops listening when you pause, thinks, then answers out loud.
- **Click the orb while it's talking** to interrupt it and say something else. **Esc** stops everything.
- **Keep listening after each reply** lets you have a back-and-forth conversation without clicking each time.
- **Wake word "Jarvis"**: it listens all the time and only responds when you start with "Jarvis…". Keep the tab open.
- **Voice**: pick any voice your computer has. It defaults to a British male voice when one is available (Google UK English Male in Chrome, Daniel on a Mac).
- You can always type instead of talking.

## Settings

Set these as environment variables before starting the server:

| Variable | Default | What it does |
|---|---|---|
| `JARVIS_MODEL` | `claude-opus-5-5` | Which Claude model answers. `claude-haiku-5-5` replies faster and costs about 40 times less, but gives less thoughtful answers. |
| `JARVIS_EFFORT` | `low` | How much Claude thinks before answering (`low`, `medium`, `high`). Low keeps replies quick. |
| `JARVIS_PORT` | `8340` | The local port. |

Roughly, each spoken reply costs one to two cents with the default model and a few hundredths of a cent with Haiku.

## Privacy

- The server only accepts connections from your own computer.
- Chrome and Edge send your microphone audio to Google or Microsoft to turn it into text. Safari on a Mac can do this on the device.
- What you say (as text) and your `jarvis/` files go to the Claude API to get the reply.

## Research: ways to get a talking Jarvis (Oct 2026)

| Option | Setup | Cost | Good for | Downsides |
|---|---|---|---|---|
| **Claude app voice mode** (iOS, Android, desktop) | None: tap the voice button | Included in your Claude plan | Talking to Claude anywhere, today | Doesn't know this repo's files unless you paste them in; no wake word |
| **This repo's `voice/`** | 5 minutes, needs an API key | Pay per use (cents) | A Jarvis that knows your business plan and memory, with a wake word | Runs only on your computer while the server is on; browser voices sound robotic |
| **Claude Code voice mode** (`/voice`) | Built into Claude Code | Included | Talking to Claude Code while it works on the repo | You speak, but it answers in text |
| **[jarvis-voice-assistant](https://github.com/Julian-Ivanov/jarvis-voice-assistant)** (open source) | 15–30 min, Windows | API key + ElevenLabs (free tier is 10k characters/month) | More realistic voice, browser automation, describing your screen | Windows only; more moving parts |
| **Pipecat or LiveKit Agents** (open-source voice frameworks) | Hours, you write code | Several paid speech services | Phone-call agents and low-latency, production voice bots | Overkill for a personal assistant |
| **Fully offline** (whisper.cpp + local model + Piper voice) | Hours | Free after setup | Privacy, no internet | Local models are much weaker than Claude |

**Recommendation:** use the Claude app's voice mode when you're away from your computer, and this `voice/` Jarvis at your desk, since it knows your plan and progress. If the robotic voice bothers you, the next upgrade is a premium voice (ElevenLabs or similar) in place of the browser's built-in one.

Sources: [Julian-Ivanov/jarvis-voice-assistant](https://github.com/Julian-Ivanov/jarvis-voice-assistant), [VoiceOS: Claude voice mode](https://www.voiceos.com/blog/claude-voice-mode), [VoiceDash: Claude voice input](https://voicedash.ai/?p=13702), [Claude Code voice mode](https://ai-startups.dealroom.co/news/feed/claude-code-gets-voice-mode-for-hands-free-ai-coding), [Fora Soft: Pipecat vs LiveKit](https://www.forasoft.com/blog/article/pipecat-vs-livekit-agents), [LiveKit: open-source voice frameworks](https://livekit.com/blog/best-open-source-voice-and-video-ai-agent-frameworks), [jarvis_dart (offline)](https://pub.dev/documentation/jarvis_dart/latest/).
