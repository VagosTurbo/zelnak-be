// backend2.0/models/category.js
import { poolPromise, sql } from '../config/database.js';

export const dbGetAllCategories = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM categories');
    return result.recordset;
};

export const dbGetCategoryById = async (id) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM categories WHERE id = @id');
    return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const dbCreateCategory = async (newCategory, transaction) => {
    const result = await transaction.request()
        .input('name', sql.NVarChar, newCategory.name)
        .input('parent_id', sql.Int, newCategory.parent_id)
        .input('is_approved', sql.Bit, newCategory.is_approved)
        .query(`
            INSERT INTO categories (name, parent_id, is_approved)
            OUTPUT INSERTED.id
            VALUES (@name, @parent_id, @is_approved)
        `);

    return result.recordset[0].id;  // return category id
};



export const dbGetCategoryHierarchy = async (categoryId) => {
    const pool = await poolPromise;
    let category = await dbGetCategoryById(categoryId);
    const hierarchy = [];

    while (category) {
        hierarchy.unshift(category);
        category = category.parent_id ? await dbGetCategoryById(category.parent_id) : null;
    }

    return hierarchy;
};