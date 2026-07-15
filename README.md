# notion-effort

Chrome extension to control AI model and reasoning effort in Notion.

## Install

1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click Load unpacked → select this folder

## Usage

1. Open `app.notion.com`
2. Click extension icon
3. Select model and effort level
4. Send AI messages — requests will be intercepted

## Models

| Alias | Name | Family | Efforts |
|-------|------|--------|---------|
| almond-croissant-low | Sonnet 4.6 | anthropic | low/medium/high/max |
| ambrosia-tart-high | Opus 4.8 | anthropic | low/medium/high/max |
| orchid-muffin | GPT-5.6 Terra | openai | medium/high |
| orange-mousse | GPT-5.6 Sol | openai | medium/high |

## How it works

Intercepts `POST /api/v3/runInferenceTranscript` and modifies the `model` field in the request payload.

## License

MIT
