import express from 'express'
import cors from 'cors'

import analyticsRoutes from './routes/analytics.routes'
import reportRoutes from './routes/report.routes'
import deviceRoutes from './routes/device.routes'
import otaRoutes from './routes/ota.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/analytics', analyticsRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/device', deviceRoutes)
app.use('/api/ota', otaRoutes)

export default app
