from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

# Allow frontend (React) to access backend (FastAPI)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (frontend)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

def generate_pm5_data():
    """Simulate PM5 data from Concept2 BikeErg"""
    return {
        "power_watts": random.randint(50, 400),
        "stroke_rate": random.randint(50, 120),
        "distance_meters": random.randint(0, 5000),
        "elapsed_time": random.randint(0, 3600),
        "heart_rate_bpm": random.randint(80, 180)
    }

@app.get("/data")
def get_data():
    """API endpoint to fetch real-time PM5 data"""
    return generate_pm5_data()
