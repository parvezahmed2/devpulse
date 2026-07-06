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





 




export const issueService = {
  createIssue,
  getAllIssues,
  getSingleIssue
   
}