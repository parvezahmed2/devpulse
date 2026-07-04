import dotenv from "dotenv";
import path from "path";
dotenv.config({
    path: path.join(process.cwd(), ".env"),
});


const config = {
    port : process.env.PORT,
    secret : process.env.JWT_SECRET,
    jwt_expires : process.env.JWT_EXPIRES
}


export default config;