import { Pool } from "pg"
import config from "../config/index"


export const pool = new Pool({
    connectionString : config.connection_string,


    ssl: {
        rejectUnauthorized : false,
    },  
})



export const initDB = async() => {
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(100) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'contributor'
              CHECK (role IN ('contributor', 'maintainer')),

            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            
            )

            `);


            await pool.query(`
                CREATE TABLE IF NOT EXISTS  issues(
                id SERIAL PRIMARY KEY,
                title VARCHAR(150) NOT NULL,
                description TEXT NOT NULL,
                type VARCHAR(30)
                CHECK(type IN ('bug','feature_request'))
                 NOT NULL,

                status VARCHAR(30)
                CHECK(status IN ('open','in_progress','resolved'))
                DEFAULT 'open',

                reporter_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
                )  
                  `);
            console.log("Database connected successfully!");
    }
    catch(error){
        console.log(error)
    }
}
             