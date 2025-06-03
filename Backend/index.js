const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const UserModel = require("./models/Users");
const MsgSchema = require("./models/Messages");
const Job = require("./models/Jobs");
const Experience = require("./models/InterviewExperience");


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
    const { studentName, companyName, jobRole,experience,email } = req.body;
    const exp = await Experience.findByIdAndUpdate(
      req.params.id,
      { studentName, companyName, jobRole,experience,email},
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
    const { email, firstName, lastName, regNo, phone, dateOfBirth, currentSemester, branchOfStudy, skills, resume } = req.body;

    let user = await UserModel.findOne({ email });

    if (user) {
      // Ensure `profile` exists inside user
      if (!user.profile) {
        user.profile = {};
      }

      // Update user.profile instead of user directly
      user.profile.firstName = firstName;
      user.profile.lastName = lastName;
      user.profile.regNo = regNo;
      user.profile.phone = phone;
      user.profile.dateOfBirth = dateOfBirth;
      user.profile.currentSemester = currentSemester;
      user.profile.branchOfStudy = branchOfStudy;
      user.profile.skills = skills;
      user.profile.resume = resume;

      await user.save();
      return res.status(200).json({ message: "Profile updated successfully", user });
    }

    // Create a new user with profile
    user = new UserModel({
      email,
      profile: {
        firstName,
        lastName,
        regNo,
        phone,
        dateOfBirth,
        currentSemester,
        branchOfStudy,
        skills,
        resume,
      }
    });

    await user.save();
    res.status(201).json({ message: "Profile saved successfully", user });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ message: "Internal server error", error });
  }
});


// Get User Profile by ID
app.get("/api/users/profile/:id", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Update User Profile
app.put("/api/users/profile/:id", async (req, res) => {
  try {
    const { username, email, role } = req.body;
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { username, email, role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Delete User Profile
app.delete("/api/users/profile/:id", async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// app.put("/api/users/profile", async (req, res) => {
//   try {
//     const {firstName, lastName, regNo, phone, email, dateOfBirth, currentSemester, branchOfStudy, sslcAggregate, diplomaOr12thAggregate, historyOfBacklogs, skills, resume} = req.body;

//     // Find user by email and update profile
//     const updatedUser = await UserModel.findOneAndUpdate(
//       { email },
//       {
//       $set: { 
//         "profile.firstName": firstName,
// "profile.lastName": lastName,
// "profile.regNo": regNo,
// "profile.phone": phone,
// "profile.email": email,
// "profile.dateOfBirth": dateOfBirth,
// "profile.currentSemester": currentSemester,
// "profile.branchOfStudy": branchOfStudy,
// "profile.sslcAggregate": sslcAggregate,
// "profile.diplomaOr12thAggregate": diplomaOr12thAggregate,
// "profile.historyOfBacklogs": historyOfBacklogs,
// "profile.skills": skills,
// "profile.resume": resume

//       }
//     },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({ message: "Profile updated successfully", profile: updatedUser.profile });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error", error });
//   }
// });
// app.put("/api/users/profile/update", async (req, res) => {
//   const { firstName, lastName, regNo, phone, email, dateOfBirth, currentSemester, branchOfStudy, sslcAggregate, diplomaOr12thAggregate, historyOfBacklogs, skills, resume
//   } = req.body;
//   try {
//     const updatedUser = await UserModel.findOneAndUpdate(
//       { email },
//       { firstName, lastName, regNo, phone, email, dateOfBirth, currentSemester, branchOfStudy, sslcAggregate, diplomaOr12thAggregate, historyOfBacklogs, skills, resume
//       },
//       { new: true }
//     );
//     res.status(200).json(updatedUser);
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error", error });
//   }
// });

// app.get("/api/users/profile/:email", async (req, res) => {
//   try {
//     const { email } = req.params;

//     const user = await UserModel.findOne({ email }, "profile");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json(user.profile);
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error", error });
//   }
// });
// // app.post("/api/users/profile/store", async (req, res) => {
// //   try {
// //     console.log("Received Data:", req.body); // Log request data
// //     const { email } = req.body;

// //     if (!email) {
// //       return res.status(400).json({ message: "Email is required" });
// //     }

// //     let user = await UserModel.findOne({ email });

// //     if (user) {
// //       // Use findOneAndUpdate for atomic update
// //       user = await UserModel.findOneAndUpdate(
// //         { email },
// //         { $set: req.body },
// //         { new: true, runValidators: true }
// //       );
// //       return res.json({ message: "Profile updated successfully", user });
// //     } else {
// //       const newUser = new UserModel(req.body);
// //       await newUser.save();
// //       return res.json({ message: "Profile created successfully", newUser });
// //     }
// //   } catch (error) {
// //     console.error("Error saving profile:", error);
// //     res.status(500).json({ message: "Server error", error: error.message });
// //   }
// // });

// // app.post("/api/users/profile/store", async (req, res) => {
// //   try {
// //     console.log("Received Data:", req.body); // Log request data
// //     const { email, firstName, lastName, usn, phone, dob, semester, branch, sslc, diploma, backlogs, resume, skills } = req.body;
// //     if (!email) {
// //       return res.status(400).json({ message: "Email is required" });
// //     }

// //     let user = await UserModel.findOne({ email });

// //     if (user) {
// //       user.set(req.body);
// //       await user.save();
// //       return res.json({ message: "Profile updated successfully", user });
// //     } else {
// //       const newUser = new User(req.body);
// //       await newUser.save();
// //       return res.json({ message: "Profile created successfully", newUser });
// //     }
// //   } catch (error) {
// //     console.error("Error saving profile:", error);
// //     res.status(500).json({ message: "Server error", error: error.message });
// //   }
// // });
// // app.post("/api/users/profile/store", async (req, res) => {
// //   try {
// //     console.log("Received Data:", req.body);

// //     const { email, firstName, lastName, regNo, phone, dateOfBirth, currentSemester, 
// //             branchOfStudy, sslcAggregate, diplomaOr12thAggregate, historyOfBacklogs, 
// //             skills, resume } = req.body;

// //     if (!email) {
// //       return res.status(400).json({ message: "Email is required" });
// //     }

// //     let user = await UserModel.findOne({ email });

// //     if (user) {
// //       user.profile.set({
// //         firstName, lastName, regNo, phone, dateOfBirth, currentSemester, 
// //         branchOfStudy, sslcAggregate, diplomaOr12thAggregate, historyOfBacklogs, 
// //         skills, resume
// //       });
// //       await user.profile.save();
// //       return res.json({ message: "Profile updated successfully", user });
// //     } else {
// //       return res.status(404).json({ message: "User not found" });
// //     }
// //   } catch (error) {
// //     console.error("Error saving profile:", error);
// //     res.status(500).json({ message: "Server error", error: error.message });
// //   }
// // });

// app.post("/api/users/profile/store", async (req, res) => {
//   try {
//     console.log("Received Data:", req.body);

//     const { email, firstName, lastName, regNo, phone, dateOfBirth, currentSemester, 
//             branchOfStudy, sslcAggregate, diplomaOr12thAggregate, historyOfBacklogs, 
//             skills, resume } = req.body;

//     if (!email) {
//       return res.status(400).json({ message: "Email is required" });
//     }

//     let user = await UserModel.findOne({ email });

//     if (user) {
//       if (!user.profile) {
//         user.profile = {}; // Initialize profile if it doesn't exist
//       }
      
//       user.profile.set({
//         firstName, lastName, regNo, phone, dateOfBirth, currentSemester, 
//         branchOfStudy, sslcAggregate, diplomaOr12thAggregate, historyOfBacklogs, 
//         skills, resume
//       });

//       await user.save();  // ✅ Save the entire user document

//       return res.json({ message: "Profile updated successfully", user });
//     } else {
//       return res.status(404).json({ message: "User not found" });
//     }
//   } catch (error) {
//     console.error("Error saving profile:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });



app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

