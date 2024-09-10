import express, { Request, Response } from "express";
import { Collection, ObjectId } from "mongodb";
import db from "../database/index";

import yahooFinance from "yahoo-finance2";

export const utilsRouter = express.Router();

utilsRouter.use(express.json());

utilsRouter.post("/spread", async (req: Request, res: Response) => {
    try {
        const { ativoA, ativoB, initDate, finalDate } = req.body;
        const queryOptions = { period1: initDate, period2: finalDate /* ... */ };
        console.log(queryOptions)
        const resultAtivoA = await yahooFinance.chart(ativoA+".SA", queryOptions);
        console.log("A: "+resultAtivoA.quotes)
        const resultAtivoB = await yahooFinance.chart(ativoB+".SA", queryOptions);
        console.log("B: "+resultAtivoB.quotes)
        
        res.send({ativoA: resultAtivoA.quotes, ativoB: resultAtivoB.quotes})
    } catch (error) {
        console.log(error)
        res.status(404).send("Erro ao buscar os dados dos ativos. Confira os dados enviados ou tente novamente mais tarde.")
    }
})

utilsRouter.get("/list_comments", async (req: Request, res: Response) => {
    try {
        let collectionComments: Collection = await db.collection("Comments");
        const comments = await collectionComments.find({}).toArray()

        return res.send(comments);
        
    } catch (error) {
        res.status(500).send("Erro ao realizar comentário. Tente novamente mais tarde.")
    }
})

utilsRouter.post("/comments", async (req: Request, res: Response) => {
    try {
        const { userEmail } = req.body;

        let collectionComments: Collection = await db.collection("Comments");

        let collectionUsers: Collection = await db.collection("Users");

        const user = await collectionUsers.findOne({email: userEmail})

        const newCommentData = {
            //@ts-ignore
            name: user.name,
            //@ts-ignore
            email: user.email,
            comment: req.body.comment,
            type: req.body.type,
            userId: user?._id,
            date: new Date()
        }

        const newComment = await collectionComments.insertOne(newCommentData);
        
        return res.send( {
            newComment,
        })
        
    } catch (error) {
        res.status(500).send("Erro ao realizar comentário. Tente novamente mais tarde.")
    }
})
