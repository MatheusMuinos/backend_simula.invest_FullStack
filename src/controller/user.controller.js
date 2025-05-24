import bcrypt from 'bcrypt';
import db from '../models/index.js';
import jwt from 'jsonwebtoken';
import { createUser, findUserByUsername, findUserByEmail } from '../services/user.service.js';

const register = async (req, res) => {
    console.log("Registering user:", req.body);
    if (!req.body || !req.body.username || !req.body.email || !req.body.password) {
        return res.status(400).json({ message: 'username, email and password are required' });
    }

    const { username, email, password } = req.body;

    try {
        // Verifica se o email ou username já existem
        const existingUser = await findUserByEmail(email) || await findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Cria o usuário
        const user = await createUser({ username, email, password });
        console.log("User saved:", user);
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
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
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