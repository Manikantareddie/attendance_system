const backendURL = "http://localhost:3000"; // Change this if your backend uses a different port

// STUDENT FORM HANDLING
const studentForm = document.getElementById("studentForm");
if (studentForm) {
  studentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const roll = document.getElementById("roll").value;
    const className = document.getElementById("class").value;

    const student = { name, roll_number: roll, class: className };

    try {
      const response = await fetch(`${backendURL}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });

      if (response.ok) {
        alert("Student added!");
        studentForm.reset();
        loadStudents();
      } else {
        alert("Failed to add student");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  });
}

// LOAD STUDENT LIST FOR STUDENTS PAGE
async function loadStudents() {
  const tbody = document.getElementById("studentTableBody");
  if (!tbody) return;

  try {
    const res = await fetch(`${backendURL}/students`);
    const students = await res.json();

    tbody.innerHTML = "";

    students.forEach((s) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${s.id}</td>
        <td>${s.name}</td>
        <td>${s.roll_number}</td>
        <td>${s.class}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    alert("Failed to load students");
  }
}

// POPULATE ATTENDANCE TABLE
async function populateAttendanceTable() {
  const tableBody = document.getElementById("attendanceTableBody");
  if (!tableBody) return;

  try {
    const res = await fetch(`${backendURL}/students`);
    const students = await res.json();

    tableBody.innerHTML = "";

    students.forEach(student => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${student.name}</td>
        <td>${student.roll_number}</td>
        <td>${student.class}</td>
        <td>
          <label>
            <input type="radio" name="status_${student.id}" value="Present" checked> Present
          </label>
          <label>
            <input type="radio" name="status_${student.id}" value="Absent"> Absent
          </label>
        </td>
      `;

      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to load students for attendance", err);
  }
}

// ATTENDANCE FORM SUBMISSION
const attendanceForm = document.getElementById("attendanceForm");
if (attendanceForm) {
  attendanceForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const date = document.getElementById("attendanceDate").value;
    if (!date) {
      alert("Please select a date.");
      return;
    }

    try {
      const res = await fetch(`${backendURL}/students`);
      const students = await res.json();

      const attendanceData = students.map((student) => {
        const status = document.querySelector(`input[name="status_${student.id}"]:checked`).value;
        return {
          student_id: student.id,
          date,
          status
        };
      });

      const response = await fetch(`${backendURL}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(attendanceData)
      });

      if (response.ok) {
        alert("✅ Attendance recorded successfully!");
      } else {
        alert("❌ Failed to record attendance.");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Error sending attendance data.");
    }
  });
}

// ATTENDANCE REPORT GENERATION (LIVE)
const viewReportBtn = document.getElementById("viewReportBtn");
if (viewReportBtn) {
  viewReportBtn.addEventListener("click", async () => {
    const selectedDate = document.getElementById("reportDate").value;
    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }

    try {
      const res = await fetch(`${backendURL}/attendance?date=${selectedDate}`);
      const records = await res.json();

      const reportBody = document.getElementById("reportTableBody");
      reportBody.innerHTML = "";

      if (records.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="4">No attendance records found for this date.</td>`;
        reportBody.appendChild(row);
      } else {
        records.forEach((record) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${record.name}</td>
            <td>${record.roll_number}</td>
            <td>${record.class}</td>
            <td>${record.status}</td>
          `;
          reportBody.appendChild(row);
        });
      }
    } catch (err) {
      console.error("Failed to fetch attendance records", err);
      alert("Error loading attendance report.");
    }
  });
}

// ON PAGE LOAD
window.onload = () => {
  const studentTable = document.getElementById("studentTableBody");
  if (studentTable) {
    loadStudents();
  }

  populateAttendanceTable(); // Also try to auto-populate the attendance table
};
