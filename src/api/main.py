# src/api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from src.api.ble_runner import ble_logger, ble_state

app = FastAPI()
last_session_snapshot = {}

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
    global reset_task
    ble_state.update({
        "session_active": True,
        "elapsed": 0,
        "distance": 0,
        "energy_kwh": 0.0,
    })
    return {"message": "Session started."}

@app.post("/stop")
async def stop_session():
    last_session_snapshot.update({
        "elapsed_time": ble_state["elapsed"],
        "distance_meters": ble_state["distance"],
        "energy_kwh": ble_state["energy_kwh"]
    })
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
