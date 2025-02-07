import { User, UnitUser } from "./user.interface";
import bcrypt from "bcryptjs";
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // default XAMPP password is empty
    database: 'api_database',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const findAll = async (): Promise<UnitUser[]> => {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows as UnitUser[];
};

export const findOne = async (id: number): Promise<UnitUser | null> => {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
};

export const create = async (userData: User): Promise<UnitUser | null> => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const [result]: any = await pool.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [userData.username, userData.email, hashedPassword]
    );

    const user: UnitUser = {
        id: result.insertId,
        username: userData.username,
        email: userData.email,
        password: hashedPassword
    };
    return user;
};

export const findByEmail = async (email: string): Promise<UnitUser | null> => {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
};

export const comparePassword = async (email: string, supplied_password: string): Promise<UnitUser | null> => {
    const user = await findByEmail(email);
    if (!user) {
        return null;
    }

    const decryptPassword = await bcrypt.compare(supplied_password, user.password);
    if (!decryptPassword) {
        return null;
    }

    return user;
};

export const update = async (id: number, updateValues: User): Promise<UnitUser | null> => {
    const userExists = await findOne(id);
    if (!userExists) {
        return null;
    }

    const salt = await bcrypt.genSalt(10);
    const newPass = updateValues.password ? 
        await bcrypt.hash(updateValues.password, salt) : 
        userExists.password;

    await pool.query(
        'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?',
        [updateValues.username, updateValues.email, newPass, id]
    );

    return findOne(id);
};

export const remove = async (id: number): Promise<boolean> => {
    const user = await findOne(id);
    if (!user) {
        return false;
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return true;
};