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

  /* ---------------- Switch Update (4CH Device) ---------------- */
  if (switch_no && status) {
    const switchNo = Number(
      String(switch_no).replace('S', '')
    )

    await saveSwitchStatus(deviceid, switchNo, status)
  }

  console.log('🔄 Update saved:', deviceid)
}
