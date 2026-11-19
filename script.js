const bookBtn = document.getElementById("bookBtn");
const trackBtn = document.getElementById("trackBtn");

const booking = document.getElementById("booking");
const tracking = document.getElementById("tracking");

const repairForm = document.getElementById("repairForm");
const trackingForm = document.getElementById("trackingForm");

const bookingResult = document.getElementById("bookingResult");
const trackingResult = document.getElementById("trackingResult");

// Open booking form
bookBtn.addEventListener("click", function () {
    booking.hidden = false;
    tracking.hidden = true;
    booking.scrollIntoView({ behavior: "smooth" });
});

// Open tracking form
trackBtn.addEventListener("click", function () {
    tracking.hidden = false;
    booking.hidden = true;
    tracking.scrollIntoView({ behavior: "smooth" });
});

// Save a new repair request
repairForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("customerName").value.trim();
    const email = document.getElementById("customerEmail").value.trim();
    const device = document.getElementById("deviceType").value;
    const problem = document.getElementById("problem").value.trim();

    if (!name || !email || !device || !problem) {
        alert("Please fill all fields.");
        return;
    }

    const ticketId = "REP-" +
        Date.now().toString(36).toUpperCase() +
        "-" + Math.random().toString(36).slice(2, 7).toUpperCase();

    const repair = {
        ticketId: ticketId,
        name: name,
        email: email,
        device: device,
        problem: problem,
        status: "Pending",
        createdAt: new Date().toLocaleString()
    };

    // Save ticket in browser storage
    localStorage.setItem(ticketId, JSON.stringify(repair));

    bookingResult.replaceChildren();

    const message = document.createElement("h3");
    message.textContent = "Repair Request Submitted!";

    const ticketText = document.createElement("p");
    ticketText.textContent = "Your Ticket ID: " + ticketId;

    const note = document.createElement("p");
    note.textContent = "Save this ID to track your repair.";

    bookingResult.append(message, ticketText, note);
    bookingResult.hidden = false;

    repairForm.reset();
});

// Track an existing repair request
trackingForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const ticketId = document.getElementById("ticketId")
        .value.trim().toUpperCase();

    const savedData = localStorage.getItem(ticketId);

    trackingResult.replaceChildren();

    if (!savedData) {
        trackingResult.textContent =
            "Ticket not found. Please check your Ticket ID.";
    }
     else {
        try {
            const repair = JSON.parse(savedData);

            const heading = document.createElement("h3");
            heading.textContent = "Repair Details";
            trackingResult.appendChild(heading);

            const details = [
                ["Ticket ID", repair.ticketId],
                ["Customer", repair.name],
                ["Device", repair.device],
                ["Problem", repair.problem],
                ["Technician", repair.technician || "Not Assigned"],
                ["Diagnosis", repair.diagnosis || "Pending"],
                ["Estimated Cost",
                    repair.estimatedCost != null
                        ? "₹" + repair.estimatedCost
                        : "Not Available"],
                ["Status", repair.status],
                ["Created", repair.createdAt]
            ];

            details.forEach(function (item) {
                const line = document.createElement("p");
                const label = document.createElement("strong");
                label.textContent = item[0] + ": ";
                line.append(label, document.createTextNode(item[1]));
                trackingResult.appendChild(line);
                // Repair Timeline
            const timelineHeading = document.createElement("h3");
            timelineHeading.textContent = "Repair Timeline";
            trackingResult.appendChild(timelineHeading);

            const history = Array.isArray(repair.timeline)
                ? repair.timeline
                : [{
                    status: repair.status,
                    date: repair.createdAt
                }];

            history.forEach(function (entry) {
                const item = document.createElement("p");
                item.className = "timeline-item";
                item.textContent =
                    entry.status + " — " + entry.date;
                trackingResult.appendChild(item);
            });

            // Customer Completion Confirmation
            if (repair.status === "Completed") {
                if (repair.customerConfirmed) {
                    const confirmed = document.createElement("p");
                    confirmed.textContent =
                        "✓ Customer confirmed repair completion.";
                    trackingResult.appendChild(confirmed);
                } else {
                    const confirmButton = document.createElement("button");
                    confirmButton.textContent =
                        "Confirm Repair Completion";

                    confirmButton.addEventListener("click", function () {
                        repair.customerConfirmed = true;
                        repair.confirmedAt =
                            new Date().toLocaleString();

                        localStorage.setItem(
                            repair.ticketId,
                            JSON.stringify(repair)
                        );

                        alert("Repair completion confirmed!");
                        trackingForm.requestSubmit();
                    });

                    trackingResult.appendChild(confirmButton);
                }
            }
            });
        } catch (error) {
            trackingResult.textContent =
                "Unable to read this ticket.";
        }
    }

    trackingResult.hidden = false;
});
// ===== ADMIN DASHBOARD =====

const adminLink = document.getElementById("adminLink");
const adminSection = document.getElementById("admin");
const repairTableBody = document.getElementById("repairTableBody");

// Open Admin Dashboard
adminLink.addEventListener("click", function () {
    adminSection.hidden = false;
    loadAdminDashboard();
});

// Get saved repair tickets
function getAllRepairs() {
    const repairs = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (!key.startsWith("REP-")) {
            continue;
        }

        try {
            const repair = JSON.parse(localStorage.getItem(key));

            if (repair && repair.ticketId === key) {
                repairs.push(repair);
            }
        } catch (error) {
            console.log("Invalid repair record skipped.");
        }
    }

    return repairs;
}

// Display dashboard information
function loadAdminDashboard() {
    const repairs = getAllRepairs();

    document.getElementById("totalRepairs").textContent =
        repairs.length;

    document.getElementById("pendingRepairs").textContent =
        repairs.filter(r => r.status === "Pending").length;

    document.getElementById("progressRepairs").textContent =
        repairs.filter(r => r.status === "In Progress").length;

    document.getElementById("completedRepairs").textContent =
        repairs.filter(r => r.status === "Completed").length;

    repairTableBody.replaceChildren();

    if (repairs.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 8;
        cell.textContent = "No repair requests found.";
        row.appendChild(cell);
        repairTableBody.appendChild(row);
        return;
    }

    repairs.forEach(function (repair) {
        const row = document.createElement("tr");

        function addCell(value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
            return cell;
        }

        addCell(repair.ticketId);
        addCell(repair.name);
        addCell(repair.device);

        // Technician input
        const technicianCell = document.createElement("td");
        const technicianInput = document.createElement("input");
        technicianInput.type = "text";
        technicianInput.placeholder = "Technician name";
        technicianInput.value = repair.technician || "";
        technicianCell.appendChild(technicianInput);
        row.appendChild(technicianCell);
        // Device Diagnosis
        const diagnosisCell = document.createElement("td");
        const diagnosisInput = document.createElement("input");

        diagnosisInput.type = "text";
        diagnosisInput.placeholder = "Enter diagnosis";
        diagnosisInput.value = repair.diagnosis || "";

        diagnosisCell.appendChild(diagnosisInput);
        row.appendChild(diagnosisCell);

        // Estimated Repair Cost
        const costCell = document.createElement("td");
        const costInput = document.createElement("input");

        costInput.type = "number";
        costInput.min = "0";
        costInput.step = "0.01";
        costInput.placeholder = "Cost in INR";
        costInput.value = repair.estimatedCost ?? "";

        costCell.appendChild(costInput);
        row.appendChild(costCell);

        // Status dropdown
        const statusCell = document.createElement("td");
        const statusSelect = document.createElement("select");

        ["Pending", "In Progress", "Completed"].forEach(function (status) {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            statusSelect.appendChild(option);
        });

        statusSelect.value = repair.status;
        statusCell.appendChild(statusSelect);
        row.appendChild(statusCell);

        // Save button
        const actionCell = document.createElement("td");
        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.className = "save-btn";

        saveButton.addEventListener("click", function () {
            const costValue = costInput.value.trim();

            if (costValue !== "" &&
                (!Number.isFinite(Number(costValue)) ||
                 Number(costValue) < 0)) {
                alert("Enter a valid estimated cost.");
                return;
            }

            repair.technician = technicianInput.value.trim();
            repair.diagnosis = diagnosisInput.value.trim();
            repair.estimatedCost =
                costValue === "" ? null : Number(costValue);

            // Save status history
            if (!Array.isArray(repair.timeline)) {
                repair.timeline = [{
                    status: "Pending",
                    date: repair.createdAt
                }];
            }

            if (repair.status !== statusSelect.value) {
                repair.timeline.push({
                    status: statusSelect.value,
                    date: new Date().toLocaleString()
                });
            }

            repair.status = statusSelect.value

            localStorage.setItem(
                repair.ticketId,
                JSON.stringify(repair)
            );

            alert("Repair updated successfully!");
            loadAdminDashboard();
        });

        actionCell.appendChild(saveButton);
        row.appendChild(actionCell);

        repairTableBody.appendChild(row);
    });
}