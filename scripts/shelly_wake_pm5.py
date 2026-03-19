#!/usr/bin/env python3
import requests
import time
import asyncio
import logging
import os
from bleak import BleakScanner

SHELLY_IP = "172.19.7.51"
RELAY_ID = 1
POWER_OFF_SECONDS = 30

LOG_DIR = "/home/pranish/ai-academia-bikeerg/session_logs"
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "shellySwitch.log")

logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    filemode="a",
)

async def bluetooth_available():
    print("🔎 Checking Bluetooth availability...")
    while True:
        try:
            await BleakScanner.discover(timeout=2)
            logging.info("Bluetooth is available")
            print("✅ Bluetooth is available")
            return True
        except Exception as e:
            logging.warning(f"Bluetooth not available yet: {e}")
            print(f"⏳ Bluetooth not available yet: {e}")
            await asyncio.sleep(2)

def shelly_toggle_pm5():
    status_url = f"http://{SHELLY_IP}/rpc/Switch.GetStatus?id={RELAY_ID}"
    set_url = f"http://{SHELLY_IP}/rpc/Switch.Set"

    try:
        print("🔎 Querying Shelly status...")
        response = requests.get(status_url, timeout=5)
        response.raise_for_status()
        data = response.json()
        current_state = data.get("output", None)

        print(f"ℹ️ Current Shelly relay state: {'ON' if current_state else 'OFF'}")
        logging.info(f"Current Shelly relay state: {current_state}")

        print("⚡ Turning PM5 power OFF via Shelly...")
        r1 = requests.post(set_url, json={"id": RELAY_ID, "on": False}, timeout=5)
        r1.raise_for_status()
        logging.info("Shelly relay turned OFF")

        print(f"⏳ Waiting {POWER_OFF_SECONDS} seconds for PM5 full power-down...")
        time.sleep(POWER_OFF_SECONDS)

        print("⚡ Turning PM5 power ON via Shelly...")
        r2 = requests.post(set_url, json={"id": RELAY_ID, "on": True}, timeout=5)
        r2.raise_for_status()
        logging.info("Shelly relay turned ON")

        print("✅ Shelly PM5 wake sequence completed.")
        return True

    except requests.RequestException as e:
        logging.error(f"Shelly request failed: {e}")
        print(f"❌ Shelly request failed: {e}")
        return False

async def main():
    ok = await bluetooth_available()
    if ok:
        shelly_toggle_pm5()

if __name__ == "__main__":
    asyncio.run(main())