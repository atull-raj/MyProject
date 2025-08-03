-- db.sql

CREATE TABLE user_information (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    user_phone_number VARCHAR(20)
);

CREATE TABLE product_master (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL
);

CREATE TABLE user_transaction (
    transaction_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES user_information(user_id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    product_id INT REFERENCES product_master(product_id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL
);

-- Optional: Sample Data (testing ke liye)
INSERT INTO user_information (user_name, user_phone_number) VALUES
('Rohan Sharma', '9876543210'),
('Priya Singh', '9988776655');

INSERT INTO product_master (product_name) VALUES
('Laptop'),
('Mouse'),
('Keyboard');

INSERT INTO user_transaction (user_id, transaction_date, product_id, total_amount) VALUES
(1, '2023-01-15', 1, 75000.00),
(2, '2023-01-16', 2, 800.00),
(1, '2023-02-20', 3, 1500.00),
(2, '2023-03-01', 1, 60000.00);
