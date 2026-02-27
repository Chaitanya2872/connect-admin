
import { prisma } from '../db/prisma'

/**
 * Handle smart meter update messages
 * Topic: $aws/things/(thingId)/update
 * 
 * Payload example:
 * {
 *   "deviceid": "IOTIQSM_A1125004",
 *   "meter": "1",
 *   "voltage1": 410.29,
 *   "voltage2": 236.888,
 *   "current": 17.335,
 *   "power_factor": 0.96,
 *   "power": 3.14,
 *   "frequency": 49.97,
 *   "machine": true
 * }
 */
export async function handleSmartMeterUpdate(payload: any) {
  const {
    deviceid,
    meter,
    voltage1,
    voltage2,
    current,
    power_factor,
    power,
    frequency,
    machine
  } = payload

  try {
    // First, ensure device exists (auto-create if needed)
    let device = await prisma.device.findUnique({
      where: { deviceId: deviceid }
    })

    if (!device) {
      console.warn(`⚠️ Smart Meter not found: ${deviceid}. Auto-creating...`)
      
      device = await prisma.device.create({
        data: {
          deviceId: deviceid,
          deviceType: 'SMART_METER'
        }
      })
      console.log(`✅ Smart Meter auto-created: ${deviceid}`)
    }

    const asNumber = (value: unknown): number | null => {
      if (value === null || value === undefined || value === '') {
        return null
      }
      const n = Number(value)
      return Number.isFinite(n) ? n : null
    }

    const asBoolean = (value: unknown): boolean | null => {
      if (value === true || value === false) {
        return value
      }
      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase()
        if (normalized === 'true') {
          return true
        }
        if (normalized === 'false') {
          return false
        }
      }
      return null
    }

    const powerFactorValue = asNumber(
      power_factor ?? payload.powerFactor
    )

    // Save smart meter data
    await prisma.smartMeterData.create({
      data: {
        deviceId: deviceid,
        meter: meter === null || meter === undefined || meter === '' ? null : String(meter),
        voltage1: asNumber(voltage1),
        voltage2: asNumber(voltage2),
        current: asNumber(current),
        powerFactor: powerFactorValue,
        power: asNumber(power),
        frequency: asNumber(frequency),
        machine: asBoolean(machine ?? payload.machine)
      }
    })

    console.log(`📊 Smart Meter update saved: ${deviceid}`)
    
  } catch (error) {
    console.error('❌ Error handling smart meter update:', error)
  }
}

/**
 * Handle smart meter health messages
 * Topic: $aws/things/(thingId)/health_reply
 * 
 * Payload example:
 * {
 *   "deviceid": "IOTIQSM1_A1025001",
 *   "heap": "value",
 *   "rssi": "-40",
 *   "internet_speed": "1mb/s",
 *   "fault": "working_status" or "no fault"
 * }
 */
export async function handleSmartMeterHealth(payload: any) {
  const {
    deviceid,
    heap,
    rssi,
    internet_speed,
    fault
  } = payload

  try {
    await prisma.deviceHealth.create({
      data: {
        deviceId: deviceid,
        heap: heap ? parseInt(heap) : null,
        rssi: rssi ? parseInt(rssi) : null,
        carrier: internet_speed || null,
        fault: fault || null
      }
    })

    console.log(`🏥 Smart Meter health saved: ${deviceid}`)
    
  } catch (error) {
    console.error('❌ Error handling smart meter health:', error)
  }
}

/**
 * Handle smart meter alive messages
 * Topic: $aws/things/(thingId)/alive_reply
 * 
 * Payload example:
 * {
 *   "deviceid": "IOTIQSM1_A1025001",
 *   "ssid": "IOTIQ_R&D",
 *   "password": "1234567890",
 *   "ipaddress": "192.168.10.10",
 *   "macaddress": "30:C9:22:3A:09:24",
 *   "firmware_version": "2.1.0"
 * }
 */
export async function handleSmartMeterAlive(topic: string, payload: any) {
  const thingId = topic.split('/')[2]

  try {
    await prisma.device.upsert({
      where: { deviceId: payload.deviceid },
      update: {
        thingId,
        ipAddress: payload.ipaddress,
        macAddress: payload.macaddress,
        firmwareVersion: payload.firmware_version,
        deviceType: 'SMART_METER'
      },
      create: {
        deviceId: payload.deviceid,
        thingId,
        deviceType: 'SMART_METER',
        ipAddress: payload.ipaddress,
        macAddress: payload.macaddress,
        firmwareVersion: payload.firmware_version
      }
    })

    console.log(`🟢 Smart Meter alive: ${payload.deviceid}`)
    
  } catch (error) {
    console.error('❌ Error handling smart meter alive:', error)
  }
}

/**
 * Check if a device is a smart meter based on deviceId prefix
 */
export function isSmartMeter(deviceId: string): boolean {
  return deviceId.startsWith('IOTIQSM_') || deviceId.startsWith('IOTIQSM1_')
}
