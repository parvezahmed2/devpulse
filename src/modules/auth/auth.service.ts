import config from "../../config/index";
import { pool } from "../../db/index";
import type { ILogin, IUser } from "./auth.interface";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";

const createUserDB = async(payload: IUser) =>{

    // console.log("It's server")
    const {name, email, password, role} = payload

    // password database ase ki na 

    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
      `,
      [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("Email already exists");
}

    const hashPassword = await bcrypt.hash(password, 10)
    
    const result = await pool.query(
        `
       INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,COALESCE($4,'contributor')) 
       RETURNING *
      `,
        [name, email, hashPassword,role],
      )

      delete result.rows[0].password;


      return result
}





const loginUserIntoDB = async (payload: ILogin) => {
    const { email, password } = payload;  
     
    const userData = await pool.query(
      `
      SELECT * FROM users WHERE email=$1
      `,
      [email],
    );
    if (userData.rows.length === 0) {
      throw new Error("Invalid Credentials!");
    }
  
    // 2. Compare the password -> Done
    const user = userData.rows[0];
    const matchPassword = await bcrypt.compare(password, user.password);
  
    if (!matchPassword) {
      throw new Error("Invalid Credentials!");
    }
  
    //3. Generate Token
    const jwtpayload = {
      id: user.id,
      name: user.name,
      is_active: user.is_active,
      role : user.role,
      email: user.email,
    };

  
    const accessToken = jwt.sign(jwtpayload, config.secret as string, {
      expiresIn: "1d",
    });
  
    // const refreshToken = jwt.sign(jwtpayload, config.refresh_secret as string, {
    //   expiresIn: "3d",
    // });
    
    const { password: _, ...userWithoutPassword } = user;
    // return { accessToken, refreshToken };
    return {
      token: accessToken,
      // refreshToken,
      user: userWithoutPassword
    };
  };





export const authService = {
    createUserDB,
    loginUserIntoDB
}