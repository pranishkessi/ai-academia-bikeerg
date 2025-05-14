import asyncio
from datetime import datetime
from bleak import BleakScanner, BleakClient

UUID_0036 = "ce060036-43e5-11e4-916c-0800200c9a66"

ble_state = {
    "power": 0,
    "cadence": 0.0,
    "elapsed": 0,
    "distance": 0,
    "energy_kwh": 0.0,
    "session_active": False,
    "connected": False,
}

_last_stroke_time = None
_start_time = None
_stroke_intervals = []

def to_uint16_le(b):
    return b[0] + (b[1] << 8)

def notification_handler(_, data):
    global _last_stroke_time, _stroke_intervals, _start_time
    now = datetime.now()
    current_ts = now.timestamp()
    if not _start_time:
        return

    power = to_uint16_le(data[3:5])
    ble_state["power"] = power

    if power > 0:
        if _last_stroke_time:
            interval = current_ts - _last_stroke_time
            if 0.3 < interval < 5.0:
                _stroke_intervals.append(interval)
                if len(_stroke_intervals) > 5:
                    _stroke_intervals.pop(0)
        _last_stroke_time = current_ts

    if _stroke_intervals:
        avg_interval = sum(_stroke_intervals) / len(_stroke_intervals)
        ble_state["cadence"] = round(60 / avg_interval, 1)
    else:
        ble_state["cadence"] = 0.0

async def ble_logger():
    global _start_time
    while True:
        if not ble_state["session_active"]:
            await asyncio.sleep(1)
            continue

        try:
            devices = await BleakScanner.discover(timeout=5.0)
            pm5 = next((d for d in devices if "PM5" in d.name or "Concept2" in d.name), None)
            if not pm5:
                print("❌ PM5 not found.")
                ble_state["connected"] = False
                await asyncio.sleep(3)
                continue

            print(f"✅ Found PM5: {pm5.name} [{pm5.address}]")
            async with BleakClient(pm5.address) as client:
                await client.start_notify(UUID_0036, notification_handler)
                print("🔗 Connected to PM5 BLE")
                ble_state["connected"] = True

                # Reset metrics when session starts
                _start_time = datetime.now().timestamp()
                ble_state.update({
                    "elapsed": 0,
                    "distance": 0,
                    "energy_kwh": 0.0,
                })

                while ble_state["session_active"]:
                    await asyncio.sleep(1)
                    ble_state["elapsed"] += 1
                    ble_state["distance"] += int((ble_state["cadence"] / 60) * 6)
                    ble_state["energy_kwh"] += round((ble_state["power"] * 1) / 3600000, 6)

                await client.stop_notify(UUID_0036)
                ble_state["connected"] = False
                print("🔌 Session ended, BLE disconnected.")

        except Exception as e:
            print(f"⚠️ BLE logger error: {e}")
            ble_state["connected"] = False
            await asyncio.sleep(2)
