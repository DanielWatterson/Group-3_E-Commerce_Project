import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import {config} from "dotenv";

config();

export const hashPassword = async (password) => {
    const hashedPassword = await hash(password, 11);
    return hashedPassword;
};

export const comparePassword = async (password, hashedPassword) => {
    const isMatch = await compare(password, hashedPassword);
    return isMatch;
};

export const createToken = async (email) => {
    const token = jwt.sign({email: email}, process.env.JWT_SECRET, { expiresIn: "1d" });
    return token;
};