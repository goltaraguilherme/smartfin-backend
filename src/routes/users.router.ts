import express, { Request, Response } from "express";
import { Collection, ObjectId } from "mongodb";
import db from "../database/index";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import * as mailer from "../modules/mailer";
import User from "../models/user";

dotenv.config();

function generateToken(params = {}) {
    return jwt.sign(params, <string>process.env.SECRET_JWT, {
        expiresIn: 24*60*60, //24horas * 60min * 60s
    });
}

export const userRouter = express.Router();

userRouter.use(express.json());

userRouter.get("/", async (req: Request, res: Response) => {
    try{
        let collection: Collection = await db.collection("Users");
        const users = (await collection.find({}).toArray());

        res.status(200).send(users);
    }catch(err){
        //@ts-ignore
        res.status(500).send(err.message);
    }
})

userRouter.get("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        
        const query = { _id: new ObjectId(id) };
        let collection: Collection = await db.collection("Users");
        //@ts-ignore
        const user = (await collection.findOne(query)) as User;

        if (user) {
            res.status(200).send(user);
        }
    } catch (error) {
        res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
    }
});

userRouter.post("/edit_user", async (req: Request, res: Response) => {
    const { email, plan, dateFinal } = req.body;

    try {
        let userCollection = await db.collection("Users");
        //@ts-ignore
        const user = await userCollection.updateOne({email}, {
            "$set": {
                plan,
                dateFinal
            }
        });

        if (user) {
            res.status(200).send(user);
        }
    } catch (error) {
        res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
    }
});

userRouter.post("/register", async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        let collection: Collection = await db.collection("Users");
        if(await collection.findOne({email}))
            return res.status(400).send( {err : "User already exist."})

        req.body.password = await bcrypt.hash(req.body.password, 10);

        const now = new Date()
        now.setDate(now.getDate() + 1)

        const user = await collection.insertOne({
            name: req.body.name,
            email: req.body.email,
            telephone: req.body.telephone,
            corretora: req.body.corretora,
            password: req.body.password,
            plan: req.body.plan,
            dateFinal: now,
            typeUser: "Premium",
            passwordResetExpires: "",
            passwordResetToken: ""
        });
        
        //@ts-ignore
        user.password = undefined;

        return res.send( {
            user,
            //@ts-ignore
            token: generateToken ({ id: user.id }),
        })
    } catch (error) {
        console.error(error);
        //@ts-ignore
        res.status(400).send(error.message);
    }
});

userRouter.post('/authenticate', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        let collection = await db.collection("Users");
        const user = await collection.findOne({ email });
    
        if(!user)
            return res.status(404).send({ error: 'User not found'});
    
        if(!await bcrypt.compare(password, user.password))
            return res.status(400).send({ error: 'Invalid password'});
    
        user.password = undefined;
    
        res.send({ 
          user,
          token: generateToken( {id: user.id} ),
         });
    } catch (error) {
        console.error(error)
        //@ts-ignore
        res.status(500).send(error.message)
    }

});

userRouter.post('/forgot_password', async (req: Request, res: Response) => {
    const {email} = req.body;
    try {
        let userCollection: Collection = await db.collection("Users");

        const user = await userCollection.findOne({ email })
        if(!user)
            return res.status(400).send({err: 'Usuário não encontrado'})

        const token = crypto.randomBytes(4).toString('hex')
        const nome = user.name
        const now = new Date()
        now.setHours(now.getHours() + 1)

        await userCollection.updateOne({email}, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        })

        //@ts-ignore
        await mailer.default.sendMail({
            to: email,
            from: 'mvpsmartfintemp@gmail.com',
            template: 'auth/forgot_password',
            subject: 'Troca de senha',
            context: {token, nome},
        }, (err:any) => {
            console.log(err)
            if(err)
                return res.status(400).send({err: 'Não foi possível enviar o email. Tente novamente.'})
        })
        return res.send('Email com chave para troca de senha enviado')
    } catch (error) {
        res.status(400).send({err: 'Tente novamente em instantes.'})
    }
})

userRouter.post('/reset_password', async (req: Request, res: Response) => {
    const { email, token, password } = req.body
    let userCollection: Collection = await db.collection("Users");

    try {
        const user = await userCollection.findOne({email})
        
        if(!user){
            return res.status(400).send({err: 'Usuário não encontrado'})
        }
        //@ts-ignore
        delete user._id;

        if(token !== user.passwordResetToken)
            return res.status(400).send({ err: 'Chave inválida'})

        const now = new Date()

        if(now > user.passwordResetExpires)
            return res.status(400).send({err: 'Chave expirada. Por favor, gere uma nova e tente novamente.'})
    
    user.password = await bcrypt.hash(password, 10);

    await userCollection.updateOne({email}, {
        "$set": {
            password: user.password
        }
    })

    return res.send('Senha alterada com sucesso')
    } catch (error) {
        res.status(400).send({err: 'Tente novamente em instantes.'})
    }
})

userRouter.delete('/delete_user/:id', async (req: Request, res: Response) => {
    try{
        //@ts-ignore
        const { id }  = req?.params?.id;
        let collection: Collection = await db.collection("Users");
        
        //@ts-ignore
        await collection.findOneAndDelete({_id: id})

        res.send('Usuário apagado com sucesso')
    
    } catch (err) {
        return res.status(400).send({ err : 'Erro. Por favor, tente novamente em instantes'});
    }
    
})