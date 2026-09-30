
import { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";

const API = "http://localhost:5000/api";

function App() {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [name, setName] = useState("");
  const [annualLeave, setAnnualLeave] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const loadData = async () => {
    const emp = await axios.get(`${API}/employees`);
    const leave = await axios.get(`${API}/leaves`);

    setEmployees(emp.data);
    setLeaves(leave.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const addEmployee = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/employees`, {
        name,
        annual_leave: Number(annualLeave)
      });

      setName("");
      setAnnualLeave("");
      setMessage("Employee added successfully!");
      setMessageType("success");

      loadData();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error adding employee";

      setMessage(errorMessage);
      setMessageType("error");
      alert(errorMessage);
    }
  };

  const applyLeave = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API}/leaves`, {
        employee_id: Number(employeeId),
        start_date: startDate,
        end_date: endDate
      });

      setMessage(
        `${response.data.message}! ${response.data.leaveDays} days used. Remaining: ${response.data.remainingLeave}`
      );

      setMessageType("success");

      setEmployeeId("");
      setStartDate("");
      setEndDate("");

      loadData();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error applying leave";

      setMessage(errorMessage);
      setMessageType("error");

      alert(errorMessage);
    }
  };

  return (
    <div className="container">
      <h1>Employee Leave Tracker</h1>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <section>
        <h2>Add Employee</h2>

        <form onSubmit={addEmployee}>
          <input
            placeholder="Employee Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Annual Leave Days"
            value={annualLeave}
            onChange={(e) => setAnnualLeave(e.target.value)}
            min="0"
            required
          />

          <button>Add Employee</button>
        </form>
      </section>

      <section>
        <h2>Employee Leave Balance</h2>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Annual Leave</th>
              <th>Used</th>
              <th>Remaining</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.name}</td>
                <td>{employee.annual_leave}</td>
                <td>{employee.used_leave}</td>
                <td>
                  <strong>{employee.remaining_leave}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Apply for Leave</h2>

        <form onSubmit={applyLeave}>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
          >
            <option value="">Select Employee</option>

            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} — {employee.remaining_leave} days left
              </option>
            ))}
          </select>

          <label>Start Date</label>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <label>End Date</label>

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          <button>Apply Leave</button>
        </form>
      </section>

      <section>
        <h2>Leave Applications</h2>

        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
            </tr>
          </thead>

          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.id}>
                <td>{leave.employee_name}</td>
                <td>{leave.start_date.substring(0, 10)}</td>
                <td>{leave.end_date.substring(0, 10)}</td>
                <td>{leave.leave_days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default App;
