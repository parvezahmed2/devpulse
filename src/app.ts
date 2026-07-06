import  express, { type Application, type Request, type Response } from "express";
import { authRouter } from "./modules/auth/auth.route";
import { issuesRouter } from "./modules/issues/issues.route";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import cors from "cors";

const app:Application =  express()
app.use(cors());
app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({
    extended: true
}))

app.use('/api/auth', authRouter)
app.use('/api/issues', issuesRouter)

app.use(globalErrorHandler)

export default app