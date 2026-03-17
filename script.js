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
const tutorTabButton = document.querySelector('.course-tab[data-tab="tutor"]');
const careerTabButton = document.querySelector('.course-tab[data-tab="career"]');

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
const assignmentLevelCard = document.getElementById("assignmentLevelCard");
const topicBarChart = document.getElementById("topicBarChart");
const topicPerformanceCard = document.getElementById("topicPerformanceCard");
const gradePieLegend = document.getElementById("gradePieLegend");
const analyticsInsights = document.getElementById("analyticsInsights");
const tutorPanel = document.getElementById("tutorPanel");
const tutorAssignmentList = document.getElementById("tutorAssignmentList");
const gradePieTitle = document.getElementById("gradePieTitle");
const studentBarTitle = document.getElementById("studentBarTitle");
const trendLineTitle = document.getElementById("trendLineTitle");
const topicBarTitle = document.getElementById("topicBarTitle");

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
const analyticsPanel = document.getElementById("analyticsPanel");
const careerPanel = document.getElementById("careerPanel");
const activeUserNameHome = document.getElementById("activeUserNameHome");
const activeUserNameCalendar = document.getElementById("activeUserNameCalendar");
const activeUserNameDetail = document.getElementById("activeUserNameDetail");
const careerSummaryTitle = document.getElementById("careerSummaryTitle");
const careerSummaryText = document.getElementById("careerSummaryText");
const careerTrackList = document.getElementById("careerTrackList");
const careerSkillsList = document.getElementById("careerSkillsList");
const careerProjectsList = document.getElementById("careerProjectsList");
const careerIdeasList = document.getElementById("careerIdeasList");

const toggleButtons = [
  document.getElementById("chatToggle"),
  document.getElementById("chatToggleCalendar"),
  document.getElementById("chatToggleDetail"),
].filter(Boolean);

let currentCourse = "home";
let activeTab = "assignments";
let calendarDate = new Date(2026, 2, 1);
let isTeacherView = false;
let currentCourseDisplayTitle = "";

const teacherDashboardCards = [
  { icon: "CH1", title: "Chemistry Lab Foundations - Period 1", teacher: "Dr. Nina Verma", schedule: "Mon/Wed | 8:00 AM", published: true },
  { icon: "CH2", title: "Chemistry Lab Foundations - Period 2", teacher: "Dr. Nina Verma", schedule: "Mon/Wed | 9:30 AM", published: true },
  { icon: "ORG", title: "Organic Chemistry Lab", teacher: "Dr. Nina Verma", schedule: "Tue/Thu | 10:00 AM", published: true },
  { icon: "ANA", title: "Analytical Chemistry", teacher: "Dr. Nina Verma", schedule: "Tue/Thu | 1:00 PM", published: true },
  { icon: "PHY", title: "Physical Chemistry", teacher: "Dr. Nina Verma", schedule: "Wed/Fri | 11:00 AM", published: false },
  { icon: "CHE", title: "Chemistry Seminar", teacher: "Dr. Nina Verma", schedule: "Fri | 2:30 PM", published: false },
];
const teacherCourseTitleToClassId = {
  "Chemistry Lab Foundations - Period 1": "c1",
};

let studentDashboardCards = [];
let analyticsClassId = "c1";
let analyticsStudentId = "s1";
const ALL_STUDENTS_VALUE = "__all__";

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

const careerReadinessByCourse = {
  chemistry: {
    careers: [
      {
        title: "Lab Technician",
        why: "Apply lab safety, measurement accuracy, and reporting skills in research and quality labs.",
        requiredSkills: ["Lab safety procedures", "Data logging", "Measurement precision", "Report writing"],
      },
      {
        title: "Quality Control Analyst",
        why: "Use testing workflows to verify product quality in pharma, food, and manufacturing.",
        requiredSkills: ["Standard operating procedures", "Sample testing", "Root-cause analysis", "Documentation"],
      },
    ],
    projects: [
      {
        id: "chem-project-1",
        title: "Household pH Testing Journal",
        outcome: "Create a mini lab report comparing acidity/basicity across common household liquids.",
        skills: ["Experimental design", "Data collection", "Observation writing", "Scientific communication"],
        plan: [
          "Week 1: Define hypothesis, list materials, and build a safe testing checklist.",
          "Week 2: Run pH tests on 8-10 samples and record results in a table.",
          "Week 3: Analyze patterns, make a chart, and identify outliers.",
          "Week 4: Write final report with conclusion, errors, and next experiment ideas.",
        ],
      },
      {
        id: "chem-project-2",
        title: "Reaction Rate Comparison",
        outcome: "Compare how temperature affects dissolving rate and present findings.",
        skills: ["Controlled variables", "Timing experiments", "Graphing results", "Presentation skills"],
        plan: [
          "Week 1: Choose materials and design fair-test procedure with controls.",
          "Week 2: Run repeated trials at different temperatures.",
          "Week 3: Plot rate curves and summarize trends.",
          "Week 4: Build a short slide deck and present recommendations.",
        ],
      },
    ],
    ideas: [
      "Add your top project to a student portfolio with 1 screenshot and 3 bullet outcomes.",
      "Practice explaining your project in 60 seconds for interviews.",
      "Ask your teacher for one rubric-based improvement and apply it in the next project.",
    ],
  },
  math: {
    careers: [
      {
        title: "Data Analyst",
        why: "Use logic and structured reasoning to interpret trends and support decisions.",
        requiredSkills: ["Logical reasoning", "Pattern detection", "Data interpretation", "Clear communication"],
      },
      {
        title: "Operations Research Assistant",
        why: "Solve optimization and planning problems with discrete math foundations.",
        requiredSkills: ["Set and graph models", "Combinatorics", "Proof-based thinking", "Model validation"],
      },
    ],
    projects: [
      {
        id: "math-project-1",
        title: "Campus Schedule Optimizer",
        outcome: "Model course scheduling constraints and propose an improved weekly schedule.",
        skills: ["Constraint modeling", "Set logic", "Optimization basics", "Decision documentation"],
        plan: [
          "Week 1: Define constraints (time blocks, conflicts, availability).",
          "Week 2: Build feasible schedule options using sets and logic rules.",
          "Week 3: Score each option on efficiency and workload balance.",
          "Week 4: Present final schedule recommendation with reasoning.",
        ],
      },
      {
        id: "math-project-2",
        title: "Proof Portfolio",
        outcome: "Build a mini portfolio of 6 polished proofs across different techniques.",
        skills: ["Direct proof", "Contrapositive", "Induction", "Technical writing"],
        plan: [
          "Week 1: Select proof topics and collect reference examples.",
          "Week 2: Draft first 3 proofs and get peer feedback.",
          "Week 3: Draft remaining proofs and standardize format.",
          "Week 4: Revise all proofs into a clean portfolio PDF.",
        ],
      },
    ],
    ideas: [
      "Turn one project into a GitHub README with your reasoning process.",
      "Track common logic mistakes and create a personal checklist before submission.",
      "Pair with a classmate to review proof clarity each week.",
    ],
  },
  biology: {
    careers: [
      {
        title: "Clinical Research Assistant",
        why: "Use biological systems knowledge to support data collection and protocol adherence.",
        requiredSkills: ["Biology fundamentals", "Observation accuracy", "Protocol compliance", "Data entry"],
      },
      {
        title: "Biotech Lab Assistant",
        why: "Apply microscopy and cell-system concepts in lab support roles.",
        requiredSkills: ["Microscopy", "Sample handling", "Documentation", "Team communication"],
      },
    ],
    projects: [
      {
        id: "bio-project-1",
        title: "Cell Systems Visual Guide",
        outcome: "Design a visual handbook of major organelles and their functions.",
        skills: ["Concept synthesis", "Scientific visualization", "Comparative analysis", "Teaching others"],
        plan: [
          "Week 1: Select organelles and gather accurate references.",
          "Week 2: Create organelle cards with function and analogy.",
          "Week 3: Build comparison pages (plant vs animal cells).",
          "Week 4: Share handbook and run a 10-minute peer walkthrough.",
        ],
      },
      {
        id: "bio-project-2",
        title: "Microscopy Observation Tracker",
        outcome: "Build a repeatable observation template for microscope sessions.",
        skills: ["Observation protocols", "Pattern tracking", "Scientific note-taking", "Quality checks"],
        plan: [
          "Week 1: Create a standard observation form and scoring rubric.",
          "Week 2: Log observations from at least 5 slide sessions.",
          "Week 3: Analyze repeated findings and error patterns.",
          "Week 4: Summarize improvements and propose next lab focus.",
        ],
      },
    ],
    ideas: [
      "Convert your best diagram into a one-page revision sheet for exams.",
      "Build a glossary of 25 key biology terms with examples.",
      "Practice explaining one concept weekly to a non-biology friend.",
    ],
  },
  literature: {
    careers: [
      {
        title: "Content Writer",
        why: "Use narrative analysis and clear communication to create engaging written content.",
        requiredSkills: ["Audience awareness", "Structured writing", "Critical reading", "Editing"],
      },
      {
        title: "Communications Specialist",
        why: "Apply textual interpretation and messaging skills in organizational communication.",
        requiredSkills: ["Messaging strategy", "Tone adaptation", "Research synthesis", "Presentation"],
      },
    ],
    projects: [
      {
        id: "lit-project-1",
        title: "Theme Analysis Blog Series",
        outcome: "Publish a 4-post series analyzing modern text themes for student readers.",
        skills: ["Close reading", "Argument building", "Blog writing", "Editorial revision"],
        plan: [
          "Week 1: Choose texts and draft editorial calendar.",
          "Week 2: Write and revise first two posts.",
          "Week 3: Write final posts and add supporting evidence.",
          "Week 4: Publish series and gather peer comments for revision.",
        ],
      },
      {
        id: "lit-project-2",
        title: "Narrative Voice Podcast Script",
        outcome: "Create a short podcast script comparing narrative voice across stories.",
        skills: ["Script writing", "Comparative analysis", "Storytelling", "Public speaking"],
        plan: [
          "Week 1: Select two stories and collect key excerpts.",
          "Week 2: Outline script segments and transitions.",
          "Week 3: Draft, rehearse, and tighten script timing.",
          "Week 4: Record episode and publish reflection notes.",
        ],
      },
    ],
    ideas: [
      "Use your strongest writing sample as a portfolio piece for internships.",
      "Practice one mock interview answer each week using literary evidence.",
      "Create a personal editing rubric and reuse it for all future writing.",
    ],
  },
  history: {
    careers: [
      {
        title: "Policy Research Assistant",
        why: "Historical source analysis supports evidence-based policy research work.",
        requiredSkills: ["Source evaluation", "Argument building", "Context framing", "Evidence citation"],
      },
      {
        title: "Museum Education Assistant",
        why: "History communication skills transfer to public learning and interpretation roles.",
        requiredSkills: ["Historical storytelling", "Audience engagement", "Program planning", "Visual curation"],
      },
    ],
    projects: [
      {
        id: "hist-project-1",
        title: "Trade Route Story Map",
        outcome: "Build an interactive or slide-based map showing impacts of key trade routes.",
        skills: ["Historical mapping", "Cause-effect analysis", "Narrative design", "Research synthesis"],
        plan: [
          "Week 1: Choose routes and collect primary/secondary sources.",
          "Week 2: Draft map layers and timeline notes.",
          "Week 3: Add cultural/economic impact narratives.",
          "Week 4: Present map with evidence citations and Q&A notes.",
        ],
      },
      {
        id: "hist-project-2",
        title: "Debate Evidence Portfolio",
        outcome: "Create a claim-evidence-reasoning packet for a history policy debate.",
        skills: ["Claim writing", "Evidence ranking", "Counterargument", "Debate prep"],
        plan: [
          "Week 1: Frame debate question and initial claim set.",
          "Week 2: Collect evidence and evaluate source reliability.",
          "Week 3: Build counterarguments and rebuttal strategy.",
          "Week 4: Finalize debate packet and reflect on performance.",
        ],
      },
    ],
    ideas: [
      "Create a one-page timeline artifact for your portfolio.",
      "Track your evidence quality score each week to improve citations.",
      "Join or simulate a panel discussion to practice concise arguments.",
    ],
  },
  programming: {
    careers: [
      {
        title: "Junior Software Developer",
        why: "Programming coursework builds coding, debugging, and delivery habits needed in real product teams.",
        requiredSkills: ["Problem decomposition", "Debugging", "Version control", "Code readability"],
      },
      {
        title: "QA Automation Associate",
        why: "Structured thinking and loop logic are strong foundations for test automation roles.",
        requiredSkills: ["Test cases", "Automation logic", "Bug reporting", "Collaboration"],
      },
    ],
    projects: [
      {
        id: "cs-project-1",
        title: "Assignment Tracker App",
        outcome: "Build a simple web app to track assignments, due dates, and completion status.",
        skills: ["JavaScript fundamentals", "State handling", "UI design", "Feature planning"],
        plan: [
          "Week 1: Define features, wireframe UI, and scaffold project files.",
          "Week 2: Implement add/edit/complete task flows.",
          "Week 3: Add sorting, filtering, and local storage persistence.",
          "Week 4: Test edge cases, improve UX, and publish demo.",
        ],
      },
      {
        id: "cs-project-2",
        title: "Debugging Playbook",
        outcome: "Create a reusable debugging guide with real examples from your assignments.",
        skills: ["Error diagnosis", "Troubleshooting workflow", "Technical writing", "Reflection"],
        plan: [
          "Week 1: Collect 10 bugs and categorize by root cause.",
          "Week 2: Document steps to reproduce and fix each bug type.",
          "Week 3: Add checklist and common prevention patterns.",
          "Week 4: Turn it into a polished guide and share with peers.",
        ],
      },
    ],
    ideas: [
      "Keep a project changelog to show growth over time.",
      "Write one resume bullet for each completed project outcome.",
      "Ask for a peer code review at least once per week.",
    ],
  },
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
    tutor: {
      title: "Tutor",
      description: `On-demand tutoring support for ${courseTitle}.`,
      items: ["No tutor resources are configured for this course yet."],
    },
    analytics: {
      title: "Analytics",
      description: `Progress analytics for ${courseTitle}.`,
      items: [],
    },
    career: {
      title: "Career Readiness",
      description: `Connect course learning to careers, portfolio projects, and future-ready skills for ${courseTitle}.`,
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

Object.entries(courseData).forEach(([courseKey, course]) => {
  course.tabs = makeTabPlaceholders(course.title, courseKey);
  course.tabs.grades.records = defaultGradeRecordsByCourse[courseKey] || [];
  if (courseKey === "chemistry") {
    course.tabs.tutor = {
      title: "Tutor",
      description: "Chemistry tutoring support for lab safety, calculations, and report writing.",
      items: [
        "Live tutor hours: Tue/Thu 4:00-5:00 PM in Science 204.",
        "Ask the Tutor: Bring one lab question and one sig-fig question each session.",
        "Quick Help Topics: Unit conversion, significant figures, graph interpretation.",
        "This Week Focus: Structuring your first experiment write-up (purpose, data, conclusion).",
      ],
    };
  }
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

function getTeacherClassIdForActiveCourse() {
  const title = (currentCourseDisplayTitle || "").trim();
  if (teacherCourseTitleToClassId[title]) return teacherCourseTitleToClassId[title];
  return courseKeyToClassId[currentCourse] || null;
}

function getTeacherGradeRowsForClass(classId) {
  const enrolledStudentIds = recordsEnrollments
    .filter((e) => e.classId === classId)
    .map((e) => e.studentId);

  const students = recordsStudents.filter((s) => enrolledStudentIds.includes(s.id));
  const rows = students.map((student) => {
    const classGrade = recordsClassGrades.find(
      (g) => g.classId === classId && g.studentId === student.id
    );
    return {
      studentName: `${student.firstName} ${student.lastName}`,
      studentId: student.id,
      term: classGrade?.term || "-",
      percent: classGrade?.percent ?? null,
      letter: classGrade?.letterGrade || "-",
    };
  });

  if (rows.length === 0) {
    const gradeOnlyRows = recordsClassGrades
      .filter((g) => g.classId === classId)
      .map((g) => {
        const s = recordsStudents.find((x) => x.id === g.studentId);
        return {
          studentName: s ? `${s.firstName} ${s.lastName}` : g.studentId,
          studentId: g.studentId,
          term: g.term || "-",
          percent: g.percent ?? null,
          letter: g.letterGrade || "-",
        };
      });
    return gradeOnlyRows;
  }

  return rows;
}

function getTutorAssignmentsForCourse(courseKey) {
  const classId = courseKeyToClassId[courseKey];
  if (!classId) return [];

  const rows = recordsAssignments
    .filter((a) => a.classId === classId)
    .map((assignment) => {
      const grade = recordsAssignmentGrades.find(
        (g) => g.studentId === currentStudentId && g.assignmentId === assignment.id
      );
      const hasScore = grade && grade.pointsEarned != null;
      const dueDateObj = parseIsoDateLocal(assignment.dueDate);
      const isPast = dueDateObj <= demoToday || hasScore;
      if (!isPast) return null;

      const total = Number(assignment.pointsPossible ?? 100);
      const earned = hasScore ? Number(grade.pointsEarned) : 0;
      const percent = total > 0 ? Math.round((earned / total) * 100) : 0;
      const scoreText = hasScore ? `${earned}/${total} (${percent}%)` : "Not graded yet";

      return {
        title: assignment.title,
        dueIso: assignment.dueDate,
        dueDate: formatShortDate(assignment.dueDate),
        scoreText,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b.dueIso || "").localeCompare(a.dueIso || ""));

  return rows;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function parseIsoDateLocal(isoDate) {
  const [y, m, d] = String(isoDate || "").split("-").map(Number);
  if (!y || !m || !d) return new Date(isoDate);
  return new Date(y, m - 1, d);
}

function formatAssignmentDate(isoDate) {
  const d = parseIsoDateLocal(isoDate);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function formatShortDate(isoDate) {
  const d = parseIsoDateLocal(isoDate);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function addDaysToIsoDate(isoDate, daysToAdd) {
  const d = parseIsoDateLocal(isoDate);
  d.setDate(d.getDate() + daysToAdd);
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
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
        const dueLabel = `${a.title} (${a.pointsPossible} pts) — Due ${formatShortDate(a.dueDate)} at ${a.dueTime}`;

        if (grade && grade.pointsEarned != null) {
          pastItems.push(`${a.title} (${grade.pointsEarned}/${a.pointsPossible})`);
          return;
        }

        const due = new Date(a.dueDate);
        if (due < demoToday) {
          overdueItems.push(`${a.title} (was due ${formatShortDate(a.dueDate)} at ${a.dueTime})`);
        } else {
          currentItems.push(dueLabel);
        }
      });

      course.tabs.assignments = {
        title: "Assignments",
        description: `Assignments for ${course.title}.`,
        sections: [
          {
            label: "Overdue Assignments",
            summary: "Needs immediate action",
            items: overdueItems.length ? overdueItems : ["No overdue assignments right now."],
          },
          {
            label: "Current Assignments",
            summary: "Due soon",
            items: currentItems.length ? currentItems : ["No current assignments this week."],
          },
          {
            label: "Past Assignments",
            summary: "Completed or submitted",
            items: pastItems.length ? pastItems : ["No completed assignments yet."],
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
        weeks: course.tabs.modules.weeks || [],
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

    course.tabs.grades = {
      title: "Grades",
      description: `Gradebook for ${course.title}. Overall score updates from the assignment rows below.`,
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

  const activeCourseClassId = courseKeyToClassId[currentCourse] || analyticsClassId;
  const enrolledClassIds = Array.from(new Set(recordsEnrollments.map((e) => e.classId)));
  const classes = isTeacherView
    ? recordsClasses.filter((c) => enrolledClassIds.includes(c.id))
    : recordsClasses.filter((c) => c.id === activeCourseClassId);

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

  const classStudents = isTeacherView
    ? recordsStudents.filter((s) =>
        recordsEnrollments.some((e) => e.classId === analyticsClassId && e.studentId === s.id)
      )
    : recordsStudents.filter((s) => s.id === currentStudentId);

  analyticsStudentSelect.innerHTML = "";
  if (isTeacherView) {
    const allOption = document.createElement("option");
    allOption.value = ALL_STUDENTS_VALUE;
    allOption.textContent = "All students";
    analyticsStudentSelect.appendChild(allOption);
  }

  classStudents.forEach((student) => {
    const option = document.createElement("option");
    option.value = student.id;
    option.textContent = `${student.firstName} ${student.lastName}`;
    analyticsStudentSelect.appendChild(option);
  });

  if (isTeacherView) {
    const exists = analyticsStudentId === ALL_STUDENTS_VALUE || classStudents.some((s) => s.id === analyticsStudentId);
    if (!exists) analyticsStudentId = ALL_STUDENTS_VALUE;
  } else if (!classStudents.find((s) => s.id === analyticsStudentId)) {
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

function drawBarChart(canvas, labels, values, options = {}) {
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

  const max = Number(options.max || 100);
  const barColor = options.color || "#6aa5af";
  const slot = chartW / Math.max(values.length, 1);
  const barW = Math.max(16, slot * 0.55);

  values.forEach((v, i) => {
    const x = left + i * slot + (slot - barW) / 2;
    const h = Math.max(0, (v / max) * chartH);
    const y = top + chartH - h;
    ctx.fillStyle = barColor;
    ctx.fillRect(x, y, barW, h);
    ctx.fillStyle = "#2f4c56";
    ctx.font = "11px Nunito";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(v)}%`, x + barW / 2, y - 6);
    ctx.fillStyle = "#5a7079";
    ctx.fillText(labels[i], x + barW / 2, top + chartH + 14);
  });
}

function drawTrendChart(canvas, labels, studentValues, classValues, legendA = "Class Avg", legendB = "Student") {
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
  ctx.fillText(legendA, left + 24, top + 15);
  ctx.fillStyle = "#2f8d71";
  ctx.fillRect(left + 108, top + 6, 10, 10);
  ctx.fillStyle = "#2f4c56";
  ctx.fillText(legendB, left + 124, top + 15);
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

function buildStudentOverallSeries(classId) {
  const assignments = getClassAssignments(classId);
  const studentIds = recordsEnrollments.filter((e) => e.classId === classId).map((e) => e.studentId);
  const labels = studentIds.map((id) => {
    const s = recordsStudents.find((row) => row.id === id);
    return s ? `${s.firstName}` : id;
  });
  const values = studentIds.map((studentId) => {
    const grades = recordsAssignmentGrades.filter(
      (g) => g.studentId === studentId && assignments.some((a) => a.id === g.assignmentId)
    );
    const earned = grades.reduce((sum, g) => sum + Number(g.pointsEarned || 0), 0);
    const possible = assignments.reduce((sum, a) => sum + Number(a.pointsPossible || 0), 0) || 1;
    return Math.round((earned / possible) * 100);
  });
  return { labels, values };
}

function buildTopicSeries(classId, studentId, teacherMode) {
  const assignments = getClassAssignments(classId);
  const topicMap = {};

  assignments.forEach((assignment) => {
    const topic = String(assignment.type || "other")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (ch) => ch.toUpperCase());

    if (!topicMap[topic]) topicMap[topic] = { earned: 0, possible: 0 };

    if (teacherMode) {
      const rows = recordsAssignmentGrades.filter(
        (g) => g.assignmentId === assignment.id && g.pointsEarned != null
      );
      const avg = rows.length
        ? rows.reduce((sum, r) => sum + Number(r.pointsEarned || 0), 0) / rows.length
        : 0;
      topicMap[topic].earned += avg;
      topicMap[topic].possible += Number(assignment.pointsPossible || 0);
    } else {
      const row = recordsAssignmentGrades.find(
        (g) => g.assignmentId === assignment.id && g.studentId === studentId
      );
      topicMap[topic].earned += Number(row?.pointsEarned || 0);
      topicMap[topic].possible += Number(assignment.pointsPossible || 0);
    }
  });

  const labels = Object.keys(topicMap);
  const values = labels.map((label) => {
    const item = topicMap[label];
    return item.possible > 0 ? Math.round((item.earned / item.possible) * 100) : 0;
  });

  return { labels, values };
}

function renderAnalyticsInsights(classId, studentId, series, topicSeries, teacherAllMode = true) {
  analyticsInsights.innerHTML = "";
  let messages = [];

  if (!isTeacherView) {
    const studentGrade = recordsClassGrades.find((g) => g.classId === classId && g.studentId === studentId);
    const overall = studentGrade ? `${studentGrade.percent}% (${studentGrade.letterGrade})` : "Not available";
    const missingCount = series.studentValues.filter((v) => v === 0).length;
    let weakestIndex = 0;
    series.studentValues.forEach((value, idx) => {
      if (value < series.studentValues[weakestIndex]) weakestIndex = idx;
    });
    const weakest = series.assignments[weakestIndex];
    const weakestScore = series.studentValues[weakestIndex] || 0;
    messages = [
      `${getStudentName(studentId)} current overall grade: ${overall}.`,
      `Missing or unsubmitted assignments: ${missingCount}.`,
      weakest
        ? `Lowest assignment performance: "${weakest.title}" at ${weakestScore}%.`
        : "No assignment analytics available yet.",
      topicSeries.labels.length
        ? `Topic to focus this week: ${topicSeries.labels[topicSeries.values.indexOf(Math.min(...topicSeries.values))]}.`
        : "Topic performance will appear as more graded work is available.",
    ];
  } else if (teacherAllMode) {
    const studentSeries = buildStudentOverallSeries(classId);
    const classAverage = studentSeries.values.length
      ? Math.round(studentSeries.values.reduce((a, b) => a + b, 0) / studentSeries.values.length)
      : 0;
    let lowestStudentIdx = 0;
    studentSeries.values.forEach((v, idx) => {
      if (v < studentSeries.values[lowestStudentIdx]) lowestStudentIdx = idx;
    });
    let weakestAssignmentIdx = 0;
    series.classValues.forEach((v, idx) => {
      if (v < series.classValues[weakestAssignmentIdx]) weakestAssignmentIdx = idx;
    });
    const weakestAssignment = series.assignments[weakestAssignmentIdx];
    const weakestTopicIdx = topicSeries.values.length
      ? topicSeries.values.indexOf(Math.min(...topicSeries.values))
      : -1;
    const weakestTopic = weakestTopicIdx >= 0 ? topicSeries.labels[weakestTopicIdx] : "N/A";
    const missingRows = recordsAssignmentGrades.filter(
      (g) => g.pointsEarned == null && series.assignments.some((a) => a.id === g.assignmentId)
    ).length;
    const totalRows = series.assignments.length * Math.max(1, studentSeries.labels.length);
    const missingRate = Math.round((missingRows / totalRows) * 100);

    messages = [
      `Class average performance: ${classAverage}%. Lowest student group is ${studentSeries.labels[lowestStudentIdx] || "N/A"} at ${studentSeries.values[lowestStudentIdx] || 0}%.`,
      weakestAssignment
        ? `Weakest assignment-level outcome: "${weakestAssignment.title}" with class average ${series.classValues[weakestAssignmentIdx]}%.`
        : "Assignment-level trend needs more data.",
      `Topic with lowest mastery: ${weakestTopic}. Missing submission rate: ${missingRate}%.`,
      `Instructor suggestion: Add a 10-minute mini-lesson and worked example on ${weakestTopic}, then assign a short formative check in the next class.`,
      "Instructor suggestion: Group students below 70% into a targeted support station and provide scaffolded practice.",
    ];
  } else {
    const studentGrade = recordsClassGrades.find((g) => g.classId === classId && g.studentId === studentId);
    const overall = studentGrade ? `${studentGrade.percent}% (${studentGrade.letterGrade})` : "Not available";
    const missingCount = series.studentValues.filter((v) => v === 0).length;
    let weakestIndex = 0;
    series.studentValues.forEach((value, idx) => {
      if (value < series.studentValues[weakestIndex]) weakestIndex = idx;
    });
    const weakest = series.assignments[weakestIndex];
    const weakestScore = series.studentValues[weakestIndex] || 0;
    const studentName = getStudentName(studentId);
    messages = [
      `${studentName} overall grade: ${overall}.`,
      `${studentName} missing or unsubmitted assignments: ${missingCount}.`,
      weakest
        ? `Lowest assignment for ${studentName}: "${weakest.title}" at ${weakestScore}%.`
        : "No assignment analytics available yet.",
      topicSeries.labels.length
        ? `Coaching focus for ${studentName}: ${topicSeries.labels[topicSeries.values.indexOf(Math.min(...topicSeries.values))]}.`
        : "Topic performance will appear as more graded work is available.",
    ];
  }

  messages.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    analyticsInsights.appendChild(li);
  });
}

function renderAnalytics() {
  if (!analyticsPanel || !gradePieChart || !studentBarChart || !trendLineChart || !topicBarChart) return;

  if (!recordsLoaded) {
    drawPieChart(gradePieChart, [1], ["#d8e6e9"]);
    drawBarChart(studentBarChart, ["A1", "A2"], [0, 0]);
    drawTrendChart(trendLineChart, ["A1", "A2"], [0, 0], [0, 0]);
    drawBarChart(topicBarChart, ["Topic"], [0]);
    if (gradePieLegend) gradePieLegend.innerHTML = "<span><i style='background:#d8e6e9'></i>Loading records...</span>";
    return;
  }

  const analyticsStudentValue = analyticsStudentId || (isTeacherView ? ALL_STUDENTS_VALUE : currentStudentId);
  const teacherAllMode = isTeacherView && analyticsStudentValue === ALL_STUDENTS_VALUE;
  const series = buildAssignmentSeries(analyticsClassId, teacherAllMode ? currentStudentId : analyticsStudentValue);
  const topicSeries = buildTopicSeries(analyticsClassId, teacherAllMode ? currentStudentId : analyticsStudentValue, isTeacherView && teacherAllMode);

  if (!isTeacherView) {
    if (assignmentLevelCard) assignmentLevelCard.classList.remove("hidden");
    if (topicPerformanceCard) topicPerformanceCard.classList.add("hidden");
    analyticsStudentId = currentStudentId;
    if (analyticsStudentSelect) analyticsStudentSelect.disabled = true;
    if (analyticsClassSelect) analyticsClassSelect.disabled = true;

    const completed = series.studentValues.filter((v) => v > 0).length;
    const missing = series.studentValues.filter((v) => v === 0).length;
    drawPieChart(gradePieChart, [completed, missing || 0], ["#4aa77a", "#d57a7a"]);

    if (gradePieLegend) {
      gradePieLegend.innerHTML = "";
      ["Completed", "Missing"].forEach((label, idx) => {
        const val = idx === 0 ? completed : missing;
        const color = idx === 0 ? "#4aa77a" : "#d57a7a";
        const pill = document.createElement("span");
        pill.innerHTML = `<i style="background:${color}"></i>${label}: ${val}`;
        gradePieLegend.appendChild(pill);
      });
    }

    if (gradePieTitle) gradePieTitle.textContent = "Your Completion Snapshot";
    if (studentBarTitle) studentBarTitle.textContent = "Your Assignment Scores";
    if (trendLineTitle) trendLineTitle.textContent = "Assignment Trend: You vs Class Average";
    if (topicBarTitle) topicBarTitle.textContent = "Your Topic-wise Performance";

    drawBarChart(studentBarChart, series.labels, series.studentValues, { color: "#5fa7a5" });
    drawTrendChart(trendLineChart, series.labels, series.studentValues, series.classValues, "Class Avg", "You");
  } else {
    if (assignmentLevelCard) assignmentLevelCard.classList.toggle("hidden", teacherAllMode);
    if (topicPerformanceCard) topicPerformanceCard.classList.remove("hidden");
    if (analyticsStudentSelect) analyticsStudentSelect.disabled = false;
    if (analyticsClassSelect) analyticsClassSelect.disabled = false;

    if (teacherAllMode) {
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

      if (gradePieTitle) gradePieTitle.textContent = "Grade Distribution (Class)";
      if (studentBarTitle) studentBarTitle.textContent = "Student-level Performance";
      if (trendLineTitle) trendLineTitle.textContent = "Assignment-level Class Performance";
      if (topicBarTitle) topicBarTitle.textContent = "Topic-wise Class Performance";

      const studentSeries = buildStudentOverallSeries(analyticsClassId);
      drawBarChart(studentBarChart, studentSeries.labels, studentSeries.values, { color: "#4d9aa8" });
      drawTrendChart(
        trendLineChart,
        series.labels,
        series.classValues,
        new Array(series.classValues.length).fill(80),
        "Class Avg",
        "Target 80%"
      );
      drawBarChart(topicBarChart, topicSeries.labels, topicSeries.values, { color: "#7e9cb6" });
    } else {
      const selectedName = getStudentName(analyticsStudentValue);
      const completed = series.studentValues.filter((v) => v > 0).length;
      const missing = series.studentValues.filter((v) => v === 0).length;
      drawPieChart(gradePieChart, [completed, missing || 0], ["#4aa77a", "#d57a7a"]);

      if (gradePieLegend) {
        gradePieLegend.innerHTML = "";
        ["Completed", "Missing"].forEach((label, idx) => {
          const val = idx === 0 ? completed : missing;
          const color = idx === 0 ? "#4aa77a" : "#d57a7a";
          const pill = document.createElement("span");
          pill.innerHTML = `<i style="background:${color}"></i>${label}: ${val}`;
          gradePieLegend.appendChild(pill);
        });
      }

      if (gradePieTitle) gradePieTitle.textContent = `${selectedName}: Completion Snapshot`;
      if (studentBarTitle) studentBarTitle.textContent = `${selectedName}: Assignment Scores`;
      if (trendLineTitle) trendLineTitle.textContent = `${selectedName}: You vs Class Average`;
      if (topicBarTitle) topicBarTitle.textContent = `${selectedName}: Topic-wise Performance`;

      drawBarChart(studentBarChart, series.labels, series.studentValues, { color: "#5fa7a5" });
      drawTrendChart(trendLineChart, series.labels, series.studentValues, series.classValues, "Class Avg", selectedName);
      drawBarChart(topicBarChart, topicSeries.labels, topicSeries.values, { color: "#7e9cb6" });
    }
  }

  renderAnalyticsInsights(analyticsClassId, analyticsStudentValue, series, topicSeries, teacherAllMode);
}
updateCourseCardsGrades();

function getCareerDataForCourse(courseKey) {
  return careerReadinessByCourse[courseKey] || careerReadinessByCourse.programming;
}

function projectStorageKey(courseKey, projectId) {
  return `career_project_done:${currentStudentId}:${courseKey}:${projectId}`;
}

function isProjectCompleted(courseKey, projectId) {
  try {
    return localStorage.getItem(projectStorageKey(courseKey, projectId)) === "1";
  } catch (_error) {
    return false;
  }
}

function setProjectCompleted(courseKey, projectId, done) {
  try {
    if (done) {
      localStorage.setItem(projectStorageKey(courseKey, projectId), "1");
    } else {
      localStorage.removeItem(projectStorageKey(courseKey, projectId));
    }
  } catch (_error) {
    // Ignore storage errors in restricted browsers.
  }
}

function renderCareerReadinessTab(courseKey) {
  if (!careerPanel || !careerTrackList || !careerSkillsList || !careerProjectsList || !careerIdeasList) return;

  const data = getCareerDataForCourse(courseKey);
  const careers = data.careers || [];
  const projects = data.projects || [];
  const ideas = data.ideas || [];

  careerTrackList.innerHTML = "";
  careerSkillsList.innerHTML = "";
  careerProjectsList.innerHTML = "";
  careerIdeasList.innerHTML = "";

  careers.forEach((career) => {
    const card = document.createElement("article");
    card.className = "career-pill";
    card.innerHTML = `<h4>${escapeHtml(career.title)}</h4><p>${escapeHtml(career.why)}</p>`;
    careerTrackList.appendChild(card);
  });

  const requiredSkills = Array.from(
    new Set(careers.flatMap((career) => (career.requiredSkills || []).map((s) => s.trim())).filter(Boolean))
  );
  requiredSkills.forEach((skill) => {
    const li = document.createElement("li");
    li.textContent = skill;
    careerSkillsList.appendChild(li);
  });

  let completedCount = 0;

  projects.forEach((project) => {
    const done = isProjectCompleted(courseKey, project.id);
    if (done) completedCount += 1;

    const card = document.createElement("article");
    card.className = "project-card";

    const weekListHtml = (project.plan || [])
      .map((step) => `<li>${escapeHtml(step)}</li>`)
      .join("");
    const skillsText = (project.skills || []).join(" • ");

    card.innerHTML = `
      <div class="project-top">
        <div>
          <h4 class="project-title">${escapeHtml(project.title)}</h4>
          <p class="project-meta">${escapeHtml(project.outcome || "")}</p>
        </div>
        <label class="project-check">
          <input type="checkbox" ${done ? "checked" : ""} aria-label="Mark project as completed" />
          Completed
        </label>
      </div>
      <ol class="week-plan">${weekListHtml}</ol>
      <p class="project-skills"><strong>Skills you will build:</strong> ${escapeHtml(skillsText)}</p>
    `;

    const checkbox = card.querySelector("input[type='checkbox']");
    if (checkbox) {
      checkbox.addEventListener("change", () => {
        setProjectCompleted(courseKey, project.id, checkbox.checked);
        renderCareerReadinessTab(courseKey);
      });
    }

    careerProjectsList.appendChild(card);
  });

  ideas.forEach((idea) => {
    const li = document.createElement("li");
    li.textContent = idea;
    careerIdeasList.appendChild(li);
  });

  if (careerSummaryTitle) {
    careerSummaryTitle.textContent = `${projects.length ? Math.round((completedCount / projects.length) * 100) : 0}% Portfolio Plan Complete`;
  }
  if (careerSummaryText) {
    careerSummaryText.textContent = `${completedCount} of ${projects.length} projects completed.`;
  }
}

function renderActiveTab() {
  if (currentCourse === "home") return;

  const tabData = courseData[currentCourse].tabs[activeTab];
  if (!tabData) return;

  tabTitle.textContent = tabData.title;
  tabDescription.textContent = isTeacherView
    ? getTeacherTabDescription(activeTab, currentCourseDisplayTitle || courseData[currentCourse].title)
    : tabData.description;

  const assignmentsAccordion = document.getElementById("assignmentsAccordion");
  const gradesPanel = document.getElementById("gradesPanel");
  const overallGradeEl = document.getElementById("overallGrade");
  const gradesTableBody = document.querySelector("#gradesTable tbody");
  const gradesTableHeaders = document.querySelectorAll("#gradesTable thead th");
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
  if (tutorAssignmentList) tutorAssignmentList.innerHTML = "";
  if (analyticsPanel) analyticsPanel.classList.add("hidden");
  if (tutorPanel) tutorPanel.classList.add("hidden");
  if (careerPanel) careerPanel.classList.add("hidden");

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

    if (isTeacherView) {
      const headers = ["Student", "Student ID", "Term", "Percent", "Letter", "Notes"];
      gradesTableHeaders.forEach((th, idx) => {
        if (headers[idx]) th.textContent = headers[idx];
      });

      const classId = getTeacherClassIdForActiveCourse();
      const rows = classId ? getTeacherGradeRowsForClass(classId) : [];

      if (rows.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="6">No student gradebook data available for this class yet.</td>`;
        gradesTableBody.appendChild(tr);
        overallGradeEl.textContent = "--";
      } else {
        let totalPercent = 0;
        let gradedCount = 0;

        rows.forEach((row) => {
          if (typeof row.percent === "number") {
            totalPercent += row.percent;
            gradedCount += 1;
          }
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${escapeHtml(row.studentName)}</td>
            <td>${escapeHtml(row.studentId)}</td>
            <td>${escapeHtml(row.term)}</td>
            <td>${row.percent == null ? "-" : `${row.percent}%`}</td>
            <td>${escapeHtml(row.letter)}</td>
            <td>${row.percent == null ? "Grade not posted" : "Posted"}</td>
          `;
          gradesTableBody.appendChild(tr);
        });

        const avg = gradedCount > 0 ? Math.round(totalPercent / gradedCount) : null;
        overallGradeEl.textContent = avg == null ? "--" : `${avg}%`;
      }
    } else {
      const headers = ["Assignment", "Due", "Submitted", "Status", "Score", "Teacher Notes"];
      gradesTableHeaders.forEach((th, idx) => {
        if (headers[idx]) th.textContent = headers[idx];
      });

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

  // TUTOR TAB ONLY
  else if (activeTab === "tutor") {
    if (tutorPanel) tutorPanel.classList.remove("hidden");
    const tutorRows = getTutorAssignmentsForCourse(currentCourse);

    if (tutorAssignmentList && tutorRows.length === 0) {
      const empty = document.createElement("div");
      empty.className = "announcement-empty";
      empty.textContent = "No past assignments are available to study yet.";
      tutorAssignmentList.appendChild(empty);
    } else if (tutorAssignmentList) {
      tutorRows.forEach((row) => {
        const item = document.createElement("article");
        item.className = "tutor-row";
        item.innerHTML = `
          <div class="tutor-row-left">
            <div class="tutor-row-title">${escapeHtml(row.title)}</div>
            <div class="tutor-row-meta">Due ${escapeHtml(row.dueDate)} | Score: ${escapeHtml(row.scoreText)}</div>
          </div>
          <button class="study-btn" type="button">Study</button>
        `;

        const studyBtn = item.querySelector(".study-btn");
        if (studyBtn) {
          studyBtn.addEventListener("click", () => {
            setChatOpen(true);
            chatInput.value = `Help me study for "${row.title}" in ${courseData[currentCourse].title}.`;
            chatInput.focus();
          });
        }

        tutorAssignmentList.appendChild(item);
      });
    }
  }

  // ANALYTICS TAB ONLY
  else if (activeTab === "analytics") {
    if (analyticsPanel) analyticsPanel.classList.remove("hidden");
    const classId = courseKeyToClassId[currentCourse];
    if (classId) analyticsClassId = classId;
    populateAnalyticsFilters();
    renderAnalytics();
  }

  // CAREER READINESS TAB ONLY
  else if (activeTab === "career") {
    if (careerPanel) careerPanel.classList.remove("hidden");
    renderCareerReadinessTab(currentCourse);
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

function renderCourseDetail(key, cardEl = null) {
  const course = courseData[key];
  if (!course) return;

  currentCourse = key;
  activeTab = "assignments";
  updateCourseTabVisibility();
  const teacherCardTitle = cardEl?.dataset?.displayTitle || "";
  currentCourseDisplayTitle = isTeacherView && teacherCardTitle ? teacherCardTitle : course.title;

  detailTag.textContent = isTeacherView ? "Chemistry" : course.tag;
  detailTitle.textContent = currentCourseDisplayTitle;
  detailHeading.textContent = isTeacherView ? `${currentCourseDisplayTitle} Overview` : course.heading;
  detailIntro.textContent = isTeacherView
    ? `Teacher workspace for ${currentCourseDisplayTitle}. Manage assignments, student progress, files, and announcements.`
    : course.intro;

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
    card.dataset.displayTitle = info.title;
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
      publishedCoursesHeading.textContent = `Published Chemistry Courses (${publishedCount})`;
    } else {
      publishedCoursesHeading.style.display = "none";
    }
  }
  if (unpublishedCoursesHeading && isTeacherView) {
    unpublishedCoursesHeading.textContent = isTeacherView
      ? `Unpublished Chemistry Courses (${unpublishedCount})`
      : `Unpublished Courses (${unpublishedCount})`;
  }
  if (unpublishedCoursesGroup) {
    unpublishedCoursesGroup.style.display = isTeacherView ? "" : "none";
  }
  if (publishedCourseDivider) {
    publishedCourseDivider.style.display = isTeacherView ? "" : "none";
  }
}

function updateCourseTabVisibility() {
  const showTutorTab = !isTeacherView && currentCourse === "chemistry";
  if (tutorTabButton) {
    tutorTabButton.classList.toggle("hidden", !showTutorTab);
  }
  const showCareerTab = !isTeacherView;
  if (careerTabButton) {
    careerTabButton.classList.toggle("hidden", !showCareerTab);
  }
  if ((!showTutorTab && activeTab === "tutor") || (!showCareerTab && activeTab === "career")) {
    activeTab = "assignments";
  }
}

function getTeacherTabDescription(tabKey, courseTitle) {
  if (tabKey === "assignments") return `Manage assignments and due dates for ${courseTitle}.`;
  if (tabKey === "grades") return `Review grading details for ${courseTitle}.`;
  if (tabKey === "announcements") return `Post and manage announcements for ${courseTitle}.`;
  if (tabKey === "files") return `Manage course files for ${courseTitle}.`;
  if (tabKey === "modules") return `Organize modules and weekly content for ${courseTitle}.`;
  if (tabKey === "analytics") return `View class performance analytics for ${courseTitle}.`;
  return `Course workspace for ${courseTitle}.`;
}

function navigateToPage(path, params = {}) {
  const query = new URLSearchParams(params);
  if (isTeacherView && path !== "teacher.html") {
    query.set("view", "teacher");
  }
  const qs = query.toString();
  window.location.href = qs ? `${path}?${qs}` : path;
}

function setViewRole(teacherMode) {
  isTeacherView = teacherMode;
  document.body.classList.toggle("teacher-view", teacherMode);
  const teacherName = recordsTeachers[0]
    ? `${recordsTeachers[0].title || ""} ${recordsTeachers[0].firstName || ""} ${recordsTeachers[0].lastName || ""}`.trim()
    : "Dr. Nina Verma";
  const student = recordsStudents.find((s) => s.id === currentStudentId);
  const studentName = student ? `${student.firstName} ${student.lastName}` : "Jordan Chen";
  const activeName = teacherMode ? teacherName : studentName;

  [activeUserNameHome, activeUserNameCalendar, activeUserNameDetail].forEach((el) => {
    if (el) el.textContent = activeName;
  });

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
  updateCourseTabVisibility();
  applyDashboardClassesForRole();
  if (currentCourse !== "home") renderActiveTab();
  if (activeTab === "analytics") {
    populateAnalyticsFilters();
    renderAnalytics();
  }
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
    const params = { course: card.dataset.course || "chemistry" };
    if (isTeacherView && card.dataset.displayTitle) {
      params.title = card.dataset.displayTitle;
    }
    navigateToPage("course.html", params);
  });
});

navDashboard.addEventListener("click", (event) => {
  event.preventDefault();
  navigateToPage(isTeacherView ? "teacher.html" : "dashboard.html");
});

navCalendar.addEventListener("click", (event) => {
  event.preventDefault();
  navigateToPage("calendar.html");
});

navCourses.addEventListener("click", (event) => {
  event.preventDefault();
  navigateToPage(isTeacherView ? "teacher.html" : "dashboard.html");
});

navInbox.addEventListener("click", (event) => {
  event.preventDefault();
  navigateToPage(isTeacherView ? "teacher.html" : "dashboard.html");
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

backToHome.addEventListener("click", () => {
  navigateToPage(isTeacherView ? "teacher.html" : "dashboard.html");
});

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
    if (isTeacherView) {
      window.location.href = "index.html";
    } else {
      navigateToPage("teacher.html");
    }
    closeProfileMenu();
  });
}

if (settingsOption) {
  settingsOption.addEventListener("click", () => {
    closeProfileMenu();
  });
}

function initPageRoute() {
  const pageName = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (pageName === "calendar.html") {
    showView("calendar");
    return;
  }
  if (pageName === "course.html") {
    const params = new URLSearchParams(window.location.search);
    const courseKey = params.get("course") || "chemistry";
    const title = params.get("title");
    const courseCardLike = title ? { dataset: { displayTitle: title } } : null;
    renderCourseDetail(courseKey, courseCardLike);
    showView("detail");
    return;
  }
  showView("home");
}

const pageName = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
const pageParams = new URLSearchParams(window.location.search);
const initialTeacherMode = pageName === "teacher.html" || pageParams.get("view") === "teacher";

setViewRole(initialTeacherMode);
initPageRoute();

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
