# src/api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import os
from datetime import datetime
from src.api.ble_runner import ble_logger, ble_state

app = FastAPI()
last_session_snapshot = {}

# Directory for session logs
LOG_DIR = "session_logs"
os.makedirs(LOG_DIR, exist_ok=True)

# Thresholds for unlocked AI tasks
THRESHOLDS = [0.002, 0.004, 0.006, 0.008]
TASK_LABELS = [
    "Google Search",
    "Image/Sound Recognition",
    "Speech-to-Text",
    "LLM Inference"
]

# Log writer
def log_session_to_file(snapshot):
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = os.path.join(LOG_DIR, f"session_{timestamp}.json")
    with open(filename, "w") as f:
        json.dump(snapshot, f, indent=2)
    print(f"📄 Session saved to {filename}")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(ble_logger())

@app.get("/")
def read_root():
    return {"message": "Welcome to the Concept2 BikeErg Real-Time API"}

@app.get("/data")
def get_data():
    return {
        "power_watts": ble_state.get("power", 0) if ble_state.get("session_active") else 0,
        "stroke_rate": int(ble_state.get("cadence", 0)) if ble_state.get("session_active") else 0,
        "distance_meters": int(ble_state.get("distance", 0)) if ble_state.get("session_active") else 0,
        "elapsed_time": int(ble_state.get("elapsed", 0)) if ble_state.get("session_active") else 0,
        "energy_kwh": round(ble_state.get("energy_kwh", 0.0), 4) if ble_state.get("session_active") else 0.0,
        "session_active": ble_state.get("session_active", False),
        "connected": ble_state.get("connected", False),
        "last_session_snapshot": last_session_snapshot,
    }

@app.post("/start")
async def start_session():
    ble_state.update({
        "session_active": True,
        "elapsed": 0,
        "distance": 0,
        "energy_kwh": 0.0,
    })
    return {"message": "Session started."}

@app.post("/stop")
async def stop_session():
    energy = ble_state.get("energy_kwh", 0.0)
    unlocked_tasks = [label for t, label in zip(THRESHOLDS, TASK_LABELS) if energy >= t]

    last_session_snapshot.update({
        "elapsed_time": ble_state.get("elapsed", 0),
        "distance_meters": ble_state.get("distance", 0),
        "energy_kwh": round(energy, 4),
        "tasks_unlocked": unlocked_tasks
    })

    log_session_to_file(last_session_snapshot)

    ble_state["session_active"] = False
    asyncio.create_task(reset_after_delay())
    return {"message": "Session stopped."}

async def reset_after_delay():
    await asyncio.sleep(30)
    ble_state.update({
        "power": 0,
        "cadence": 0.0,
        "elapsed": 0,
        "distance": 0,
        "energy_kwh": 0.0,
    })
    last_session_snapshot.clear()
