import { prisma } from '../db/prisma'
import { saveSwitchStatus } from './switch.service'
import { handleSmartMeterUpdate, isSmartMeter } from './smartmeter.service'

export async function handleUpdate(payload: any) {
  const {
    deviceid,
    climate,
    energy,
    switch_no,
    status,
    channels,
    temp,
    fault
  } = payload

  try {
    // Check if this is a smart meter device
    if (isSmartMeter(deviceid)) {
      await handleSmartMeterUpdate(payload)
      return
    }

    // First, ensure device exists (auto-create if needed)
    let device = await prisma.device.findUnique({
      where: { deviceId: deviceid }
    })

    if (!device) {
      console.warn(`⚠️ Device not found: ${deviceid}. Auto-creating...`)
      
      // Auto-detect device type
      let deviceType = 'SINGLE'
      if (deviceid.startsWith('IOTIQ4SC_')) {
        deviceType = 'SWITCH_4CH'
      } else if (deviceid.startsWith('IOTIQDC2_')) {
        deviceType = 'DONGLE_2CH'
      }

      // Create device
      device = await prisma.device.create({
        data: {
          deviceId: deviceid,
          deviceType
        }
      })
      console.log(`✅ Device auto-created: ${deviceid}`)
    }

    /* ---------------- Channel Configuration (Dongle) ---------------- */
    if (channels) {
      await prisma.device.update({
        where: { deviceId: deviceid },
        data: { channels }
      })
      console.log(`🔧 Channels configured: ${deviceid} → ${channels}`)
    }

    /* ---------------- Climate Data ---------------- */
    if (climate) {
      const [temperature, humidity, sunlight] = climate.split('/')

      await prisma.deviceClimate.create({
        data: {
          deviceId: deviceid,
          temperature: Number(temperature),
          humidity: Number(humidity),
          sunlight: Number(sunlight)
        }
      })
    }

    /* ---------------- Energy Data ---------------- */
    if (energy) {
      const [voltage, current, power, unit] = energy.split('/')

      await prisma.deviceEnergy.create({
        data: {
          deviceId: deviceid,
          voltage: Number(voltage),
          current: Number(current),
          power: Number(power),
          unit: Number(unit)
        }
      })
    }

    /* ---------------- Switch Update ---------------- */
    if (switch_no && status) {
      const switchNo = Number(
        String(switch_no).replace(/[^\d]/g, '')
      )

      await saveSwitchStatus(deviceid, switchNo, status)
    }

    console.log('🔄 Update saved:', deviceid)
  } catch (error) {
    console.error('❌ Error handling update:', error)
  }
}