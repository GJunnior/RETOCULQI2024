import { NextFunction } from "express";
import { Request, Response } from 'express';
import { MESSAGES, COMMERCE, JWT } from "../helpers/constants";
import { DefaultMessageModel } from "../model/defaultMessage";
import Joi from "joi";
import luhn from "luhn";
import { getCredentials } from "../helpers/generics";
import jwt from "jsonwebtoken";

const validateFields = (body: any, headers: any, messageToReturn: any) => {
    let currentYear = new Date().getFullYear();
    let regexp = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

    // VALIDACION DE ESTRUCTURA CON JOI
    let fieldsTokenSchema = Joi.object().keys({
        card_number: Joi.string().min(13).max(16).required(),
        cvv: Joi.string().min(3).max(4).required(),
        expiration_month: Joi.number().min(1).max(12).required(),
        expiration_year: Joi.number().min(currentYear).max(currentYear + 5).required(),
        email: Joi.string().required()
    })
    const { error } = fieldsTokenSchema.validate(body);
    if (error) {
        messageToReturn.message = error.message;
        return false;
    }

    //VALIDANDO CON PAQUETE LUHN
    let is_valid_card_number = luhn.validate(body.card_number);

    if (!is_valid_card_number) {
        messageToReturn.message = MESSAGES.CARD_NUMBER_INVALID;
        return false;
    }

    if (!body.email.match(regexp)) {
        messageToReturn.message = MESSAGES.EMAIL_INVALID;
        return false;
    }
    if (!(body.email.includes("gmail.com") || body.email.includes("hotmail.com") || body.email.includes("yahoo.es"))) {
        messageToReturn.message = MESSAGES.EMAIL_INVALID;
        return false;
    }
    if (!headers.authorization) {
        messageToReturn.message = MESSAGES.NOT_ID_COMMERCE;
        return false;
    }
    var idCommerce = headers.authorization.split(' ')[1];
    if (idCommerce.substring(0, 8) !== COMMERCE.PREFIX_ID) {
        messageToReturn.message = MESSAGES.ID_COMMERCE_INVALID;
        return false;
    }
    return true;
}

export const validateFieldsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Content-Type', 'application/json');
    let messageToReturn = new DefaultMessageModel("");
    try {
        const body = req.body;
        const headers = req.headers;

        let continueFlow = validateFields(body, headers, messageToReturn);

        if (!continueFlow) {
            console.log(messageToReturn);
            res.status(400).send(JSON.stringify(messageToReturn));
            return;
        }
        res.status(200);
        next();
    } catch (error: any) {
        res.status(500);
        messageToReturn.message = "FORMATO DE SOLICITUD INVALIDO";
        res.status(500).send(JSON.stringify(messageToReturn));
    }
}

const validateHeader = (token: any, messageToReturn: any) => {
    if (!token) {
        messageToReturn.message = MESSAGES.BEARER_TOKEN_NOTFOUND;
        return false;
    }
    return true;
}

export const validateTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let messageToReturn = new DefaultMessageModel("");
    try {
        res.setHeader('Content-Type', 'application/json');        
        const token = req.headers.authorization;
        const resultValidation = validateHeader(token, messageToReturn);
        if (!resultValidation) {
            console.log(messageToReturn);
            res.status(400).send(JSON.stringify(messageToReturn));
            return;
        }
        
        let resultCredentials = await getCredentials();
        let bearerToken = req.headers.authorization?.split(' ')[1];

        jwt.verify(bearerToken || "", resultCredentials.JWT_SECRET_KEY, (err: any, decoded: any) => {
            if (err) {
                const messageResult = err.message;
                switch (messageResult) {
                    case JWT.error.error_signature:
                        messageToReturn.message = JWT.message.TOKEN_INVALID;
                        break;
                    case JWT.error.error_expire:
                        messageToReturn.message = JWT.message.TOKEN_EXPIRE;
                        break;
                    case JWT.error.error_token_null:
                        messageToReturn.message = JWT.message.TOKEN_NOT_SPECIFY;
                        break;
                    default:
                        messageToReturn.message = err.message.toUpperCase();
                        break;
                }
                console.log(messageToReturn);
                res.status(400).send(JSON.stringify(messageToReturn));
                return;
            } else {
                res.status(200);
                next();
            }
        });
    }
    catch (error:any) {
        messageToReturn.message = MESSAGES.FAIL;
        res.status(500).send(JSON.stringify(messageToReturn));
    }
}