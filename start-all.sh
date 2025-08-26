#!/bin/bash
exec &> /home/pranish/ai-academia-bikeerg/manual-launch.log
echo "📦 Manual launch started at $(date)"

if [[ "$RUN_LOGGED" == "1" ]]; then
  exec &> /home/pranish/ai-academia-bikeerg/boot.log
fi

export DISPLAY=:0
cd /home/pranish/ai-academia-bikeerg

echo "🐍 Activating Python virtual environment..."
source venv/bin/activate

echo "🚀 Starting FastAPI backend..."
uvicorn src.api.main:app --host 0.0.0.0 --port 8080 --reload &

echo "🌐 Starting Vite frontend..."
cd frontend
npm run dev &

# Wait for frontend to be reachable
echo "⏳ Waiting for frontend to become available at http://localhost:5173 ..."
until curl -s http://localhost:5173 > /dev/null; do
  echo "… frontend not up yet, retrying..."
  sleep 1
done
echo "✅ Frontend is now reachable."

# If running under Openbox kiosk, let systemd launch Chromium so it can auto-restart.
if [[ "$SKIP_CHROMIUM" == "1" ]]; then
  echo "🖥️ SKIP_CHROMIUM=1 set → not launching browser here (systemd will do it)."
  exit 0
fi

echo "🖥️ Launching Chromium browser in kiosk mode..."
chromium --kiosk http://localhost:5173 \
  --disable-background-networking \
  --disable-component-update \
  --disable-default-apps \
  --noerrdialogs \
  --no-first-run \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --force-device-scale-factor=0.9 \
  >/dev/null 2>&1 &
