#!/bin/bash

# Activate your Python virtual environment
source venv/bin/activate

# Start backend
uvicorn src.api.main:app --host 0.0.0.0 --port 8080 --reload &

# Move into frontend and start frontend
cd frontend
npm run dev

