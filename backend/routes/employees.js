const express = require("express");
const db = require("../config/db");

const router = express.Router();

// Add employee
router.post("/", async (req, res) => {
    try {
        const { name, annual_leave } = req.body;

        if (!name || annual_leave === undefined) {
            return res.status(400).json({
                message: "Name and annual leave are required"
            });
        }

        const [result] = await db.execute(
            "INSERT INTO employees (name, annual_leave) VALUES (?, ?)",
            [name, annual_leave]
        );

        res.status(201).json({
            message: "Employee added successfully",
            employeeId: result.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to add employee"
        });
    }
});

// Get employees + remaining leave
router.get("/", async (req, res) => {
    try {
        const [employees] = await db.execute(`
            SELECT
                e.id,
                e.name,
                e.annual_leave,
                COALESCE(SUM(l.leave_days), 0) AS used_leave,
                e.annual_leave -
                COALESCE(SUM(l.leave_days), 0) AS remaining_leave
            FROM employees e
            LEFT JOIN leave_applications l
                ON e.id = l.employee_id
            GROUP BY e.id, e.name, e.annual_leave
        `);

        res.json(employees);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch employees"
        });
    }
});

module.exports = router;