import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../database/index";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import * as bcrypt from "bcrypt";
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
        //@ts-ignore
        const users = (await collections.users?.find({}).toArray()) as User[];

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
        //@ts-ignore
        const user = (await collections.users.findOne(query)) as User;

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
        if(await collections.users?.findOne({email}))
            return res.status(400).send( {err : "User already exist."})

        req.body.password = await bcrypt.hash(req.body.password, 10);

        const user = await collections.users?.insertOne(req.body);
        
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
    const { email, password } = req.body;
    //@ts-ignore
    const user = await collections.users.findOne({ email });

    if(!user)
        return res.status(404).send({ error: 'User not found'});

    if(!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Invalid password'});

    user.password = undefined;

    res.send({ 
      user,
      token: generateToken( {id: user.id} ),
     });
});

userRouter.delete('/delete_user/:id', async (req: Request, res: Response) => {
    try{
        //@ts-ignore
        const { id }  = req?.params?.id;
        
        //@ts-ignore
        await collections.users.findOneAndDelete({_id: id})

        res.send('Usuário apagado com sucesso')
    
    } catch (err) {
        return res.status(400).send({ err : 'Erro. Por favor, tente novamente em instantes'});
    }
    
})