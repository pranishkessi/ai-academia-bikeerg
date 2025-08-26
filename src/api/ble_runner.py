# ble_runner.py — production: sample-and-hold + linear decay + monotonic time (no test logger)
import os
os.system("bluetoothctl power off; sleep 1; bluetoothctl power on")

import asyncio
import traceback
import time
from datetime import datetime
from bleak import BleakScanner, BleakClient

# ===== BLE Characteristic UUIDs =====
UUID_0036 = "ce060036-43e5-11e4-916c-0800200c9a66"  # Notify characteristic
UUID_WRITE = "ce060034-43e5-11e4-916c-0800200c9a66"  # Write characteristic

# ===== Public state consumed by the API/frontend =====
ble_state = {
    "power": 0,             # instantaneous watts (hold + decay)
    "cadence": 0.0,         # strokes per minute
    "elapsed": 0.0,         # seconds since session start (float)
    "distance": 0.0,        # meters
    "energy_kwh": 0.0,      # kWh integral (uses displayed power)
    "session_active": False,
    "connected": False,
}

# ===== Internal tracking =====
_last_stroke_t = None             # monotonic seconds
_stroke_intervals = []
_last_notify_t = None             # monotonic seconds
_last_notified_power = 0
_start_t = None

# ===== Tuning constants (overridable by ENV) =====
DISTANCE_PER_STROKE = float(os.getenv("DISTANCE_PER_STROKE", "6.0"))
SCAN_INTERVAL       = float(os.getenv("SCAN_INTERVAL", "5.0"))
RETRY_TIMEOUT       = float(os.getenv("RETRY_TIMEOUT", "300"))
INITIAL_BOOT_DELAY  = float(os.getenv("INITIAL_BOOT_DELAY", "20"))

TICK_SECONDS        = float(os.getenv("TICK_SECONDS", "0.2"))
POWER_HOLD_SEC      = float(os.getenv("POWER_HOLD_SEC", "0.75"))   # no decay within this window
POWER_DECAY_WINDOW  = float(os.getenv("POWER_DECAY_WINDOW", "2.0"))# linear fall to zero after hold
CADENCE_IDLE_SEC    = float(os.getenv("CADENCE_IDLE_SEC", "2.0"))

MAX_STROKE_HISTORY  = 5
MIN_STROKE_INTERVAL = 0.3
MAX_STROKE_INTERVAL = 5.0

def _now_mono():
    return time.monotonic()

def to_uint16_le(b: bytes) -> int:
    return b[0] + (b[1] << 8)

def notification_handler(_, data: bytes):
    """Handle incoming PM5 notifications (UUID 0x0036)."""
    global _last_stroke_t, _stroke_intervals, _last_notify_t, _last_notified_power, _start_t
    now = _now_mono()
    if not _start_t:
        return

    # --- Parse power (uint16 LE at bytes [3:5]) ---
    power = to_uint16_le(data[3:5])
    _last_notified_power = int(power)
    _last_notify_t = now

    # --- Stroke & cadence (edge approximation) ---
    if power > 0:
        if _last_stroke_t:
            interval = now - _last_stroke_t
            if MIN_STROKE_INTERVAL < interval < MAX_STROKE_INTERVAL:
                _stroke_intervals.append(interval)
                if len(_stroke_intervals) > MAX_STROKE_HISTORY:
                    _stroke_intervals.pop(0)
        _last_stroke_t = now

    if _stroke_intervals:
        avg = sum(_stroke_intervals) / len(_stroke_intervals)
        if avg > 0:
            ble_state["cadence"] = round(60.0 / avg, 1)

def build_sleep_command(doze_sec=0, sleep_sec=65535):
    """CSAFE frame to extend PM5 doze/sleep timeouts."""
    doze_hi, doze_lo = (doze_sec >> 8) & 0xFF, doze_sec & 0xFF
    sleep_hi, sleep_lo = (sleep_sec >> 8) & 0xFF, sleep_sec & 0xFF
    body = [0x21, doze_hi, doze_lo, sleep_hi, sleep_lo, 0, 0, 0, 0]
    length = len(body)
    return bytearray([0xF0, length] + body + [0xF2])

async def ble_logger():
    """
    Connect to PM5 and publish a PM5-like power signal:
      • Sample-and-hold for POWER_HOLD_SEC after last packet
      • Linear decay to 0 over POWER_DECAY_WINDOW
    Cadence zeroes after CADENCE_IDLE_SEC without strokes.
    Energy integrates displayed power; distance integrates cadence.
    """
    global _start_t, _stroke_intervals, _last_notify_t, _last_notified_power, _last_stroke_t

    retry_start = _now_mono()
    print(f"⏳ Initial boot delay {int(INITIAL_BOOT_DELAY)}s before starting BLE scan...")
    await asyncio.sleep(INITIAL_BOOT_DELAY)

    while True:
        try:
            print("🔍 Scanning for PM5...")
            devices = await BleakScanner.discover(timeout=SCAN_INTERVAL)
            pm5 = next((d for d in devices if d.name and ("PM5" in d.name or "Concept2" in d.name)), None)

            if not pm5:
                if _now_mono() - retry_start > RETRY_TIMEOUT:
                    print("❌ Timed out waiting for PM5 to advertise. Resetting retry timer.")
                    retry_start = _now_mono()
                print("⏳ PM5 not found. Retrying in 5s...")
                await asyncio.sleep(5)
                continue

            print(f"✅ Found PM5: {pm5.name} [{pm5.address}]")
            async with BleakClient(pm5.address) as client:
                await client.start_notify(UUID_0036, notification_handler)
                print("🔗 Connected to PM5 BLE")
                ble_state["connected"] = True

                # Extend PM5 sleep timeout
                try:
                    await client.write_gatt_char(UUID_WRITE, build_sleep_command())
                    print("🛌 PM5 sleep timeout extended.")
                except Exception as e:
                    print(f"⚠️ Sleep extension failed (non-fatal): {e}")

                # Reset session metrics & timers
                _start_t = _now_mono()
                _stroke_intervals.clear()
                _last_stroke_t = None
                _last_notify_t = None
                _last_notified_power = 0

                ble_state.update({
                    "elapsed": 0.0,
                    "distance": 0.0,
                    "energy_kwh": 0.0,
                    "power": 0,
                    "cadence": 0.0,
                })

                prev = _now_mono()

                # ===== Connected loop =====
                while True:
                    await asyncio.sleep(TICK_SECONDS)

                    now = _now_mono()
                    dt = now - prev
                    if dt <= 0:
                        prev = now
                        continue

                    # ----- Cadence idle handling -----
                    if _last_stroke_t is None or (now - _last_stroke_t) > CADENCE_IDLE_SEC:
                        ble_state["cadence"] = 0.0
                        _stroke_intervals.clear()

                    # ----- Power: HOLD then linear decay -----
                    if _last_notify_t is None:
                        ble_state["power"] = 0
                    else:
                        age = now - _last_notify_t
                        if age <= POWER_HOLD_SEC:
                            ble_state["power"] = _last_notified_power
                        elif age < POWER_HOLD_SEC + POWER_DECAY_WINDOW:
                            t = age - POWER_HOLD_SEC
                            factor = max(0.0, 1.0 - (t / POWER_DECAY_WINDOW))
                            ble_state["power"] = int(round(_last_notified_power * factor))
                        else:
                            ble_state["power"] = 0

                    # ----- Integrations only while session is active -----
                    if ble_state["session_active"]:
                        ble_state["elapsed"] += dt

                        if ble_state["cadence"] > 0:
                            strokes_per_sec = ble_state["cadence"] / 60.0
                            ble_state["distance"] += strokes_per_sec * DISTANCE_PER_STROKE * dt

                        ble_state["energy_kwh"] += (ble_state["power"] * dt) / 3_600_000.0

                    prev = now

        except Exception as e:
            print(f"⚠️ BLE logger error: {e}\n{traceback.format_exc()}")
            ble_state["connected"] = False
            print("🔄 Restarting BLE loop in 5s...")
            await asyncio.sleep(5)
