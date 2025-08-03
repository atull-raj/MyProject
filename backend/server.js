import "dotenv/config";
import express from "express";
import pg from "pg";
import cors from "cors";

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

pool.connect();

// pool.connect((err, client, release) => {
//   if (err) {
//     return console.log("error acquiring client", err.stack);
//   }
//   console.log("connected to postgreSQL database!");
// });

app.get("/api/dashboard-data", async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT 
            ui.user_name,
            ut.transaction_date,
            pm.product_name,
            ut.total_amount,
            ut.transaction_id,
            ui.user_id,
            pm.product_id
        FROM
            user_transaction as ut
        JOIN 
            user_information as ui ON ut.user_id = ui.user_id
        JOIN
            product_master as pm ON ut.product_id = pm.product_id
        ORDER BY
            ut.transaction_date DESC;
        `);

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id,user_name FROM user_information ORDER BY user_name;`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT product_id, product_name FROM product_master ORDER BY product_name;"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.post("/api/transactions", async (req, res) => {
  const { userId, productId, transactionDate, totalAmount } = req.body;
  try {
    const newTransaction = await pool.query(
      `INSERT INTO user_transaction (user_id, product_id, transaction_date, total_amount)
             VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, productId, transactionDate, totalAmount]
    );

    res.json(newTransaction.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteTransaction = await pool.query(
      "DELETE FROM user_transaction WHERE transaction_id = $1 RETURNING * ",
      [id]
    );
    if (deleteTransaction.rows.length === 0) {
      return res.status(404).json({ msg: "Transaction not found" });
    }
    res.json({
      msg: "transaction deleted",
      deleted_item: deleteTransaction.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Backend Server Running on port ${PORT}`);
});
