const STORAGE_KEYS = {
  students: "cem_students",
  admins: "cem_admins",
  events: "cem_events",
  registrations: "cem_registrations",
  notifications: "cem_notifications",
  currentUser: "cem_current_user",
  selectedEventId: "cem_selected_event_id",
  pendingRegistration: "cem_pending_registration",
  passes: "cem_passes"
};

const COLLEGE_ADMIN_PASSWORD = "CEM-ADMIN-2026";

const sampleEvents = [
  {
    id: "EVT-1001",
    name: "National HackSprint",
    description: "A 24-hour innovation sprint for coders, designers, and problem solvers across departments.",
    date: "2026-05-02",
    time: "09:00",
    venue: "Innovation Lab, Block B",
    registrationEnd: "2026-04-28",
    fees: 300,
    brochure: "HackSprint guidelines and challenge themes",
    organizerId: "seed-admin-1",
    organizerName: "Tech Club Faculty Desk",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    published: true,
    createdAt: "2026-04-01T08:00:00.000Z",
    review: "",
    images: ""
  },
  {
    id: "EVT-1002",
    name: "Rhythm Night",
    description: "Dance, music, and stage performance auditions leading to the annual cultural night showcase.",
    date: "2026-05-08",
    time: "17:30",
    venue: "Open Air Auditorium",
    registrationEnd: "2026-05-04",
    fees: 150,
    brochure: "Performance slots and judging rules",
    organizerId: "seed-admin-2",
    organizerName: "Cultural Committee",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
    published: true,
    createdAt: "2026-04-03T09:30:00.000Z",
    review: "",
    images: ""
  },
  {
    id: "EVT-1003",
    name: "AI Career Workshop",
    description: "Hands-on workshop on AI tools, ethics, and project portfolios for students planning internships.",
    date: "2026-05-15",
    time: "11:00",
    venue: "Seminar Hall 3",
    registrationEnd: "2026-05-11",
    fees: 0,
    brochure: "Workshop outline and laptop requirements",
    organizerId: "seed-admin-1",
    organizerName: "Placement Cell",
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
    published: true,
    createdAt: "2026-04-05T10:15:00.000Z",
    review: "",
    images: ""
  }
];

document.addEventListener("DOMContentLoaded", () => {
  seedAppData();
  renderSharedShell();
  hydratePage();
});

function seedAppData() {
  if (!readData(STORAGE_KEYS.events).length) {
    writeData(STORAGE_KEYS.events, sampleEvents);
  }

  if (!readData(STORAGE_KEYS.notifications).length) {
    writeData(STORAGE_KEYS.notifications, [
      {
        id: cryptoRandomId("NOTE"),
        message: "Three featured events are now live for student registration.",
        createdAt: new Date().toISOString()
      }
    ]);
  }
}

function renderSharedShell() {
  const nav = document.querySelector("[data-render='nav']");
  const footer = document.querySelector("[data-render='footer']");
  const currentUser = getCurrentUser();
  const requestedNavRole = document.body.dataset.nav || "public";
  const navRole = requestedNavRole === "public" && currentUser ? currentUser.role : requestedNavRole;

  if (nav) {
    nav.innerHTML = createNavMarkup(navRole, currentUser);
  }

  if (footer) {
    footer.innerHTML = `CampusEvents Portal | Secure college event coordination and digital passes`;
  }
}

function hydratePage() {
  const page = document.body.dataset.page;

  bindLogoutButtons();

  switch (page) {
    case "home":
      renderHomePage();
      break;
    case "login":
      setupLoginPage();
      break;
    case "student-register":
      setupStudentRegistrationPage();
      break;
    case "admin-register":
      setupAdminRegistrationPage();
      break;
    case "events":
      renderEventsPage();
      break;
    case "event-registration":
      setupEventRegistrationPage();
      break;
    case "payment":
      setupPaymentPage();
      break;
    case "pass":
      renderPassPage();
      break;
    case "student-dashboard":
      renderStudentDashboard();
      break;
    case "admin-dashboard":
      renderAdminDashboard();
      break;
    case "create-event":
      setupCreateEventPage();
      break;
    case "about":
      renderAboutMetrics();
      break;
    case "contact":
      setupContactPage();
      break;
    default:
      break;
  }
}

function createNavMarkup(navRole, currentUser) {
  const publicLinks = `
    <li><a href="index.html">Home</a></li>
    <li><a href="events.html">Events</a></li>
    <li><a href="about.html">About</a></li>
    <li><a href="contact.html">Contact</a></li>
  `;

  const studentLinks = `
    <li><a href="student-dashboard.html">Dashboard</a></li>
    <li><a href="events.html">Events</a></li>
    <li><a href="pass.html">My Pass</a></li>
    <li><a href="contact.html">Support</a></li>
  `;

  const adminLinks = `
    <li><a href="admin-dashboard.html">Dashboard</a></li>
    <li><a href="create-event.html">Create Event</a></li>
    <li><a href="events.html">Published Events</a></li>
    <li><a href="contact.html">Support</a></li>
  `;

  let links = publicLinks;
  if (navRole === "student") {
    links = studentLinks;
  } else if (navRole === "admin") {
    links = adminLinks;
  }

  const accountAction = currentUser
    ? `
      <span class="ghost-link">${escapeHtml(currentUser.name)} | ${capitalize(currentUser.role)}</span>
      <button class="btn-secondary" type="button" data-action="logout">Logout</button>
    `
    : `
      <a class="ghost-link" href="student-register.html">Student Sign Up</a>
      <a class="btn" href="login.html">Login</a>
    `;

  return `
    <div class="logo">
      <span class="logo-badge">CE</span>
      <span>CampusEvents</span>
    </div>
    <ul class="nav-links">${links}</ul>
    <div class="nav-actions">${accountAction}</div>
  `;
}

function renderHomePage() {
  const heroStats = document.getElementById("heroStats");
  const featuredEvents = document.getElementById("featuredEvents");
  const publishedEvents = getPublishedEvents();
  const registrations = readData(STORAGE_KEYS.registrations);
  const admins = readData(STORAGE_KEYS.admins);
  const students = readData(STORAGE_KEYS.students);

  if (heroStats) {
    heroStats.innerHTML = `
      <div class="metric">
        <span class="label">Published Events</span>
        <span class="value">${publishedEvents.length}</span>
      </div>
      <div class="metric">
        <span class="label">Registrations Logged</span>
        <span class="value">${registrations.length}</span>
      </div>
      <div class="metric">
        <span class="label">Student Accounts</span>
        <span class="value">${students.length}</span>
      </div>
      <div class="metric">
        <span class="label">Authorized Admins</span>
        <span class="value">${admins.length}</span>
      </div>
    `;
  }

  if (featuredEvents) {
    featuredEvents.innerHTML = publishedEvents
      .slice(0, 3)
      .map((event) => createEventCard(event, true))
      .join("");
    bindEventSelectButtons();
  }
}

function setupLoginPage() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const role = formData.get("role");
    const email = String(formData.get("email")).trim().toLowerCase();
    const password = String(formData.get("password")).trim();

    const collection = readData(role === "student" ? STORAGE_KEYS.students : STORAGE_KEYS.admins);
    const user = collection.find((item) => item.email.toLowerCase() === email && item.password === password);

    if (!user) {
      showMessage("loginMessage", "Invalid login details. Please check your role, email, and password.", true);
      return;
    }

    setCurrentUser({ id: user.id, name: user.name, role });
    showMessage("loginMessage", `${capitalize(role)} login successful. Redirecting to your dashboard...`);
    window.setTimeout(() => {
      window.location.href = role === "student" ? "student-dashboard.html" : "admin-dashboard.html";
    }, 800);
  });
}

function setupStudentRegistrationPage() {
  const form = document.getElementById("studentRegisterForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const students = readData(STORAGE_KEYS.students);
    const email = String(formData.get("email")).trim().toLowerCase();

    if (students.some((student) => student.email.toLowerCase() === email)) {
      showMessage("studentRegisterMessage", "A student account with this email already exists.", true);
      return;
    }

    const student = {
      id: cryptoRandomId("STU"),
      role: "student",
      name: String(formData.get("name")).trim(),
      enrollmentNumber: String(formData.get("enrollmentNumber")).trim(),
      course: String(formData.get("course")).trim(),
      branch: String(formData.get("branch")).trim(),
      semester: String(formData.get("semester")).trim(),
      year: String(formData.get("year")).trim(),
      collegeName: String(formData.get("collegeName")).trim(),
      mobileNumber: String(formData.get("mobileNumber")).trim(),
      email,
      password: String(formData.get("password")).trim(),
      createdAt: new Date().toISOString()
    };

    students.push(student);
    writeData(STORAGE_KEYS.students, students);
    setCurrentUser({ id: student.id, name: student.name, role: "student" });
    showMessage("studentRegisterMessage", "Student account created successfully. Redirecting to your dashboard...");
    window.setTimeout(() => {
      window.location.href = "student-dashboard.html";
    }, 800);
  });
}

function setupAdminRegistrationPage() {
  const roleType = document.getElementById("adminType");
  const studentFields = document.getElementById("adminStudentFields");
  const facultyFields = document.getElementById("adminFacultyFields");
  const form = document.getElementById("adminRegisterForm");

  const toggleFields = () => {
    if (!roleType || !studentFields || !facultyFields) return;
    const isStudent = roleType.value === "student";
    studentFields.classList.toggle("hidden", !isStudent);
    facultyFields.classList.toggle("hidden", isStudent);
  };

  if (roleType) {
    roleType.addEventListener("change", toggleFields);
    toggleFields();
  }

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const admins = readData(STORAGE_KEYS.admins);
    const email = String(formData.get("email")).trim().toLowerCase();
    const adminPassword = String(formData.get("adminPassword")).trim();

    if (adminPassword !== COLLEGE_ADMIN_PASSWORD) {
      showMessage("adminRegisterMessage", "The college admin password is incorrect.", true);
      return;
    }

    if (admins.some((admin) => admin.email.toLowerCase() === email)) {
      showMessage("adminRegisterMessage", "An admin account with this email already exists.", true);
      return;
    }

    const type = String(formData.get("adminType")).trim();
    const admin = {
      id: cryptoRandomId("ADM"),
      role: "admin",
      type,
      name: String(formData.get("name")).trim(),
      email,
      password: String(formData.get("password")).trim(),
      contactNumber: String(formData.get("contactNumber")).trim(),
      details: type === "student"
        ? {
            branch: String(formData.get("branch")).trim(),
            semester: String(formData.get("semester")).trim(),
            enrollmentNumber: String(formData.get("enrollmentNumber")).trim()
          }
        : {
            facultyName: String(formData.get("facultyName")).trim(),
            collegeName: String(formData.get("facultyCollegeName")).trim(),
            department: String(formData.get("department")).trim()
          },
      createdAt: new Date().toISOString()
    };

    admins.push(admin);
    writeData(STORAGE_KEYS.admins, admins);
    setCurrentUser({ id: admin.id, name: admin.name, role: "admin" });
    showMessage("adminRegisterMessage", "Admin account created successfully. Redirecting to your dashboard...");
    window.setTimeout(() => {
      window.location.href = "admin-dashboard.html";
    }, 800);
  });
}

function renderEventsPage() {
  const list = document.getElementById("eventsList");
  const empty = document.getElementById("eventsEmpty");
  if (!list) return;

  const currentUser = getCurrentUser();
  const events = getPublishedEvents();

  if (!events.length) {
    empty?.classList.remove("hidden");
    list.innerHTML = "";
    return;
  }

  empty?.classList.add("hidden");
  list.innerHTML = events.map((event) => createEventCard(event, currentUser?.role === "student")).join("");
  bindEventSelectButtons();
}

function setupEventRegistrationPage() {
  const eventId = localStorage.getItem(STORAGE_KEYS.selectedEventId);
  const event = getEventById(eventId);
  const user = getCurrentUser();
  const panel = document.getElementById("selectedEventInfo");
  const form = document.getElementById("eventRegistrationForm");

  if (!event || !panel) {
    redirectToEvents();
    return;
  }

  panel.innerHTML = `
    <div class="info-banner">
      <div>
        <strong>${escapeHtml(event.name)}</strong>
        <p>${escapeHtml(event.description)}</p>
      </div>
      <span class="status-pill">${event.fees > 0 ? `Paid | INR ${event.fees}` : "Free Event"}</span>
    </div>
    <div class="info-grid">
      <div class="meta-row"><span>Date</span><strong>${formatDate(event.date)} at ${formatTime(event.time)}</strong></div>
      <div class="meta-row"><span>Venue</span><strong>${escapeHtml(event.venue)}</strong></div>
      <div class="meta-row"><span>Registration Closes</span><strong>${formatDate(event.registrationEnd)}</strong></div>
      <div class="meta-row"><span>Organizer</span><strong>${escapeHtml(event.organizerName)}</strong></div>
    </div>
  `;

  if (user?.role === "student") {
    const student = readData(STORAGE_KEYS.students).find((item) => item.id === user.id);
    if (student) {
      populateFormField(form, "name", student.name);
      populateFormField(form, "enrollmentNumber", student.enrollmentNumber);
      populateFormField(form, "branch", student.branch);
      populateFormField(form, "semester", student.semester);
      populateFormField(form, "mobileNumber", student.mobileNumber);
      populateFormField(form, "email", student.email);
    }
  }

  if (!form) return;

  form.addEventListener("submit", (submitEvent) => {
    submitEvent.preventDefault();
    if (!user || user.role !== "student") {
      showMessage("eventRegisterMessage", "Please log in as a student before registering for an event.", true);
      return;
    }

    const formData = new FormData(form);
    const registration = {
      id: cryptoRandomId("REG"),
      eventId: event.id,
      studentId: user.id,
      studentName: String(formData.get("name")).trim(),
      enrollmentNumber: String(formData.get("enrollmentNumber")).trim(),
      branch: String(formData.get("branch")).trim(),
      semester: String(formData.get("semester")).trim(),
      mobileNumber: String(formData.get("mobileNumber")).trim(),
      email: String(formData.get("email")).trim(),
      paymentMethod: String(formData.get("paymentMethod")).trim(),
      registrationAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.pendingRegistration, JSON.stringify(registration));
    window.location.href = "payment.html";
  });
}

function setupPaymentPage() {
  const pending = readJson(STORAGE_KEYS.pendingRegistration);
  const summary = document.getElementById("paymentSummary");
  const form = document.getElementById("paymentForm");

  if (!pending || !summary || !form) {
    return;
  }

  const event = getEventById(pending.eventId);
  if (!event) return;

  summary.innerHTML = `
    <div class="meta-row"><span>Event</span><strong>${escapeHtml(event.name)}</strong></div>
    <div class="meta-row"><span>Student</span><strong>${escapeHtml(pending.studentName)}</strong></div>
    <div class="meta-row"><span>Payment Method</span><strong>${escapeHtml(pending.paymentMethod)}</strong></div>
    <div class="meta-row"><span>Amount</span><strong>${event.fees > 0 ? `INR ${event.fees}` : "No fee"}</strong></div>
  `;

  form.addEventListener("submit", (submitEvent) => {
    submitEvent.preventDefault();
    const registrations = readData(STORAGE_KEYS.registrations);
    const passes = readData(STORAGE_KEYS.passes);
    const notifications = readData(STORAGE_KEYS.notifications);

    const duplicate = registrations.find((item) => item.eventId === pending.eventId && item.studentId === pending.studentId);
    if (duplicate) {
      localStorage.removeItem(STORAGE_KEYS.pendingRegistration);
      showMessage("paymentMessage", "You have already registered for this event. Redirecting to your pass...", true);
      window.setTimeout(() => {
        window.location.href = "pass.html";
      }, 1000);
      return;
    }

    const paymentAt = new Date().toISOString();
    const registration = {
      ...pending,
      amount: event.fees,
      paymentAt,
      status: "confirmed"
    };
    registrations.push(registration);
    writeData(STORAGE_KEYS.registrations, registrations);

    const pass = {
      id: cryptoRandomId("PASS"),
      code: `${pending.eventId}-${pending.enrollmentNumber}`.replace(/\s+/g, ""),
      eventId: event.id,
      eventName: event.name,
      studentId: pending.studentId,
      studentName: pending.studentName,
      enrollmentNumber: pending.enrollmentNumber,
      amount: event.fees,
      paymentAt,
      paymentMethod: pending.paymentMethod,
      venue: event.venue,
      date: event.date,
      time: event.time
    };

    const existingPassIndex = passes.findIndex((item) => item.eventId === event.id && item.studentId === pending.studentId);
    if (existingPassIndex >= 0) {
      passes[existingPassIndex] = pass;
    } else {
      passes.push(pass);
    }
    writeData(STORAGE_KEYS.passes, passes);

    notifications.unshift({
      id: cryptoRandomId("NOTE"),
      message: `${event.name} has a new confirmed registration from ${pending.studentName}.`,
      createdAt: paymentAt
    });
    writeData(STORAGE_KEYS.notifications, notifications.slice(0, 15));

    localStorage.removeItem(STORAGE_KEYS.pendingRegistration);
    showMessage("paymentMessage", "Payment recorded and digital pass generated successfully.");
    window.setTimeout(() => {
      window.location.href = "pass.html";
    }, 800);
  });
}

function renderPassPage() {
  const currentUser = getCurrentUser();
  const passContainer = document.getElementById("passContainer");
  const empty = document.getElementById("passEmpty");
  if (!passContainer || !empty) return;

  if (!currentUser || currentUser.role !== "student") {
    empty.classList.remove("hidden");
    empty.innerHTML = `<p>Please log in as a student to view your digital passes.</p>`;
    passContainer.innerHTML = "";
    return;
  }

  const passes = readData(STORAGE_KEYS.passes)
    .filter((pass) => pass.studentId === currentUser.id)
    .sort((a, b) => new Date(b.paymentAt) - new Date(a.paymentAt));

  if (!passes.length) {
    empty.classList.remove("hidden");
    empty.innerHTML = `<p>No digital pass found yet. Register for an event and complete payment to generate one.</p>`;
    passContainer.innerHTML = "";
    return;
  }

  empty.classList.add("hidden");
  passContainer.innerHTML = passes.map((pass) => createPassMarkup(pass)).join("");
}

function renderStudentDashboard() {
  const currentUser = getCurrentUser();
  const heading = document.getElementById("studentDashboardHeading");
  const stats = document.getElementById("studentStats");
  const notificationsBox = document.getElementById("studentNotifications");
  const timeline = document.getElementById("studentTimeline");

  if (!currentUser || currentUser.role !== "student") {
    redirectToLogin();
    return;
  }

  const registrations = readData(STORAGE_KEYS.registrations).filter((item) => item.studentId === currentUser.id);
  const passes = readData(STORAGE_KEYS.passes).filter((item) => item.studentId === currentUser.id);
  const publishedEvents = getPublishedEvents();

  if (heading) {
    heading.textContent = `Welcome, ${currentUser.name}`;
  }

  if (stats) {
    stats.innerHTML = `
      <div class="stat-card"><span>Upcoming Events</span><strong>${publishedEvents.length}</strong></div>
      <div class="stat-card"><span>My Registrations</span><strong>${registrations.length}</strong></div>
      <div class="stat-card"><span>Digital Passes</span><strong>${passes.length}</strong></div>
      <div class="stat-card"><span>Total Spent</span><strong>INR ${registrations.reduce((sum, item) => sum + Number(item.amount || 0), 0)}</strong></div>
    `;
  }

  if (notificationsBox) {
    notificationsBox.innerHTML = readData(STORAGE_KEYS.notifications)
      .slice(0, 4)
      .map((note) => `
        <div class="notification-item">
          <div>
            <strong>${escapeHtml(note.message)}</strong>
            <small>${formatDateTime(note.createdAt)}</small>
          </div>
          <span class="tag">New</span>
        </div>
      `)
      .join("");
  }

  if (timeline) {
    timeline.innerHTML = registrations.length
      ? registrations
          .sort((a, b) => new Date(b.paymentAt) - new Date(a.paymentAt))
          .map((registration) => {
            const event = getEventById(registration.eventId);
            return `
              <li>
                <strong>${escapeHtml(event?.name || "Event")}</strong><br>
                Registered on ${formatDateTime(registration.registrationAt)} | Payment ${registration.amount > 0 ? `INR ${registration.amount}` : "Free"}
              </li>
            `;
          })
          .join("")
      : `<li>Your event activity will appear here after you register.</li>`;
  }
}

function renderAdminDashboard() {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    redirectToLogin();
    return;
  }

  const adminEvents = readData(STORAGE_KEYS.events).filter((item) => item.organizerId === currentUser.id);
  const registrations = readData(STORAGE_KEYS.registrations);
  const myRegistrations = registrations.filter((item) => adminEvents.some((event) => event.id === item.eventId));
  const stats = document.getElementById("adminStats");
  const eventTable = document.getElementById("adminEventsTable");
  const participantTable = document.getElementById("adminParticipantsTable");
  const reviewForm = document.getElementById("postEventForm");
  const heading = document.getElementById("adminDashboardHeading");

  if (heading) {
    heading.textContent = `Organizer Desk | ${currentUser.name}`;
  }

  if (stats) {
    stats.innerHTML = `
      <div class="stat-card"><span>My Events</span><strong>${adminEvents.length}</strong></div>
      <div class="stat-card"><span>Published</span><strong>${adminEvents.filter((event) => event.published).length}</strong></div>
      <div class="stat-card"><span>Registrations</span><strong>${myRegistrations.length}</strong></div>
      <div class="stat-card"><span>Revenue</span><strong>INR ${myRegistrations.reduce((sum, item) => sum + Number(item.amount || 0), 0)}</strong></div>
    `;
  }

  if (eventTable) {
    eventTable.innerHTML = adminEvents.length
      ? adminEvents.map((event) => `
          <tr>
            <td>${escapeHtml(event.name)}</td>
            <td>${formatDate(event.date)}</td>
            <td>${escapeHtml(event.venue)}</td>
            <td>${event.fees > 0 ? `INR ${event.fees}` : "Free"}</td>
            <td>${event.published ? "Published" : "Draft"}</td>
            <td>${registrations.filter((item) => item.eventId === event.id).length}</td>
          </tr>
        `).join("")
      : `<tr><td colspan="6">No events created yet. Use the create event page to publish your first event.</td></tr>`;
  }

  if (participantTable) {
    participantTable.innerHTML = myRegistrations.length
      ? myRegistrations.map((item) => `
          <tr>
            <td>${escapeHtml(item.studentName)}</td>
            <td>${escapeHtml(getEventById(item.eventId)?.name || "-")}</td>
            <td>${escapeHtml(item.enrollmentNumber)}</td>
            <td>${escapeHtml(item.branch)}</td>
            <td>${escapeHtml(item.semester)}</td>
            <td>${formatDateTime(item.registrationAt)}</td>
          </tr>
        `).join("")
      : `<tr><td colspan="6">No students have registered for your events yet.</td></tr>`;
  }

  if (!reviewForm) return;

  reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(reviewForm);
    const eventId = String(formData.get("eventId")).trim();
    const review = String(formData.get("review")).trim();
    const images = String(formData.get("images")).trim();
    const events = readData(STORAGE_KEYS.events);
    const target = events.find((item) => item.id === eventId && item.organizerId === currentUser.id);

    if (!target) {
      showMessage("postEventMessage", "Select one of your events to save post-event details.", true);
      return;
    }

    target.review = review;
    target.images = images;
    writeData(STORAGE_KEYS.events, events);
    showMessage("postEventMessage", "Post-event review and glimpse references saved.");
    reviewForm.reset();
  });

  const eventSelect = document.getElementById("postEventSelect");
  if (eventSelect) {
    eventSelect.innerHTML = `
      <option value="">Select Event</option>
      ${adminEvents.map((event) => `<option value="${event.id}">${escapeHtml(event.name)}</option>`).join("")}
    `;
  }
}

function setupCreateEventPage() {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    redirectToLogin();
    return;
  }

  const form = document.getElementById("createEventForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const events = readData(STORAGE_KEYS.events);
    const notifications = readData(STORAGE_KEYS.notifications);

    const newEvent = {
      id: cryptoRandomId("EVT"),
      name: String(formData.get("name")).trim(),
      description: String(formData.get("description")).trim(),
      date: String(formData.get("date")).trim(),
      time: String(formData.get("time")).trim(),
      venue: String(formData.get("venue")).trim(),
      registrationEnd: String(formData.get("registrationEnd")).trim(),
      fees: Number(formData.get("fees") || 0),
      brochure: String(formData.get("brochure")).trim(),
      image: String(formData.get("posterUrl")).trim() || getFallbackEventImage(),
      organizerId: currentUser.id,
      organizerName: currentUser.name,
      published: true,
      createdAt: new Date().toISOString(),
      review: "",
      images: ""
    };

    events.unshift(newEvent);
    writeData(STORAGE_KEYS.events, events);

    notifications.unshift({
      id: cryptoRandomId("NOTE"),
      message: `${newEvent.name} has been published. Registrations are now open for students.`,
      createdAt: newEvent.createdAt
    });
    writeData(STORAGE_KEYS.notifications, notifications.slice(0, 15));

    showMessage("createEventMessage", "Event published successfully. It is now visible to logged-in students.");
    form.reset();
  });
}

function renderAboutMetrics() {
  const stats = document.getElementById("aboutStats");
  if (!stats) return;

  const events = getPublishedEvents();
  const registrations = readData(STORAGE_KEYS.registrations);
  const paidRegistrations = registrations.filter((item) => Number(item.amount) > 0).length;

  stats.innerHTML = `
    <div class="stat-card"><span>Live Event Records</span><strong>${events.length}</strong></div>
    <div class="stat-card"><span>Confirmed Registrations</span><strong>${registrations.length}</strong></div>
    <div class="stat-card"><span>Paid Transactions</span><strong>${paidRegistrations}</strong></div>
    <div class="stat-card"><span>Digital Passes Generated</span><strong>${readData(STORAGE_KEYS.passes).length}</strong></div>
  `;
}

function setupContactPage() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    showMessage("contactMessage", "Your message has been captured in this prototype. In a full system this would be routed to the event coordination desk.");
    form.reset();
  });
}

function createEventCard(event, showRegisterAction) {
  const currentUser = getCurrentUser();
  const canRegister = showRegisterAction && currentUser?.role === "student";
  const action = canRegister
    ? `<button class="btn" type="button" data-event-select="${event.id}">Register Now</button>`
    : `<a class="btn-ghost" href="${currentUser?.role === "admin" ? "admin-dashboard.html" : "login.html"}">${currentUser?.role === "admin" ? "View Organizer Desk" : "Login to Register"}</a>`;

  return `
    <article class="event-card">
      <div class="event-visual" style="background-image:url('${escapeHtml(event.image || getFallbackEventImage())}')">
        <span class="event-date-chip">${formatDayMonth(event.date)}</span>
      </div>
      <span class="status-pill">${event.fees > 0 ? `Fee | INR ${event.fees}` : "Free Access"}</span>
      <div>
        <h3>${escapeHtml(event.name)}</h3>
        <p>${escapeHtml(event.description)}</p>
      </div>
      <div class="event-meta">
        <div class="meta-row"><span>Date</span><strong>${formatDate(event.date)} at ${formatTime(event.time)}</strong></div>
        <div class="meta-row"><span>Venue</span><strong>${escapeHtml(event.venue)}</strong></div>
        <div class="meta-row"><span>Registration Ends</span><strong>${formatDate(event.registrationEnd)}</strong></div>
        <div class="meta-row"><span>Organizer</span><strong>${escapeHtml(event.organizerName)}</strong></div>
      </div>
      <div class="section-actions">
        ${action}
        <span class="tag">${escapeHtml(event.brochure)}</span>
      </div>
    </article>
  `;
}

function createPassMarkup(pass) {
  return `
    <section class="pass">
      <div class="pass-header">
        <div>
          <span class="eyebrow">Digital Entry Pass</span>
          <h2>${escapeHtml(pass.eventName)}</h2>
          <p class="muted">Carry this pass at the venue for verification and attendance.</p>
        </div>
        <div>
          <span class="pass-code">${escapeHtml(pass.code)}</span>
          <p class="muted">Verified admission token</p>
        </div>
      </div>
      <div class="pass-meta">
        <div class="meta-row"><span>Student Name</span><strong>${escapeHtml(pass.studentName)}</strong></div>
        <div class="meta-row"><span>Enrollment Number</span><strong>${escapeHtml(pass.enrollmentNumber)}</strong></div>
        <div class="meta-row"><span>Payment Amount</span><strong>${Number(pass.amount) > 0 ? `INR ${pass.amount}` : "Free"}</strong></div>
        <div class="meta-row"><span>Payment Method</span><strong>${escapeHtml(pass.paymentMethod)}</strong></div>
        <div class="meta-row"><span>Payment Date & Time</span><strong>${formatDateTime(pass.paymentAt)}</strong></div>
        <div class="meta-row"><span>Venue</span><strong>${escapeHtml(pass.venue)}</strong></div>
        <div class="meta-row"><span>Event Schedule</span><strong>${formatDate(pass.date)} at ${formatTime(pass.time)}</strong></div>
      </div>
    </section>
  `;
}

function bindEventSelectButtons() {
  document.querySelectorAll("[data-event-select]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.setItem(STORAGE_KEYS.selectedEventId, button.dataset.eventSelect);
      window.location.href = "event-registration.html";
    });
  });
}

function bindLogoutButtons() {
  document.querySelectorAll("[data-action='logout']").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
      window.location.href = "index.html";
    });
  });
}

function redirectToLogin() {
  window.location.href = "login.html";
}

function redirectToEvents() {
  window.location.href = "events.html";
}

function populateFormField(form, name, value) {
  const field = form?.querySelector(`[name="${name}"]`);
  if (field) {
    field.value = value || "";
  }
}

function showMessage(targetId, message, isError = false) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.textContent = message;
  target.className = isError ? "alert-box" : "info-banner";
}

function readData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (error) {
    return [];
  }
}

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (error) {
    return null;
  }
}

function writeData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getPublishedEvents() {
  return readData(STORAGE_KEYS.events)
    .filter((event) => event.published)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function getEventById(id) {
  return readData(STORAGE_KEYS.events).find((event) => event.id === id);
}

function getCurrentUser() {
  return readJson(STORAGE_KEYS.currentUser);
}

function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
}

function cryptoRandomId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatTime(value) {
  if (!value) return "-";
  const date = new Date(`2000-01-01T${value}`);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDayMonth(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short"
  });
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getFallbackEventImage() {
  const options = [
    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80"
  ];
  return options[Math.floor(Math.random() * options.length)];
}
