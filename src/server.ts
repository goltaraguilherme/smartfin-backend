import express, {Request, Response} from "express";
import { userRouter } from "./routes/users.router";
import { utilsRouter } from "./routes/utils.router";
import authMiddleware from "./middlewares/auth"
import cors from "cors";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();

const port:number = 3000 | <number>Number(process.env.PORT);

app.get('/', async (req: Request, res: Response) => {
    res.send("Smartfin Backend")
});

app.use(cors())
app.use("/utils", authMiddleware, utilsRouter)
app.use("/users", userRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})


export default app;

