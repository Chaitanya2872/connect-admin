import { prisma } from '../db/prisma'
import { saveSwitchStatus } from './switch.service'

export async function handleUpdate(payload: any) {
  const {
    deviceid,
    climate,
    energy,
    switch_no,
    status
  } = payload

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

  /* ---------------- Switch Update (S1–S100 ONLY) ---------------- */
  if (typeof switch_no === 'string' && status) {

    // Accept ONLY S1 to S100
    const match = switch_no.match(/^S(\d{1,3})$/)

    if (!match) {
      console.log(`⚠️ Ignored unsupported switch: ${switch_no}`)
      return
    }

    const switchNo = Number(match[1])

    if (switchNo < 1 || switchNo > 100) {
      console.log(`⚠️ Switch out of range: S${switchNo}`)
      return
    }

    await saveSwitchStatus(deviceid, switchNo, status)
  }

  console.log('🔄 Update saved:', deviceid)
}

