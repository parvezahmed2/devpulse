import { pool } from "../../db/index";
import type { IUser } from "../auth/auth.interface";
import type { ICreateIssue, IJwtPayload } from "./issues.interface";

export const createIssue = async (issueData: ICreateIssue,reporterUser : IJwtPayload ) => {

    const { title, description, type } = issueData;
     const reporterId= reporterUser.id;
   
    if (!title || title.trim() === "") {
      throw new Error("Title is required");
    }
  
    if (title.length > 150) {
      throw new Error("Title cannot exceed 150 characters");
    }
  
    if (!description || description.trim() === "") {
      throw new Error("Description is required");
    }
  
    if (description.length < 20) {
      throw new Error(
        "Description must be at least 20 characters"
      );
    }
  
    if (
      type !== "bug" &&
      type !== "feature_request"
    ) {
      throw new Error(
        "Type must be bug or feature_request"
      );
    }
   
    const reporter = await pool.query(
      `
      SELECT id
      FROM users
      WHERE id = $1
      `,
      [reporterId]
    );
  
    if (reporter.rows.length === 0) {
      throw new Error("Reporter not found");
    }
  
   
    const result = await pool.query(
      `
      INSERT INTO issues
      (title,description,type,reporter_id)VALUES
      ($1,$2,$3,$4)
      RETURNING
        id,
        title,
        description,
        type,
        status,
        reporter_id,
        created_at,
        updated_at
      `,
      [
        title,
        description,
        type,
        reporterId
      ]
    );
  
    
  
    return result.rows[0];
  };
  

  

 export const deleteIssue = async (issueId: number,user: {id: number;role: string;}) => {
  const issueResult = await pool.query(

      `
      SELECT
          id,
          reporter_id
      FROM issues
      WHERE id = $1
      `,

      [issueId]

  );

   
  if (issueResult.rows.length === 0) {

      throw new Error("Issue not found");

  }

   

  if (user.role !== "maintainer") {

      throw new Error("Forbidden");

  }

  
  await pool.query(

      `
      DELETE FROM issues
      WHERE id = $1
      `,

      [issueId]

  );

   
  return;

};




export const issueService = {
  createIssue
}