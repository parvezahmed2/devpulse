import { pool } from "../../db/index";
import type { IUser } from "../auth/auth.interface";
import type { ICreateIssue, IJwtPayload, IssueStatus, IssueType } from "./issues.interface";

const createIssue = async (issueData: ICreateIssue,reporterUser : IJwtPayload ) => {

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



  const getAllIssues = async (sort: string = "newest",type?: IssueType,status?: IssueStatus) => {

    let query = `
        SELECT
            id,
            title,
            description,
            type,
            status,
            reporter_id,
            created_at,
            updated_at
        FROM issues
    `;

     
    const conditions: string[] = [];
 

    const values: any[] = [];

     

    if (type) {

        values.push(type);

        conditions.push(
            `type = $${values.length}`
        );

    }

  

    if (status) {

        values.push(status);

        conditions.push(
            `status = $${values.length}`
        );

    }

     

    if (conditions.length > 0) {

        query += `
            WHERE
            ${conditions.join(" AND ")}
        `;

    }

    if (sort === "oldest") {

        query += `
            ORDER BY created_at ASC
        `;

    }

    else {

        query += `
            ORDER BY created_at DESC
        `;

    }

     

    const result = await pool.query(
        query,
        values
    );

     
  


     
const reporterIds = [
  ...new Set(
      result.rows.map(
          (issue) => issue.reporter_id
      )
  )
];

if (reporterIds.length === 0) {
  return [];
}
 
const reporterResult = await pool.query(
  `
  SELECT
      id,
      name,
      role
  FROM users
  WHERE id = ANY($1)
  `,
  [reporterIds]
);

const reporterMap = new Map<number, any>();

for (const reporter of reporterResult.rows) {
  reporterMap.set(reporter.id, reporter);
}
 
const issues = result.rows.map((issue) => ({
  id: issue.id,
  title: issue.title,
  description: issue.description,
  type: issue.type,
  status: issue.status,
  reporter: reporterMap.get(issue.reporter_id),
  created_at: issue.created_at,
  updated_at: issue.updated_at,
}));

return issues;



};
  

 

const getSingleIssue = async (issueId: number) => {
  const issueResult = await pool.query(
      `
      SELECT
          id,
          title,
          description,
          type,
          status,
          reporter_id,
          created_at,
          updated_at
      FROM issues
      WHERE id = $1
      `,
      [issueId]
  );
  if (issueResult.rows.length === 0) {
      throw new Error("Issue not found");
  }


  const issue = issueResult.rows[0];


  const reporterResult = await pool.query(
      `
      SELECT
          id,
          name,
          role
      FROM users
      WHERE id = $1
      `,
      [issue.reporter_id]
  );


  


  return {


      id: issue.id,


      title: issue.title,


      description: issue.description,


      type: issue.type,


      status: issue.status,


      reporter: reporterResult.rows[0],


      created_at: issue.created_at,


      updated_at: issue.updated_at


  };


};






const updateIssue = async (issueId: number, updateData:ICreateIssue,user: { id: number;role: string;}) => {


  const issueResult = await pool.query(
     `
     SELECT
         *
     FROM issues
     WHERE id = $1
     `,
  
     [issueId] 
);

  
  if (issueResult.rows.length === 0) {
  
     throw new Error("Issue not found");
  
  }
  
  const issue = issueResult.rows[0];

  
  if (
     updateData.title &&
     updateData.title.length > 150
  ) {
     throw new Error(
         "Title cannot exceed 150 characters"
     );
  }
  

  if (
     updateData.description &&
     updateData.description.length < 20
  ) {
  
     throw new Error(
         "Description must be at least 20 characters"
     );
  }
  
  
  if (
     updateData.type &&
     updateData.type !== "bug" &&
     updateData.type !== "feature_request"
  ) {
     throw new Error(
         "Type must be bug or feature_request"
     );
  }
  
  
  if (user.role === "maintainer") {
  }
  else {
     if (issue.reporter_id !== user.id) {
         throw new Error("Forbidden");
     }
  
     if (issue.status !== "open") {
         throw new Error(
             "Only open issues can be updated"
         );
     }
  }


  const fields: string[] = [];
  
  const values: any[] = [];
  
  if (updateData.title !== undefined) {
  
     values.push(updateData.title);
  
     fields.push(`title = $${values.length}`);
  }
  
  if (updateData.description !== undefined) {
  
     values.push(updateData.description);
  
     fields.push(`description = $${values.length}`);
  }


  if (updateData.type !== undefined) {

     values.push(updateData.type);
     fields.push(`type = $${values.length}`);
  }
  if (fields.length === 0) {
     throw new Error("No data provided for update");
  }
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(issueId);
  const result = await pool.query(
  
     `
     UPDATE issues
     SET
     ${fields.join(", ")}
  
     WHERE id = $${values.length}
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
  
     values
  );
  return result.rows[0];
  };
  
  
  
  
  
  
  
  
  
 




export const issueService = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue
   
}