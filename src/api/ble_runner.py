import os
os.system("bluetoothctl power off; sleep 1; bluetoothctl power on")
import asyncio
from datetime import datetime
from bleak import BleakScanner, BleakClient
import traceback

# BLE Characteristic UUIDs
UUID_0036 = "ce060036-43e5-11e4-916c-0800200c9a66"  # Notify characteristic
UUID_WRITE = "ce060034-43e5-11e4-916c-0800200c9a66"  # Write characteristic

# Global BLE state for frontend or other modules
ble_state = {
    "power": 0,
    "cadence": 0.0,
    "elapsed": 0,
    "distance": 0,
    "energy_kwh": 0.0,
    "session_active": False,
    "connected": False,
}

# Internal stroke tracking
_last_stroke_time = None
_start_time = None
_stroke_intervals = []

# Constants for museum-grade operation
DISTANCE_PER_STROKE = 6      # meters
SCAN_INTERVAL = 5.0          # seconds per BLE scan
RETRY_TIMEOUT = 300          # 5 minutes max wait before printing timeout
INITIAL_BOOT_DELAY = 20      # Give time for PM5 + Bluetooth service to start

def to_uint16_le(b):
    """Convert a 2-byte little-endian array to int."""
    return b[0] + (b[1] << 8)

def notification_handler(_, data):
    """Handle incoming BLE notifications from PM5."""
    global _last_stroke_time, _stroke_intervals, _start_time
    now = datetime.now()
    current_ts = now.timestamp()
    if not _start_time:
        return

    power = to_uint16_le(data[3:5])
    ble_state["power"] = power

    # Track strokes and cadence
    if power > 0:
        if _last_stroke_time:
            interval = current_ts - _last_stroke_time
            if 0.3 < interval < 5.0:  # Filter unrealistic intervals
                _stroke_intervals.append(interval)
                if len(_stroke_intervals) > 5:
                    _stroke_intervals.pop(0)
        _last_stroke_time = current_ts

    if _stroke_intervals:
        avg_interval = sum(_stroke_intervals) / len(_stroke_intervals)
        ble_state["cadence"] = round(60 / avg_interval, 1)
    else:
       
        ble_state["cadence"] = 0.0

def build_sleep_command(doze_sec=0, sleep_sec=65535):
    """Build a CSAFE frame to extend PM5 sleep timeout."""
    doze_hi, doze_lo = (doze_sec >> 8) & 0xFF, doze_sec & 0xFF
    sleep_hi, sleep_lo = (sleep_sec >> 8) & 0xFF, sleep_sec & 0xFF
    body = [0x21, doze_hi, doze_lo, sleep_hi, sleep_lo, 0, 0, 0, 0]
    length = len(body)
    frame = [0xF0, length] + body + [0xF2]
    return bytearray(frame)

async def ble_logger():
    """Main BLE handling loop for PM5 connection and data tracking."""
    global _start_time, _stroke_intervals
    retry_start = datetime.now().timestamp()

    print(f"⏳ Initial boot delay {INITIAL_BOOT_DELAY}s before starting BLE scan...")
    await asyncio.sleep(INITIAL_BOOT_DELAY)

    while True:
        try:
            print("🔍 Scanning for PM5...")
            devices = await BleakScanner.discover(timeout=SCAN_INTERVAL)

            # Log discovered devices for museum debug
            device_names = [d.name or "Unknown" for d in devices]
            print(f"📡 Discovered devices: {device_names}")

            pm5 = next(
                (d for d in devices if d.name and ("PM5" in d.name or "Concept2" in d.name)),
                None
            )

            if not pm5:
                elapsed = datetime.now().timestamp() - retry_start
                if elapsed > RETRY_TIMEOUT:
                    print("❌ Timed out waiting for PM5 to advertise. Resetting retry timer.")
                    retry_start = datetime.now().timestamp()

                print("⏳ PM5 not found. Retrying in 5s...")
                await asyncio.sleep(5)
                continue

            print(f"✅ Found PM5: {pm5.name} [{pm5.address}]")

            async with BleakClient(pm5.address) as client:
                await client.start_notify(UUID_0036, notification_handler)
                print("🔗 Connected to PM5 BLE")
                ble_state["connected"] = True

                # Extend PM5 sleep timeout
                sleep_cmd = build_sleep_command()
                await client.write_gatt_char(UUID_WRITE, sleep_cmd)
                print("🛌 PM5 sleep timeout extended to 18.2 hours.")

                # Reset session metrics
                _start_time = datetime.now().timestamp()
                _stroke_intervals.clear()
                ble_state.update({
                    "elapsed": 0,
                    "distance": 0,
                    "energy_kwh": 0.0,
                })

                # Main loop while BLE is connected
                while True:
                    await asyncio.sleep(1)

                    # Update metrics only if session is active
                    if ble_state["session_active"]:
                        ble_state["elapsed"] += 1
                        ble_state["distance"] += int((ble_state["cadence"] / 60) * DISTANCE_PER_STROKE)
                        ble_state["energy_kwh"] += round((ble_state["power"]) / 3600000, 6)

        except Exception as e:
            print(f"⚠️ BLE logger error: {e}\n{traceback.format_exc()}")
            ble_state["connected"] = False
            print("🔄 Restarting BLE loop in 5s...")
            await asyncio.sleep(5)
