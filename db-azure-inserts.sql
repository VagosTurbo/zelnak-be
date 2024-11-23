-- Insert sample categories
INSERT INTO categories (name, parent_id)
VALUES
    ('Fruits', NULL),
    ('Vegetables', NULL),
    ('Citrus Fruits', 1),
    ('Leafy Vegetables', 2),
    ('Tomatoes', 2),
    ('Berries', 1);
GO