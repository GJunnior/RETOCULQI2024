import { getCredentials } from "../helpers/generics";
import { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import { TokenModel } from "../model/token";
import { MESSAGES } from "../helpers/constants";
import { getClient } from "./db";

export const generateToken = async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    let messageToReturn = new TokenModel("", "");
    try {        
        res.status(404);
        let body = req.body;
        let headers = req.headers;

        let client = await getClient();
        await client?.connect();

        let idCommerce = headers.authorization?.split(' ')[1];
        let existCommerce = await client?.hGetAll(String(idCommerce));

        if (Object.keys(existCommerce || {}).length === 0) {
            client?.disconnect();
            messageToReturn.message = MESSAGES.ID_COMMERCE_NOTFOUND;
            return;
        }

        res.status(200);
        let resultCredentials = await getCredentials();
        const token = jwt.sign(
            { correo: body.email },
            resultCredentials.JWT_SECRET_KEY,
            { expiresIn: resultCredentials.EXPIRES_IN },
        );

        await client?.hSet(String(idCommerce), {
            email: body.email,
            card_number: body.card_number,
            cvv: body.cvv,
            expiration_year: body.expiration_year,
            expiration_month: body.expiration_month,
            token: token
        })

        messageToReturn.message = MESSAGES.OK;
        messageToReturn.token = token;
        client?.disconnect();
    } catch (error: any) {
        res.status(500);
        messageToReturn.message = MESSAGES.FAIL;
        messageToReturn.token = "";
    } finally {
        res.send(JSON.stringify(messageToReturn));
    }
}

export const getCardData = async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        let client = await getClient();
        await client?.connect();
        let commerce = await client?.hGetAll('pk_test_LsRBKejzCOEEWOsw');

        delete commerce?.cvv;
        delete commerce?.token;
        
        client?.disconnect();
        
        res.status(200).send(JSON.stringify(commerce));
    } catch (error: any) {
        res.send(JSON.stringify({"message": MESSAGES.FAIL}));
    }
}