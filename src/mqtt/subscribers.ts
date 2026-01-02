import { mqtt } from 'aws-iot-device-sdk-v2'
import { handleAlive } from '../services/device.service'
import { handleHealth } from '../services/health.service'
import { handleUpdate } from '../services/update.service'

export function subscribeTopics(
  connection: mqtt.MqttClientConnection
) {

  const handler = (topic: string, payload: ArrayBuffer) => {
    try {
      const message = Buffer.from(payload).toString('utf-8')
      const data = JSON.parse(message)

      console.log(`📩 MQTT [${topic}] →`, data)

      routeMessage(topic, data)
    } catch (err) {
      console.error('❌ MQTT parse error:', err)
    }
  }

  connection.subscribe(
    '$aws/things/+/alive_reply',
    mqtt.QoS.AtLeastOnce,
    handler
  )

  connection.subscribe(
    '$aws/things/+/health_reply',
    mqtt.QoS.AtLeastOnce,
    handler
  )

  connection.subscribe(
    '$aws/things/+/update',
    mqtt.QoS.AtLeastOnce,
    handler
  )

  console.log('📡 All CCMS topics subscribed')
}

/**
 * PURE ROUTER — NO MQTT OBJECT HERE
 */
function routeMessage(topic: string, data: any) {

  if (topic.includes('alive_reply')) {
    handleAlive(data)
    return
  }

  if (topic.includes('health_reply')) {
    handleHealth(data)
    return
  }

  if (topic.includes('/update')) {
    handleUpdate(data)
    return
  }

  console.warn('⚠️ Unhandled topic:', topic)
}
