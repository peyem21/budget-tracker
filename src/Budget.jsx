import React, { useState, useEffect } from "react";
import { MdDelete } from "react-icons/md";
import { BsToggle2Off } from "react-icons/bs";
import { BsToggle2On } from "react-icons/bs";
import { IoClose } from "react-icons/io5";

// import { Pie } from 'react-chartjs-2';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Budget() {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const [categories, setCategories] = useState([
    "Food",
    "Transport",
    "Entertainment",
    "Utilities",
    "Health",
    "Salary",
    "Other",
  ]);
  const [newCategory, setNewCategory] = useState("");

  const [editTransaction, setEditTransaction] = useState(null);
  const [theme, setTheme] = useState("light");

  // Load transactions and balance from local storage when component mounts
  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem("transactions"));
    const storedBalance = parseFloat(localStorage.getItem("balance"));

    if (storedTransactions) setTransactions(storedTransactions);
    if (!isNaN(storedBalance)) setBalance(storedBalance);
  }, []);

  // Save transactions and balance to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("balance", balance.toString());
  }, [transactions, balance]);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);

    const storedCategories = JSON.parse(localStorage.getItem("categories"));
    if (storedCategories) setCategories(storedCategories);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [theme, categories]);

  const handleAddTransaction = (e) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (description.trim() === "" || isNaN(parsedAmount) || category === "") {
      alert("Please enter description, amount, and select a category.");
      return;
    }
    if (!description || !amount || !category) {
      toast.error("Please fill all fields");
      return;
    }
    const newTransaction = {
      id: Date.now(),
      description: description.trim(),
      amount: parsedAmount,
      category,
      type: parsedAmount >= 0 ? "income" : "expense",
    };

    setTransactions((prev) => [...prev, newTransaction]);
    setBalance((prev) => prev + parsedAmount);
    setDescription("");
    setAmount("");
    setCategory("");
    toast.success("Transaction added successfully!");
  };

  const removeTransaction = (id) => {
    const transactionToRemove = transactions.find(
      (transaction) => transaction.id === id
    );
    const updatedTransactions = transactions.filter(
      (transaction) => transaction.id !== id
    );
    setTransactions(updatedTransactions);

    if (transactionToRemove) {
      setBalance((prev) => prev - transactionToRemove.amount);
    }
  };

  // Calculate the summary by category
  const categorySummary = transactions.reduce((summary, transaction) => {
    if (transaction.category) {
      if (!summary[transaction.category]) {
        summary[transaction.category] = 0;
      }
      summary[transaction.category] += transaction.amount;
    }
    return summary;
  }, {});

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    if (categories.includes(newCategory.trim())) {
      toast.error("This category already exists");
      return;
    }
    setCategories((prev) => [...prev, newCategory.trim()]);
    setNewCategory("");
    toast.success("Category added successfully!");
  };

  const removeCategory = (categoryToRemove) => {
    setCategories((prev) =>
      prev.filter((category) => category !== categoryToRemove)
    );
  };

  const categoryData = transactions.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: [
          "#ff6384",
          "#36a2eb",
          "#cc65fe",
          "#ffce56",
          "#ffa726",
          "#66bb6a",
          "#29b6f6",
        ],
      },
    ],
  };

  const startEditTransaction = (transaction) => {
    setEditTransaction(transaction);
    setDescription(transaction.description);
    setAmount(transaction.amount);
    setCategory(transaction.category);
  };
  const saveEditTransaction = (e) => {
    e.preventDefault();
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === editTransaction.id
          ? { ...t, description, amount: parseFloat(amount), category }
          : t
      )
    );
    setEditTransaction(null);
    setDescription("");
    setAmount("");
    setCategory("");
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div
      // style={theme === "light" ? styles.containerLight : styles.containerDark}
      className={`container ${theme === "light" ? "light" : "dark"}`}
    >
      <h1>Simple Budget Tracker</h1>
      <h2>Current Balance: ${balance.toFixed(2)}</h2>
      <ToastContainer />
      <button onClick={toggleTheme} className="theme-button p-2">
        {theme === "light" ? <BsToggle2Off /> : <BsToggle2On />}
      </button>
      {/* Transaction Form */}
      <form onSubmit={handleAddTransaction} className="form">
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={styles.input}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={styles.select}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button type="submit" className="form button">
          Add Transaction
        </button>
      </form>
      Add Category Form
      <form onSubmit={handleAddCategory} className="add-category-form input">
        <input
          type="text"
          placeholder="New Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button type="submit" className="add-button">
          Add Category
        </button>
      </form>
      {/* Render categories */}
      <ul className="transaction-list">
        {categories.map((category) => (
          <li key={category} className="transaction-item">
            {category}
            <button
              onClick={() => removeCategory(category)}
              className="delete-button"
            >
              <IoClose />
            </button>
          </li>
        ))}
      </ul>
      {/* Transactions List */}
      <h2>Transactions</h2>
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id} className="transaction-item">
            {transaction.description}: ${transaction.amount.toFixed(2)} (
            {transaction.category})
            <div>
              <button onClick={() => removeTransaction(transaction.id)}>
                <MdDelete />
              </button>
              <button
                onClick={() => startEditTransaction(transaction)}
                className="edit-button"
              >
                Edit
              </button>
            </div>
          </li>
        ))}
      </ul>
      {/* Category Summary */}
      <h2>Summary by Category</h2>
      <ul className="summary-list">
        {Object.keys(categorySummary).map((cat) => (
          <li key={cat} className="summary-item">
            {cat}: ${categorySummary[cat].toFixed(2)}
          </li>
        ))}
      </ul>
      {/* <Pie data={chartData} /> */}
    </div>
  );
}

// Simple inline styles for better presentation
const styles = {
  containerLight: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#fff",
    color: "#000",
    position: "relative",
  },

  containerDark: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#333",
    color: "#fff",
    position: "relative",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    margin: "5px 0",
    fontSize: "16px",
  },
  select: {
    padding: "10px",
    margin: "5px 0",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    marginTop: "10px",
    fontSize: "16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  list: {
    listStyle: "none",
    padding: "0",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    borderBottom: "1px solid #ccc",
  },
  deleteButton: {
    background: "none",
    border: "none",
    color: "red",
    cursor: "pointer",
    fontSize: "20px",
  },
  summaryList: {
    listStyle: "none",
    padding: "0",
  },
  summaryItem: {
    padding: "5px 0",
  },
};
