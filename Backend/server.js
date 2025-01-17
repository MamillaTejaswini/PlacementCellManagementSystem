const authRoutes = require("./routes/auth");
//app.use("/api/auth", authRoutes);


require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
// Load environment variables
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define user schema and model
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

// Prepopulate the database
const seedUsers = async () => {
  const users = [
    { username: "student1", password: "password123" },
    { username: "student2", password: "mypassword" },
    { username: "student3", password: "12345" },
    { username: "student4", password: "password4" },
    { username: "student5", password: "mypasswor5" },
    { username: "student6", password: "password6" },
    { username: "student7", password: "password7" },
    { username: "student8", password: "password8" },
    { username: "student9", password: "password9" },
    { username: "student10", password: "password10" },
    { username: "student11", password: "password11" },
    { username: "student12", password: "password12" },
    { username: "student13", password: "password13" },
    { username: "student14", password: "password14" },
    { username: "student15", password: "password15" },
  ];

  for (const user of users) {
    const existingUser = await User.findOne({ username: user.username });
    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      await User.create({ username: user.username, password: hashedPassword });
    }
  }
};

seedUsers(); // Seed database

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid username or password" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid username or password" });

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


