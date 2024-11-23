// backend2.0/models/attribute.js
import { poolPromise, sql } from '../config/database.js';

// Function to create a new attribute
export const dbCreateAttribute = async (newAttribute) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('name', sql.NVarChar, newAttribute.name)
        .input('is_required', sql.Bit, newAttribute.is_required)
        .input('category_id', sql.Int, newAttribute.category_id)
        .query('INSERT INTO attributes (name, is_required, category_id) VALUES (@name, @is_required, @category_id)');
    return { id: result.recordset[0].id, ...newAttribute };
};

// Function to get attributes by category ID
export const dbGetAttributesByCategoryId = async (categoryId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('category_id', sql.Int, categoryId)
        .query('SELECT * FROM attributes WHERE category_id = @category_id');
    return result.recordset;
};

// Function to update an attribute
export const dbUpdateAttribute = async (attributeId, updatedAttribute) => {
    const pool = await poolPromise;

    // Check if the updated name is unique within the same category
    const existingAttribute = await pool.request()
        .input('name', sql.NVarChar, updatedAttribute.name)
        .input('category_id', sql.Int, updatedAttribute.category_id)
        .input('attribute_id', sql.Int, attributeId)
        .query(`
            SELECT COUNT(*) AS count
            FROM attributes
            WHERE name = @name AND category_id = @category_id AND id != @attribute_id
        `);

    if (existingAttribute.recordset[0].count > 0) {
        throw new Error('Attribute name must be unique within the same category');
    }

    // Proceed with updating the attribute
    const result = await pool.request()
        .input('id', sql.Int, attributeId)
        .input('name', sql.NVarChar, updatedAttribute.name)
        .input('is_required', sql.Bit, updatedAttribute.is_required)
        .query(`
            UPDATE attributes
            SET name = @name, is_required = @is_required
            WHERE id = @id
        `);

    return { id: attributeId, ...updatedAttribute };
};

// Function to delete an attribute
export const dbDeleteAttribute = async (attributeId) => {
    const pool = await poolPromise;

    // Check if the attribute exists
    const existingAttribute = await pool.request()
        .input('id', sql.Int, attributeId)
        .query('SELECT * FROM attributes WHERE id = @id');

    if (existingAttribute.recordset.length === 0) {
        throw new Error('Attribute not found');
    }

    // Proceed with deleting the attribute
    await pool.request()
        .input('id', sql.Int, attributeId)
        .query('DELETE FROM attributes WHERE id = @id');

    return { message: 'Attribute deleted successfully', id: attributeId };
};
