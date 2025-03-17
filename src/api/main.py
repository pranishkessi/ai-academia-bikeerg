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

# Home route to prevent 404 error
@app.get("/")
def home():
    return {"message": "Welcome to the Concept2 BikeErg API"}

def generate_pm5_data():
    """Simulate PM5 data from Concept2 BikeErg"""
    power_watts = random.randint(50, 400)  # Random Power Output
    elapsed_time = random.randint(0, 3600)  # Random Elapsed Time in seconds

    # Convert Power (Watts) to Energy (kWh)
    energy_kwh = (power_watts * elapsed_time) / (1000 * 3600)

    return {
        "power_watts": power_watts,
        "stroke_rate": random.randint(50, 120),
        "distance_meters": random.randint(0, 5000),
        "elapsed_time": elapsed_time,
        "energy_kwh": round(energy_kwh, 4)  # Rounded to 4 decimal places
    }

@app.get("/data")
def get_data():
    """API endpoint to fetch real-time PM5 data"""
    return generate_pm5_data()
