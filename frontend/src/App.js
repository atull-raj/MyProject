

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [dashboardData, setDashboardData] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for new transaction form
  const [newTransaction, setNewTransaction] = useState({
    userId: "",
    productId: "",
    transactionDate: "",
    totalAmount: "",
  });


  const API_URL = "http://localhost:5000/api";

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, usersRes, productsRes] = await Promise.all([
          axios.get(`${API_URL}/dashboard-data`),
          axios.get(`${API_URL}/users`),
          axios.get(`${API_URL}/products`),
        ]);
        setDashboardData(dashboardRes.data);
        setUsers(usersRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please check if backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Form Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/transactions`,
        newTransaction
      );
      console.log("New transaction added:", response.data);
     
      const updatedDashboardData = await axios.get(`${API_URL}/dashboard-data`);
      setDashboardData(updatedDashboardData.data);
      
      setNewTransaction({
        userId: "",
        productId: "",
        transactionDate: "",
        totalAmount: "",
      });
    } catch (err) {
      console.error("Error adding transaction:", err);
      alert("Failed to add transaction. Please check your input.");
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await axios.delete(`${API_URL}/transactions/${transactionId}`);
        console.log(`Transaction ${transactionId} deleted.`);
        
        setDashboardData((prevData) =>
          prevData.filter((item) => item.transaction_id !== transactionId)
        );
      } catch (err) {
        console.error("Error deleting transaction:", err);
        alert("Failed to delete transaction.");
      }
    }
  };

  if (loading) return <div>Loading dashboard data...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="App">
      <h1>User Dashboard</h1>

      
      <div className="add-transaction-section">
        <h2>Add New Transaction</h2>
        <form onSubmit={handleAddTransaction}>
          <label>
            User Name:
            <select
              name="userId"
              value={newTransaction.userId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.user_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Product Name:
            <select
              name="productId"
              value={newTransaction.productId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.product_id} value={product.product_id}>
                  {product.product_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Transaction Date:
            <input
              type="date"
              name="transactionDate"
              value={newTransaction.transactionDate}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Total Amount:
            <input
              type="number"
              name="totalAmount"
              value={newTransaction.totalAmount}
              onChange={handleInputChange}
              step="0.01"
              required
            />
          </label>
          <button type="submit">Add Transaction</button>
        </form>
      </div>

      <hr />

     
      <div className="dashboard-table-section">
        <h2>All Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Transaction Date</th>
              <th>Product Name</th>
              <th>Total Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.length > 0 ? (
              dashboardData.map((data) => (
                <tr key={data.transaction_id}>
                  <td>{data.user_name}</td>
                  <td>
                    {new Date(data.transaction_date).toLocaleDateString()}
                  </td>
                  <td>{data.product_name}</td>
                  <td>${parseFloat(data.total_amount).toFixed(2)}</td>
                  <td>
                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDeleteTransaction(data.transaction_id)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
