import { dbGetAllProducts, dbGetProductById, dbCreateProduct, dbUpdateProduct, dbDeleteProduct } from "../models/product.js";
import { dbGetUserById, dbUpdateUser } from "../models/user.js";
import { dbGetCategoryById } from "../models/category.js";
import { Roles } from "../enums/roles.js";

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const products = await dbGetAllProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Failed to retrieve products: " + err.message });
    }
};

// Get product by ID
export const getProductById = async (req, res) => {
    try {
        const productId = req.params.id;

        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        const product = await dbGetProductById(productId);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json(product);
    } catch (err) {
        res.status(500).json({ error: "Failed to retrieve product: " + err.message });
    }
};

// Create a new product
export const createProduct = async (req, res) => {
    try {
        const { name, price, description, user_id, image, category_id } = req.body;

        // Validate required fields
        if (!user_id || !price || !name || !category_id) {
            return res.status(400).json({ error: "Name, price, category, and user_id are required" });
        }
        
        // Check if user exists
        const user = await dbGetUserById(user_id);
        if (!user) {
            return res.status(400).json({ error: "User ID doesn't exist" });
        }

        // Check if category exists
        const category = await dbGetCategoryById(category_id);
        if (!category) {
            return res.status(400).json({ error: "Category doesn't exist" });
        }

        // Set default image if not provided
        const imageUrl = image || "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";

        // Create product
        const productCreated = await dbCreateProduct({ 
            name, 
            price, 
            description, 
            user_id, 
            image: imageUrl, 
            category_id 
        });

        if (productCreated) {

             // Check if user's current role is Registered
             if (user.role === Roles.Registered) {
                // Update user role to Farmer
                const roleUpdated = await dbUpdateUser(user_id, { role: Roles.Farmer });
                if (roleUpdated) {
                    return res.status(201).json({ 
                        message: "Product created successfully, user role updated to Farmer" 
                    });
                } else {
                    return res.status(500).json({ 
                        error: "Product created, but failed to update user role to Farmer" 
                    });
                }
            }

            res.status(201).json({ message: "Product created successfully" });
        } else {
            res.status(500).json({ error: "Failed to create product" });
        }
    } catch (err) {
        res.status(400).json({ error: "Failed to create product: " + err.message });
    }
};


// Update a product
export const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedProduct = {};

        // Check if any of the forbidden fields are included in the update request
        if (req.body.created_at || req.body.user_id) {
            return res.status(400).json({ error: "Cannot update 'created_at' or 'user_id' fields" });
        }

        // Add the allowed fields to updatedProduct object
        if (req.body.name) updatedProduct.name = req.body.name;
        if (req.body.price) updatedProduct.price = req.body.price;
        if (req.body.description) updatedProduct.description = req.body.description;
        if (req.body.image) updatedProduct.image = req.body.image;

        // Ensure that at least one valid field is provided for the update
        if (Object.keys(updatedProduct).length === 0) {
            return res.status(400).json({ error: "At least one field is required to update" });
        }

        // Check if the product exists
        const existingProduct = await dbGetProductById(productId);
        if (!existingProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Update the product in the database
        const productUpdated = await dbUpdateProduct(productId, updatedProduct);

        if (productUpdated) {
            res.json({ message: "Product updated successfully" });
        } else {
            res.status(500).json({ error: "Failed to update product" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to update product: " + err.message });
    }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        const existingProduct = await dbGetProductById(productId);

        if (!existingProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Proceed with deleting the product
        await dbDeleteProduct(productId);

        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete product: " + err.message });
    }
};

