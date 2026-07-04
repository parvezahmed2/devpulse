import app from "./app"
import config from "./config/index"
import { initDB } from "./db/index"

const main = () => {
    initDB()
    app.listen(config.port, () =>{
        console.log(`Example app listening on port ${config.port}`)
    })
}

main()