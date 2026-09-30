#!/bin/bash
cd "$(dirname "$0")"
MODEL="qwen2.5:3b-instruct-q5_K_S"

echo "========================================="
echo "      أبو شريك - الذكاء الاصطناعي المحلي"
echo "========================================="

if ! command -v ollama >/dev/null 2>&1; then
  echo "Ollama غير مثبت. سيتم فتح صفحة التحميل."
  open "https://ollama.com/download"
  read -n 1 -s -r -p "اضغط أي زر للإغلاق..."
  exit 1
fi
open -a Ollama >/dev/null 2>&1 || true
sleep 3
if ! curl -s http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
  echo "تعذر تشغيل Ollama. افتح تطبيق Ollama ثم جرّب من جديد."
  read -n 1 -s -r -p "اضغط أي زر للإغلاق..."
  exit 1
fi
if ! ollama list 2>/dev/null | grep -q "$MODEL"; then
  echo "يتم تنزيل نموذج Qwen2.5 3B للمرة الأولى..."
  ollama pull "$MODEL" || exit 1
fi
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js غير مثبت على الجهاز."
  read -n 1 -s -r -p "اضغط أي زر للإغلاق..."
  exit 1
fi
export OLLAMA_MODEL="$MODEL"
node server.mjs &
SERVER_PID=$!
sleep 2
open "http://localhost:3000"
wait $SERVER_PID
