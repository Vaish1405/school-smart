const appShell = document.getElementById("appShell");
const chatPanel = document.getElementById("chatPanel");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

const homeView = document.getElementById("homeView");
const calendarView = document.getElementById("calendarView");
const detailView = document.getElementById("detailView");
const cards = document.querySelectorAll(".class-card");
const backToHome = document.getElementById("backToHome");
const courseTabs = document.querySelectorAll(".course-tab");

const detailTag = document.getElementById("detailTag");
const detailTitle = document.getElementById("detailTitle");
const detailHeading = document.getElementById("detailHeading");
const detailIntro = document.getElementById("detailIntro");

const tabTitle = document.getElementById("tabTitle");
const tabDescription = document.getElementById("tabDescription");
const tabList = document.getElementById("tabList");
const calendarGroups = document.getElementById("calendarGroups");
const monthGrid = document.getElementById("monthGrid");
const miniGrid = document.getElementById("miniGrid");
const calendarMonthLabel = document.getElementById("calendarMonthLabel");
const miniMonthLabel = document.getElementById("miniMonthLabel");
const calendarPrev = document.getElementById("calendarPrev");
const calendarNext = document.getElementById("calendarNext");
const miniPrev = document.getElementById("miniPrev");
const miniNext = document.getElementById("miniNext");

const navDashboard = document.getElementById("navDashboard");
const navCalendar = document.getElementById("navCalendar");
const navCourses = document.getElementById("navCourses");
const navInbox = document.getElementById("navInbox");

const toggleButtons = [
  document.getElementById("chatToggle"),
  document.getElementById("chatToggleCalendar"),
  document.getElementById("chatToggleDetail"),
].filter(Boolean);

let currentCourse = "home";
let activeTab = "assignments";
let calendarDate = new Date(2026, 2, 1);

// Records: only courses in courseKeyToClassId get real data (chemistry -> c1)
const courseKeyToClassId = { chemistry: "c1" };
const RECORDS_BASE = "records";
let recordsTeachers = [];
let recordsClasses = [];
let recordsStudents = [];
let recordsEnrollments = [];
let recordsAssignments = [];
let recordsAssignmentGrades = [];
let recordsClassGrades = [];
let recordsAnnouncements = [];
let recordsFiles = [];
let recordsLoaded = false;
// Demo: current user (used for dashboard grade and Grades tab)
let currentStudentId = "s1";

function makeTabPlaceholders(courseTitle) {
  return {
    assignments: {
      title: "Assignments",
      description: `Placeholder assignments for ${courseTitle}.`,
      items: [
        "Assignment 1: Intro activity (Draft)",
        "Assignment 2: Weekly practice (Not yet graded)",
        "Assignment 3: Reflection post (Opens next week)",
      ],
    },
    grades: {
      title: "Grades",
      description: `Placeholder gradebook entries for ${courseTitle}.`,
      items: [
        "Current grade: --",
        "No graded items posted yet",
        "Rubrics will appear after first submission",
      ],
    },
    announcements: {
      title: "Announcements",
      description: `Placeholder announcements feed for ${courseTitle}.`,
      items: [
        "Welcome announcement will be posted here",
        "Weekly updates will appear in this tab",
        "Deadline reminders will be pinned",
      ],
    },
    files: {
      title: "Files",
      description: `Placeholder files area for ${courseTitle}.`,
      items: [
        "Syllabus.pdf",
        "Week-1-Slides.pdf",
        "Template-Worksheet.docx",
      ],
    },
    modules: {
      title: "Modules (Calendar View)",
      description: `Assignments and due dates organized by date for ${courseTitle}.`,
      items: [
        "Module 1: Getting Started",
        "Module 2: Core Concepts",
        "Module 3: Practice and Review",
      ],
      schedule: [
        {
          date: "Monday, March 23",
          entries: [
            { assignment: "Reading Check", due: "11:59 PM" },
          ],
        },
        {
          date: "Wednesday, March 25",
          entries: [
            { assignment: "Practice Assignment", due: "5:00 PM" },
          ],
        },
        {
          date: "Friday, March 27",
          entries: [
            { assignment: "Weekly Quiz", due: "8:00 PM" },
            { assignment: "Discussion Reply", due: "11:59 PM" },
          ],
        },
      ],
    },
  };
}

const courseData = {
  chemistry: {
    tag: "Chemistry",
    title: "Chemistry Lab Foundations",
    heading: "Lab Safety and First Experiment Setup",
    intro:
      "This course introduces lab safety procedures, scientific notation in measurements, and foundational experiment documentation.",
    todo: "Complete safety contract and upload lab notebook template by Wednesday.",
  },
  math: {
    tag: "Mathematics",
    title: "Discrete Mathematics",
    heading: "Logic, Sets, and Proof Basics",
    intro:
      "This module focuses on set operations, logical propositions, and proof techniques to build formal problem-solving skills.",
    todo: "Submit Problem Set 4 by Thursday at 11:59 PM.",
  },
  biology: {
    tag: "Biology",
    title: "Biology 101: Cell Systems",
    heading: "Cell Structure and Function",
    intro:
      "All living organisms are made of cells. This lesson compares prokaryotic and eukaryotic cells and introduces organelle functions.",
    todo: "Submit labeled eukaryotic cell diagram by Friday 5:00 PM.",
  },
  literature: {
    tag: "Literature",
    title: "Modern Literature",
    heading: "Narrative Voice and Theme",
    intro:
      "Students analyze point of view, thematic development, and rhetorical choices across short modern fiction pieces.",
    todo: "Upload reflection draft before Wednesday 8:00 PM.",
  },
  history: {
    tag: "History",
    title: "Global History",
    heading: "Trade Networks and Cultural Exchange",
    intro:
      "This unit explores how historic trade routes shaped political, economic, and cultural development across regions.",
    todo: "Prepare two arguments for Thursday debate circle.",
  },
  programming: {
    tag: "Computer Science",
    title: "Intro to Programming",
    heading: "Loops and Structured Problem Solving",
    intro:
      "This module practices loop logic, tracing code execution, and improving readability through clearer variable naming.",
    todo: "Complete loop challenge set and commit solutions by Tuesday night.",
  },
};

Object.values(courseData).forEach((course) => {
  course.tabs = makeTabPlaceholders(course.title);
});

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatAssignmentDate(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function getTeacherById(id) {
  return recordsTeachers.find((t) => t.id === id) || null;
}
function getClassById(id) {
  return recordsClasses.find((c) => c.id === id) || null;
}
function getAssignmentById(id) {
  return recordsAssignments.find((a) => a.id === id) || null;
}

function applyRecordsToCourseData() {
  Object.entries(courseKeyToClassId).forEach(([courseKey, classId]) => {
    const cls = getClassById(classId);
    const teacher = cls ? getTeacherById(cls.teacherId) : null;
    const list = recordsAssignments.filter((a) => a.classId === classId);
    const course = courseData[courseKey];
    if (!course) return;

    if (cls) {
      course.title = cls.name;
      course.tag = "Chemistry";
      if (cls.heading) course.heading = cls.heading;
      if (cls.description) course.intro = cls.description;
      const nextDue = list
        .filter((a) => {
          const grade = recordsAssignmentGrades.find(
            (g) => g.assignmentId === a.id && g.studentId === currentStudentId
          );
          return !grade || grade.pointsEarned == null;
        })
        .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))[0];
      course.todo = nextDue
        ? `Complete "${nextDue.title}" by ${formatAssignmentDate(nextDue.dueDate)} at ${nextDue.dueTime}.`
        : "All assignments for this unit are complete.";
    }

    if (list.length) {
      course.tabs.assignments = {
        title: "Assignments",
        description: `Assignments for ${course.title}.`,
        items: list.map((a) => ({
          title: a.title,
          description: a.description,
          dueDate: a.dueDate,
          dueTime: a.dueTime,
          pointsPossible: a.pointsPossible,
          type: a.type,
        })),
      };

      const byDate = {};
      list.forEach((a) => {
        const dateLabel = formatAssignmentDate(a.dueDate);
        if (!byDate[dateLabel]) byDate[dateLabel] = [];
        byDate[dateLabel].push({ assignment: a.title, due: a.dueTime });
      });
      const dateToIso = {};
      list.forEach((a) => { dateToIso[formatAssignmentDate(a.dueDate)] = a.dueDate; });
      const sortedDates = Object.keys(byDate).sort((a, b) => (dateToIso[a] || "").localeCompare(dateToIso[b] || ""));
      course.tabs.modules = {
        title: "Modules (Calendar View)",
        description: `Assignments and due dates organized by date for ${course.title}.`,
        items: course.tabs.modules.items,
        schedule: sortedDates.map((date) => ({ date, entries: byDate[date] })),
      };
    }

    const gradeRows = recordsAssignmentGrades
      .filter((g) => g.studentId === currentStudentId)
      .map((g) => {
        const a = getAssignmentById(g.assignmentId);
        return a && a.classId === classId
          ? {
              assignmentTitle: a.title,
              pointsEarned: g.pointsEarned,
              pointsPossible: a.pointsPossible,
              feedback: g.feedback,
            }
          : null;
      })
      .filter(Boolean);
    const classGrade = recordsClassGrades.find(
      (g) => g.studentId === currentStudentId && g.classId === classId
    );
    course.tabs.grades = {
      title: "Grades",
      description: classGrade
        ? `Current grade: ${classGrade.percent}% (${classGrade.letterGrade}).`
        : `Gradebook for ${course.title}.`,
      items: gradeRows.length
        ? gradeRows
        : ["No graded items posted yet."],
      recordGrades: true,
    };

    const announcements = recordsAnnouncements.filter((n) => n.classId === classId);
    course.tabs.announcements = {
      title: "Announcements",
      description: `Announcements for ${course.title}.`,
      items:
        announcements.length > 0
          ? announcements.map((n) => ({
              title: n.title,
              body: n.body,
              postedAt: n.postedAt,
            }))
          : course.tabs.announcements.items,
      recordAnnouncements: announcements.length > 0,
    };

    const files = recordsFiles.filter((f) => f.classId === classId);
    course.tabs.files = {
      title: "Files",
      description: `Course files for ${course.title}.`,
      items:
        files.length > 0
          ? files.map((f) => ({ name: f.name, type: f.type, url: f.url }))
          : course.tabs.files.items,
      recordFiles: files.length > 0,
    };
  });
}

function updateChemistryCard() {
  const classId = courseKeyToClassId.chemistry;
  const cls = getClassById(classId);
  const teacher = cls ? getTeacherById(cls.teacherId) : null;
  const classGrade = recordsClassGrades.find(
    (g) => g.studentId === currentStudentId && g.classId === classId
  );
  const card = document.querySelector('.class-card[data-course="chemistry"]');
  if (!card) return;
  const body = card.querySelector(".course-body");
  if (!body) return;
  if (cls) {
    const h3 = body.querySelector("h3");
    if (h3) h3.textContent = cls.name;
    const ps = body.querySelectorAll("p");
    if (teacher && ps[0]) ps[0].textContent = `${teacher.title} ${teacher.firstName} ${teacher.lastName}`;
    if (cls.schedule && ps[1]) ps[1].textContent = cls.schedule.replace(/\s+(\d)/, " | $1");
  }
  const gradeEl = body.querySelector(".course-grade");
  if (gradeEl && classGrade)
    gradeEl.textContent = `Grade: ${classGrade.percent}% (${classGrade.letterGrade})`;
}

async function loadRecords() {
  const files = [
    "teachers.json",
    "classes.json",
    "students.json",
    "enrollments.json",
    "assignments.json",
    "assignment_grades.json",
    "class_grades.json",
    "announcements.json",
    "files.json",
  ];
  try {
    const results = await Promise.all(
      files.map((f) => fetch(`${RECORDS_BASE}/${f}`).then((r) => (r.ok ? r.json() : [])))
    );
    [
      recordsTeachers,
      recordsClasses,
      recordsStudents,
      recordsEnrollments,
      recordsAssignments,
      recordsAssignmentGrades,
      recordsClassGrades,
      recordsAnnouncements,
      recordsFiles,
    ] = results.map((r) => (Array.isArray(r) ? r : []));
    recordsLoaded = true;
    applyRecordsToCourseData();
    updateChemistryCard();
    if (currentCourse !== "home") renderActiveTab();
  } catch (e) {
    console.warn("Could not load records. Serve the app over HTTP (see README).", e);
  }
}

loadRecords();

function appendMessage(text, role) {
  const bubble = document.createElement("div");
  bubble.className = `message ${role}`;
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderActiveTab() {
  if (currentCourse === "home") return;

  const tabData = courseData[currentCourse].tabs[activeTab];
  if (!tabData) return;

  tabTitle.textContent = tabData.title;
  tabDescription.textContent = tabData.description;

  tabList.innerHTML = "";
  calendarGroups.innerHTML = "";

  if (activeTab === "modules" && tabData.schedule) {
    tabList.classList.add("hidden");
    calendarGroups.classList.remove("hidden");

    tabData.schedule.forEach((group) => {
      const groupEl = document.createElement("section");
      groupEl.className = "calendar-group";

      const heading = document.createElement("h4");
      heading.textContent = group.date;
      groupEl.appendChild(heading);

      const list = document.createElement("ul");
      group.entries.forEach((entry) => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${entry.assignment}</span><strong>Due ${entry.due}</strong>`;
        list.appendChild(li);
      });

      groupEl.appendChild(list);
      calendarGroups.appendChild(groupEl);
    });
  } else {
    tabList.classList.remove("hidden");
    calendarGroups.classList.add("hidden");

    tabData.items.forEach((item) => {
      const li = document.createElement("li");
      if (item && typeof item === "object" && "title" in item && "dueDate" in item) {
        const dueStr = item.dueDate && item.dueTime
          ? `Due ${new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${item.dueTime}`
          : "";
        const ptsStr = item.pointsPossible != null ? ` (${item.pointsPossible} pts)` : "";
        li.innerHTML = `<strong>${escapeHtml(item.title)}</strong>${dueStr ? ` — ${dueStr}${ptsStr}` : ""}` +
          (item.description ? `<p class="assignment-desc">${escapeHtml(item.description)}</p>` : "");
      } else if (tabData.recordGrades && item && typeof item === "object" && "assignmentTitle" in item) {
        const pts = item.pointsEarned != null
          ? `${item.pointsEarned}/${item.pointsPossible != null ? item.pointsPossible : "?"} pts`
          : "—";
        li.innerHTML =
          `<strong>${escapeHtml(item.assignmentTitle)}</strong> — ${pts}` +
          (item.feedback ? `<p class="assignment-desc">${escapeHtml(item.feedback)}</p>` : "");
      } else if (tabData.recordAnnouncements && item && typeof item === "object" && "title" in item && "body" in item) {
        const dateStr = item.postedAt
          ? new Date(item.postedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "";
        li.innerHTML =
          `<strong>${escapeHtml(item.title)}</strong>${dateStr ? ` <span class="muted">${dateStr}</span>` : ""}` +
          `<p class="assignment-desc">${escapeHtml(item.body)}</p>`;
      } else if (tabData.recordFiles && item && typeof item === "object" && "name" in item) {
        li.innerHTML = `<a href="${escapeHtml(item.url || "#")}">${escapeHtml(item.name)}</a>`;
      } else {
        li.textContent = typeof item === "string" ? item : "";
      }
      tabList.appendChild(li);
    });
  }

  courseTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === activeTab);
  });
}

function renderCourseDetail(key) {
  const course = courseData[key];
  if (!course) return;

  currentCourse = key;
  activeTab = "assignments";

  detailTag.textContent = course.tag;
  detailTitle.textContent = course.title;
  detailHeading.textContent = course.heading;
  detailIntro.textContent = course.intro;

  renderActiveTab();
}

function buildEventMapForActiveMonth() {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const eventMap = {};

  if (year !== 2026 || month !== 2) return eventMap;

  Object.values(courseData).forEach((course) => {
    course.tabs.modules.schedule.forEach((group) => {
      const match = group.date.match(/(\d{1,2})$/);
      if (!match) return;
      const day = Number(match[1]);
      if (!eventMap[day]) eventMap[day] = [];

      group.entries.forEach((entry) => {
        eventMap[day].push({
          assignment: entry.assignment,
          due: entry.due,
          course: course.title,
        });
      });
    });
  });

  return eventMap;
}

function renderMiniMonth(firstDay, daysInMonth, prevDays) {
  miniGrid.innerHTML = "";

  for (let i = 0; i < 42; i += 1) {
    const dayCell = document.createElement("span");
    let dayNum = 0;

    if (i < firstDay) {
      dayNum = prevDays - firstDay + i + 1;
      dayCell.classList.add("outside");
    } else if (i < firstDay + daysInMonth) {
      dayNum = i - firstDay + 1;
      const isToday =
        calendarDate.getFullYear() === 2026 &&
        calendarDate.getMonth() === 2 &&
        dayNum === 16;
      if (isToday) dayCell.classList.add("today");
    } else {
      dayNum = i - (firstDay + daysInMonth) + 1;
      dayCell.classList.add("outside");
    }

    dayCell.textContent = String(dayNum);
    miniGrid.appendChild(dayCell);
  }
}

function renderCalendarMonth() {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const monthName = calendarDate.toLocaleString("en-US", { month: "long", year: "numeric" });
  const eventsByDay = buildEventMapForActiveMonth();

  calendarMonthLabel.textContent = monthName;
  miniMonthLabel.textContent = monthName;
  monthGrid.innerHTML = "";

  for (let i = 0; i < 42; i += 1) {
    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day";

    let dayNum = 0;
    let outside = false;

    if (i < firstDay) {
      dayNum = prevDays - firstDay + i + 1;
      outside = true;
    } else if (i < firstDay + daysInMonth) {
      dayNum = i - firstDay + 1;
    } else {
      dayNum = i - (firstDay + daysInMonth) + 1;
      outside = true;
    }

    if (outside) dayEl.classList.add("outside");
    if (!outside && year === 2026 && month === 2 && dayNum === 16) {
      dayEl.classList.add("today");
    }

    const number = document.createElement("div");
    number.className = "day-number";
    number.textContent = String(dayNum);
    dayEl.appendChild(number);

    if (!outside && eventsByDay[dayNum]) {
      const events = eventsByDay[dayNum];
      events.slice(0, 2).forEach((event) => {
        const chip = document.createElement("span");
        chip.className = "event-chip";
        chip.innerHTML = `${event.assignment}<br /><strong>${event.course} | Due ${event.due}</strong>`;
        dayEl.appendChild(chip);
      });

      if (events.length > 2) {
        const more = document.createElement("span");
        more.className = "more-chip";
        more.textContent = `+${events.length - 2} more`;
        dayEl.appendChild(more);
      }
    }

    monthGrid.appendChild(dayEl);
  }

  renderMiniMonth(firstDay, daysInMonth, prevDays);
}

function setActiveNav(active) {
  [navDashboard, navCourses, navCalendar, navInbox].forEach((el) => el.classList.remove("active"));

  if (active === "calendar") {
    navCalendar.classList.add("active");
  } else {
    navDashboard.classList.add("active");
  }
}

function showView(view) {
  if (view === "detail") {
    homeView.classList.add("hidden");
    calendarView.classList.add("hidden");
    detailView.classList.remove("hidden");
    setActiveNav("dashboard");
  } else if (view === "calendar") {
    homeView.classList.add("hidden");
    detailView.classList.add("hidden");
    calendarView.classList.remove("hidden");
    setActiveNav("calendar");
    renderCalendarMonth();
  } else {
    currentCourse = "home";
    calendarView.classList.add("hidden");
    detailView.classList.add("hidden");
    homeView.classList.remove("hidden");
    setActiveNav("dashboard");
  }
}

function activeContextText() {
  if (!calendarView.classList.contains("hidden")) {
    return calendarView.innerText.toLowerCase();
  }

  return detailView.classList.contains("hidden")
    ? homeView.innerText.toLowerCase()
    : detailView.innerText.toLowerCase();
}

function answerFromContext(question) {
  const q = question.toLowerCase();

  if (!calendarView.classList.contains("hidden")) {
    if (q.includes("due") || q.includes("deadline") || q.includes("calendar")) {
      return "This calendar month view organizes assignments by date cells, with each event showing course and due time.";
    }
  }

  if (!detailView.classList.contains("hidden") && currentCourse !== "home") {
    const course = courseData[currentCourse];

    if (q.includes("todo") || q.includes("due") || q.includes("deadline")) {
      return course.todo;
    }

    if (q.includes("calendar") || q.includes("due date") || q.includes("due dates")) {
      return `In Modules, assignments are organized by date (for example Monday, March 23, Wednesday, March 25, and Friday, March 27) with due times shown next to each item.`;
    }

    if (q.includes("assignments") || q.includes("grades") || q.includes("announcements") || q.includes("files") || q.includes("modules")) {
      return `This course includes these tabs: Assignments, Grades, Announcements, Files, and Modules. The Modules tab now shows a calendar-style schedule with assignment due dates.`;
    }

    if (q.includes("what class") || q.includes("course name")) {
      return `You are viewing ${course.title}.`;
    }
  }

  if (q.includes("published classes") || q.includes("how many classes")) {
    return "The home dashboard shows 6 published classes.";
  }

  const context = activeContextText();
  const words = q.split(/\W+/).filter((w) => w.length > 3);
  const overlap = words.filter((w) => context.includes(w));

  if (overlap.length >= 2) {
    return `I can see that in the current page context (for example: ${overlap.slice(0, 3).join(", ")}). Ask a more specific question for a precise answer.`;
  }

  return "I couldn't find that directly here yet. Ask about class tabs, deadlines, or dashboard tasks.";
}

function setChatOpen(isOpen) {
  appShell.classList.toggle("chat-open", isOpen);
  chatPanel.setAttribute("aria-hidden", String(!isOpen));

  toggleButtons.forEach((btn) => {
    btn.setAttribute("aria-expanded", String(isOpen));
    btn.textContent = isOpen ? "Close AI Study Helper" : "Open AI Study Helper";
  });
}

cards.forEach((card) => {
  card.addEventListener("click", () => {
    renderCourseDetail(card.dataset.course);
    showView("detail");
  });
});

navDashboard.addEventListener("click", (event) => {
  event.preventDefault();
  showView("home");
});

navCalendar.addEventListener("click", (event) => {
  event.preventDefault();
  showView("calendar");
});

navCourses.addEventListener("click", (event) => {
  event.preventDefault();
  showView("home");
});

navInbox.addEventListener("click", (event) => {
  event.preventDefault();
  showView("home");
});

calendarPrev.addEventListener("click", () => {
  calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1);
  renderCalendarMonth();
});

calendarNext.addEventListener("click", () => {
  calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1);
  renderCalendarMonth();
});

miniPrev.addEventListener("click", () => {
  calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1);
  renderCalendarMonth();
});

miniNext.addEventListener("click", () => {
  calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1);
  renderCalendarMonth();
});

courseTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeTab = tab.dataset.tab;
    renderActiveTab();
  });
});

backToHome.addEventListener("click", () => showView("home"));

toggleButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const willOpen = !appShell.classList.contains("chat-open");
    setChatOpen(willOpen);
    if (willOpen) chatInput.focus();
  });
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const question = chatInput.value.trim();
  if (!question) return;

  appendMessage(question, "user");
  const response = answerFromContext(question);

  window.setTimeout(() => {
    appendMessage(response, "bot");
  }, 180);

  chatInput.value = "";
  chatInput.focus();
});
