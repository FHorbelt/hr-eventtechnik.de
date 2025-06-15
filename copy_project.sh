#!/bin/bash

# HR-Eventtechnik Project Code Copier für Mac
# Kopiert strukturiert alle Projektdateien in die Zwischenablage

PROJECT_PATH="."  # Aktueller Ordner (du bist bereits im hr-eventtechnik Ordner)
OUTPUT_FILE="/tmp/project_code.txt"

echo "🚀 HR-Eventtechnik Code Copier"
echo "================================"

# Überprüfen ob Ordner existiert
if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Ordner nicht gefunden: $PROJECT_PATH"
    echo "💡 Bitte den PROJECT_PATH in der ersten Zeile anpassen!"
    exit 1
fi

echo "📂 Analysiere Projekt: $(basename "$PROJECT_PATH")"
echo "============================================================"

# Output-Datei erstellen
cat > "$OUTPUT_FILE" << EOF
=== HR-EVENTTECHNIK PROJEKT CODE ===
Projekt: $(basename "$PROJECT_PATH")
Pfad: $(realpath "$PROJECT_PATH")
Erstellt: $(date)
============================================================

📁 PROJEKTSTRUKTUR:

EOF

# Projektstruktur anzeigen
echo "📁 PROJEKTSTRUKTUR:" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

cd "$PROJECT_PATH" || exit 1

# Tree-ähnliche Struktur erstellen
find . -type f \( \
    -name "*.html" -o \
    -name "*.css" -o \
    -name "*.js" -o \
    -name "*.json" -o \
    -name "*.md" -o \
    -name "*.txt" \
\) \
-not -path "./node_modules/*" \
-not -path "./.git/*" \
-not -path "./dist/*" \
-not -path "./build/*" \
| sort >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"
echo "============================================================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Dateien sammeln
files_list=$(find . -type f \( \
    -name "*.html" -o \
    -name "*.css" -o \
    -name "*.js" -o \
    -name "*.json" -o \
    -name "*.md" -o \
    -name "*.txt" \
\) \
-not -path "./node_modules/*" \
-not -path "./.git/*" \
-not -path "./dist/*" \
-not -path "./build/*" \
-not -name "*.rtf" \
| sort)

# Dateien zählen
file_count=$(echo "$files_list" | wc -l)
if [ -z "$files_list" ]; then
    file_count=0
fi

# Dateien verarbeiten
echo "$files_list" | while IFS= read -r file; do
    if [ -n "$file" ]; then
        echo "📄 DATEI: $file" >> "$OUTPUT_FILE"
        echo "------------------------------------------------------------" >> "$OUTPUT_FILE"
        
        # Dateiinhalt hinzufügen
        if [ -r "$file" ]; then
            cat "$file" >> "$OUTPUT_FILE" 2>/dev/null || echo "[FEHLER: Datei konnte nicht gelesen werden]" >> "$OUTPUT_FILE"
        else
            echo "[FEHLER: Datei nicht lesbar]" >> "$OUTPUT_FILE"
        fi
        
        echo "" >> "$OUTPUT_FILE"
        echo "============================================================" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        
        echo "✅ $file"
    fi
done

# In Zwischenablage kopieren (Mac)
if command -v pbcopy > /dev/null; then
    cat "$OUTPUT_FILE" | pbcopy
    
    # Statistiken
    char_count=$(wc -c < "$OUTPUT_FILE")
    
    echo ""
    echo "🎉 ERFOLGREICH!"
    echo "📋 $file_count Dateien in Zwischenablage kopiert"
    echo "📏 Gesamtgröße: $(printf "%'d" $char_count) Zeichen"
    echo ""
    echo "💡 Du kannst jetzt Cmd+V drücken um alles einzufügen!"
    
else
    echo ""
    echo "❌ pbcopy nicht verfügbar!"
    echo "📄 Code wurde in $OUTPUT_FILE gespeichert"
    echo "💡 Du kannst die Datei manuell öffnen und kopieren"
fi

# Temporäre Datei aufräumen
rm -f "$OUTPUT_FILE"

echo ""
read -p "⏸️  Drücke Enter zum Beenden..."