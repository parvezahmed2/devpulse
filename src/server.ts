import app from "./app"
import config from "./config/index"

const main = () => {
    app.listen(config.port, () =>{
        console.log(`Example app listening on port ${config.port}`)
    })
}

main()