import { prisma } from '../db/prisma'

export async function handleAlive(payload: any) {
  const {
    deviceid,
    ipaddress,
    macaddress,
    firmware_version
  } = payload

  const deviceType = deviceid.startsWith('IOTIQ4SC_')
    ? 'SWITCH_4CH'
    : 'SINGLE'

  await prisma.device.upsert({
    where: { deviceId: deviceid },
    update: {
      ipAddress: ipaddress,
      macAddress: macaddress,
      firmwareVersion: firmware_version,
      deviceType
    },
    create: {
      deviceId: deviceid,
      deviceType,
      ipAddress: ipaddress,
      macAddress: macaddress,
      firmwareVersion: firmware_version
    }
  })

  console.log('✅ Device alive saved:', deviceid)
}
