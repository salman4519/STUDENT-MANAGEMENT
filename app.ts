import express from "express";
import bodyParser from "body-parser";
import path from "path";
import dotenv from "dotenv";
import session from "express-session";
import helmet from "helmet";
import userRoutes from "./routes/userRoute";

// Initialize environment variables
dotenv.config();

const app = express();

// Middleware for security headers
app.use(helmet());

// Set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware for parsing requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware for serving static files
app.use(express.static(path.join(__dirname, "public")));

// Session setup
app.use(
    session({
        secret: process.env.SESSION_SECRET || "defaultSecret", // Use an environment variable for the secret
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Set to true if using HTTPS
    })
);

// Routes
app.use("/", userRoutes);

// Catch 404 errors for undefined routes
app.use((req, res) => {
    res.status(404).render("404", { message: "Page not found" });
});

// Global error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`The server is running at http://localhost:${PORT}`));
