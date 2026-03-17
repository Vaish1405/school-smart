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
const homeSubtitle = document.getElementById("homeSubtitle");
const profileToggle = document.getElementById("profileToggle");
const profileMenu = document.getElementById("profileMenu");
const teacherViewOption = document.getElementById("teacherViewOption");
const settingsOption = document.getElementById("settingsOption");
const publishedCoursesHeading = document.getElementById("publishedCoursesHeading");
const unpublishedCoursesHeading = document.getElementById("unpublishedCoursesHeading");
const publishedCourseGrid = document.getElementById("publishedCourseGrid");
const unpublishedCourseGrid = document.getElementById("unpublishedCourseGrid");
const unpublishedCoursesGroup = document.getElementById("unpublishedCoursesGroup");
const publishedCourseDivider = document.querySelector("#publishedCoursesGroup .course-divider");

const toggleButtons = [
  document.getElementById("chatToggle"),
  document.getElementById("chatToggleCalendar"),
  document.getElementById("chatToggleDetail"),
].filter(Boolean);

let currentCourse = "home";
let activeTab = "assignments";
let calendarDate = new Date(2026, 2, 1);
let isTeacherView = false;

const teacherDashboardCards = [
  { icon: "CS1", title: "Intro to Programming - Period 1", teacher: "Prof. Aaron Bell", schedule: "Mon/Wed | 8:00 AM", published: true },
  { icon: "CS2", title: "Intro to Programming - Period 2", teacher: "Prof. Aaron Bell", schedule: "Mon/Wed | 9:30 AM", published: true },
  { icon: "DS", title: "Data Structures", teacher: "Prof. Aaron Bell", schedule: "Tue/Thu | 10:00 AM", published: true },
  { icon: "AL", title: "Algorithms", teacher: "Prof. Aaron Bell", schedule: "Tue/Thu | 1:00 PM", published: true },
  { icon: "WD", title: "Web Development", teacher: "Prof. Aaron Bell", schedule: "Wed/Fri | 11:00 AM", published: false },
  { icon: "SE", title: "Software Engineering", teacher: "Prof. Aaron Bell", schedule: "Fri | 2:30 PM", published: false },
];

let studentDashboardCards = [];

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

const defaultGradeRecordsByCourse = {
  chemistry: [
    { name: "Lab Report 1", dueDate: "Mar 5", submittedDate: "Mar 5", status: "Complete", earned: 96, total: 100, teacherNotes: "Excellent method section; improve conclusion clarity." },
    { name: "Problem Set 2", dueDate: "Mar 10", submittedDate: "Mar 12", status: "Late", earned: 84, total: 100, teacherNotes: "Submitted late, so points were deducted. Good effort; watch algebraic simplification." },
    { name: "Quiz 3", dueDate: "Mar 16", submittedDate: "-", status: "Missing", earned: 0, total: 100, teacherNotes: "Not submitted. Missing work receives a zero." },
  ],
  math: [
    { name: "Logic Quiz 2", dueDate: "Mar 6", submittedDate: "Mar 6", status: "Complete", earned: 44, total: 50, teacherNotes: "Strong on truth tables." },
    { name: "Set Proof Worksheet", dueDate: "Mar 11", submittedDate: "Mar 11", status: "Complete", earned: 46, total: 50, teacherNotes: "Proof structure is improving." },
    { name: "Induction Checkpoint", dueDate: "Mar 15", submittedDate: "Mar 15", status: "Complete", earned: 45, total: 50, teacherNotes: "Very clear base and inductive steps." },
  ],
  biology: [
    { name: "Organelle Diagram", dueDate: "Mar 4", submittedDate: "Mar 4", status: "Complete", earned: 48, total: 50, teacherNotes: "Detailed labeling and neat annotations." },
    { name: "Microscopy Lab", dueDate: "Mar 9", submittedDate: "Mar 9", status: "Complete", earned: 46, total: 50, teacherNotes: "Good observations and conclusions." },
    { name: "Cell Cycle Quiz", dueDate: "Mar 14", submittedDate: "Mar 14", status: "Complete", earned: 46, total: 50, teacherNotes: "Only one missed concept." },
  ],
  literature: [
    { name: "Theme Analysis", dueDate: "Mar 5", submittedDate: "Mar 5", status: "Complete", earned: 45, total: 50, teacherNotes: "Great thematic evidence." },
    { name: "Narrative Voice Essay", dueDate: "Mar 12", submittedDate: "Mar 12", status: "Complete", earned: 44, total: 50, teacherNotes: "Thoughtful close reading." },
    { name: "Discussion Reflection", dueDate: "Mar 16", submittedDate: "Mar 16", status: "Complete", earned: 45, total: 50, teacherNotes: "Strong synthesis across texts." },
  ],
  history: [
    { name: "Trade Route Map", dueDate: "Mar 3", submittedDate: "Mar 3", status: "Complete", earned: 42, total: 50, teacherNotes: "Good map accuracy, add more context notes." },
    { name: "Source Comparison", dueDate: "Mar 10", submittedDate: "Mar 10", status: "Complete", earned: 43, total: 50, teacherNotes: "Solid evidence use." },
    { name: "Debate Prep Notes", dueDate: "Mar 15", submittedDate: "Mar 15", status: "Complete", earned: 44, total: 50, teacherNotes: "Clear claims and supporting data." },
  ],
  programming: [
    { name: "Loop Practice Set", dueDate: "Mar 4", submittedDate: "Mar 4", status: "Complete", earned: 47, total: 50, teacherNotes: "Correct and readable solutions." },
    { name: "Tracing Worksheet", dueDate: "Mar 10", submittedDate: "Mar 10", status: "Complete", earned: 46, total: 50, teacherNotes: "Strong step-by-step tracing." },
    { name: "Mini Coding Challenge", dueDate: "Mar 15", submittedDate: "Mar 15", status: "Complete", earned: 45, total: 50, teacherNotes: "Good decomposition and naming." },
  ],
};
const lateSubmissionOffsetsByAssignmentId = {
  a2: 1,
};
const demoToday = new Date(2026, 2, 16);

const uniqueTabSeedByCourse = {
  chemistry: {
    assignments: [
      {
        label: "Overdue Assignments",
        summary: "Safety and lab prep follow-up",
        items: [
          "Lab station checklist update (was due Mon)",
          "Goggles compliance form (was due Tue)",
        ],
      },
      {
        label: "Current Assignments",
        summary: "Due this week",
        items: [
          "Measurement conversion warmup (due Thu)",
          "Pre-lab question set (due Fri)",
        ],
      },
      {
        label: "Past Assignments",
        summary: "Submitted items",
        items: [
          "Lab safety contract (submitted)",
          "Notebook setup check (graded)",
        ],
      },
    ],
    announcements: [
      { title: "Lab Coat Reminder", preview: "Bring your lab coat and goggles for Wednesday's activity.", date: "Mar 14, 2026" },
      { title: "Bench Rotation Update", preview: "Partner benches were updated. Check seating before class.", date: "Mar 11, 2026" },
      { title: "Data Table Template Posted", preview: "Use the new table format for your first experiment write-up.", date: "Mar 8, 2026" },
    ],
    files: {
      Syllabus: [{ name: "Chemistry Syllabus.pdf", type: "PDF" }],
      Labs: [{ name: "Lab Rules Sheet.pdf", type: "PDF" }, { name: "Data Table Template.docx", type: "DOCX" }],
      Homework: [{ name: "Sig Figs Practice.pdf", type: "PDF" }],
      Slides: [{ name: "Intro Lab Safety.pptx", type: "PPTX" }],
    },
    modules: [
      { title: "Week 1", summary: "Safety and Measurement Basics", materials: ["Safety Protocol Handout", "Measurement Demo"], assignments: ["Safety Contract", "Notebook Template"], homework: ["Sig Fig Worksheet"] },
      { title: "Week 2", summary: "Data Recording", materials: ["Observation Notes", "Sample Data Tables"], assignments: ["Pre-lab Questions"], homework: ["Unit Conversion Practice"] },
      { title: "Week 3", summary: "First Experiment", materials: ["Procedure Walkthrough", "Report Rubric"], assignments: ["Experiment Write-up"], homework: ["Graphing Practice"] },
    ],
  },
  math: {
    assignments: [
      { label: "Overdue Assignments", summary: "Needs immediate action", items: ["Proof rewrite draft (was due Mon)", "Set notation corrections (was due Tue)"] },
      { label: "Current Assignments", summary: "Due this week", items: ["Logic quiz review (due Thu)", "Combinatorics worksheet (due Fri)"] },
      { label: "Past Assignments", summary: "Completed or submitted", items: ["Truth table practice (submitted)", "Induction checkpoint (graded)"] },
    ],
    announcements: [
      { title: "Quiz Scope Posted", preview: "Quiz 4 covers implication, equivalence, and quantifiers.", date: "Mar 13, 2026" },
      { title: "Office Hours Added", preview: "Extra office hours on Thursday 4:00-5:00 PM.", date: "Mar 10, 2026" },
      { title: "Proof Style Guide", preview: "A sample direct-proof format is now in Files.", date: "Mar 7, 2026" },
    ],
    files: {
      Syllabus: [{ name: "Discrete Math Syllabus.pdf", type: "PDF" }],
      Assignments: [{ name: "Proof Set 4.docx", type: "DOCX" }],
      Homework: [{ name: "Combinatorics HW.pdf", type: "PDF" }],
      Slides: [{ name: "Logic and Quantifiers.pptx", type: "PPTX" }],
    },
    modules: [
      { title: "Week 1", summary: "Logic Foundations", materials: ["Propositions Notes", "Truth Table Guide"], assignments: ["Logic Quiz Prep"], homework: ["Truth Table Set"] },
      { title: "Week 2", summary: "Sets and Functions", materials: ["Set Operations Notes", "Function Examples"], assignments: ["Set Proof Worksheet"], homework: ["Set Builder Practice"] },
      { title: "Week 3", summary: "Proof Techniques", materials: ["Direct vs Contrapositive", "Induction Template"], assignments: ["Induction Checkpoint"], homework: ["Proof Revision"] },
    ],
  },
  biology: {
    assignments: [
      { label: "Overdue Assignments", summary: "Follow-up needed", items: ["Microscope sketch labels (was due Mon)", "Organelle comparison chart (was due Tue)"] },
      { label: "Current Assignments", summary: "Due this week", items: ["Cell membrane diagram (due Thu)", "Lab observation notes (due Fri)"] },
      { label: "Past Assignments", summary: "Completed or submitted", items: ["Cell model worksheet (submitted)", "Organelle quiz (graded)"] },
    ],
    announcements: [
      { title: "Microscope Lab Prep", preview: "Review slide handling before Friday's practical.", date: "Mar 14, 2026" },
      { title: "Cell Cycle Diagram Resource", preview: "A printable guide is available in Files.", date: "Mar 9, 2026" },
      { title: "Lab Partner Rotation", preview: "Pairs updated for this week's microscope station.", date: "Mar 6, 2026" },
    ],
    files: {
      Syllabus: [{ name: "Biology 101 Syllabus.pdf", type: "PDF" }],
      Labs: [{ name: "Microscope Lab Guide.pdf", type: "PDF" }],
      Homework: [{ name: "Cell Function Practice.pdf", type: "PDF" }],
      Slides: [{ name: "Cell Organelles Overview.pptx", type: "PPTX" }],
    },
    modules: [
      { title: "Week 1", summary: "Cell Structures", materials: ["Organelle Chart", "Cell Type Comparison"], assignments: ["Cell Diagram"], homework: ["Membrane Function Questions"] },
      { title: "Week 2", summary: "Microscopy Skills", materials: ["Slide Prep Demo", "Microscope Checklist"], assignments: ["Lab Observation Log"], homework: ["Vocabulary Review"] },
      { title: "Week 3", summary: "Cell Cycle", materials: ["Mitosis Notes", "Cell Cycle Animation"], assignments: ["Cell Cycle Quiz"], homework: ["Cycle Sequence Practice"] },
    ],
  },
  literature: {
    assignments: [
      { label: "Overdue Assignments", summary: "Revision needed", items: ["Quote integration pass (was due Mon)", "Theme draft polish (was due Tue)"] },
      { label: "Current Assignments", summary: "Due this week", items: ["Narrative voice paragraph (due Thu)", "Short reflection response (due Fri)"] },
      { label: "Past Assignments", summary: "Completed or submitted", items: ["Reading annotation set (submitted)", "Theme analysis (graded)"] },
    ],
    announcements: [
      { title: "Discussion Prompt 5", preview: "Prepare one passage on point of view for seminar.", date: "Mar 15, 2026" },
      { title: "Essay Rubric Updated", preview: "The rubric now clarifies evidence and analysis criteria.", date: "Mar 11, 2026" },
      { title: "Reading Schedule", preview: "Chapter breakdown for next week is posted in Files.", date: "Mar 7, 2026" },
    ],
    files: {
      Syllabus: [{ name: "Modern Literature Syllabus.pdf", type: "PDF" }],
      Assignments: [{ name: "Narrative Voice Prompt.docx", type: "DOCX" }],
      Reading: [{ name: "Short Fiction Packet.pdf", type: "PDF" }],
      Slides: [{ name: "Theme and Tone.pptx", type: "PPTX" }],
    },
    modules: [
      { title: "Week 1", summary: "Narrative Perspective", materials: ["POV Handout", "Sample Excerpts"], assignments: ["Voice Analysis"], homework: ["Annotation Task"] },
      { title: "Week 2", summary: "Theme Development", materials: ["Theme Tracker", "Close Reading Notes"], assignments: ["Theme Paragraph"], homework: ["Reading Reflection"] },
      { title: "Week 3", summary: "Author Choices", materials: ["Style Device Guide", "Discussion Notes"], assignments: ["Seminar Response"], homework: ["Evidence Collection"] },
    ],
  },
  history: {
    assignments: [
      { label: "Overdue Assignments", summary: "Catch-up tasks", items: ["Map label corrections (was due Mon)", "Timeline citations (was due Tue)"] },
      { label: "Current Assignments", summary: "Due this week", items: ["Primary source analysis (due Thu)", "Debate claim sheet (due Fri)"] },
      { label: "Past Assignments", summary: "Completed or submitted", items: ["Trade route map (submitted)", "Source comparison (graded)"] },
    ],
    announcements: [
      { title: "Debate Teams Posted", preview: "Check your team assignment for Thursday's debate.", date: "Mar 14, 2026" },
      { title: "Archive Source Packet", preview: "New source packet uploaded under Files.", date: "Mar 10, 2026" },
      { title: "Map Quiz Format", preview: "Map quiz includes route labeling and short response.", date: "Mar 8, 2026" },
    ],
    files: {
      Syllabus: [{ name: "Global History Syllabus.pdf", type: "PDF" }],
      Assignments: [{ name: "Source Analysis Template.docx", type: "DOCX" }],
      Homework: [{ name: "Trade Network Questions.pdf", type: "PDF" }],
      Slides: [{ name: "Silk Road and Exchange.pptx", type: "PPTX" }],
    },
    modules: [
      { title: "Week 1", summary: "Trade Networks", materials: ["Silk Road Map", "Exchange Notes"], assignments: ["Route Map"], homework: ["Trade Impact Questions"] },
      { title: "Week 2", summary: "Primary Sources", materials: ["Source Evaluation Guide", "Bias Checklist"], assignments: ["Source Comparison"], homework: ["Evidence Notes"] },
      { title: "Week 3", summary: "Debate and Argument", materials: ["Claim Structure Sheet", "Counterargument Guide"], assignments: ["Debate Prep"], homework: ["Argument Revision"] },
    ],
  },
  programming: {
    assignments: [
      { label: "Overdue Assignments", summary: "Fixes needed", items: ["Loop trace corrections (was due Mon)", "Variable naming cleanup (was due Tue)"] },
      { label: "Current Assignments", summary: "Due this week", items: ["Nested loop challenge (due Thu)", "Debugging reflection (due Fri)"] },
      { label: "Past Assignments", summary: "Completed or submitted", items: ["Loop practice set (submitted)", "Tracing worksheet (graded)"] },
    ],
    announcements: [
      { title: "Challenge Set Released", preview: "New practice problems for while-loops are now available.", date: "Mar 14, 2026" },
      { title: "Lab Time Reminder", preview: "Bring your laptop for live debugging lab on Tuesday.", date: "Mar 10, 2026" },
      { title: "Style Guide Update", preview: "Naming conventions were updated in the coding guide.", date: "Mar 6, 2026" },
    ],
    files: {
      Syllabus: [{ name: "Intro Programming Syllabus.pdf", type: "PDF" }],
      Assignments: [{ name: "Loop Challenge Set.pdf", type: "PDF" }],
      Homework: [{ name: "Trace Practice Worksheet.pdf", type: "PDF" }],
      Slides: [{ name: "Loops and Conditionals.pptx", type: "PPTX" }],
    },
    modules: [
      { title: "Week 1", summary: "Loop Basics", materials: ["For Loop Notes", "Iteration Demo"], assignments: ["Loop Practice Set"], homework: ["Trace Table Exercise"] },
      { title: "Week 2", summary: "Debugging", materials: ["Common Bugs Sheet", "Debugger Walkthrough"], assignments: ["Tracing Worksheet"], homework: ["Bug Fix Practice"] },
      { title: "Week 3", summary: "Problem Decomposition", materials: ["Pseudocode Guide", "Function Planning"], assignments: ["Mini Coding Challenge"], homework: ["Refactor Exercise"] },
    ],
  },
};

const defaultModulesScheduleByCourse = {
  chemistry: [
    { date: "Monday, March 18", entries: [{ assignment: "Lab Safety Contract", due: "11:59 PM" }] },
    { date: "Wednesday, March 20", entries: [{ assignment: "Lab Notebook Template", due: "11:59 PM" }] },
    { date: "Tuesday, March 25", entries: [{ assignment: "Measurement and Significant Figures Quiz", due: "5:00 PM" }] },
    { date: "Thursday, March 27", entries: [{ assignment: "First Experiment Write-up", due: "11:59 PM" }] },
  ],
  math: [
    { date: "Tuesday, March 19", entries: [{ assignment: "Logic Quiz Review", due: "4:00 PM" }] },
    { date: "Thursday, March 21", entries: [{ assignment: "Combinatorics Worksheet", due: "11:59 PM" }] },
    { date: "Monday, March 24", entries: [{ assignment: "Induction Practice", due: "8:00 PM" }] },
  ],
  biology: [
    { date: "Monday, March 17", entries: [{ assignment: "Cell Membrane Diagram", due: "3:00 PM" }] },
    { date: "Wednesday, March 19", entries: [{ assignment: "Lab Observation Notes", due: "11:59 PM" }] },
    { date: "Friday, March 21", entries: [{ assignment: "Cell Cycle Checkpoint", due: "2:00 PM" }] },
  ],
  literature: [
    { date: "Tuesday, March 18", entries: [{ assignment: "Narrative Voice Paragraph", due: "9:00 PM" }] },
    { date: "Thursday, March 20", entries: [{ assignment: "Reflection Response", due: "11:59 PM" }] },
    { date: "Monday, March 24", entries: [{ assignment: "Seminar Prep Notes", due: "8:30 PM" }] },
  ],
  history: [
    { date: "Wednesday, March 19", entries: [{ assignment: "Primary Source Analysis", due: "6:00 PM" }] },
    { date: "Friday, March 21", entries: [{ assignment: "Debate Claim Sheet", due: "11:59 PM" }] },
    { date: "Tuesday, March 25", entries: [{ assignment: "Route Timeline Revision", due: "7:00 PM" }] },
  ],
  programming: [
    { date: "Monday, March 17", entries: [{ assignment: "Nested Loop Challenge", due: "11:59 PM" }] },
    { date: "Wednesday, March 19", entries: [{ assignment: "Debugging Reflection", due: "10:00 PM" }] },
    { date: "Friday, March 21", entries: [{ assignment: "Mini Coding Challenge", due: "11:59 PM" }] },
  ],
};

function makeTabPlaceholders(courseTitle, courseKey) {
  const seed = uniqueTabSeedByCourse[courseKey] || uniqueTabSeedByCourse.math;
  return {
    assignments: {
      title: "Assignments",
      description: `Track overdue, past, and current assignments for ${courseTitle}.`,
      sections: seed.assignments,
    },
    grades: {
      title: "Grades",
      description: `View overall class grade and assignment score details for ${courseTitle}.`,
      records: [],
    },
    announcements: {
      title: "Announcements",
      description: `Teacher announcements for ${courseTitle}.`,
      posts: seed.announcements,
    },
    files: {
      title: "Files",
      description: `Class files and materials for ${courseTitle}.`,
      folders: seed.files,
    },
    modules: {
      title: "Modules",
      description: `Weekly modules and resources for ${courseTitle}.`,
      weeks: seed.modules,
      schedule: defaultModulesScheduleByCourse[courseKey] || [],
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

Object.entries(courseData).forEach(([courseKey, course]) => {
  course.tabs = makeTabPlaceholders(course.title, courseKey);
  course.tabs.grades.records = defaultGradeRecordsByCourse[courseKey] || [];
});

function computePercentFromGradeRecords(records) {
  let totalEarned = 0;
  let totalPossible = 0;
  records.forEach((record) => {
    const earned = record.status === "Missing" ? 0 : Number(record.earned ?? 0);
    const total = Number(record.total ?? 100);
    totalEarned += earned;
    totalPossible += total;
  });
  return totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
}

function letterGradeFromPercent(percent) {
  if (percent >= 97) return "A+";
  if (percent >= 93) return "A";
  if (percent >= 90) return "A-";
  if (percent >= 87) return "B+";
  if (percent >= 83) return "B";
  if (percent >= 80) return "B-";
  if (percent >= 77) return "C+";
  if (percent >= 73) return "C";
  if (percent >= 70) return "C-";
  if (percent >= 67) return "D+";
  if (percent >= 63) return "D";
  if (percent >= 60) return "D-";
  return "F";
}

function getGradeRecordsForCourse(courseKey) {
  const course = courseData[courseKey];
  const tab = course?.tabs?.grades;
  if (!tab) return [];
  if (Array.isArray(tab.records) && tab.records.length) return tab.records;
  if (tab.recordGrades && Array.isArray(tab.items)) {
    return tab.items
      .filter((item) => item && typeof item === "object" && "assignmentTitle" in item)
      .map((item) => {
        const dueIso = item.dueDate || "";
        const dueDate = dueIso ? formatShortDate(dueIso) : "-";
        const isMissing = item.pointsEarned == null;
        const lateOffset = item.assignmentId
          ? Number(lateSubmissionOffsetsByAssignmentId[item.assignmentId] || 0)
          : 0;
        const submittedIso = !isMissing && dueIso ? addDaysToIsoDate(dueIso, lateOffset) : "";
        return {
          name: item.assignmentTitle,
          dueDate,
          submittedDate: isMissing ? "-" : (submittedIso ? formatShortDate(submittedIso) : dueDate),
          status: isMissing ? "Missing" : (lateOffset > 0 ? "Late" : "Complete"),
          earned: isMissing ? 0 : Number(item.pointsEarned ?? 0),
          total: Number(item.pointsPossible ?? 100),
          teacherNotes: item.feedback || "No notes from teacher.",
        };
      });
  }
  return [];
}

function getCourseGradeSummary(courseKey) {
  const records = getGradeRecordsForCourse(courseKey);
  const percent = computePercentFromGradeRecords(records);
  return { percent, letter: letterGradeFromPercent(percent) };
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatAssignmentDate(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function formatShortDate(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function addDaysToIsoDate(isoDate, daysToAdd) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + daysToAdd);
  return d.toISOString().slice(0, 10);
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
      const overdueItems = [];
      const currentItems = [];
      const pastItems = [];
      list.forEach((a) => {
        const grade = recordsAssignmentGrades.find(
          (g) => g.assignmentId === a.id && g.studentId === currentStudentId
        );
        const dueLabel = `${a.title} (due ${formatShortDate(a.dueDate)} at ${a.dueTime})`;
        if (grade && grade.pointsEarned != null) {
          pastItems.push(`${a.title} (submitted, ${grade.pointsEarned}/${a.pointsPossible})`);
          return;
        }
        const due = new Date(a.dueDate);
        if (due < demoToday) overdueItems.push(`${a.title} (was due ${formatShortDate(a.dueDate)} at ${a.dueTime})`);
        else currentItems.push(dueLabel);
      });
      course.tabs.assignments = {
        title: "Assignments",
        description: `Assignments for ${course.title}.`,
        sections: [
          { label: "Overdue Assignments", summary: "Needs immediate action", items: overdueItems.length ? overdueItems : ["No overdue assignments right now."] },
          { label: "Current Assignments", summary: "Due soon", items: currentItems.length ? currentItems : ["No current assignments this week."] },
          { label: "Past Assignments", summary: "Completed or submitted", items: pastItems.length ? pastItems : ["No completed assignments yet."] },
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
        weeks: course.tabs.modules.weeks || [],
        schedule: sortedDates.map((date) => ({ date, entries: byDate[date] })),
      };
    }

    const gradeRows = recordsAssignmentGrades
      .filter((g) => g.studentId === currentStudentId)
      .map((g) => {
        const a = getAssignmentById(g.assignmentId);
        return a && a.classId === classId
          ? {
              assignmentId: a.id,
              assignmentTitle: a.title,
              dueDate: a.dueDate,
              pointsEarned: g.pointsEarned,
              pointsPossible: a.pointsPossible,
              feedback: g.feedback,
            }
          : null;
      })
      .filter(Boolean);
    course.tabs.grades = {
      title: "Grades",
      description: `Gradebook for ${course.title}. Overall score updates from the assignment rows below.`,
      items: gradeRows.length
        ? gradeRows
        : ["No graded items posted yet."],
      recordGrades: true,
    };

    const announcements = recordsAnnouncements.filter((n) => n.classId === classId);
    course.tabs.announcements = {
      title: "Announcements",
      description: `Announcements for ${course.title}.`,
      posts:
        announcements.length > 0
          ? announcements.map((n) => ({
              title: n.title,
              preview: n.body,
              date: n.postedAt
                ? new Date(n.postedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "",
            }))
          : course.tabs.announcements.posts,
      recordAnnouncements: announcements.length > 0,
    };

    const files = recordsFiles.filter((f) => f.classId === classId);
    const folders = {};
    files.forEach((f) => {
      const folderName = f.type ? `${String(f.type).toUpperCase()} Files` : "Course Files";
      if (!folders[folderName]) folders[folderName] = [];
      folders[folderName].push({ name: f.name, type: String(f.type || "FILE").toUpperCase() });
    });
    course.tabs.files = {
      title: "Files",
      description: `Course files for ${course.title}.`,
      folders: files.length > 0 ? folders : course.tabs.files.folders,
      recordFiles: files.length > 0,
    };
  });
}

function updateCourseCardsGrades() {
  const chemistryClassId = courseKeyToClassId.chemistry;
  const cls = getClassById(chemistryClassId);
  const teacher = cls ? getTeacherById(cls.teacherId) : null;
  const chemistryCard = document.querySelector('.class-card[data-course="chemistry"]');
  if (chemistryCard) {
    const body = chemistryCard.querySelector(".course-body");
    if (body && cls) {
      const h3 = body.querySelector("h3");
      if (h3) h3.textContent = cls.name;
      const ps = body.querySelectorAll("p");
      if (teacher && ps[0]) ps[0].textContent = `${teacher.title} ${teacher.firstName} ${teacher.lastName}`;
      if (cls.schedule && ps[1]) ps[1].textContent = cls.schedule.replace(/\s+(\d)/, " | $1");
    }
  }

  document.querySelectorAll(".class-card").forEach((card) => {
    const courseKey = card.dataset.course;
    if (!courseKey || !courseData[courseKey]) return;
    const summary = getCourseGradeSummary(courseKey);
    const gradeEl = card.querySelector(".course-grade");
    if (gradeEl) {
      gradeEl.textContent = `Grade: ${summary.percent}% (${summary.letter})`;
    }
  });
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
    updateCourseCardsGrades();
    applyDashboardClassesForRole();
    if (currentCourse !== "home") renderActiveTab();
  } catch (e) {
    console.warn("Could not load records. Serve the app over HTTP (see README).", e);
  }
}

loadRecords();
updateCourseCardsGrades();

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

    const records = getGradeRecordsForCourse(currentCourse);

    const summary = getCourseGradeSummary(currentCourse);

    records.forEach((record) => {
      const earned =
        record.status === "Missing"
          ? 0
          : Number(record.earned ?? 0);

      const total = Number(record.total ?? 100);

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

    overallGradeEl.textContent = `${summary.percent}%`;
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
    const schedule = course.tabs?.modules?.schedule || [];
    schedule.forEach((group) => {
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

function captureStudentDashboardCards() {
  if (studentDashboardCards.length) return;
  studentDashboardCards = Array.from(cards).map((card) => {
    const iconEl = card.querySelector(".course-icon");
    const titleEl = card.querySelector(".course-body h3");
    const lines = card.querySelectorAll(".course-body p");
    return {
      icon: iconEl ? iconEl.textContent : "",
      title: titleEl ? titleEl.textContent : "",
      teacher: lines[0] ? lines[0].textContent : "",
      schedule: lines[1] ? lines[1].textContent : "",
      published: card.closest("#publishedCourseGrid") != null,
    };
  });
}

function applyDashboardClassesForRole() {
  captureStudentDashboardCards();
  const source = isTeacherView ? teacherDashboardCards : studentDashboardCards;
  let publishedCount = 0;
  let unpublishedCount = 0;
  cards.forEach((card, index) => {
    const info = source[index];
    if (!info) return;
    const iconEl = card.querySelector(".course-icon");
    const titleEl = card.querySelector(".course-body h3");
    const lines = card.querySelectorAll(".course-body p");
    if (iconEl) iconEl.textContent = info.icon;
    if (titleEl) titleEl.textContent = info.title;
    if (lines[0]) lines[0].textContent = info.teacher;
    if (lines[1]) lines[1].textContent = info.schedule;
    const shouldBePublished = isTeacherView ? Boolean(info.published) : true;
    if (shouldBePublished) {
      publishedCount += 1;
      if (publishedCourseGrid) publishedCourseGrid.appendChild(card);
    } else {
      unpublishedCount += 1;
      if (unpublishedCourseGrid) unpublishedCourseGrid.appendChild(card);
    }
  });
  if (publishedCoursesHeading) {
    if (isTeacherView) {
      publishedCoursesHeading.style.display = "";
      publishedCoursesHeading.textContent = `Published CS Courses (${publishedCount})`;
    } else {
      publishedCoursesHeading.style.display = "none";
    }
  }
  if (unpublishedCoursesHeading && isTeacherView) {
    unpublishedCoursesHeading.textContent = isTeacherView
      ? `Unpublished CS Courses (${unpublishedCount})`
      : `Unpublished Courses (${unpublishedCount})`;
  }
  if (unpublishedCoursesGroup) {
    unpublishedCoursesGroup.style.display = isTeacherView ? "" : "none";
  }
  if (publishedCourseDivider) {
    publishedCourseDivider.style.display = isTeacherView ? "" : "none";
  }
}

function setViewRole(teacherMode) {
  isTeacherView = teacherMode;
  document.body.classList.toggle("teacher-view", teacherMode);
  if (homeSubtitle) {
    homeSubtitle.textContent = `Spring 2026 | ${teacherMode ? "Teacher" : "Student"} View`;
  }
  if (profileToggle) {
    profileToggle.textContent = teacherMode ? "TT" : "SS";
    profileToggle.setAttribute(
      "aria-label",
      teacherMode ? "Teacher profile menu" : "Student profile menu"
    );
  }
  if (teacherViewOption) {
    teacherViewOption.textContent = teacherMode
      ? "Switch to Student View"
      : "Switch to Teacher View";
  }
  applyDashboardClassesForRole();
}

function closeProfileMenu() {
  if (!profileMenu || !profileToggle) return;
  profileMenu.classList.add("hidden");
  profileToggle.setAttribute("aria-expanded", "false");
}

function toggleProfileMenu() {
  if (!profileMenu || !profileToggle) return;
  const willOpen = profileMenu.classList.contains("hidden");
  profileMenu.classList.toggle("hidden", !willOpen);
  profileToggle.setAttribute("aria-expanded", String(willOpen));
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

if (profileToggle && profileMenu) {
  profileToggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleProfileMenu();
  });

  profileMenu.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", (event) => {
    if (!profileMenu.contains(event.target) && !profileToggle.contains(event.target)) {
      closeProfileMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeProfileMenu();
  });
}

if (teacherViewOption) {
  teacherViewOption.addEventListener("click", () => {
    setViewRole(!isTeacherView);
    closeProfileMenu();
  });
}

if (settingsOption) {
  settingsOption.addEventListener("click", () => {
    closeProfileMenu();
  });
}

setViewRole(false);

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
