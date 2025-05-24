import db from '../models/index.js';
import bcrypt from 'bcrypt';

export const createUser = async (userData) => {
    const { username, email, password } = userData;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await db.users.create({
        username,
        email,
        password: hashedPassword,
    });
    return user;
};

export const findUserByUsername = async (username) => {
    return await db.users.findOne({ where: { username } });
};

export const findUserByEmail = async (email) => {
    return await db.users.findOne({ where: { email } });
};