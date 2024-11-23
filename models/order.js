import { poolPromise, sql } from '../config/database.js';

export const dbGetAllOrders = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM orders');
    return result.recordset;
};

export const dbGetOrderById = async (id) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM orders WHERE id = @id');
    return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const dbCreateOrder = async (newOrder) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input('seller_id', sql.Int, newOrder.seller_id)
        .input('buyer_id', sql.Int, newOrder.buyer_id)
        .input('product_id', sql.Int, newOrder.product_id)
        .input('quantity', sql.Int, newOrder.quantity)
        .query(
            'INSERT INTO orders (seller_id, buyer_id, product_id, quantity) OUTPUT Inserted.id VALUES (@seller_id, @buyer_id, @product_id, @quantity)'
        );
    return { id: result.recordset[0].id, ...newOrder };
};

export const dbUpdateOrder = async (id, updatedOrder) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input('id', sql.Int, id)
        .input('seller_id', sql.Int, updatedOrder.seller_id)
        .input('buyer_id', sql.Int, updatedOrder.buyer_id)
        .input('product_id', sql.Int, updatedOrder.product_id)
        .input('quantity', sql.Int, updatedOrder.quantity)
        .query(
            'UPDATE orders SET seller_id = @seller_id, buyer_id = @buyer_id, product_id = @product_id, quantity = @quantity WHERE id = @id'
        );
    return result.rowsAffected[0] > 0;
};

export const dbDeleteOrder = async (id) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input('id', sql.Int, id)
        .query('DELETE FROM orders WHERE id = @id');
    return result.rowsAffected[0] > 0;
};

export const dbGetOrdersByUserId = async (userId) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query('SELECT * FROM orders WHERE user_id = @userId');
    return result.recordset;
};
