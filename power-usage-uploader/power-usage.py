import os
import asyncio
from datetime import datetime, timedelta
from kasa import SmartStrip, Discover
import requests

POWER_USAGE_URL = os.environ.get('POWER_USAGE_URL')
DESKTOP_PLUG_ALIAS = 'Desktop'

async def main():
  found_devices = await Discover.discover()
  for device in found_devices.values():
    if isinstance(device, SmartStrip):
      await device.update()
      for plug in device.children:
        if plug.alias == DESKTOP_PLUG_ALIAS:
          yesterday: datetime = plug.time - timedelta(days=1)
          monthly_power = await plug.get_emeter_daily(year=yesterday.year, month=yesterday.month)
          yesterdays_power = monthly_power[yesterday.day]
          json = {
            'date': yesterday.strftime('%Y-%m-%d'),
            'rig': DESKTOP_PLUG_ALIAS,
            'power_usage_kw': float(yesterdays_power)
          }
          result = requests.post(POWER_USAGE_URL, json = json)
          print(result.text)

asyncio.run(main())
