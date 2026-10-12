// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const db = require("./config/db");
// const projectRoutes = require("./routes/projectRoutes");
// const reckonerRoutes = require("./routes/reckonerRoutes");
// const sheetRoutes = require("./routes/sheetRoutes");
// const authRoutes = require("./routes/authRoute")
// const materialRoutes = require("./routes/materialRoutes")
// const expenseRoutes = require("./routes/expenseRoutes")
// const SiteInchargeRoutes = require("./routes/SiteInchargeRoutes")
// const adminRoutes = require("./routes/adminRoutes")
// const supplyRoutes = require("./routes/supplyRoutes")
// const notificationRoutes = require("./routes/notificationRoutes")
// const projectionRoutes = require("./routes/projectionRoutes")
// const financeRoutes = require("./routes/financeRoutes")
// const resourceRoutes = require("./routes/resourceRoutes")

// const app = express();

// // Middleware
// app.use(express.json());

// // Configure CORS
// const corsOptions = {
//     origin: ["http://localhost:5173", "http://localhost:5174", "https://scpl.kggeniuslabs.com","http://192.168.253.187:5173","http://192.168.252.101:5173"], // Allowed frontend origins
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allowed HTTP methods
//     allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
//     credentials: true, // Allow cookies and authorization headers
// };

// app.use(cors(corsOptions));

// // Check DB connection before starting server
// const startServer = async () => {
//     try {
//         await db.query("SELECT 1");
//         console.log("Database connected successfully");
        
//         app.use("/auth",authRoutes)
//         app.use("/project", projectRoutes);
//         app.use("/reckoner",reckonerRoutes);
//         app.use("/sheet",sheetRoutes);
//         app.use("/material",materialRoutes)
//         app.use("/expense",expenseRoutes)
//         app.use("/site-incharge",SiteInchargeRoutes)
//         app.use("/admin",adminRoutes)
//         app.use("/supply", supplyRoutes)
//         app.use("/notification", notificationRoutes)
//         app.use("/projection", projectionRoutes)
//         app.use("/finance", financeRoutes)
//         app.use("/resource", resourceRoutes)

    
//     app.listen(process.env.PORT || 5000, () => 
//     console.log(`Server running on port ${process.env.PORT || 5000}`)
//         );
//     } catch (error) {
//         console.error("Database connection failed", error);
//         process.exit(1);
//     }
// };

// startServer();








require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoute");
const projectRoutes = require("./routes/projectRoutes");
const reckonerRoutes = require("./routes/reckonerRoutes");
const sheetRoutes = require("./routes/sheetRoutes");
const materialRoutes = require("./routes/materialRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const SiteInchargeRoutes = require("./routes/SiteInchargeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const supplyRoutes = require("./routes/supplyRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const projectionRoutes = require("./routes/projectionRoutes");
const financeRoutes = require("./routes/financeRoutes");
const resourceRoutes = require("./routes/resourceRoutes");

const app = express();

// ====================== MIDDLEWARE ======================

// Parse JSON bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS Configuration (Updated for your mobile app)
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://scpl.kggeniuslabs.com",
    "http://localhost:5000",
    "http://192.168.253.187:5173",
    "http://192.168.252.101:5173",
                        // For Expo Go
    "http://103.118.158.127",
    "http://localhost:5000"         // For EAS builds
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,
};

app.use(cors(corsOptions));

// ====================== GLOBAL ERROR HANDLER ======================
// This will help you see exactly why 400 errors are happening
app.use((err, req, res, next) => {
  console.error("=== BACKEND ERROR ===");
  console.error("Path:", req.method, req.originalUrl);
  console.error("Body:", req.body);
  console.error("Query:", req.query);
  console.error("Error Message:", err.message);
  if (err.stack) console.error("Stack:", err.stack);

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ====================== ROUTES ======================
app.use("/auth", authRoutes);
app.use("/project", projectRoutes);
app.use("/reckoner", reckonerRoutes);
app.use("/sheet", sheetRoutes);
app.use("/material", materialRoutes);
app.use("/expense", expenseRoutes);
app.use("/site-incharge", SiteInchargeRoutes);
app.use("/admin", adminRoutes);
app.use("/supply", supplyRoutes);
app.use("/notification", notificationRoutes);
app.use("/projection", projectionRoutes);
app.use("/finance", financeRoutes);
app.use("/resource", resourceRoutes);

// Health Check Route (Useful for debugging)
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server is running fine",
    timestamp: new Date().toISOString()
  });
});

// ====================== START SERVER ======================
const startServer = async () => {
  try {
    // Test database connection
    await db.query("SELECT 1");
    console.log("✅ Database connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    });

  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
