import { useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Menu,
  PlayCircle,
  Search,
  Sparkles,
  X,
  Youtube,
} from "lucide-react";

type Curriculum = "CAPS" | "IEB";

const subjects = [
  "Mathematics",
  "Physical Sciences",
  "Life Sciences",
  "English",
  "Geography",
  "Accounting",
  "Business Studies",
  "Computer Applications Technology",
  "Information Technology",
  "Mathematical Literacy",
];

const topics: Record<string, string[]> = {
  Mathematics: [
    "Algebra",
    "Functions",
    "Geometry",
    "Trigonometry",
    "Statistics",
  ],
  "Physical Sciences": [
    "Mechanics",
    "Waves",
    "Electricity",
    "Electrostatics",
    "Chemical Reactions",
  ],
  "Life Sciences": [
    "History of Life",
    "Cells",
    "Genetics",
    "Evolution",
    "Ecology",
  ],
  English: [
    "Comprehension",
    "Creative Writing",
    "Language",
    "Literature",
    "Poetry",
  ],
  Geography: [
    "Climate",
    "Geomorphology",
    "Map Skills",
    "Population",
    "Resources",
  ],
  Accounting: [
    "Accounting Concepts",
    "Financial Statements",
    "Budgets",
    "Inventory",
    "Analysis",
  ],
  "Business Studies": [
    "Business Environments",
    "Entrepreneurship",
    "Marketing",
    "Human Resources",
    "Business Strategies",
  ],
  "Computer Applications Technology": [
    "Word Processing",
    "Spreadsheets",
    "Databases",
    "Networks",
    "Information Management",
  ],
  "Information Technology": [
    "Programming",
    "Algorithms",
    "Data Structures",
    "Databases",
    "Networks",
  ],
  "Mathematical Literacy": [
    "Finance",
    "Measurement",
    "Maps and Plans",
    "Data Handling",
    "Probability",
  ],
};

const universities = [
  {
    name: "University of Cape Town",
    focus: "Computer Science, Engineering, Commerce and many other degrees.",
  },
  {
    name: "University of the Witwatersrand",
    focus: "Computer Science, Engineering, Commerce, Science and Health Sciences.",
  },
  {
    name: "University of Pretoria",
    focus: "Computer Science, Engineering, Science, Commerce and more.",
  },
  {
    name: "University of Johannesburg",
    focus: "Technology, Computer Science, Engineering, Commerce and Humanities.",
  },
];

const bursaries = [
  "NSFAS",
  "Funza Lushaka",
  "Department and provincial bursaries",
  "University-specific financial aid",
  "Corporate bursaries from major South African companies",
];

function App() {
  const [curriculum, setCurriculum] = useState<Curriculum>("CAPS");
  const [grade, setGrade] = useState("10");
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("Algebra");
  const [term, setTerm] = useState("Term 1");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [studyOpen, setStudyOpen] = useState(false);

  const [question, setQuestion] = useState("");
  const [tutorAnswer, setTutorAnswer] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);

  const [lesson, setLesson] = useState("");
  const [exercise, setExercise] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [mastered, setMastered] = useState<boolean | null>(null);
  const [studyLoading, setStudyLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);

  const currentTopics = useMemo(
    () => topics[subject] || ["Introduction"],
    [subject]
  );

  const askTutor = async () => {
    if (!question.trim()) return;

    setTutorLoading(true);
    setTutorAnswer("");

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grade,
          curriculum,
          subject,
          topic,
          question,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Tutor unavailable");
      }

      setTutorAnswer(data.answer || "No answer was returned.");
    } catch {
      setTutorAnswer(
        "The AI Tutor is not connected yet. Your question has been prepared for the EduPulse AI system."
      );
    } finally {
      setTutorLoading(false);
    }
  };

  const startStudy = async () => {
    setStudyOpen(true);
    setStudyLoading(true);
    setLesson("");
    setExercise("");
    setFeedback("");
    setMastered(null);
    setStudentAnswer("");

    try {
      const response = await fetch("/api/study", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grade,
          curriculum,
          subject,
          topic,
          term,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Study Mode unavailable");
      }

      setLesson(data.lesson || "");
      setExercise(data.exercise || "");
    } catch {
      setLesson(
        `Welcome to Study Mode for Grade ${grade} ${curriculum} ${subject}.\n\nToday we are studying ${topic} in ${term}.\n\nEduPulse Study Mode will guide you through the concept, examples and practice until you understand it.`
      );

      setExercise(
        `Explain ${topic} in your own words and give one example.`
      );
    } finally {
      setStudyLoading(false);
    }
  };

  const checkAnswer = async () => {
    if (!studentAnswer.trim()) return;

    setCheckLoading(true);
    setFeedback("");

    try {
      const response = await fetch("/api/study/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grade,
          curriculum,
          subject,
          topic,
          exercise,
          answer: studentAnswer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Checker unavailable");
      }

      setMastered(Boolean(data.mastered));
      setFeedback(data.feedback || "");
    } catch {
      setMastered(null);
      setFeedback(
        "The answer checker is not connected yet. Keep working through the topic and compare your answer with your teacher's guidance."
      );
    } finally {
      setCheckLoading(false);
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
    setMobileMenu(false);
  };

  return (
    <div className="app">
      <header className="nav">
        <button
          className="brand"
          onClick={() => scrollTo("home")}
          aria-label="EduPulse SA home"
        >
          <span className="brand-mark">
            <Brain size={22} />
          </span>
          <span>
            <strong>EduPulse SA</strong>
            <small>Mahlangu and Masonto Tech Foundation</small>
          </span>
        </button>

        <nav className={mobileMenu ? "nav-links open" : "nav-links"}>
          <button onClick={() => scrollTo("home")}>Home</button>
          <button onClick={() => scrollTo("study")}>Study</button>
          <button onClick={() => scrollTo("subjects")}>Subjects</button>
          <button onClick={() => scrollTo("tutor")}>AI Tutor</button>
          <button onClick={() => scrollTo("university")}>University</button>
          <button onClick={() => scrollTo("sources")}>Sources</button>
        </nav>

        <button
          className="mobile-menu"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Open menu"
        >
          {mobileMenu ? <X /> : <Menu />}
        </button>
      </header>

      <main>
        <section id="home" className="section hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={16} />
              SOUTH AFRICAN LEARNING, BUILT FOR LEARNERS
            </div>

            <h1>
              Learn smarter.
              <br />
              <span>Build your future.</span>
            </h1>

            <p>
              EduPulse SA is a free learning platform for Grades 4–12,
              bringing CAPS and IEB learning resources, Study Mode and AI
              tutoring together in one place.
            </p>

            <div className="hero-actions">
              <button
                className="button primary"
                onClick={() => scrollTo("study")}
              >
                <BookOpen size={18} />
                Start Learning
              </button>

              <button
                className="button secondary"
                onClick={() => scrollTo("tutor")}
              >
                <Brain size={18} />
                Ask AI Tutor
              </button>
            </div>

            <div className="hero-stats">
              <div>
                <strong>Grades 4–12</strong>
                <span>School learning</span>
              </div>
              <div>
                <strong>CAPS + IEB</strong>
                <span>Two pathways</span>
              </div>
              <div>
                <strong>Free</strong>
                <span>Built for learners</span>
              </div>
            </div>
          </div>

          <div className="hero-card">
            <div className="dashboard-card">
              <div className="card-top">
                <span>EduPulse Dashboard</span>
                <CheckCircle2 size={20} />
              </div>

              <div className="dashboard-score">
                <span>Today's learning</span>
                <strong>Ready</strong>
              </div>

              <div className="dashboard-list">
                <div>
                  <BookOpen size={18} />
                  <span>Study Mode</span>
                  <b>AI lessons</b>
                </div>
                <div>
                  <Brain size={18} />
                  <span>AI Tutor</span>
                  <b>Any subject</b>
                </div>
                <div>
                  <GraduationCap size={18} />
                  <span>University</span>
                  <b>Plan ahead</b>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="study" className="section">
          <div className="section-heading">
            <div>
              <span className="section-label">01 / STUDY MODE</span>
              <h2>Learn a topic until it makes sense.</h2>
              <p>
                Choose your grade, curriculum, subject, term and topic.
                EduPulse creates a guided lesson and practice activity.
              </p>
            </div>
          </div>

          <div className="study-panel">
            <div className="control-grid">
              <label>
                Curriculum
                <select
                  value={curriculum}
                  onChange={(e) =>
                    setCurriculum(e.target.value as Curriculum)
                  }
                >
                  <option>CAPS</option>
                  <option>IEB</option>
                </select>
              </label>

              <label>
                Grade
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                >
                  {Array.from({ length: 9 }, (_, i) => i + 4).map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </label>

              <label>
                Term
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                >
                  <option>Term 1</option>
                  <option>Term 2</option>
                  <option>Term 3</option>
                  <option>Term 4</option>
                </select>
              </label>

              <label>
                Subject
                <select
                  value={subject}
                  onChange={(e) => {
                    const next = e.target.value;
                    setSubject(next);
                    setTopic(topics[next]?.[0] || "Introduction");
                  }}
                >
                  {subjects.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label>
                Topic
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  {currentTopics.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="study-action">
              <div>
                <span>{curriculum}</span>
                <strong>
                  Grade {grade} · {subject}
                </strong>
                <small>
                  {term} · {topic}
                </small>
              </div>

              <button className="button primary" onClick={startStudy}>
                <PlayCircle size={18} />
                Enter Study Mode
              </button>
            </div>
          </div>
        </section>

        <section id="subjects" className="section">
          <div className="section-heading">
            <div>
              <span className="section-label">02 / SUBJECT LIBRARY</span>
              <h2>Your school subjects, in one place.</h2>
              <p>
                Explore learning areas and build your understanding from the
                basics upward.
              </p>
            </div>
          </div>

          <div className="subject-grid">
            {subjects.map((item, index) => (
              <button
                className={`subject-card subject-${(index % 6) + 1}`}
                key={item}
                onClick={() => {
                  setSubject(item);
                  setTopic(topics[item]?.[0] || "Introduction");
                  scrollTo("study");
                }}
              >
                <BookOpen size={22} />
                <strong>{item}</strong>
                <span>{topics[item]?.length || 0} topic areas</span>
              </button>
            ))}
          </div>
        </section>

        <section id="tutor" className="section">
          <div className="tutor-card">
            <div className="tutor-copy">
              <span className="section-label">03 / EDU PULSE AI</span>
              <h2>Ask a question. Get taught.</h2>
              <p>
                Ask about Mathematics, Physical Sciences, Life Sciences,
                English, Geography, coding or any other school subject.
              </p>

              <div className="tutor-context">
                Grade {grade} · {curriculum} · {subject} · {topic}
              </div>
            </div>

            <div className="tutor-box">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Example: Explain Newton's laws in a simple way."
              />

              <button
                className="button primary"
                onClick={askTutor}
                disabled={tutorLoading}
              >
                <Brain size={18} />
                {tutorLoading ? "Teaching..." : "Ask EduPulse AI"}
              </button>

              {tutorAnswer && (
                <div className="ai-output">
                  <strong>EduPulse AI</strong>
                  <p>{tutorAnswer}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="sources" className="section">
          <div className="section-heading">
            <div>
              <span className="section-label">04 / CURRICULUM SOURCES</span>
              <h2>Use trusted South African sources.</h2>
              <p>
                EduPulse helps learners find official curriculum and learning
                resources.
              </p>
            </div>
          </div>

          <div className="source-grid">
            <a
              className="source-card"
              href="https://www.education.gov.za/"
              target="_blank"
              rel="noreferrer"
            >
              <BookOpen size={24} />
              <strong>DBE / CAPS</strong>
              <span>
                Department of Basic Education curriculum information.
              </span>
            </a>

            <a
              className="source-card"
              href="https://www.ieb.co.za/"
              target="_blank"
              rel="noreferrer"
            >
              <GraduationCap size={24} />
              <strong>IEB</strong>
              <span>Independent Examinations Board information.</span>
            </a>

            <a
              className="source-card"
              href="https://www.siyavula.com/"
              target="_blank"
              rel="noreferrer"
            >
              <Brain size={24} />
              <strong>Siyavula</strong>
              <span>
                Open learning resources, especially Mathematics and Physical
                Sciences.
              </span>
            </a>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <span className="section-label">05 / YOUTUBE LEARNING</span>
              <h2>Find South African teachers online.</h2>
            </div>
          </div>

          <div className="youtube-grid">
            <a
              className="youtube-card"
              href="https://www.youtube.com/results?search_query=Kevin+Math+and+Science+South+Africa"
              target="_blank"
              rel="noreferrer"
            >
              <Youtube size={28} />
              <strong>Kevin Math and Science</strong>
              <span>Search YouTube lessons</span>
            </a>

            <a
              className="youtube-card"
              href="https://www.youtube.com/results?search_query=Mlungisi+Nkosi+South+Africa+teacher"
              target="_blank"
              rel="noreferrer"
            >
              <Youtube size={28} />
              <strong>Mlungisi Nkosi</strong>
              <span>Search YouTube lessons</span>
            </a>

            <a
              className="youtube-card"
              href="https://www.youtube.com/results?search_query=South+African+teacher+lessons+CAPS"
              target="_blank"
              rel="noreferrer"
            >
              <Youtube size={28} />
              <strong>South African Teacher Lessons</strong>
              <span>Explore CAPS learning videos</span>
            </a>
          </div>
        </section>

        <section className="section">
          <div className="coming-soon">
            <span className="section-label">06 / PAST PAPERS</span>
            <h2>Past Papers</h2>
            <div className="coming-badge">COMING SOON</div>
            <p>
              EduPulse SA is preparing a structured past-paper experience for
              Grades 4–12 and multiple subjects.
            </p>
          </div>
        </section>

        <section id="university" className="section">
          <div className="section-heading">
            <div>
              <span className="section-label">07 / MATRIC & UNIVERSITY</span>
              <h2>Start planning before Grade 12.</h2>
              <p>
                Explore degrees, universities, admission requirements and
                funding options. Always confirm final requirements with the
                institution.
              </p>
            </div>
          </div>

          <div className="degree-grid">
            {universities.map((university) => (
              <article className="degree-card" key={university.name}>
                <GraduationCap size={26} />
                <h3>{university.name}</h3>
                <p>{university.focus}</p>
                <span>
                  <Search size={15} /> Check current requirements
                </span>
              </article>
            ))}
          </div>

          <div className="bursary-box">
            <div>
              <span className="section-label">FUNDING</span>
              <h3>Bursaries to investigate</h3>
            </div>

            <ul>
              {bursaries.map((bursary) => (
                <li key={bursary}>
                  <CheckCircle2 size={17} />
                  {bursary}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <strong>EduPulse SA</strong>
          <p>
            Free South African learning support for Grades 4–12.
          </p>
        </div>

        <div>
          <strong>Founded in 2026</strong>
          <p>Nkululeko Mahlangu & Thabang Masonto</p>
        </div>

        <div>
          <strong>Mahlangu and Masonto Tech Foundation</strong>
          <p>Learn. Build. Lead.</p>
        </div>
      </footer>

      {studyOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setStudyOpen(false)}
        >
          <div
            className="study-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="section-label">STUDY MODE</span>
                <h2>{topic}</h2>
                <p>
                  Grade {grade} · {curriculum} · {subject} · {term}
                </p>
              </div>

              <button
                className="icon-button"
                onClick={() => setStudyOpen(false)}
                aria-label="Close Study Mode"
              >
                <X />
              </button>
            </div>

            {studyLoading ? (
              <div className="loading-state">
                <Brain size={30} />
                <strong>Preparing your lesson...</strong>
                <span>
                  EduPulse is building notes and an exercise for you.
                </span>
              </div>
            ) : (
              <div className="study-content">
                <article className="lesson-box">
                  <span className="section-label">LESSON NOTES</span>
                  <p>{lesson}</p>
                </article>

                <article className="exercise-box">
                  <span className="section-label">EXERCISE</span>
                  <p>{exercise}</p>

                  <textarea
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    placeholder="Write your answer here..."
                  />

                  <button
                    className="button primary"
                    onClick={checkAnswer}
                    disabled={checkLoading}
                  >
                    {checkLoading
                      ? "Checking..."
                      : "Check my answer"}
                  </button>

                  {feedback && (
                    <div
                      className={
                        mastered
                          ? "feedback success"
                          : "feedback"
                      }
                    >
                      <strong>
                        {mastered === true
                          ? "Understanding demonstrated ✓"
                          : mastered === false
                            ? "Keep working — you're getting there."
                            : "Tutor feedback"}
                      </strong>
                      <p>{feedback}</p>
                    </div>
                  )}
                </article>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
