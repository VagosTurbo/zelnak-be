import { dbGetAllOrders, dbGetOrderById, dbCreateOrder, dbUpdateOrder, dbDeleteOrder, dbGetOrdersByUserId } from '../models/order.js';

export const getAllOrders = async (req, res) => {
    try {
        const orders = await dbGetAllOrders();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const getOrderById = async (req, res) => {
    try {
        const order = await dbGetOrderById(req.params.id);
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const createOrder = async (req, res) => {
    const newOrder = {
        seller_id: req.body.seller_id,
        buyer_id: req.body.buyer_id,
        product_id: req.body.product_id,
        quantity: req.body.quantity,
    };
    try {
        await dbCreateOrder(newOrder);
        res.json({ message: "Order created successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const updateOrder = async (req, res) => {
    const updatedOrder = {
        seller_id: req.body.seller_id,
        buyer_id: req.body.buyer_id,
        product_id: req.body.product_id,
        quantity: req.body.quantity,
    };

    try {
        await dbUpdateOrder(req.params.id, updatedOrder);
        res.json({ message: "Order updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const deleteOrder = async (req, res) => {
    try {
        await dbDeleteOrder(req.params.id);
        res.json({ message: "Order deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const getOrdersByUserId = async (req, res) => {
    try {
        const orders = await dbGetOrdersByUserId(req.params.userId);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

