import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { publishToDevice } from '../mqtt/publishers'
import { prisma } from '../db/prisma'

const router = Router()

const getQueryString = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    const first = value[0]
    return typeof first === 'string' ? first : first !== undefined ? String(first) : undefined
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return undefined
}

const parseDateParam = (value?: string): Date | null => {
  if (!value) {
    return null
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  const parsed = (input: string | number) => {
    const date = new Date(input)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const direct = parsed(trimmed)
  if (direct) {
    return direct
  }

  if (/^\d+$/.test(trimmed)) {
    const milliseconds = Number(trimmed)
    const date = parsed(milliseconds)
    if (date) {
      return date
    }
  }

  if (trimmed.includes(' ') && !trimmed.includes('+')) {
    const plusFixed = parsed(trimmed.replace(' ', '+'))
    if (plusFixed) {
      return plusFixed
    }
  }

  return null
}

const parseBucket = (value?: string): string | null => {
  if (!value) {
    return 'hour'
  }
  const bucket = value.toLowerCase()
  const allowed = ['minute', 'hour', 'day', 'week', 'month']
  return allowed.includes(bucket) ? bucket : null
}

const parsePositiveInt = (value?: string, defaultValue?: number, maxValue?: number): number | null => {
  if (!value) {
    return defaultValue ?? null
  }
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }
  if (maxValue && parsed > maxValue) {
    return maxValue
  }
  return parsed
}

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null
  }
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/**
 * POST /api/smartmeter/:thingId/config
 * Configure smart meter WiFi and communication settings
 */
router.post('/:thingId/config', async (req, res) => {
  try {
    const { thingId } = req.params
    const { deviceid, ssid, password, access_token, secret, mode } = req.body

    if (!deviceid || !ssid || !password) {
      return res.status(400).json({ 
        error: 'deviceid, ssid and password are required' 
      })
    }

    const payload: any = {
      deviceid,
      ssid,
      password,
      access_token: access_token || '',
      secret: secret || '',
      mode: mode || '1' // 1=WiFi, 2=BLE, 3=custom
    }

    await publishToDevice(thingId, 'config', payload)

    console.log(`📡 Smart Meter config sent: ${deviceid}`)

    res.json({ success: true })
  } catch (error) {
    console.error('❌ Smart meter config error:', error)
    res.status(500).json({ error: 'Configuration failed' })
  }
})

/**
 * POST /api/smartmeter/:thingId/setting
 * Configure smart meter parameters and schedules
 */
router.post('/:thingId/setting', async (req, res) => {
  try {
    const { thingId } = req.params
    const { 
      deviceid, 
      status, 
      parameter, 
      range, 
      thres, 
      trig_time, 
      stop_time, 
      repeat 
    } = req.body

    if (!deviceid) {
      return res.status(400).json({ 
        error: 'deviceid is required' 
      })
    }

    const payload: any = {
      deviceid,
      status: status || '',
      parameter: parameter || '',
      range: range || '',
      thres: thres || '',
      trig_time: trig_time || '',
      stop_time: stop_time || '',
      repeat: repeat || ''
    }

    await publishToDevice(thingId, 'setting', payload)

    // Save settings to database
    if (parameter || range || thres || trig_time || stop_time || repeat) {
      await prisma.smartMeterSettings.upsert({
        where: { deviceId: deviceid },
        update: {
          parameter: parameter || undefined,
          range: range || undefined,
          threshold: thres || undefined,
          triggerTime: trig_time || undefined,
          stopTime: stop_time || undefined,
          repeatPattern: repeat || undefined
        },
        create: {
          deviceId: deviceid,
          parameter: parameter || null,
          range: range || null,
          threshold: thres || null,
          triggerTime: trig_time || null,
          stopTime: stop_time || null,
          repeatPattern: repeat || null
        }
      })
    }

    console.log(`⚙️ Smart Meter settings sent: ${deviceid}`)

    res.json({ success: true })
  } catch (error) {
    console.error('❌ Smart meter setting error:', error)
    res.status(500).json({ error: 'Setting configuration failed' })
  }
})

/**
 * POST /api/smartmeter/:thingId/control
 * Control smart meter relay (on/off)
 */
router.post('/:thingId/control', async (req, res) => {
  try {
    const { thingId } = req.params
    const { deviceid, status } = req.body

    if (!deviceid || !status) {
      return res.status(400).json({ 
        error: 'deviceid and status are required' 
      })
    }

    if (!['on', 'off'].includes(status.toLowerCase())) {
      return res.status(400).json({ 
        error: 'status must be "on" or "off"' 
      })
    }

    const payload = {
      deviceid,
      status: status.toLowerCase()
    }

    await publishToDevice(thingId, 'control', payload)

    console.log(`🎛️ Smart Meter control sent: ${deviceid} → ${status}`)

    res.json({ success: true })
  } catch (error) {
    console.error('❌ Smart meter control error:', error)
    res.status(500).json({ error: 'Control command failed' })
  }
})

/**
 * POST /api/smartmeter/:thingId/reset
 * Reset smart meter to default settings
 */
router.post('/:thingId/reset', async (req, res) => {
  try {
    const { thingId } = req.params
    const { deviceid, mode, secret } = req.body

    if (!deviceid) {
      return res.status(400).json({ error: 'deviceid is required' })
    }

    const payload: any = {
      deviceid,
      mode: mode || '1',
      secret: secret || ''
    }

    await publishToDevice(thingId, 'reset', payload)

    console.log(`🔄 Smart Meter reset sent: ${deviceid}`)

    res.json({ success: true })
  } catch (error) {
    console.error('❌ Smart meter reset error:', error)
    res.status(500).json({ error: 'Reset command failed' })
  }
})

/**
 * POST /api/smartmeter/:thingId/alive
 * Request alive status from smart meter
 */
router.post('/:thingId/alive', async (req, res) => {
  try {
    const { thingId } = req.params
    const { deviceid } = req.body

    if (!deviceid) {
      return res.status(400).json({ error: 'deviceid is required' })
    }

    await publishToDevice(thingId, 'alive', { deviceid })

    console.log(`💚 Smart Meter alive request sent: ${deviceid}`)

    res.json({ success: true })
  } catch (error) {
    console.error('❌ Smart meter alive error:', error)
    res.status(500).json({ error: 'Alive request failed' })
  }
})

/**
 * GET /api/smartmeter/:deviceId/analytics/summary
 * Get aggregate analytics for smart meter data
 * Query: from, to (ISO date), meter
 */
router.get('/:deviceId/analytics/summary', async (req, res) => {
  try {
    const { deviceId } = req.params
    const fromValue = getQueryString(req.query.from)
    const toValue = getQueryString(req.query.to)
    const meterValue = getQueryString(req.query.meter)

    const fromDate = parseDateParam(fromValue)
    if (fromValue && !fromDate) {
      return res.status(400).json({ error: 'Invalid from date' })
    }

    const toDate = parseDateParam(toValue)
    if (toValue && !toDate) {
      return res.status(400).json({ error: 'Invalid to date' })
    }

    const device = await prisma.device.findUnique({
      where: { deviceId },
      select: { deviceId: true, deviceType: true }
    })

    if (!device) {
      return res.status(404).json({ error: 'Device not found' })
    }

    if (device.deviceType !== 'SMART_METER') {
      return res.status(400).json({ error: 'Not a smart meter device' })
    }

    const where: any = { deviceId }
    if (meterValue) {
      where.meter = meterValue
    }
    if (fromDate || toDate) {
      where.createdAt = {}
      if (fromDate) {
        where.createdAt.gte = fromDate
      }
      if (toDate) {
        where.createdAt.lte = toDate
      }
    }

    const conditions: Prisma.Sql[] = [
      Prisma.sql`"deviceId" = ${deviceId}`
    ]
    if (meterValue) {
      conditions.push(Prisma.sql`"meter" = ${meterValue}`)
    }
    if (fromDate) {
      conditions.push(Prisma.sql`"createdAt" >= ${fromDate}`)
    }
    if (toDate) {
      conditions.push(Prisma.sql`"createdAt" <= ${toDate}`)
    }
    const whereSql = Prisma.join(conditions, ' AND ')

    const [summaryRows, latest, first, machineCounts] = await Promise.all([
      prisma.$queryRaw<{
        samples: number
        voltage1Avg: number | null
        voltage2Avg: number | null
        currentAvg: number | null
        powerFactorAvg: number | null
        powerAvg: number | null
        frequencyAvg: number | null
        voltage1Min: number | null
        voltage2Min: number | null
        currentMin: number | null
        powerFactorMin: number | null
        powerMin: number | null
        frequencyMin: number | null
        voltage1Max: number | null
        voltage2Max: number | null
        currentMax: number | null
        powerFactorMax: number | null
        powerMax: number | null
        frequencyMax: number | null
      }[]>(Prisma.sql`
        SELECT
          COUNT(*)::int AS "samples",
          AVG("voltage1") AS "voltage1Avg",
          AVG("voltage2") AS "voltage2Avg",
          AVG("current") AS "currentAvg",
          AVG("powerFactor") AS "powerFactorAvg",
          AVG("power") AS "powerAvg",
          AVG("frequency") AS "frequencyAvg",
          MIN("voltage1") AS "voltage1Min",
          MIN("voltage2") AS "voltage2Min",
          MIN("current") AS "currentMin",
          MIN("powerFactor") AS "powerFactorMin",
          MIN("power") AS "powerMin",
          MIN("frequency") AS "frequencyMin",
          MAX("voltage1") AS "voltage1Max",
          MAX("voltage2") AS "voltage2Max",
          MAX("current") AS "currentMax",
          MAX("powerFactor") AS "powerFactorMax",
          MAX("power") AS "powerMax",
          MAX("frequency") AS "frequencyMax"
        FROM "SmartMeterData"
        WHERE ${whereSql}
      `),
      prisma.smartMeterData.findFirst({
        where,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.smartMeterData.findFirst({
        where,
        orderBy: { createdAt: 'asc' }
      }),
      prisma.$queryRaw<{
        machine: boolean | null
        count: number
      }[]>(Prisma.sql`
        SELECT
          "machine",
          COUNT(*)::int AS "count"
        FROM "SmartMeterData"
        WHERE ${whereSql}
        GROUP BY "machine"
      `)
    ])

    const summary = summaryRows[0]
    const samples = summary ? Number(summary.samples) : 0
    const machineTotals = machineCounts.reduce((sum, row) => sum + Number(row.count), 0)
    const machineOn = machineCounts.find((row) => row.machine === true)?.count ?? 0
    const machineOff = machineCounts.find((row) => row.machine === false)?.count ?? 0
    const machineUnknown = machineCounts.find((row) => row.machine === null)?.count ?? 0
    const machineOnRatio = machineTotals > 0 ? machineOn / machineTotals : null

    res.json({
      deviceId,
      meter: meterValue || null,
      range: {
        from: fromDate ? fromDate.toISOString() : null,
        to: toDate ? toDate.toISOString() : null
      },
      samples,
      averages: {
        voltage1: toNumber(summary?.voltage1Avg),
        voltage2: toNumber(summary?.voltage2Avg),
        current: toNumber(summary?.currentAvg),
        powerFactor: toNumber(summary?.powerFactorAvg),
        power: toNumber(summary?.powerAvg),
        frequency: toNumber(summary?.frequencyAvg)
      },
      minimums: {
        voltage1: toNumber(summary?.voltage1Min),
        voltage2: toNumber(summary?.voltage2Min),
        current: toNumber(summary?.currentMin),
        powerFactor: toNumber(summary?.powerFactorMin),
        power: toNumber(summary?.powerMin),
        frequency: toNumber(summary?.frequencyMin)
      },
      maximums: {
        voltage1: toNumber(summary?.voltage1Max),
        voltage2: toNumber(summary?.voltage2Max),
        current: toNumber(summary?.currentMax),
        powerFactor: toNumber(summary?.powerFactorMax),
        power: toNumber(summary?.powerMax),
        frequency: toNumber(summary?.frequencyMax)
      },
      machine: {
        on: machineOn,
        off: machineOff,
        unknown: machineUnknown,
        onRatio: machineOnRatio
      },
      first,
      latest
    })
  } catch (error) {
    console.error('❌ Error fetching smart meter summary analytics:', error)
    res.status(500).json({ error: 'Failed to fetch summary analytics' })
  }
})

/**
 * GET /api/smartmeter/:deviceId/analytics/series
 * Get time-series analytics
 * Query: from, to (ISO date), bucket=minute|hour|day|week|month, meter
 */
router.get('/:deviceId/analytics/series', async (req, res) => {
  try {
    const { deviceId } = req.params
    const fromValue = getQueryString(req.query.from)
    const toValue = getQueryString(req.query.to)
    const meterValue = getQueryString(req.query.meter)
    const bucketValue = getQueryString(req.query.bucket)

    const fromDate = parseDateParam(fromValue)
    if (fromValue && !fromDate) {
      return res.status(400).json({ error: 'Invalid from date' })
    }

    const toDate = parseDateParam(toValue)
    if (toValue && !toDate) {
      return res.status(400).json({ error: 'Invalid to date' })
    }

    const bucket = parseBucket(bucketValue)
    if (!bucket) {
      return res.status(400).json({ error: 'Invalid bucket value' })
    }

    const device = await prisma.device.findUnique({
      where: { deviceId },
      select: { deviceId: true, deviceType: true }
    })

    if (!device) {
      return res.status(404).json({ error: 'Device not found' })
    }

    if (device.deviceType !== 'SMART_METER') {
      return res.status(400).json({ error: 'Not a smart meter device' })
    }

    const conditions: Prisma.Sql[] = [
      Prisma.sql`"deviceId" = ${deviceId}`
    ]
    if (meterValue) {
      conditions.push(Prisma.sql`"meter" = ${meterValue}`)
    }
    if (fromDate) {
      conditions.push(Prisma.sql`"createdAt" >= ${fromDate}`)
    }
    if (toDate) {
      conditions.push(Prisma.sql`"createdAt" <= ${toDate}`)
    }

    const whereSql = Prisma.join(conditions, ' AND ')

    const rows = await prisma.$queryRaw<{
      bucket: Date
      voltage1Avg: number | null
      voltage2Avg: number | null
      currentAvg: number | null
      powerFactorAvg: number | null
      powerAvg: number | null
      frequencyAvg: number | null
      machineOnRatio: number | null
      count: number
    }[]>(Prisma.sql`
      SELECT
        date_trunc(${bucket}, "createdAt") AS "bucket",
        AVG("voltage1") AS "voltage1Avg",
        AVG("voltage2") AS "voltage2Avg",
        AVG("current") AS "currentAvg",
        AVG("powerFactor") AS "powerFactorAvg",
        AVG("power") AS "powerAvg",
        AVG("frequency") AS "frequencyAvg",
        AVG(CASE WHEN "machine" = true THEN 1 ELSE 0 END) AS "machineOnRatio",
        COUNT(*)::int AS "count"
      FROM "SmartMeterData"
      WHERE ${whereSql}
      GROUP BY 1
      ORDER BY 1
    `)

    const series = rows.map((row) => ({
      bucket: row.bucket instanceof Date ? row.bucket.toISOString() : String(row.bucket),
      count: Number(row.count),
      averages: {
        voltage1: toNumber(row.voltage1Avg),
        voltage2: toNumber(row.voltage2Avg),
        current: toNumber(row.currentAvg),
        powerFactor: toNumber(row.powerFactorAvg),
        power: toNumber(row.powerAvg),
        frequency: toNumber(row.frequencyAvg)
      },
      machine: {
        onRatio: toNumber(row.machineOnRatio)
      }
    }))

    res.json({
      deviceId,
      meter: meterValue || null,
      bucket,
      range: {
        from: fromDate ? fromDate.toISOString() : null,
        to: toDate ? toDate.toISOString() : null
      },
      series
    })
  } catch (error) {
    console.error('❌ Error fetching smart meter series analytics:', error)
    res.status(500).json({ error: 'Failed to fetch series analytics' })
  }
})

/**
 * GET /api/smartmeter/:deviceId/analytics/live
 * Get live windowed stats + latest reading
 * Query: windowMinutes (default 15), meter
 */
router.get('/:deviceId/analytics/live', async (req, res) => {
  try {
    const { deviceId } = req.params
    const windowValue = getQueryString(req.query.windowMinutes)
    const meterValue = getQueryString(req.query.meter)
    const windowMinutes = parsePositiveInt(windowValue, 15, 10080)

    if (windowValue && !windowMinutes) {
      return res.status(400).json({ error: 'Invalid windowMinutes' })
    }

    const device = await prisma.device.findUnique({
      where: { deviceId },
      select: { deviceId: true, deviceType: true }
    })

    if (!device) {
      return res.status(404).json({ error: 'Device not found' })
    }

    if (device.deviceType !== 'SMART_METER') {
      return res.status(400).json({ error: 'Not a smart meter device' })
    }

    const now = new Date()
    const fromDate = new Date(now.getTime() - windowMinutes * 60 * 1000)

    const conditions: Prisma.Sql[] = [
      Prisma.sql`"deviceId" = ${deviceId}`,
      Prisma.sql`"createdAt" >= ${fromDate}`
    ]
    if (meterValue) {
      conditions.push(Prisma.sql`"meter" = ${meterValue}`)
    }

    const whereSql = Prisma.join(conditions, ' AND ')

    const where: any = { deviceId, createdAt: { gte: fromDate } }
    if (meterValue) {
      where.meter = meterValue
    }

    const [summaryRows, latest, machineCounts] = await Promise.all([
      prisma.$queryRaw<{
        samples: number
        voltage1Avg: number | null
        voltage2Avg: number | null
        currentAvg: number | null
        powerFactorAvg: number | null
        powerAvg: number | null
        frequencyAvg: number | null
        voltage1Min: number | null
        voltage2Min: number | null
        currentMin: number | null
        powerFactorMin: number | null
        powerMin: number | null
        frequencyMin: number | null
        voltage1Max: number | null
        voltage2Max: number | null
        currentMax: number | null
        powerFactorMax: number | null
        powerMax: number | null
        frequencyMax: number | null
      }[]>(Prisma.sql`
        SELECT
          COUNT(*)::int AS "samples",
          AVG("voltage1") AS "voltage1Avg",
          AVG("voltage2") AS "voltage2Avg",
          AVG("current") AS "currentAvg",
          AVG("powerFactor") AS "powerFactorAvg",
          AVG("power") AS "powerAvg",
          AVG("frequency") AS "frequencyAvg",
          MIN("voltage1") AS "voltage1Min",
          MIN("voltage2") AS "voltage2Min",
          MIN("current") AS "currentMin",
          MIN("powerFactor") AS "powerFactorMin",
          MIN("power") AS "powerMin",
          MIN("frequency") AS "frequencyMin",
          MAX("voltage1") AS "voltage1Max",
          MAX("voltage2") AS "voltage2Max",
          MAX("current") AS "currentMax",
          MAX("powerFactor") AS "powerFactorMax",
          MAX("power") AS "powerMax",
          MAX("frequency") AS "frequencyMax"
        FROM "SmartMeterData"
        WHERE ${whereSql}
      `),
      prisma.smartMeterData.findFirst({
        where,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.$queryRaw<{
        machine: boolean | null
        count: number
      }[]>(Prisma.sql`
        SELECT
          "machine",
          COUNT(*)::int AS "count"
        FROM "SmartMeterData"
        WHERE ${whereSql}
        GROUP BY "machine"
      `)
    ])

    const summary = summaryRows[0]
    const samples = summary ? Number(summary.samples) : 0
    const machineTotals = machineCounts.reduce((sum, row) => sum + Number(row.count), 0)
    const machineOn = machineCounts.find((row) => row.machine === true)?.count ?? 0
    const machineOff = machineCounts.find((row) => row.machine === false)?.count ?? 0
    const machineUnknown = machineCounts.find((row) => row.machine === null)?.count ?? 0
    const machineOnRatio = machineTotals > 0 ? machineOn / machineTotals : null

    res.json({
      deviceId,
      meter: meterValue || null,
      windowMinutes,
      range: {
        from: fromDate.toISOString(),
        to: now.toISOString()
      },
      samples,
      averages: {
        voltage1: toNumber(summary?.voltage1Avg),
        voltage2: toNumber(summary?.voltage2Avg),
        current: toNumber(summary?.currentAvg),
        powerFactor: toNumber(summary?.powerFactorAvg),
        power: toNumber(summary?.powerAvg),
        frequency: toNumber(summary?.frequencyAvg)
      },
      minimums: {
        voltage1: toNumber(summary?.voltage1Min),
        voltage2: toNumber(summary?.voltage2Min),
        current: toNumber(summary?.currentMin),
        powerFactor: toNumber(summary?.powerFactorMin),
        power: toNumber(summary?.powerMin),
        frequency: toNumber(summary?.frequencyMin)
      },
      maximums: {
        voltage1: toNumber(summary?.voltage1Max),
        voltage2: toNumber(summary?.voltage2Max),
        current: toNumber(summary?.currentMax),
        powerFactor: toNumber(summary?.powerFactorMax),
        power: toNumber(summary?.powerMax),
        frequency: toNumber(summary?.frequencyMax)
      },
      machine: {
        on: machineOn,
        off: machineOff,
        unknown: machineUnknown,
        onRatio: machineOnRatio
      },
      latest
    })
  } catch (error) {
    console.error('❌ Error fetching smart meter live analytics:', error)
    res.status(500).json({ error: 'Failed to fetch live analytics' })
  }
})

/**
 * GET /api/smartmeter/:deviceId/analytics/trend
 * Get continuous trend series for a rolling window
 * Query: minutes (default 120), bucket=minute|hour|day|week|month, meter
 */
router.get('/:deviceId/analytics/trend', async (req, res) => {
  try {
    const { deviceId } = req.params
    const minutesValue = getQueryString(req.query.minutes)
    const meterValue = getQueryString(req.query.meter)
    const bucketValue = getQueryString(req.query.bucket)
    const minutes = parsePositiveInt(minutesValue, 120, 10080)

    if (minutesValue && !minutes) {
      return res.status(400).json({ error: 'Invalid minutes value' })
    }

    const bucket = bucketValue ? parseBucket(bucketValue) : 'minute'
    if (!bucket) {
      return res.status(400).json({ error: 'Invalid bucket value' })
    }

    const device = await prisma.device.findUnique({
      where: { deviceId },
      select: { deviceId: true, deviceType: true }
    })

    if (!device) {
      return res.status(404).json({ error: 'Device not found' })
    }

    if (device.deviceType !== 'SMART_METER') {
      return res.status(400).json({ error: 'Not a smart meter device' })
    }

    const now = new Date()
    const fromDate = new Date(now.getTime() - minutes * 60 * 1000)

    const conditions: Prisma.Sql[] = [
      Prisma.sql`"deviceId" = ${deviceId}`,
      Prisma.sql`"createdAt" >= ${fromDate}`,
      Prisma.sql`"createdAt" <= ${now}`
    ]
    if (meterValue) {
      conditions.push(Prisma.sql`"meter" = ${meterValue}`)
    }

    const whereSql = Prisma.join(conditions, ' AND ')

    const rows = await prisma.$queryRaw<{
      bucket: Date
      voltage1Avg: number | null
      voltage2Avg: number | null
      currentAvg: number | null
      powerFactorAvg: number | null
      powerAvg: number | null
      frequencyAvg: number | null
      machineOnRatio: number | null
      count: number
    }[]>(Prisma.sql`
      SELECT
        date_trunc(${bucket}, "createdAt") AS "bucket",
        AVG("voltage1") AS "voltage1Avg",
        AVG("voltage2") AS "voltage2Avg",
        AVG("current") AS "currentAvg",
        AVG("powerFactor") AS "powerFactorAvg",
        AVG("power") AS "powerAvg",
        AVG("frequency") AS "frequencyAvg",
        AVG(CASE WHEN "machine" = true THEN 1 ELSE 0 END) AS "machineOnRatio",
        COUNT(*)::int AS "count"
      FROM "SmartMeterData"
      WHERE ${whereSql}
      GROUP BY 1
      ORDER BY 1
    `)

    const series = rows.map((row) => ({
      bucket: row.bucket instanceof Date ? row.bucket.toISOString() : String(row.bucket),
      count: Number(row.count),
      averages: {
        voltage1: toNumber(row.voltage1Avg),
        voltage2: toNumber(row.voltage2Avg),
        current: toNumber(row.currentAvg),
        powerFactor: toNumber(row.powerFactorAvg),
        power: toNumber(row.powerAvg),
        frequency: toNumber(row.frequencyAvg)
      },
      machine: {
        onRatio: toNumber(row.machineOnRatio)
      }
    }))

    res.json({
      deviceId,
      meter: meterValue || null,
      bucket,
      minutes,
      range: {
        from: fromDate.toISOString(),
        to: now.toISOString()
      },
      series
    })
  } catch (error) {
    console.error('❌ Error fetching smart meter trend analytics:', error)
    res.status(500).json({ error: 'Failed to fetch trend analytics' })
  }
})

/**
 * GET /api/smartmeter/:deviceId/data
 * Get latest smart meter readings
 */
router.get('/:deviceId/data', async (req, res) => {
  try {
    const { deviceId } = req.params
    const { limit = '10' } = req.query

    const device = await prisma.device.findUnique({
      where: { deviceId },
      select: {
        deviceId: true,
        deviceType: true
      }
    })

    if (!device) {
      return res.status(404).json({ error: 'Device not found' })
    }

    if (device.deviceType !== 'SMART_METER') {
      return res.status(400).json({ error: 'Not a smart meter device' })
    }

    const data = await prisma.smartMeterData.findMany({
      where: { deviceId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string)
    })

    res.json({ 
      deviceId: device.deviceId,
      data 
    })
  } catch (error) {
    console.error('❌ Error fetching smart meter data:', error)
    res.status(500).json({ error: 'Failed to fetch data' })
  }
})

/**
 * GET /api/smartmeter/:deviceId/settings
 * Get smart meter settings
 */
router.get('/:deviceId/settings', async (req, res) => {
  try {
    const { deviceId } = req.params

    const device = await prisma.device.findUnique({
      where: { deviceId },
      select: {
        deviceId: true,
        deviceType: true
      }
    })

    if (!device) {
      return res.status(404).json({ error: 'Device not found' })
    }

    if (device.deviceType !== 'SMART_METER') {
      return res.status(400).json({ error: 'Not a smart meter device' })
    }

    const settings = await prisma.smartMeterSettings.findUnique({
      where: { deviceId }
    })

    res.json({ 
      deviceId: device.deviceId,
      settings: settings || null
    })
  } catch (error) {
    console.error('❌ Error fetching smart meter settings:', error)
    res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

/**
 * GET /api/smartmeter/:deviceId/latest
 * Get latest smart meter reading
 */
router.get('/:deviceId/latest', async (req, res) => {
  try {
    const { deviceId } = req.params

    const device = await prisma.device.findUnique({
      where: { deviceId },
      select: {
        deviceId: true,
        deviceType: true,
        ipAddress: true,
        firmwareVersion: true
      }
    })

    if (!device) {
      return res.status(404).json({ error: 'Device not found' })
    }

    if (device.deviceType !== 'SMART_METER') {
      return res.status(400).json({ error: 'Not a smart meter device' })
    }

    const latestData = await prisma.smartMeterData.findFirst({
      where: { deviceId },
      orderBy: { createdAt: 'desc' }
    })

    const settings = await prisma.smartMeterSettings.findUnique({
      where: { deviceId }
    })

    res.json({ 
      device: {
        deviceId: device.deviceId,
        deviceType: device.deviceType,
        ipAddress: device.ipAddress,
        firmwareVersion: device.firmwareVersion
      },
      latestData: latestData || null,
      settings: settings || null
    })
  } catch (error) {
    console.error('❌ Error fetching latest smart meter data:', error)
    res.status(500).json({ error: 'Failed to fetch data' })
  }
})

export default router
