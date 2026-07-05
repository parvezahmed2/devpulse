import type { Request, Response } from "express"
import { authService } from "./auth.service"

const createUser = async(req: Request, res: Response) => {

    console.log("server is runnint autho controller")

    try{
        const result=  await authService.createUserDB(req.body)
         

        console.log(result)
      res.status(201).json({
          success: true,
          message: "User created successfully",
          data :  result.rows[0]
      })
    }
    catch(error: any){
        res.status(500).json({
            success:false,
            message: error.message,
            error : error
        })
    }
}


const loginUser = async (req: Request, res: Response) => {
    try {
      const result = await authService.loginUserIntoDB(req.body);
      // const {refreshToken} = result
  
      // res.cookie("refreshToken", refreshToken,{
      //   secure : false,  // In production => True
      //   httpOnly : true, 
      //   sameSite: 'lax'
      // })  
  
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
        error: error,
      });
    }
  };


export const authController = {
    createUser,
    loginUser
}