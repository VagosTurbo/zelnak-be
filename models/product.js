import { poolPromise, sql } from '../config/database.js';

export const dbGetAllProducts = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM products');
    return result.recordset; // Returning the rows from the query
};

export const dbGetProductById = async (id) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('id', sql.Int, id) // Binding the id parameter
        .query('SELECT * FROM products WHERE id = @id');
    return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const dbGetProductsByCategory = async (categoryId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('categoryId', sql.Int, categoryId) 
        .query('SELECT * FROM products WHERE category_id = @categoryId');
    return result.recordset; // Returning the rows from the query
};

export const dbCreateProduct = async (newProduct) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('name', sql.NVarChar, newProduct.name)
        .input('price', sql.Decimal, newProduct.price)
        .input('description', sql.NVarChar, newProduct.description)
        .input('user_id', sql.Int, newProduct.user_id)
        .input('category_id', sql.Int, newProduct.category_id)
        .input('image', sql.NVarChar, newProduct.image)
        .query('INSERT INTO products (name, price, description, user_id, image, category_id) VALUES (@name, @price, @description, @user_id, @image, @category_id); SELECT SCOPE_IDENTITY() AS id');
        return { id: result.rowsAffected, ...newProduct }; // Returning the insertId and newProduct
};

export const dbUpdateProduct = async (id, updatedProduct) => {
    if (!id || Object.keys(updatedProduct).length === 0) {
        throw new Error("Invalid input: ID and at least one field to update are required.");
    }

    const pool = await poolPromise;
    const result = await pool.request()
        .input('name', sql.NVarChar, updatedProduct.name)
        .input('price', sql.Decimal, updatedProduct.price)
        .input('description', sql.NVarChar, updatedProduct.description)
        .input('user_id', sql.Int, updatedProduct.user_id)
        .input('image', sql.NVarChar, updatedProduct.image)
        .input('category_id', sql.Int, updatedProduct.category_id)
        .query('UPDATE products SET name = @name, price = @price, description = @description, user_id = @user_id, image = @image, category_id = @category_id WHERE id = @id');
    return result.rowsAffected > 0; // Returns true if rows were affected
};



export const dbDeleteProduct = async (id) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM products WHERE id = @id');
    return result.rowsAffected > 0; // Returns true if rows were affected
};
