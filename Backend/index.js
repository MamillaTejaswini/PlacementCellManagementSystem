const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const UserModel = require("./models/Users");
const MsgSchema = require("./models/Messages");
const Job = require("./models/Jobs");
const Experience = require("./models/InterviewExperience");

const applicationRoutes = require("./routes/application");
const slotRoutes = require("./routes/slot");
const app = express();
//app.use(express.json());
// app.use(cors());
// ✅ 1. Allow CORS from localhost:3000 (React)
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ✅ 2. Increase payload size limit for JSON and form data (base64 resume is large!)
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

mongoose
  .connect("mongodb+srv://mamillatejaswini345:123@cluster0.5c68l.mongodb.net/?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));
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
   const newUser = new UserModel({ username, email, password, role: role || 'student' });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});
app.post("/api/users/login", async (req, res) => {
  try {
    const { usernameOrEmail, password, expectedRole } = req.body;

    // Check if the user exists (by username or email)
    const user = await UserModel.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // ✅ Restrict login by role
    if (expectedRole && user.role !== expectedRole) {
      return res.status(403).json({
        message: `Access denied. Expected role: ${expectedRole}, but found: ${user.role}`,
      });
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
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
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


app.post("/api/experience", async (req, res) => {
  try {
    const experience = new Experience(req.body);
    await experience.save();
    res.status(201).json({ message: "posted successfully!" });
  } catch (error) {
    console.error("Error posting:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Fetch all jobs
app.get("/api/experience", async (req, res) => {
  try {
    const experiences = await Experience.find();
    res.status(200).json(experiences);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});
app.get('/api/experience/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ObjectId (for MongoDB)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const experience = await Experience.findById(id);

    if (!experience) {
      return res.status(404).json({ error: 'not found' });
    }

    res.status(200).json(experience);
  } catch (error) {
    console.error('Error fetching:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/experience/:id', async (req, res) => {
  try {
    const { studentName, companyName, jobRole,experience,email,difficulty,rounds,problems,mode,experienceLevel,status,jobPackage,date } = req.body;
    const exp = await Experience.findByIdAndUpdate(
      req.params.id,
      { studentName, companyName, jobRole,experience,email,difficulty,rounds,problems,mode,experienceLevel,status,jobPackage,date},
      { new: true }
    );
    res.json(exp);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.delete('/api/experience/:id', async (req, res) => {
  try {
    await Experience.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post("/api/users/profile/store", async (req, res) => {
  try {
    console.log("📥 Incoming Profile Data:", req.body);

    const {
      email, firstName, lastName, regNo, phone, dob,
      semester, branch, sslc, diploma, backlogs, skills,
      resume, location
    } = req.body;

    // Find the user
    const user = await UserModel.findOne({ email });
    if (!user) {
      console.error("❌ User not found for email:", email);
      return res.status(404).json({ message: "User not found" });
    }

    // Validations
    const sanitizedPhone = /^\d{10}$/.test(phone) ? phone : "Not set";
    const validBacklogs = /^\d+$/.test(backlogs) ? backlogs : "Not set";
    const dateOfBirth = dob ? new Date(dob).toISOString().split('T')[0] : "Not set";
    const processedSkills = Array.isArray(skills) ? skills : (skills ? [skills] : ["Not set"]);

    // Set profile fields
    user.profile = {
      firstName: firstName || "Not set",
      lastName: lastName || "Not set",
      regNo: regNo || "Not set",
      phone: sanitizedPhone,
      dateOfBirth,
      currentSemester: semester || "Not set",
      branchOfStudy: branch || "Not set",
      sslcAggregate: sslc || "Not set",
      diplomaOr12thAggregate: diploma || "Not set",
      historyOfBacklogs: validBacklogs,
      skills: processedSkills,
      resume: resume || "Not set",
      location: location || "Not set"
    };

    await user.save();
    console.log("✅ Profile updated successfully for:", email);

    res.status(200).json({
      message: "Profile updated successfully",
      user
    });


  } catch (error) {
    console.error("🔥 Error while updating profile:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
});

app.get("/api/users/email/:email", async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});
app.use('/api/slots', slotRoutes);
app.use("/api/applications", applicationRoutes);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

