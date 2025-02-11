const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const UserModel = require("./models/Users");
const MsgSchema = require("./models/Messages");
const Job = require("./models/Jobs");


const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect("mongodb+srv://mamillatejaswini345:123@cluster0.5c68l.mongodb.net/?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// User Registration
app.post("/api/users/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if username or email already exists
    const existingUser = await UserModel.findOne({
      $or: [{ username: username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the user
    const newUser = new UserModel({ username, email, password: hashedPassword, role: role || 'student' });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// User Login
app.post("/api/users/login", async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    // Check if the user exists (by username or email)
    const user = await UserModel.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Successful login - Return user details and role
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role, // Include the role in the response
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});
 app.post("/api/messages/contact", async (req, res) => {
  try {
     const { name, email, subject } = req.body;
     const newMsg = new MsgSchema({ name, email, subject });
    await newMsg.save();
    res.status(201).json({ message: "Succesfully sent" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});



// Fetch all messages
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await MsgSchema.find(); // Fetch all messages
    res.status(200).json(messages); // Return messages in JSON format
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});
app.delete('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Delete the message from the database
    const deletedMessage = await MsgSchema.findByIdAndDelete(id);
    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.status(200).json({ message: 'Message deleted successfully!' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const nodemailer = require("nodemailer");

// Send email route
app.post("/api/messages/send-email", async (req, res) => {
  const { email, response } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "mamillatejaswini345@gmail.com", // Replace with your email
        pass: "wrmb uxof uwmb ubeu", // Replace with your email password or app password
      },
    });

    const mailOptions = {
      from: "mamillatejaswini345@gmail.com",
      to: email,
      subject: "Response from Admin-Placement cell ",
      text: response,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email", error });
  }
});

app.post("/api/jobs", async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json({ message: "Job posted successfully!" });
  } catch (error) {
    console.error("Error posting job:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Fetch all jobs
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ObjectId (for MongoDB)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid Job ID' });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.status(200).json(job);
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/jobs/:id', async (req, res) => {
  try {
    const { jobTitle, companyName, role, description, eligibility, applyLink } = req.body;
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { jobTitle, companyName, role, description, eligibility, applyLink },
      { new: true }
    );
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.delete('/api/jobs/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

