import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/userModel";
import session from "express-session";

// Define session structure
declare module "express-session" {
    interface SessionData {
        user?: {
            username: string;
            role: "admin" | "user";
            place?: string;
            mobile?: string;
        };
    }
}

// Admin credentials
const adminCredentials = {
    username: "admin",
    password: "admin123",
};

// In-memory storage for users (replace with a database in production)
let students: User[] = [];

// Render the Signup Page
export const loadSignup = (req: Request, res: Response) => {
    res.render("signup", { error: null });
};

// Handle User Signup
export const postSignup = async (req: Request, res: Response) => {
    const { username, password, place, mobile } = req.body;

    // Validate input
    if (!username || !password || !place || !mobile) {
        res.render("signup", { error: "All fields are required." });
        return;
    }

    // Check if username already exists
    const existingUser = students.find(user => user.name === username);
    if (existingUser) {
        res.render("signup", { error: "Username already exists. Please log in." });
        return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser: User = {
        name: username,
        place,
        mobile,
        password: hashedPassword,
    };

    // Store the user in memory
    students.push(newUser);

    // Redirect to login page after successful signup
    res.render("signup", { error: "Signup successful!" });
};

// Render the Login Page
export const loadLogin = (req: Request, res: Response) => {
    res.render("login", { error: null });
};

// Handle User Login
// Handle User Login
export const postLogin = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
         res.status(400).render("login", { error: "Both username and password are required." });
         return;
    }

    // Check if the credentials match admin credentials
    if (username === adminCredentials.username && password === adminCredentials.password) {
        req.session.user = { username: "Admin", role: "admin" }; // Store admin in session
        return res.redirect("/admin");
    }

    // Check for regular user
    const user = students.find(user => user.name === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
         res.status(400).render("login", { error: "Invalid username or password." });
         return;
    }

    // Store regular user in session
    req.session.user = {
        username: user.name,
        role: "user",
        place: user.place,
        mobile: user.mobile,
    };

    // Redirect to dashboard
    res.redirect("/dash");
};


// Render the User Dashboard
export const loadDash = (req: Request, res: Response) => {
    const user = req.session.user;
    if (!user || user.role !== "user") {
        res.status(403).send("Access denied.");
        return;
    }
    res.render("dashS", { user });
};

// Render the Admin Dashboard
export const loadAdminDashboard = (req: Request, res: Response) => {
    const user = req.session.user;
    // if (!user || user.role !== "admin") {
    //     res.status(403).send("Access denied.");
    //     return;
    // }

    res.render("dashT", { users: students });
};

// Handle User Deletion
export const deleteUser = (req: Request, res: Response) => {
    const username = req.params.username;

    // Find and remove the user from the students array
    students = students.filter(user => user.name !== username);

    // Redirect back to the admin dashboard after deletion
    res.redirect("/admin");
};

// Render Edit User Page
export const loadEditUser = (req: Request, res: Response) => {
    const username = req.params.username;

    // Find the user in the students array
    const user = students.find(user => user.name === username);

    if (!user) {
        res.status(404).send("User not found.");
        return;
    }

    res.render("editUser", { user });
};

// Handle Edit User Form Submission
export const postEditUser = (req: Request, res: Response) => {
    const { username } = req.params;
    const { username: newUsername, place, mobile } = req.body;

    // Find the user in the students array
    const userIndex = students.findIndex(user => user.name === username);

    if (userIndex === -1) {
        res.status(404).send("User not found.");
        return;
    }

    // Update the user's details
    students[userIndex] = {
        ...students[userIndex],
        name: newUsername,
        place,
        mobile,
    };

    // Redirect to admin dashboard after saving
    res.redirect("/admin");
};


// Logout Functionality
export const logout = (req: Request, res: Response) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Error destroying session:", err);
        }
        res.redirect("/");
    });
};
