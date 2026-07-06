"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express3 = __toESM(require("express"));

// src/modules/auth/auth.route.ts
var import_express = require("express");

// src/config/index.ts
var import_dotenv = __toESM(require("dotenv"));
var import_path = __toESM(require("path"));
import_dotenv.default.config({
  path: import_path.default.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTIONSTRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET,
  jwt_expires: process.env.JWT_EXPIRES
};
var config_default = config;

// src/db/index.ts
var import_pg = require("pg");
var pool = new import_pg.Pool({
  connectionString: config_default.connection_string,
  ssl: {
    rejectUnauthorized: false
  }
});
var initDB = async () => {
  try {
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
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/auth.service.ts
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var createUserDB = async (payload) => {
  const { name, email, password, role } = payload;
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
  const hashPassword = await import_bcryptjs.default.hash(password, 10);
  const result = await pool.query(
    `
       INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,COALESCE($4,'contributor')) 
       RETURNING *
      `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
      SELECT * FROM users WHERE email=$1
      `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }
  const user = userData.rows[0];
  const matchPassword = await import_bcryptjs.default.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }
  const jwtpayload = {
    id: user.id,
    name: user.name,
    is_active: user.is_active,
    role: user.role,
    email: user.email
  };
  const accessToken = import_jsonwebtoken.default.sign(jwtpayload, config_default.secret, {
    expiresIn: "1d"
  });
  const { password: _, ...userWithoutPassword } = user;
  return {
    token: accessToken,
    // refreshToken,
    user: userWithoutPassword
  };
};
var authService = {
  createUserDB,
  loginUserIntoDB
};

// src/modules/auth/auth.controller.ts
var createUser = async (req, res) => {
  console.log("server is runnint autho controller");
  try {
    const result = await authService.createUserDB(req.body);
    console.log(result);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  createUser,
  loginUser
};

// src/modules/auth/auth.route.ts
var router = (0, import_express.Router)();
router.post("/signup", authController.createUser);
router.post("/login", authController.loginUser);
var authRouter = router;

// src/modules/issues/issues.route.ts
var import_express2 = require("express");

// src/modules/issues/issue.controller.ts
var import_http_status_codes = require("http-status-codes");

// src/modules/issues/issues.service.ts
var createIssue = async (issueData, reporterUser) => {
  const { title, description, type } = issueData;
  const reporterId = reporterUser.id;
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
  if (type !== "bug" && type !== "feature_request") {
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
var getAllIssues = async (sort = "newest", type, status) => {
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
  const conditions = [];
  const values = [];
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
  } else {
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
  const reporterMap = /* @__PURE__ */ new Map();
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
    updated_at: issue.updated_at
  }));
  return issues;
};
var getSingleIssue = async (issueId) => {
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
var updateIssue = async (issueId, updateData, user) => {
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
  if (updateData.title && updateData.title.length > 150) {
    throw new Error(
      "Title cannot exceed 150 characters"
    );
  }
  if (updateData.description && updateData.description.length < 20) {
    throw new Error(
      "Description must be at least 20 characters"
    );
  }
  if (updateData.type && updateData.type !== "bug" && updateData.type !== "feature_request") {
    throw new Error(
      "Type must be bug or feature_request"
    );
  }
  if (user.role === "maintainer") {
  } else {
    if (issue.reporter_id !== user.id) {
      throw new Error("Forbidden");
    }
    if (issue.status !== "open") {
      throw new Error(
        "Only open issues can be updated"
      );
    }
  }
  const fields = [];
  const values = [];
  if (updateData.title !== void 0) {
    values.push(updateData.title);
    fields.push(`title = $${values.length}`);
  }
  if (updateData.description !== void 0) {
    values.push(updateData.description);
    fields.push(`description = $${values.length}`);
  }
  if (updateData.type !== void 0) {
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
var deleteIssue = async (issueId, user) => {
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
var issueService = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/utils/sendResponse.ts
var sendResponse = (res, responseData) => {
  res.status(responseData.statusCode).json({
    success: responseData.success,
    message: responseData.message,
    data: responseData.data
  });
};

// src/modules/issues/issue.controller.ts
var createIssue2 = async (req, res, next) => {
  try {
    const result = await issueService.createIssue(req.body, req.user);
    sendResponse(res, {
      statusCode: import_http_status_codes.StatusCodes.CREATED,
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getAllIssues2 = async (req, res, next) => {
  try {
    const result = await issueService.getAllIssues(req.body);
    sendResponse(res, {
      statusCode: import_http_status_codes.StatusCodes.OK,
      success: true,
      message: "Issues retrieved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getSingleIssue2 = async (req, res, next) => {
  try {
    const issueId = Number(req.params.id);
    const result = await issueService.getSingleIssue(issueId);
    sendResponse(res, {
      statusCode: import_http_status_codes.StatusCodes.OK,
      success: true,
      message: "Issues retrieved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var updateIssueController = async (req, res, next) => {
  try {
    const issueId = Number(req.params.id);
    if (isNaN(issueId)) {
      res.status(400).json({
        success: false,
        message: "Invalid Issue ID"
      });
      return;
    }
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type
    };
    const user = req.user;
    const updatedIssue = await issueService.updateIssue(issueId, updateData, user);
    sendResponse(res, {
      statusCode: import_http_status_codes.StatusCodes.OK,
      success: true,
      message: "Issue updated successfully",
      data: updatedIssue
    });
  } catch (error) {
    next(error);
  }
};
var deleteIssueController = async (req, res, next) => {
  try {
    const issueId = Number(req.params.id);
    if (isNaN(issueId)) {
      sendResponse(res, {
        statusCode: import_http_status_codes.StatusCodes.BAD_REQUEST,
        success: true,
        message: "Invalid Issue ID"
      });
      return;
    }
    const user = req.user;
    await issueService.deleteIssue(issueId, user);
    sendResponse(res, {
      statusCode: import_http_status_codes.StatusCodes.OK,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
var issuesController = {
  createIssue: createIssue2,
  getAllIssues: getAllIssues2,
  getSingleIssue: getSingleIssue2,
  updateIssueController,
  deleteIssueController
};

// src/utils/jwt.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var verifyToken = (token) => {
  return import_jsonwebtoken2.default.verify(
    token,
    config_default.secret
  );
};

// src/middleware/auth.middleware.ts
var authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "Authorization token is required"
      });
      return;
    }
    const token = authHeader.split(" ")[0];
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Invalid Token"
      });
      return;
    }
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token is invalid or expired"
    });
  }
};

// src/middleware/role.middleware.ts
var authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
      return;
    }
    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: "Forbidden. You do not have permission."
      });
      return;
    }
    next();
  };
};

// src/modules/issues/issues.route.ts
var router2 = (0, import_express2.Router)();
router2.post("/", authenticate, authorize("contributor", "maintainer"), issuesController.createIssue);
router2.get("/", authenticate, issuesController.getAllIssues);
router2.get("/:id", authenticate, issuesController.getSingleIssue);
router2.patch("/:id", authenticate, authorize("contributor", "maintainer"), issuesController.updateIssueController);
router2.delete("/:id", authenticate, authorize("maintainer"), issuesController.deleteIssueController);
var issuesRouter = router2;

// src/middleware/globalErrorHandler.ts
var import_http_status_codes2 = require("http-status-codes");
var globalErrorHandler = (error, req, res, next) => {
  let statusCode = import_http_status_codes2.StatusCodes.INTERNAL_SERVER_ERROR;
  switch (error.message) {
    case "Issue not found":
      statusCode = import_http_status_codes2.StatusCodes.NOT_FOUND;
      break;
    case "Reporter not found":
      statusCode = import_http_status_codes2.StatusCodes.NOT_FOUND;
      break;
    case "User not found":
      statusCode = import_http_status_codes2.StatusCodes.NOT_FOUND;
      break;
    case "Forbidden":
      statusCode = import_http_status_codes2.StatusCodes.FORBIDDEN;
      break;
    case "Only open issues can be updated":
      statusCode = import_http_status_codes2.StatusCodes.CONFLICT;
      break;
    case "Email already exists":
      statusCode = import_http_status_codes2.StatusCodes.CONFLICT;
      break;
    case "Invalid password":
      statusCode = import_http_status_codes2.StatusCodes.UNAUTHORIZED;
      break;
    case "Invalid credentials":
      statusCode = import_http_status_codes2.StatusCodes.UNAUTHORIZED;
      break;
    case "Invalid token":
      statusCode = import_http_status_codes2.StatusCodes.UNAUTHORIZED;
      break;
    case "Token expired":
      statusCode = import_http_status_codes2.StatusCodes.UNAUTHORIZED;
      break;
    default:
      statusCode = import_http_status_codes2.StatusCodes.BAD_REQUEST;
  }
  res.status(statusCode).json({
    success: false,
    message: error.message,
    errors: error
  });
};

// src/app.ts
var app = (0, import_express3.default)();
app.use(import_express3.default.json());
app.use(import_express3.default.text());
app.use(import_express3.default.urlencoded({
  extended: true
}));
app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);
app.use(globalErrorHandler);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map