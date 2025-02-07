import { Product, UnitProduct } from "./product.interface";
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'api_database',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const findAll = async (): Promise<UnitProduct[]> => {
    const [rows] = await pool.query('SELECT * FROM products');
    return rows as UnitProduct[];
};

export const findOne = async (id: number): Promise<UnitProduct | null> => {
    const [rows]: any = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0] || null;
};

export const create = async (productInfo: Product): Promise<UnitProduct | null> => {
    const [result]: any = await pool.query(
        'INSERT INTO products (name, price, quantity, image) VALUES (?, ?, ?, ?)',
        [productInfo.name, productInfo.price, productInfo.quantity, productInfo.image]
    );

    const product: UnitProduct = {
        id: result.insertId,
        ...productInfo
    };

    return product;
};

export const update = async (id: number, updateValues: Product): Promise<UnitProduct | null> => {
    const productExists = await findOne(id);
    if (!productExists) {
        return null;
    }

    await pool.query(
        'UPDATE products SET name = ?, price = ?, quantity = ?, image = ? WHERE id = ?',
        [updateValues.name, updateValues.price, updateValues.quantity, updateValues.image, id]
    );

    return findOne(id);
};

export const remove = async (id: number): Promise<boolean> => {
    const product = await findOne(id);
    if (!product) {
        return false;
    }

    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return true;
};