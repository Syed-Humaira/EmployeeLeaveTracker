
const express = require("express");
const db = require("../config/db");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { employee_id, start_date, end_date } = req.body;

        if (!employee_id || !start_date || !end_date) {
            return res.status(400).json({
                message: "Employee, start date and end date are required"
            });
        }

        const start = new Date(start_date);
        const end = new Date(end_date);

        if (end < start) {
            return res.status(400).json({
                message: "End date cannot be before start date"
            });
        }

        // Calculate inclusive number of leave days
        const leaveDays =
            Math.ceil(
                (end - start) / (1000 * 60 * 60 * 24)
            ) + 1;

        // Check employee exists
        const [employees] = await db.execute(
            "SELECT * FROM employees WHERE id = ?",
            [employee_id]
        );

        if (employees.length === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        const employee = employees[0];

        // Check for overlapping leave
        const [overlappingLeaves] = await db.execute(
            `
            SELECT id
            FROM leave_applications
            WHERE employee_id = ?
            AND start_date <= ?
            AND end_date >= ?
            LIMIT 1
            `,
            [employee_id, end_date, start_date]
        );

        if (overlappingLeaves.length > 0) {
            return res.status(400).json({
                message:
                    "Leave request rejected. The selected dates overlap with an existing leave request."
            });
        }

        // Calculate already used leave
        const [used] = await db.execute(
            `
            SELECT COALESCE(SUM(leave_days), 0) AS used_leave
            FROM leave_applications
            WHERE employee_id = ?
            `,
            [employee_id]
        );

        const usedLeave = used[0].used_leave;
        const remaining = employee.annual_leave - usedLeave;

        // Check leave balance
        if (leaveDays > remaining) {
            return res.status(400).json({
                message:
                    `Leave request rejected. Only ${remaining} days remaining.`
            });
        }

        // Insert leave
        const [result] = await db.execute(
            `
            INSERT INTO leave_applications
            (employee_id, start_date, end_date, leave_days)
            VALUES (?, ?, ?, ?)
            `,
            [
                employee_id,
                start_date,
                end_date,
                leaveDays
            ]
        );

        res.status(201).json({
            message: "Leave applied successfully",
            leaveId: result.insertId,
            leaveDays,
            remainingLeave: remaining - leaveDays
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to apply leave"
        });
    }
});

// Get all leave applications
router.get("/", async (req, res) => {
    try {
        const [leaves] = await db.execute(`
            SELECT
                l.id,
                e.name AS employee_name,
                l.start_date,
                l.end_date,
                l.leave_days
            FROM leave_applications l
            JOIN employees e
                ON l.employee_id = e.id
            ORDER BY l.created_at DESC
        `);

        res.json(leaves);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch leave applications"
        });
    }
});

module.exports = router;
