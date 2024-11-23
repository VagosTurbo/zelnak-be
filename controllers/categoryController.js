// backend2.0/controllers/categoryController.js
import { dbGetAllCategories, dbGetCategoryById, dbCreateCategory, dbGetCategoryHierarchy } from "../models/category.js";
import { poolPromise, sql } from '../config/database.js';

export const getAllCategories = async (req, res) => {
    try {
        const categories = await dbGetAllCategories();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const getCategoryById = async (req, res) => {
    try {
        const category = await dbGetCategoryById(req.params.id);
        res.json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


export const createCategory = async (req, res) => {
    const newCategory = {
        name: req.body.name,
        parent_id: req.body.parent_id,
        is_approved: 0
    };
    // Attributes are expected to be an array of objects
    const attributes = req.body.attributes || [];  // Default to empty array if no attributes

    const pool = await poolPromise;  // Use the existing connection pool
    const transaction = new sql.Transaction(pool); // Start a transaction

    try {
        // Begin the transaction
        await transaction.begin();

        // Check if the category with the same name already exists
        const existingCategory = await transaction.request()
            .input('name', sql.NVarChar, newCategory.name)
            .query('SELECT COUNT(*) AS count FROM categories WHERE name = @name');

        if (existingCategory.recordset[0].count > 0) {
            throw new Error('Category name must be unique');
        }

        // 1. Create the category and get its ID
        const categoryId = await dbCreateCategory(newCategory, transaction);

        // 2. Create attributes if provided
        if (attributes.length > 0) {
            for (let attribute of attributes) {
                await transaction.request()
                    .input('name', sql.NVarChar, attribute.name)
                    .input('is_required', sql.Bit, attribute.is_required)
                    .input('category_id', sql.Int, categoryId)
                    .query(`
                        INSERT INTO attributes (name, is_required, category_id)
                        VALUES (@name, @is_required, @category_id)
                    `);
            }
        }

        // Commit the transaction after both operations
        await transaction.commit();

        // Return success response with category and its attributes
        res.json({
            message: "Category and attributes created successfully"
        });

    } catch (err) {
        // Rollback the transaction in case of any error
        await transaction.rollback();
        console.error('Error creating category and attributes:', err);
        res.status(500).json({ error: 'Failed to create category and attributes. Please try again later.' });
    }
};

export const updateCategory = async (req, res) => {
    const categoryId = req.params.id;  // Get category ID from the URL parameters
    const updatedCategory = {
        name: req.body.name,
        parent_id: req.body.parent_id,
        is_approved: req.body.is_approved || 0  // Default to 0 if not provided
    };

    // Attributes are expected to be an array of objects
    const attributes = req.body.attributes || [];  // Default to empty array if no attributes

    const pool = await poolPromise;  // Use the existing connection pool
    const transaction = new sql.Transaction(pool); // Start a transaction

    try {
        // Begin the transaction
        await transaction.begin();

        // 1. Check if the name is unique (only if the name has changed)
        const existingCategory = await transaction.request()
            .input('name', sql.NVarChar, updatedCategory.name)
            .input('category_id', sql.Int, categoryId)  // Exclude current category
            .query(`
                SELECT COUNT(*) AS count
                FROM categories
                WHERE name = @name AND id != @category_id
            `);

        if (existingCategory.recordset[0].count > 0) {
            throw new Error('Category name must be unique');
        }

        // 2. Update the category
        const result = await transaction.request()
            .input('name', sql.NVarChar, updatedCategory.name)
            .input('parent_id', sql.Int, updatedCategory.parent_id)
            .input('is_approved', sql.Bit, updatedCategory.is_approved)
            .input('id', sql.Int, categoryId)
            .query(`
                UPDATE categories
                SET name = @name, parent_id = @parent_id, is_approved = @is_approved
                WHERE id = @id
            `);

        // 3. Optionally, update attributes if provided
        if (attributes.length > 0) {
            for (let attribute of attributes) {
                await transaction.request()
                    .input('name', sql.NVarChar, attribute.name)
                    .input('is_required', sql.Bit, attribute.is_required)
                    .input('category_id', sql.Int, categoryId)
                    .query(`
                        INSERT INTO attributes (name, is_required, category_id)
                        VALUES (@name, @is_required, @category_id)
                    `);
            }
        }

        // Commit the transaction after both operations
        await transaction.commit();

        // Return success response with updated category and attributes
        res.json({
            message: "Category and attributes updated successfully",
            category: {
                id: categoryId,
                name: updatedCategory.name,
                parent_id: updatedCategory.parent_id,
                is_approved: updatedCategory.is_approved,
                attributes: attributes  // Include the attributes in the response if needed
            }
        });

    } catch (err) {
        // Rollback the transaction in case of any error
        await transaction.rollback();
        console.error('Error updating category and attributes:', err);
        res.status(500).json({ error: err.message || 'Failed to update category and attributes. Please try again later.' });
    }
};

export const deleteCategory = async (req, res) => {
    const categoryId = req.params.id;  // Get category ID from URL parameters
    const pool = await poolPromise;  // Use the existing connection pool
    const transaction = new sql.Transaction(pool); // Start a transaction

    try {
        // Begin the transaction
        await transaction.begin();

        // 1. Check if the category exists
        const category = await transaction.request()
            .input('id', sql.Int, categoryId)
            .query('SELECT * FROM categories WHERE id = @id');

        if (category.recordset.length === 0) {
            throw new Error('Category not found');
        }

        // 2. Delete associated attributes
        await transaction.request()
            .input('category_id', sql.Int, categoryId)
            .query('DELETE FROM attributes WHERE category_id = @category_id');

        // 3. Delete the category
        await transaction.request()
            .input('id', sql.Int, categoryId)
            .query('DELETE FROM categories WHERE id = @id');

        // Commit the transaction after both operations
        await transaction.commit();

        // Return success response
        res.json({
            message: "Category and its attributes deleted successfully",
            categoryId
        });

    } catch (err) {
        // Rollback the transaction in case of any error
        await transaction.rollback();
        console.error('Error deleting category and attributes:', err);
        res.status(500).json({ error: err.message || 'Failed to delete category and attributes. Please try again later.' });
    }
};


export const getCategoryHierarchy = async (req, res) => {
    try {
        const hierarchy = await dbGetCategoryHierarchy(req.params.categoryId);
        res.json(hierarchy);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}