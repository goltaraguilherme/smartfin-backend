import express, { Request, Response } from "express";
import yahooFinance from "yahoo-finance2";

export const utilsRouter = express.Router();

utilsRouter.use(express.json());

utilsRouter.post("/spread", async (req: Request, res: Response) => {
    try {
        const { ativoA, ativoB, initDate, finalDate } = req.body;
        const queryOptions = { period1: initDate, period2: finalDate /* ... */ };
        const resultAtivoA = await yahooFinance.historical(ativoA+".SA", queryOptions);
        const resultAtivoB = await yahooFinance.historical(ativoB+".SA", queryOptions);
        
        res.send({ativoA: resultAtivoA, ativoB: resultAtivoB})
    } catch (error) {
        res.status(404).send("Erro ao buscar os dados dos ativos. Tente novamente mais tare")
    }
})
