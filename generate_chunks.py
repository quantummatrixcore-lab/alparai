import json
with open('src/lib/ai/openrouter-gateway.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

replacements = {
    'gemini-1.5-flash': 'gemini-2.0-flash',
    'gemini-1.5-pro': 'gemini-2.0-pro',
    'claude-3.5-sonnet': 'claude-3.7-sonnet',
    'meta/llama-3.1-70b-instruct': 'meta/llama-3.3-70b-instruct',
    'meta-llama/llama-3.1-8b-instruct:free': 'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemini-flash-1.5': 'google/gemini-2.0-flash',
    'nvidia/llama-3.1-nemotron-70b-instruct': 'nvidia/llama-3.3-nemotron-70b-instruct'
}

chunks = []
for i, line in enumerate(lines):
    new_line = line
    for old, new in replacements.items():
        if old in new_line:
            new_line = new_line.replace(old, new)
    if new_line != line:
        chunks.append({
            'AllowMultiple': False,
            'StartLine': i + 1,
            'EndLine': i + 1,
            'TargetContent': line,
            'ReplacementContent': new_line
        })

print(json.dumps(chunks))
