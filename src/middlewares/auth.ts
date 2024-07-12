import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

const authConfig = <string>process.env.SECRET_JWT;

export default  (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if(!authHeader)
        return res.status(401).send({ error: 'No token provided' });

    const parts = authHeader.split(' ');

    if(!(parts.length === 2))
        return res.status(401).send({ error: 'Token error'});

    const [ scheme, token ] = parts;

    if(!/^Bearer$/i.test(scheme))
        return res.status(401).send({ error: 'Token malformatted' });

    jwt.verify(token, authConfig, (err, decoded) => {
        if(err) return res.status(401).send({ error: 'Invalid token' });

        //@ts-ignore
        req.userId = decoded.id;
        return next();
    });
    
};
