import bcrypt from 'bcrypt';
import db from '../models/index.js';
import jwt from 'jsonwebtoken';

const register = async (req, res) => {
    console.log("Registering user:", req.body);
    if (!req.body || !req.body.username || !req.body.email || !req.body.password) {
        return res.status(400).json({ message: 'username, email and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
        console.log("Invalid email format:", req.body.email);
        return res.status(400).json({ message: 'Invalid email format' });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(req.body.password)) {
        console.error("Invalid password format:", req.body.password);
        return res.status(400).json({ message: 'Invalid password format. Password must be at least 8 characters long and include at least one letter and one number.' });
    }

    const { username, email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        const savedUser = await db.users.create({
            username,
            email,
            password: hashedPassword,
        });
        console.log("User saved:", savedUser);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error("Error saving user:", error);
        return res.status(500).json({ message: `Error saving user: ${error}` });
    }
};

const login = async (req, res) => {
    console.log("Logging in user:", req.body);
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({ message: 'username, email and password are required' });
    }

    const { username, email, password } = req.body;

    if ((!email && !username) || !password) {
        console.log("Email or username, and password are required", email, username);
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await db.users.findOne({ where : { username } });
        if (!user) {
            console.log("User not found", user.username);
            return res.status(404).json({ message: 'User not found' });
        }

        if (email && user.email !== email) {
            console.log("Email does not match the registered email for this user:", user.username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch);
        if (!isMatch) {
            console.log("Invalid credentials", user.username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log("User logged in successfully", user.username);
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({ message: `Error logging in user: ${error}` });
    }
}

const getAllUsers = async (req, res) => {
    try {
        console.log("Fetching all users");
        const users = await db.users.find();
        if (!users || users.length === 0) {
            console.log("No users found");
            return res.status(404).json({ message: 'No users found' });
        }
        console.log("Users found:", users);
        res.status(200).json(users);
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ message: `Error fetching users: ${error}` });
    }
}

export default { 
    register,
    login,
    getAllUsers
};