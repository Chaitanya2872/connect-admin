import app from './app'
import { ENV } from './config/env'
import { connectMQTT } from './mqtt/connect'
import { subscribeTopics } from './mqtt/subscribers'
import { setMqttConnection } from './mqtt/connection_holder'

async function bootstrap() {
  const mqttConnection = await connectMQTT()

  // ✅ THIS LINE IS CRITICAL
  setMqttConnection(mqttConnection)

  subscribeTopics(mqttConnection)

  app.listen(ENV.PORT, () => {
    console.log(`🚀 Server running on ${ENV.PORT}`)
  })
}

bootstrap()
