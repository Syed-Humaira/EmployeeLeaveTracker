require("dotenv").config();

const express = require("express");
const cors = require("cors");

const employeeRoutes = require("./routes/employees");
const leaveRoutes = require("./routes/leaves");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Employee Leave Tracker API is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});