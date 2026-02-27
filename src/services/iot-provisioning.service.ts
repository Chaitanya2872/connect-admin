import {
  AttachPolicyCommand,
  AttachThingPrincipalCommand,
  CreateKeysAndCertificateCommand,
  CreateThingCommand,
  DescribeThingCommand,
  IoTClient
} from '@aws-sdk/client-iot'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { ENV } from '../config/env'

type ProvisionThingInput = {
  thingName: string
  policyName?: string
  attributes?: Record<string, string>
  s3Prefix?: string
}

type ProvisionThingOutput = {
  thingName: string
  certificateId: string
  certificateArn: string
  region: string
  bucket: string
  policyAttached: string | null
  s3Keys: {
    certificate: string
    privateKey: string
    publicKey: string
    metadata: string
  }
}

type ProvisioningConfig = {
  region: string
  accessKeyId: string
  secretAccessKey: string
  certBucketName: string
  defaultPolicyName?: string
}

function getProvisioningConfig(): ProvisioningConfig {
  const config = ENV.AWS_PROVISIONING
  const missing: string[] = []

  if (!config.region) {
    missing.push('AWS_IOT_RG_ONE_REGION_NAME (or AWS_REGION)')
  }
  if (!config.accessKeyId) {
    missing.push('AWS_IOT_RG_ONE_ACCESS_KEY (or AWS_ACCESS_KEY_ID)')
  }
  if (!config.secretAccessKey) {
    missing.push('AWS_IOT_RG_ONE_SECRET_ACCESS_KEY (or AWS_SECRET_ACCESS_KEY)')
  }
  if (!config.certBucketName) {
    missing.push('AWS_IOT_RG_ONE_BUCKET_NAME')
  }

  if (missing.length > 0) {
    throw new Error(`Missing provisioning environment variables: ${missing.join(', ')}`)
  }

  return {
    region: config.region,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    certBucketName: config.certBucketName,
    defaultPolicyName: config.defaultPolicyName
  }
}

async function ensureThing(
  client: IoTClient,
  thingName: string,
  attributes?: Record<string, string>
) {
  try {
    await client.send(new DescribeThingCommand({ thingName }))
    return
  } catch (error: any) {
    if (error?.name !== 'ResourceNotFoundException') {
      throw error
    }
  }

  try {
    await client.send(
      new CreateThingCommand({
        thingName,
        ...(attributes && Object.keys(attributes).length > 0
          ? { attributePayload: { attributes } }
          : {})
      })
    )
  } catch (error: any) {
    if (error?.name !== 'ResourceAlreadyExistsException') {
      throw error
    }
  }
}

function normalizePrefix(prefix?: string) {
  if (!prefix) {
    return ''
  }

  return prefix.replace(/^\/+|\/+$/g, '')
}

export async function provisionThingAndStoreCertificates(
  input: ProvisionThingInput
): Promise<ProvisionThingOutput> {
  const thingName = input.thingName?.trim()
  if (!thingName) {
    throw new Error('thingName is required')
  }

  const config = getProvisioningConfig()
  const credentials = {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey
  }

  const iot = new IoTClient({
    region: config.region,
    credentials
  })

  const s3 = new S3Client({
    region: config.region,
    credentials
  })

  await ensureThing(iot, thingName, input.attributes)

  const certificateResult = await iot.send(
    new CreateKeysAndCertificateCommand({
      setAsActive: true
    })
  )

  const certificateArn = certificateResult.certificateArn
  const certificateId = certificateResult.certificateId
  const certificatePem = certificateResult.certificatePem
  const privateKey = certificateResult.keyPair?.PrivateKey
  const publicKey = certificateResult.keyPair?.PublicKey

  if (!certificateArn || !certificateId || !certificatePem || !privateKey || !publicKey) {
    throw new Error('AWS IoT did not return complete certificate material')
  }

  await iot.send(
    new AttachThingPrincipalCommand({
      thingName,
      principal: certificateArn
    })
  )

  const policyName = input.policyName?.trim() || config.defaultPolicyName
  if (policyName) {
    await iot.send(
      new AttachPolicyCommand({
        policyName,
        target: certificateArn
      })
    )
  }

  const basePrefix = normalizePrefix(input.s3Prefix)
  const baseKey = [basePrefix, thingName, certificateId].filter(Boolean).join('/')

  const certificateKey = `${baseKey}/certificate.pem.crt`
  const privateKeyKey = `${baseKey}/private.pem.key`
  const publicKeyKey = `${baseKey}/public.pem.key`
  const metadataKey = `${baseKey}/metadata.json`

  await Promise.all([
    s3.send(
      new PutObjectCommand({
        Bucket: config.certBucketName,
        Key: certificateKey,
        Body: certificatePem,
        ContentType: 'application/x-pem-file'
      })
    ),
    s3.send(
      new PutObjectCommand({
        Bucket: config.certBucketName,
        Key: privateKeyKey,
        Body: privateKey,
        ContentType: 'application/x-pem-file'
      })
    ),
    s3.send(
      new PutObjectCommand({
        Bucket: config.certBucketName,
        Key: publicKeyKey,
        Body: publicKey,
        ContentType: 'application/x-pem-file'
      })
    ),
    s3.send(
      new PutObjectCommand({
        Bucket: config.certBucketName,
        Key: metadataKey,
        Body: JSON.stringify(
          {
            thingName,
            certificateArn,
            certificateId,
            policyName: policyName || null,
            generatedAt: new Date().toISOString()
          },
          null,
          2
        ),
        ContentType: 'application/json'
      })
    )
  ])

  return {
    thingName,
    certificateId,
    certificateArn,
    region: config.region,
    bucket: config.certBucketName,
    policyAttached: policyName || null,
    s3Keys: {
      certificate: certificateKey,
      privateKey: privateKeyKey,
      publicKey: publicKeyKey,
      metadata: metadataKey
    }
  }
}
