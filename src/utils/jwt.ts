import env from "../config/index"
import jwt from "jsonwebtoken";
import type { IJwtPayload } from "../modules/auth/auth.interface";

export const verifyToken = (

    token: string
  
  ): IJwtPayload => {
  
    return jwt.verify(
  
      token,
  
      env.secret
  
    ) as IJwtPayload;
  
  };