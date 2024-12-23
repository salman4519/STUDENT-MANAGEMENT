import express, { Request, Response, NextFunction } from "express";
import { 
    loadSignup, 
    postSignup, 
    loadLogin, 
    postLogin, 
    loadDash, 
    loadAdminDashboard, 
    loadEditUser, 
    postEditUser, 
    deleteUser ,
    logout
} from "../controllers/userController";

// Define session structure using TypeScript
declare module "express-session" {
    interface SessionData {
        User?: { 
            username: string; 
            role: "admin" | "user"; 
        };
    }
}

const userRoute = express.Router();

// Middleware for Authentication
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.user) {
        return next();
    }
    res.redirect("/");
};

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.user && req.session.user.role === "admin") {
        return next();
    }
    res.status(403).send("Access denied.");
};

// Signup Routes
userRoute.get("/signup", loadSignup);
userRoute.post("/signup", postSignup);

// Login Routes
userRoute.get("/", loadLogin);
userRoute.post("/", postLogin);

// User Dashboard Routes
userRoute.get("/dash", isAuthenticated, loadDash);

// Admin Dashboard Routes
userRoute.get("/admin", isAuthenticated, isAdmin, loadAdminDashboard);
userRoute.post("/admin/delete/:username", isAuthenticated, isAdmin, deleteUser);
userRoute.get("/admin/edit/:username", isAuthenticated, isAdmin, loadEditUser);
userRoute.post("/admin/edit/:username", isAuthenticated, isAdmin, postEditUser);
userRoute.post("/logout",isAuthenticated,logout)

// 404 Route for Missing Paths
userRoute.use((req: Request, res: Response) => {
    res.status(404).send("Page not found.");
});

export default userRoute;
