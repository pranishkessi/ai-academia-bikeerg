from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time
import random

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global session state
state = {
    "power": 0,
    "stroke_rate": 0,
    "distance": 0,
    "elapsed": 0,
    "last_time": time.time(),
    "energy_kwh": 0.0,
    "session_active": False
}


def reset_session():
    state.update({
        "power": random.randint(100, 150),
        "stroke_rate": random.randint(60, 80),
        "distance": 0,
        "elapsed": 0,
        "last_time": time.time(),
        "energy_kwh": 0.0,
        "session_active": True
    })


def simulate_session():
    now = time.time()
    elapsed_since_last = now - state["last_time"]
    state["last_time"] = now

    # Simulate only if active
    if state["session_active"]:
        state["elapsed"] += int(elapsed_since_last)

        state["power"] += random.randint(-5, 5)
        state["power"] = max(80, min(state["power"], 300))

        state["stroke_rate"] += random.randint(-1, 1)
        state["stroke_rate"] = max(50, min(state["stroke_rate"], 100))

        state["distance"] += int(state["stroke_rate"] * (elapsed_since_last / 60) * 6)
        state["energy_kwh"] += (state["power"] * elapsed_since_last) / 3600000

    return {
        "power_watts": int(state["power"]),
        "stroke_rate": int(state["stroke_rate"]),
        "distance_meters": int(state["distance"]),
        "elapsed_time": int(state["elapsed"]),
        "energy_kwh": round(state["energy_kwh"], 4),
        "session_active": state["session_active"]
    }


@app.get("/")
def read_root():
    return {"message": "Welcome to the Concept2 BikeErg API"}


@app.get("/data")
def get_data():
    return simulate_session()


@app.post("/start")
def start_session():
    reset_session()
    return {"message": "Session started."}


@app.post("/stop")
def stop_session():
    state["session_active"] = False
    return {"message": "Session stopped."}
