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

const analyticsClassSelect = document.getElementById("analyticsClassSelect");
const analyticsStudentSelect = document.getElementById("analyticsStudentSelect");
const gradePieChart = document.getElementById("gradePieChart");
const studentBarChart = document.getElementById("studentBarChart");
const trendLineChart = document.getElementById("trendLineChart");
const gradePieLegend = document.getElementById("gradePieLegend");
const analyticsInsights = document.getElementById("analyticsInsights");

const filesPanel = document.getElementById("filesPanel");
const folderList = document.getElementById("folderList");
const fileItems = document.getElementById("fileItems");
const selectedFolderTitle = document.getElementById("selectedFolderTitle");
const selectedFolderDesc = document.getElementById("selectedFolderDesc");
const modulesAccordion = document.getElementById("modulesAccordion");
const analyticsPanel = document.getElementById("analyticsPanel");

const toggleButtons = [
  document.getElementById("chatToggle"),
  document.getElementById("chatToggleCalendar"),
  document.getElementById("chatToggleDetail"),
].filter(Boolean);

let currentCourse = "home";
let activeTab = "assignments";
let calendarDate = new Date(2026, 2, 1);
let analyticsClassId = "c1";
let analyticsStudentId = "s1";

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
    analytics: {
      title: "Analytics",
      description: `Progress analytics for ${courseTitle}.`,
      items: [],
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
      const now = new Date("2026-03-26T12:00:00");
      const getStatus = (assignment) => {
        const grade = recordsAssignmentGrades.find(
          (g) => g.studentId === currentStudentId && g.assignmentId === assignment.id
        );
        if (grade && grade.pointsEarned != null) return "Past Assignments";
        const dueDate = new Date(`${assignment.dueDate}T23:59:59`);
        return dueDate < now ? "Overdue Assignments" : "Current Assignments";
      };

      const sectionMap = {
        "Overdue Assignments": [],
        "Current Assignments": [],
        "Past Assignments": [],
      };

      list.forEach((a) => {
        const dueLabel = a.dueDate
          ? `${new Date(a.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })} ${a.dueTime || ""}`.trim()
          : "No due date";
        const itemText = `${a.title} (${a.pointsPossible} pts) — Due ${dueLabel}`;
        sectionMap[getStatus(a)].push(itemText);
      });

      course.tabs.assignments = {
        title: "Assignments",
        description: `Assignments for ${course.title}.`,
        sections: [
          {
            label: "Overdue Assignments",
            summary: "Needs immediate action",
            items: sectionMap["Overdue Assignments"].length
              ? sectionMap["Overdue Assignments"]
              : ["No overdue assignments."],
          },
          {
            label: "Current Assignments",
            summary: "Due soon",
            items: sectionMap["Current Assignments"].length
              ? sectionMap["Current Assignments"]
              : ["No current assignments."],
          },
          {
            label: "Past Assignments",
            summary: "Completed or submitted",
            items: sectionMap["Past Assignments"].length
              ? sectionMap["Past Assignments"]
              : ["No past assignments yet."],
          },
        ],
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
        if (!a || a.classId !== classId) return null;
        return {
          name: a.title,
          dueDate: a.dueDate
            ? new Date(a.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "-",
          submittedDate: g.pointsEarned == null ? "-" : "Submitted",
          status: g.pointsEarned == null ? "Missing" : "Complete",
          earned: g.pointsEarned == null ? 0 : Number(g.pointsEarned),
          total: Number(a.pointsPossible || 0),
          teacherNotes: g.feedback || "No feedback yet.",
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const ad = new Date(`2026 ${a.dueDate}`).getTime() || 0;
        const bd = new Date(`2026 ${b.dueDate}`).getTime() || 0;
        return ad - bd;
      });
    const classGrade = recordsClassGrades.find(
      (g) => g.studentId === currentStudentId && g.classId === classId
    );
    course.tabs.grades = {
      title: "Grades",
      description: classGrade
        ? `Current grade: ${classGrade.percent}% (${classGrade.letterGrade}).`
        : `Gradebook for ${course.title}.`,
      records: gradeRows.length
        ? gradeRows
        : [
            {
              name: "No graded items posted yet",
              dueDate: "-",
              submittedDate: "-",
              status: "-",
              earned: 0,
              total: 0,
              teacherNotes: "No feedback yet.",
            },
          ],
      recordGrades: gradeRows.length > 0,
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
    populateAnalyticsFilters();
    renderAnalytics();
    if (currentCourse !== "home") renderActiveTab();
  } catch (e) {
    console.warn("Could not load records. Serve the app over HTTP (see README).", e);
  }
}

loadRecords();

function getClassAssignments(classId) {
  return recordsAssignments
    .filter((a) => a.classId === classId)
    .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));
}

function getStudentName(studentId) {
  const s = recordsStudents.find((x) => x.id === studentId);
  if (!s) return "Unknown Student";
  return `${s.firstName} ${s.lastName}`;
}

function populateAnalyticsFilters() {
  if (!analyticsClassSelect || !analyticsStudentSelect) return;

  const enrolledClassIds = Array.from(new Set(recordsEnrollments.map((e) => e.classId)));
  const classes = recordsClasses.filter((c) => enrolledClassIds.includes(c.id));

  analyticsClassSelect.innerHTML = "";
  classes.forEach((cls) => {
    const option = document.createElement("option");
    option.value = cls.id;
    option.textContent = cls.name;
    analyticsClassSelect.appendChild(option);
  });

  if (!classes.find((c) => c.id === analyticsClassId)) {
    analyticsClassId = classes[0]?.id || "c1";
  }
  analyticsClassSelect.value = analyticsClassId;

  const studentIdsForClass = recordsEnrollments
    .filter((e) => e.classId === analyticsClassId)
    .map((e) => e.studentId);
  const classStudents = recordsStudents.filter((s) => studentIdsForClass.includes(s.id));

  analyticsStudentSelect.innerHTML = "";
  classStudents.forEach((student) => {
    const option = document.createElement("option");
    option.value = student.id;
    option.textContent = `${student.firstName} ${student.lastName}`;
    analyticsStudentSelect.appendChild(option);
  });

  if (!classStudents.find((s) => s.id === analyticsStudentId)) {
    analyticsStudentId = classStudents[0]?.id || currentStudentId;
  }
  analyticsStudentSelect.value = analyticsStudentId;
}

function setupCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 300;
  const height = canvas.clientHeight || Number(canvas.getAttribute("height") || 200);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
}

function drawPieChart(canvas, values, colors) {
  const { ctx, width, height } = setupCanvas(canvas);
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.34;
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  let start = -Math.PI / 2;

  values.forEach((value, index) => {
    const angle = (value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = colors[index];
    ctx.fill();
    start += angle;
  });

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.53, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
}

function drawBarChart(canvas, labels, values) {
  const { ctx, width, height } = setupCanvas(canvas);
  const left = 40;
  const right = 16;
  const top = 14;
  const bottom = 34;
  const chartW = width - left - right;
  const chartH = height - top - bottom;

  ctx.strokeStyle = "#d7e3e1";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, top + chartH);
  ctx.lineTo(left + chartW, top + chartH);
  ctx.stroke();

  const max = 100;
  const slot = chartW / Math.max(values.length, 1);
  const barW = Math.max(16, slot * 0.55);

  values.forEach((v, i) => {
    const x = left + i * slot + (slot - barW) / 2;
    const h = Math.max(0, (v / max) * chartH);
    const y = top + chartH - h;
    ctx.fillStyle = "#6aa5af";
    ctx.fillRect(x, y, barW, h);
    ctx.fillStyle = "#2f4c56";
    ctx.font = "11px Nunito";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(v)}%`, x + barW / 2, y - 6);
    ctx.fillStyle = "#5a7079";
    ctx.fillText(labels[i], x + barW / 2, top + chartH + 14);
  });
}

function drawTrendChart(canvas, labels, studentValues, classValues) {
  const { ctx, width, height } = setupCanvas(canvas);
  const left = 42;
  const right = 18;
  const top = 20;
  const bottom = 36;
  const chartW = width - left - right;
  const chartH = height - top - bottom;
  const max = 100;

  ctx.strokeStyle = "#d7e3e1";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i += 1) {
    const y = top + (chartH / 5) * i;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(left + chartW, y);
    ctx.stroke();
  }

  // Y-axis labels: score percentage
  ctx.font = "11px Nunito";
  ctx.fillStyle = "#5a7079";
  ctx.textAlign = "right";
  for (let i = 0; i <= 5; i += 1) {
    const value = 100 - i * 20;
    const y = top + (chartH / 5) * i + 4;
    ctx.fillText(`${value}`, left - 8, y);
  }

  // Y-axis title
  ctx.save();
  ctx.translate(14, top + chartH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillStyle = "#46616b";
  ctx.fillText("Score (%)", 0, 0);
  ctx.restore();

  const step = labels.length > 1 ? chartW / (labels.length - 1) : 0;
  const point = (index, value) => ({
    x: left + step * index,
    y: top + chartH - (value / max) * chartH,
  });

  function plotLine(values, color) {
    if (!values.length) return;
    ctx.beginPath();
    values.forEach((value, index) => {
      const p = point(index, value);
      if (index === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    values.forEach((value, index) => {
      const p = point(index, value);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
  }

  plotLine(classValues, "#6f8ea2");
  plotLine(studentValues, "#2f8d71");

  ctx.font = "11px Nunito";
  ctx.fillStyle = "#5a7079";
  ctx.textAlign = "center";
  labels.forEach((label, index) => {
    const p = point(index, 0);
    ctx.fillText(label, p.x, top + chartH + 16);
  });

  ctx.textAlign = "left";
  ctx.fillStyle = "#38535e";
  ctx.fillRect(left + 8, top + 6, 10, 10);
  ctx.fillStyle = "#2f4c56";
  ctx.fillText("Class Avg", left + 24, top + 15);
  ctx.fillStyle = "#2f8d71";
  ctx.fillRect(left + 108, top + 6, 10, 10);
  ctx.fillStyle = "#2f4c56";
  ctx.fillText("Student", left + 124, top + 15);
}

function buildGradeDistribution(classId) {
  const gradeRows = recordsClassGrades.filter((g) => g.classId === classId);
  const bins = { A: 0, B: 0, C: 0, Df: 0 };

  gradeRows.forEach((row) => {
    const p = Number(row.percent || 0);
    if (p >= 90) bins.A += 1;
    else if (p >= 80) bins.B += 1;
    else if (p >= 70) bins.C += 1;
    else bins.Df += 1;
  });

  return bins;
}

function buildAssignmentSeries(classId, studentId) {
  const assignments = getClassAssignments(classId);
  const labels = assignments.map((a, idx) => `A${idx + 1}`);

  const studentValues = assignments.map((a) => {
    const grade = recordsAssignmentGrades.find((g) => g.studentId === studentId && g.assignmentId === a.id);
    if (!grade || grade.pointsEarned == null) return 0;
    return Math.round((Number(grade.pointsEarned) / Number(a.pointsPossible || 1)) * 100);
  });

  const classValues = assignments.map((a) => {
    const rows = recordsAssignmentGrades.filter((g) => g.assignmentId === a.id && g.pointsEarned != null);
    if (!rows.length) return 0;
    const avg = rows.reduce((sum, row) => sum + Number(row.pointsEarned || 0), 0) / rows.length;
    return Math.round((avg / Number(a.pointsPossible || 1)) * 100);
  });

  return { labels, assignments, studentValues, classValues };
}

function renderAnalyticsInsights(classId, studentId, series) {
  analyticsInsights.innerHTML = "";
  const studentGrade = recordsClassGrades.find((g) => g.classId === classId && g.studentId === studentId);
  const overall = studentGrade ? `${studentGrade.percent}% (${studentGrade.letterGrade})` : "Not available";
  const missingCount = series.studentValues.filter((v) => v === 0).length;

  let weakestIndex = 0;
  series.studentValues.forEach((value, idx) => {
    if (value < series.studentValues[weakestIndex]) weakestIndex = idx;
  });
  const weakest = series.assignments[weakestIndex];
  const weakestScore = series.studentValues[weakestIndex] || 0;

  const messages = [
    `${getStudentName(studentId)} current overall grade: ${overall}.`,
    `Missing or unsubmitted assignments: ${missingCount}.`,
    weakest
      ? `Lowest assignment performance: "${weakest.title}" at ${weakestScore}%.`
      : "No assignment analytics available yet.",
    "Goal suggestion: Raise the lowest assignment category by 10-15% to improve overall trend.",
  ];

  messages.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    analyticsInsights.appendChild(li);
  });
}

function renderAnalytics() {
  if (!analyticsPanel || !gradePieChart || !studentBarChart || !trendLineChart) return;

  if (!recordsLoaded) {
    drawPieChart(gradePieChart, [1], ["#d8e6e9"]);
    drawBarChart(studentBarChart, ["A1", "A2"], [0, 0]);
    drawTrendChart(trendLineChart, ["A1", "A2"], [0, 0], [0, 0]);
    if (gradePieLegend) gradePieLegend.innerHTML = "<span><i style='background:#d8e6e9'></i>Loading records...</span>";
    return;
  }

  const bins = buildGradeDistribution(analyticsClassId);
  const pieValues = [bins.A, bins.B, bins.C, bins.Df];
  const pieColors = ["#4aa77a", "#62b3c8", "#e9b46b", "#d57a7a"];
  drawPieChart(gradePieChart, pieValues, pieColors);

  if (gradePieLegend) {
    gradePieLegend.innerHTML = "";
    ["A (90-100)", "B (80-89)", "C (70-79)", "D/F (<70)"].forEach((label, idx) => {
      const pill = document.createElement("span");
      pill.innerHTML = `<i style="background:${pieColors[idx]}"></i>${label}: ${pieValues[idx]}`;
      gradePieLegend.appendChild(pill);
    });
  }

  const series = buildAssignmentSeries(analyticsClassId, analyticsStudentId);
  drawBarChart(studentBarChart, series.labels, series.studentValues);
  drawTrendChart(trendLineChart, series.labels, series.studentValues, series.classValues);
  renderAnalyticsInsights(analyticsClassId, analyticsStudentId, series);
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
  if (analyticsPanel) analyticsPanel.classList.add("hidden");

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

  // ANALYTICS TAB ONLY
  else if (activeTab === "analytics") {
    if (analyticsPanel) analyticsPanel.classList.remove("hidden");
    const classId = courseKeyToClassId[currentCourse];
    if (classId) analyticsClassId = classId;
    populateAnalyticsFilters();
    renderAnalytics();
  }

  // OTHER TABS
  else {
    tabList.classList.remove("hidden");

    (tabData.items || []).forEach((item) => {
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

function currentViewName() {
  if (!calendarView.classList.contains("hidden")) return "calendar";
  if (!detailView.classList.contains("hidden")) return "course-detail";
  return "home";
}

function activeContextText() {
  if (!calendarView.classList.contains("hidden")) {
    return calendarView.innerText.toLowerCase();
  }

  return detailView.classList.contains("hidden")
    ? homeView.innerText.toLowerCase()
    : detailView.innerText.toLowerCase();
}

function appendMessage(text, role) {
  const bubble = document.createElement("div");
  bubble.className = `message ${role}`;
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function queryStudyHelperApi(question) {
  const response = await fetch("/api/study-helper", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      pageContext: activeContextText(),
      currentView: currentViewName(),
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || "Study helper API request failed.");
  }

  const data = await response.json();
  if (!data?.answer || typeof data.answer !== "string") {
    throw new Error("No answer returned from study helper API.");
  }

  return data.answer;
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

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = chatInput.value.trim();
  if (!question) return;

  appendMessage(question, "user");
  chatInput.value = "";

  try {
    const answer = await queryStudyHelperApi(question);
    appendMessage(answer, "bot");
  } catch (error) {
    const message = error?.message || "Unable to reach AI agent.";
    appendMessage(`Agent error: ${message}`, "bot");
  }

  chatInput.focus();
});

if (analyticsClassSelect) {
  analyticsClassSelect.addEventListener("change", () => {
    analyticsClassId = analyticsClassSelect.value;
    populateAnalyticsFilters();
    renderAnalytics();
  });
}

if (analyticsStudentSelect) {
  analyticsStudentSelect.addEventListener("change", () => {
    analyticsStudentId = analyticsStudentSelect.value;
    renderAnalytics();
  });
}

window.addEventListener("resize", () => {
  if (!detailView.classList.contains("hidden") && activeTab === "analytics") {
    renderAnalytics();
  }
});
