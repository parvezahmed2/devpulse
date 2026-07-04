import  express, { type Application, type Request, type Response } from "express";

const app:Application =  express()
app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({
    extended: true
}))


app.get('/', (req : Request, res : Response) => {
     
    console.log("server is runnint")
    res.status(200).json({
        "message" : "Express Server",
        "author" : "Next Level"
    })
    })

export default app