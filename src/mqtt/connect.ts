import { mqtt, iot } from 'aws-iot-device-sdk-v2'
import * as path from 'path'
import { ENV } from '../config/env'

export async function connectMQTT() {

  const certPath = path.resolve('certs/device.pem.crt')
  const keyPath = path.resolve('certs/private.pem.key')
  const caPath = path.resolve('certs/AmazonRootCA1.pem')

  const config = iot.AwsIotMqttConnectionConfigBuilder
    .new_mtls_builder_from_path(certPath, keyPath)
    .with_certificate_authority_from_path(undefined, caPath)
    .with_client_id('ccms-backend')
    .with_endpoint(ENV.IOT_ENDPOINT)
    .build()

  const client = new mqtt.MqttClient()
  const connection = client.new_connection(config)

  await connection.connect()
  console.log('✅ MQTT Connected')

  return connection
}
