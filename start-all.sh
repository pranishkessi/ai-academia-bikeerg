#!/bin/bash
exec &> /home/pranish/ai-academia-bikeerg/manual-launch.log
echo "📦 Manual launch started at $(date)"

# ✅ Only log to file if RUN_LOGGED=1 is set (e.g. via autostart)
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
