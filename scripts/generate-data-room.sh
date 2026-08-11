#!/bin/bash

# ALPAR AI - Data Room Generator
# This script compiles the Data Room markdown files into a single professional PDF for VC distribution.
# It is designed to be run in CI/CD (GitHub Actions) or locally.

set -e

echo "🚀 Starting ALPAR AI Data Room Generation..."

DATA_ROOM_DIR="docs/DATA_ROOM"
OUTPUT_DIR="docs/DATA_ROOM/build"
COMPILED_MD="$OUTPUT_DIR/alpar_ai_data_room_compiled.md"
FINAL_PDF="$OUTPUT_DIR/ALPAR_AI_Data_Room.pdf"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "📑 Compiling Markdown sections..."
# In a larger data room, this would concatenate multiple files (e.g. 01_exec_summary.md, 02_tech.md, etc.)
# For now, we use index.md
cat "$DATA_ROOM_DIR/index.md" > "$COMPILED_MD"

echo "📄 Converting to PDF using md-to-pdf..."
# Make sure to run this where npx is available
npx md-to-pdf "$COMPILED_MD" --stylesheet "https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css"

if [ -f "$COMPILED_MD.pdf" ]; then
    mv "$COMPILED_MD.pdf" "$FINAL_PDF"
    echo "✅ Success! Data Room PDF generated at: $FINAL_PDF"
else
    echo "❌ Error: PDF generation failed."
    exit 1
fi
