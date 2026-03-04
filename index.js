const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

// User Model
const User = mongoose.model("User", userSchema);

app.get("/api/users", async (req, res) => {
  try {
    const sortOrder = req.query.order === "desc" ? -1 : 1;

    const users = await User.find()
      .collation({ locale: "en", strength: 2 })
      .sort({ name: sortOrder });

    res.json({ message: users });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const newUser = new User({ name });
    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE user by ID
app.delete("/api/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
