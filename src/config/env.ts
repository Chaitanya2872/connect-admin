import * as dotenv from 'dotenv'
dotenv.config()


export const ENV = {
PORT: process.env.PORT || 4000,
DB: process.env.DATABASE_URL!,
IOT_ENDPOINT: process.env.AWS_IOT_ENDPOINT!
}