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

const filesPanel = document.getElementById("filesPanel");
const folderList = document.getElementById("folderList");
const fileItems = document.getElementById("fileItems");
const selectedFolderTitle = document.getElementById("selectedFolderTitle");
const selectedFolderDesc = document.getElementById("selectedFolderDesc");
const modulesAccordion = document.getElementById("modulesAccordion");

const toggleButtons = [
  document.getElementById("chatToggle"),
  document.getElementById("chatToggleCalendar"),
  document.getElementById("chatToggleDetail"),
].filter(Boolean);

let currentCourse = "home";
let activeTab = "assignments";
let calendarDate = new Date(2026, 2, 1);

function makeTabPlaceholders(courseTitle) {
  return {
    assignments: {
      title: "Assignments",
      description: `Track overdue, past, and current assignments for ${courseTitle}.`,
      sections: [
        {
          label: "Overdue Assignments",
          summary: "Needs immediate action",
          items: [
            "Lab report draft (was due Mon)",
            "Problem set 3 (was due Tue)",
          ],
        },
        {
          label: "Current Assignments",
          summary: "Due this week",
          items: [
            "Weekly quiz (due Fri)",
            "Group discussion post (due Thu)",
          ],
        },
        {
          label: "Past Assignments",
          summary: "Completed or submitted",
          items: [
            "Intro reading response (submitted)",
            "Warm-up worksheet (feedback pending)",
          ],
        },
      ],
    },
    grades: {
      title: "Grades",
      description: `View overall class grade and assignment score details for ${courseTitle}.`,
      records: [
        {
          name: "Lab Report 1",
          dueDate: "Mar 5",
          submittedDate: "Mar 5",
          status: "Complete",
          earned: 96,
          total: 100,
          teacherNotes: "Excellent method section; improve conclusion clarity.",
        },
        {
          name: "Problem Set 2",
          dueDate: "Mar 10",
          submittedDate: "Mar 12",
          status: "Late",
          earned: 84,
          total: 100,
          teacherNotes: "Submitted late, so points were deducted. Good effort; watch algebraic simplification.",
        },
        {
          name: "Quiz 3",
          dueDate: "Mar 16",
          submittedDate: "-",
          status: "Missing",
          earned: 0,
          total: 100,
          teacherNotes: "Not submitted. Missing work receives a zero.",
        },
      ],
    },
    announcements: {
      title: "Announcements",
      description: `Teacher announcements for ${courseTitle}.`,
      posts: [
        {
          title: "Lab 2 Safety Check",
          preview: "Please submit your safety check form before lab time.",
          date: "Mar 12, 2026",
        },
        {
          title: "Guest Speaker This Friday",
          preview: "We will have Dr. Patel speak on chromatography techniques.",
          date: "Mar 10, 2026",
        },
        {
          title: "Homework Correction",
          preview: "The answer key has been updated; review questions 4 and 7.",
          date: "Mar 8, 2026",
        },
      ],
    },
    files: {
      title: "Files",
      description: `Class files and materials for ${courseTitle}.`,
      folders: {
        Syllabus: [
          { name: "Course Syllabus.pdf", type: "PDF" },
          { name: "Grading Guide.pdf", type: "PDF" },
        ],
        Assignments: [
          { name: "Assignment 1 Instructions.docx", type: "DOCX" },
          { name: "Assignment 2 Template.docx", type: "DOCX" },
        ],
        Homework: [
          { name: "Homework Week 1.pdf", type: "PDF" },
          { name: "Homework Week 2.pdf", type: "PDF" },
        ],
        Slides: [
          { name: "Week 1 Slides.pptx", type: "PPTX" },
          { name: "Week 2 Slides.pptx", type: "PPTX" },
        ],
      },
    },
    modules: {
      title: "Modules",
      description: `Weekly modules and resources for ${courseTitle}.`,
      weeks: [
        {
          title: "Week 1",
          summary: "Intro and Lab Safety",
          materials: ["Lab Safety Guide", "Lab Setup Video"],
          assignments: ["Safety Contract", "Pre-lab Quiz"],
          homework: ["Worksheet 1", "Lab Reflection"],
        },
        {
          title: "Week 2",
          summary: "Measurements and Data",
          materials: ["Metric Units Notes", "Measurement Demo"],
          assignments: ["Measurement Worksheet", "Problem Set 1"],
          homework: ["Homework 2: Conversion", "Data Practice"],
        },
        {
          title: "Week 3",
          summary: "Experimental Design",
          materials: ["Design Principles", "Sample Experiment"],
          assignments: ["Design Proposal", "Peer Feedback"],
          homework: ["Lab Report Outline"],
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

  const assignmentsAccordion = document.getElementById("assignmentsAccordion");
  const gradesPanel = document.getElementById("gradesPanel");
  const overallGradeEl = document.getElementById("overallGrade");
  const gradesTableBody = document.querySelector("#gradesTable tbody");
  const announcementSearch = document.getElementById("announcementSearch");
  const announcementList = document.getElementById("announcementList");
  const announcementsPanel = document.getElementById("announcementsPanel");

  // Reset everything first
  tabList.innerHTML = "";
  calendarGroups.innerHTML = "";
  assignmentsAccordion.innerHTML = "";
  gradesTableBody.innerHTML = "";
  announcementList.innerHTML = "";
  modulesAccordion.innerHTML = "";
  folderList.innerHTML = "";
  fileItems.innerHTML = "";
  filesPanel.classList.add("hidden");

  assignmentsAccordion.classList.add("hidden");
  gradesPanel.classList.add("hidden");
  tabList.classList.add("hidden");
  calendarGroups.classList.add("hidden");
  announcementsPanel.classList.add("hidden");
  modulesAccordion.classList.add("hidden");

  // ASSIGNMENTS TAB ONLY
  if (activeTab === "assignments") {
    assignmentsAccordion.classList.remove("hidden");

    (tabData.sections || []).forEach((section, index) => {
      const sectionEl = document.createElement("div");
      sectionEl.className = "assignment-section";

      const header = document.createElement("button");
      header.className = "assignment-header";
      header.setAttribute("aria-expanded", index === 0 ? "true" : "false");
      header.innerHTML = `
        <span>${section.label}</span>
        <small>${section.summary}</small>
        <span class="caret">${index === 0 ? "−" : "+"}</span>
      `;
      sectionEl.appendChild(header);

      const listEl = document.createElement("ul");
      listEl.className = `assignment-list ${index === 0 ? "open" : ""}`;

      (section.items || []).forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        listEl.appendChild(li);
      });

      sectionEl.appendChild(listEl);

      header.addEventListener("click", () => {
        const expanded = header.getAttribute("aria-expanded") === "true";
        header.setAttribute("aria-expanded", String(!expanded));
        listEl.classList.toggle("open", !expanded);

        const caret = header.querySelector(".caret");
        if (caret) caret.textContent = expanded ? "+" : "−";
      });

      assignmentsAccordion.appendChild(sectionEl);
    });
  }

  // GRADES TAB ONLY
  else if (activeTab === "grades") {
    gradesPanel.classList.remove("hidden");

    const records = tabData.records || [];

    let totalEarned = 0;
    let totalPossible = 0;

    records.forEach((record) => {
      const earned =
        record.status === "Missing"
          ? 0
          : Number(record.earned ?? 0);

      const total = Number(record.total ?? 100);

      totalEarned += earned;
      totalPossible += total;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${record.name}</td>
        <td>${record.dueDate}</td>
        <td>${record.submittedDate || "-"}</td>
        <td>${record.status}</td>
        <td>${earned}/${total}</td>
        <td><button class="note-btn">View Notes</button></td>
      `;

      const noteBtn = tr.querySelector(".note-btn");
      noteBtn.addEventListener("click", () => {
        alert(`${record.name} notes:\n${record.teacherNotes || "No notes"}`);
      });

      gradesTableBody.appendChild(tr);
    });

    const overallPercent =
      totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

    overallGradeEl.textContent = `${overallPercent}%`;
  }

  // ANNOUNCEMENTS TAB ONLY
  else if (activeTab === "announcements") {
    announcementsPanel.classList.remove("hidden");
    announcementSearch.value = "";

    const renderAnnouncements = (filter = "") => {
      announcementList.innerHTML = "";
      const normalizedFilter = filter.toLowerCase();
      const posts = (tabData.posts || []).filter((post) => {
        if (!normalizedFilter) return true;
        return (
          post.title.toLowerCase().includes(normalizedFilter) ||
          post.preview.toLowerCase().includes(normalizedFilter)
        );
      });

      if (posts.length === 0) {
        const empty = document.createElement("div");
        empty.className = "announcement-empty";
        empty.textContent = "No announcements found.";
        announcementList.appendChild(empty);
        return;
      }

      posts.forEach((post) => {
        const row = document.createElement("article");
        row.className = "announcement-row";
        row.innerHTML = `
          <div class="announcement-left">
            <div class="announcement-title">${post.title}</div>
            <div class="announcement-preview">${post.preview}</div>
          </div>
          <div class="announcement-date">${post.date}</div>
        `;
        announcementList.appendChild(row);
      });
    };

    renderAnnouncements();
    announcementSearch.addEventListener("input", (e) => {
      renderAnnouncements(e.target.value);
    });
  }

  // FILES TAB ONLY
  else if (activeTab === "files") {

    filesPanel.classList.remove("hidden");
    folderList.innerHTML = "";
    fileItems.innerHTML = "";

    const folders = tabData.folders || {};
    const folderNames = Object.keys(folders);
    const defaultFolder = folderNames[0] || "";
    let activeFolder = defaultFolder;

    const renderFiles = (folderName) => {
      fileItems.innerHTML = "";
      selectedFolderTitle.textContent = folderName;
      selectedFolderDesc.textContent = `Open ${folderName.toLowerCase()} files`;      

      (folders[folderName] || []).forEach((file) => {
        const li = document.createElement("li");
        li.className = "file-item";
        li.innerHTML = `<strong>${file.name}</strong><span>${file.type}</span>`;
        fileItems.appendChild(li);
      });
    };

    folderNames.forEach((folderName) => {
      const button = document.createElement("button");
      button.className = `folder-btn${folderName === activeFolder ? " active" : ""}`;
      button.textContent = folderName;
      button.addEventListener("click", () => {
        activeFolder = folderName;
        document.querySelectorAll(".folder-btn").forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        renderFiles(folderName);
      });
      folderList.appendChild(button);
    });

    renderFiles(activeFolder);
  }

  // MODULES TAB ONLY
  else if (activeTab === "modules") {
    modulesAccordion.classList.remove("hidden");
    const weeks = tabData.weeks || [];

    weeks.forEach((week, index) => {
      const weekEl = document.createElement("div");
      weekEl.className = "module-week";

      const header = document.createElement("button");
      header.className = "module-week-header";
      header.setAttribute("aria-expanded", index === 0 ? "true" : "false");
      header.innerHTML = `
        <span>${week.title}</span>
        <small>${week.summary}</small>
        <span class="caret">${index === 0 ? "−" : "+"}</span>
      `;
      weekEl.appendChild(header);

      const content = document.createElement("div");
      content.className = `module-week-content ${index === 0 ? "open" : ""}`;
      const sectionTemplate = (label, items) => {
        const sec = document.createElement("div");
        sec.className = "module-section";
        sec.innerHTML = `<h4>${label}</h4><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
        return sec;
      };

      content.appendChild(sectionTemplate("Class Material", week.materials || []));
      content.appendChild(sectionTemplate("Assignments", week.assignments || []));
      content.appendChild(sectionTemplate("Homework", week.homework || []));

      weekEl.appendChild(content);

      header.addEventListener("click", () => {
        const expanded = header.getAttribute("aria-expanded") === "true";
        header.setAttribute("aria-expanded", String(!expanded));
        content.classList.toggle("open", expanded ? false : true);
        const caret = header.querySelector(".caret");
        if (caret) caret.textContent = expanded ? "+" : "−";
      });

      modulesAccordion.appendChild(weekEl);
    });
  }

  // OTHER TABS
  else {
    tabList.classList.remove("hidden");

    (tabData.items || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
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
