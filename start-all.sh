#!/bin/bash

if [[ "$RUN_LOGGED" == "1" ]]; then
  exec &> /home/pranish/ai-academia-bikeerg/boot.log
  echo "🚀 Boot launch started at $(date)"
else
  echo "📦 Manual launch started at $(date) (no log file)"
fi

export DISPLAY=:0
cd /home/pranish/ai-academia-bikeerg

# Clean up old processes
pkill -f "uvicorn src.api.main:app" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null
sleep 2

echo "🐍 Activating Python virtual environment..."
source venv/bin/activate

echo "🚀 Starting FastAPI backend..."
nohup /home/pranish/ai-academia-bikeerg/venv/bin/uvicorn \
  src.api.main:app --host 0.0.0.0 --port 8080 \
  > /home/pranish/ai-academia-bikeerg/backend.log 2>&1 &

echo "🌐 Starting Vite frontend..."
cd /home/pranish/ai-academia-bikeerg/frontend
nohup npm run dev \
  > /home/pranish/ai-academia-bikeerg/frontend/frontend.log 2>&1 &

# Wait for frontend first time
echo "⏳ Waiting for frontend to become available at http://localhost:5173 ..."
until curl -s http://localhost:5173 > /dev/null; do
  echo "… frontend not up yet, retrying..."
  sleep 1
done
echo "✅ Frontend is now reachable."

# Wake PM5
echo "⚡ Triggering PM5 wake via Shelly..."
/home/pranish/ai-academia-bikeerg/venv/bin/python \
  /home/pranish/ai-academia-bikeerg/scripts/shelly_wake_pm5.py

echo "⏳ Waiting 6 seconds for PM5 to boot and begin BLE advertising..."
sleep 6
echo "✅ PM5 wake sequence completed."

# Re-check frontend after the long Shelly delay
echo "🔁 Re-checking frontend availability after Shelly wake..."
until curl -s http://localhost:5173 > /dev/null; do
  echo "… frontend not reachable after Shelly wake, retrying..."
  sleep 1
done
echo "✅ Frontend still reachable."

if [[ "$SKIP_CHROMIUM" == "1" ]]; then
  echo "🖥️ SKIP_CHROMIUM=1 set → not launching browser here."
  exit 0
fi

echo "🖥️ Launching Chromium browser in kiosk mode..."
chromium-browser --kiosk http://localhost:5173 \
  --disable-background-networking \
  --disable-component-update \
  --disable-default-apps \
  --noerrdialogs \
  --no-first-run \
  --disable-infobars \
  --start-fullscreen \
  >/dev/null 2>&1 &