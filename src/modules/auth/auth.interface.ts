export interface IUser {
    id?: number;
  
    name: string;
  
    email: string;
  
    password: string;
  
    role: "contributor" | "maintainer";
  
    created_at?: Date;
  
    updated_at?: Date;
  }


  export interface ISignup {
    name: string;
  
    email: string;
  
    password: string;
  
    role: "contributor" | "maintainer";
  }

  
  export interface ILogin {
    email: string;
  
    password: string;
  }
  

  export interface IJwtPayload {
    id: number;
  
    role: "contributor" | "maintainer";
  }