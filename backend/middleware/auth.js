import { hash, compare } from "bcrypt";

export const hashPassword = async (password) => {
    const hashedPassword = await hash(password, 11);
    return hashedPassword;
};

export const comparePassword = async (password, hashedPassword) => {
    const isMatch = await compare(password, hashedPassword);
    return isMatch;
};