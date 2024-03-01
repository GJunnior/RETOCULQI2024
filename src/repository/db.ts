import { createClient } from 'redis';
import 'dotenv/config';


export const getClient = async () => {
    try {
        const client = createClient({
            password: process.env.REDIS_PW,
            socket: {
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT)
            }
        });
        return client;
    } catch (error) {
        console.log(error)
    }
}