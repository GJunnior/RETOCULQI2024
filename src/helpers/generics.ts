import * as fs from 'fs';
import 'dotenv/config';

export const getCredentials = async () => {
    let root = process.env.CREDENTIALS;
    let result = fs.readFileSync(String(root), 'utf-8');
    return JSON.parse(String(result));
  }
  