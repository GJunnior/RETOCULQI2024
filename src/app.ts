import express, { Request, Response } from 'express';
import 'dotenv/config';
import * as fs from 'fs';
import { JWT } from './helpers/constants';
import { validateFieldsMiddleware, validateTokenMiddleware } from './middleware/middleware';
import { generateToken, getCardData } from './repository/account';

function checkEnv() {
  console.log("INSTANCIA : " + process.env.INSTANCE);
  console.log("PUERTO : " + process.env.PORT);
  console.log("PROYECTO : " + String(process.env.PROJECTNAME).toUpperCase());
  console.log("CREDENCIALES : " + (process.env.CREDENTIALS ? process.env.CREDENTIALS : "<not-set>"));
  console.log("\n");

  if (process.env.CREDENTIALS) {
    if (!fs.existsSync(process.env.CREDENTIALS)) {
      console.log(`${JWT.message.CREDS_NOT_FOUND}: [${process.env.CREDENTIALS}], terminando...`)
      process.exit(-1);
    }
  } else {
    console.log(`${JWT.message.CREDS_NOT_SPECIFY}, terminando...`)
    process.exit(-1);
  }
}

// REVISANDO VARIABLES DE ENTORNO Y CREDENCIALES
checkEnv();

const app = express();

app.use(express.json());

// ENDPOINT PARA OBTENER TOKEN Y MIDDLEWARE PARA VALIDACION DE CAMPOS
app.post('/tokens', validateFieldsMiddleware, async (req: Request, res: Response) => {
  await generateToken(req, res);
})

// MIDDLEWARE PARA VALIDACION DE TOKEN - SI EN CASO EXPIRO ENTRE OTROS
app.use(validateTokenMiddleware);

// ENDPOINT PARA OBTENER DATOS DE TARJETA
app.post('/getCardData', async (req: Request, res: Response) => {
  await getCardData(req, res);
})

export default app;