import { useMemo, useState } from 'react';
import { api } from '@appdeploy/client';
import {
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Menu,
  PlayCircle,
  Search,
  Sparkles,
  X,
} from 'lucide-react';

type Curriculum = 'CAPS' | 'IEB';

const grades = ['Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

const subjects = [
  ['Mathematics', '∑', 'Numeracy, algebra, geometry, functions and problem solving.'],
  ['Physical Sciences', '⚛', 'Physics and chemistry concepts, calculations and experiments.'],
  ['Life Sciences', '🧬', 'Biology, ecology, genetics, evolution and human systems.'],
  ['English', 'Aa', 'Language, literature, comprehension, writing and communication.'],
  ['Geography', '🌍', 'Maps, climate, settlements, resources and geographical skills.'],
  ['Accounting', '₿', 'Accounting concepts, statements, analysis and practice.'],
  ['Business Studies', '▣', 'Business environments, management, entrepreneurship and strategy.'],
  ['Computer Applications Technology', '</>', 'Digital literacy, applications, information and technology.'],
  ['Information Technology', '{ }', 'Programming, data, systems and computational thinking.'],
  ['Mathematical Literacy', '≈', 'Everyday mathematics, finance, data and measurement.'],
];

const curriculumNotes: Record<Curriculum, string> = {
  CAPS: 'Use the Department of Basic Education CAPS framework as the curriculum reference. FET Mathematics and Physical Sciences learners can also jump directly into Siyavula resources.',
  IEB: 'Use the IEB National Senior Certificate requirements and your school’s IEB subject programme as the reference. EduPulse explains concepts without reproducing proprietary school materials.',
};

const sourceLinks = [
  { name: 'DBE CAPS — FET Grades 10–12', url: 'https://www.education.gov.za/Curriculum/CurriculumStatements/FET%28Grades10-12%29.aspx', tag: 'Official CAPS' },
  { name: 'DBE CAPS — Grades 4–9', url: 'https://www.education.gov.za/Curriculum/NCSGradesR12/CAPS/tabid/420/Default.aspx', tag: 'Official CAPS' },
  { name: 'IEB — NSC Requirements', url: 'https://www.ieb.co.za/assessment/high-schools/national-senior-certificate/nsc-requirements', tag: 'Official IEB' },
  { name: 'Siyavula Open Textbooks', url: 'https://www.siyavula.com/read', tag: 'FET resource' },
];

const fetSiyavula: Record<string, string> = {
  Mathematics: 'https://www.siyavula.com/read/za/mathematics/',
  'Physical Sciences': 'https://www.siyavula.com/read/za/physical-sciences/',
};

const youtubeTeachers = [
  { name: 'Kevin Math & Science', search: 'Kevin Math and Science South Africa', note: 'Search for topic-specific lessons.' },
  { name: 'Mlungisi Nkosi', search: 'Mlungisi Nkosi education South Africa', note: 'Search for the relevant school subject and topic.' },
  { name: 'South African teacher lessons', search: 'South Africa CAPS Grade 10 mathematics physical sciences', note: 'Use the topic search to discover relevant lessons.' },
];

const topicMap: Record<string, string[]> = {
  Mathematics: ['Algebraic expressions', 'Exponents', 'Functions', 'Trigonometry', 'Analytical geometry', 'Probability'],
  'Physical Sciences': ['Mechanics', 'Waves and sound', 'Electricity', 'Matter and materials', 'Chemical reactions', 'Organic chemistry'],
  'Life Sciences': ['Cells', 'Genetics', 'Evolution', 'Ecology', 'Human reproduction', 'Human systems'],
  English: ['Language structures', 'Comprehension', 'Literature', 'Essay writing', 'Creative writing'],
  Geography: ['Mapwork', 'Climate', 'Geomorphology', 'Population', 'Resources', 'Settlement'],
  Accounting: ['Accounting concepts', 'Financial statements', 'Cost accounting', 'Analysis', 'Budgeting'],
  'Business Studies': ['Business environments', 'Entrepreneurship', 'Management', 'Marketing', 'Human resources'],
  'Computer Applications Technology': ['Word processing', 'Spreadsheets', 'Databases', 'Networks', 'Information management'],
  'Information Technology': ['Programming', 'Data structures', 'Databases', 'Systems', 'Problem solving'],
  'Mathematical Literacy': ['Finance', 'Data handling', 'Measurement', 'Maps and plans'],
};

function App() {
  const [grade, setGrade] = useState('Grade 10');
  const [curriculum, setCurriculum] = useState<Curriculum>('CAPS');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState(topicMap.Mathematics[0]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [studyMode, setStudyMode] = useState(false);
  const [studyLoading, setStudyLoading] = useState(false);
  const [studyLesson, setStudyLesson] = useState('');
  const [studyExercise, setStudyExercise] = useState('');
  const [studyFeedback, setStudyFeedback] = useState('');
  const [mastered, setMastered] = useState(false);

  const isFet = ['Grade 10', 'Grade 11', 'Grade 12'].includes(grade);
  const topics = topicMap[subject] || ['Introduction', 'Key concepts', 'Revision'];

  const filteredSubjects = useMemo(
    () => subjects.filter(item => item[0].toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const askTutor = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer('');

    try {
      const response = await api.post('/api/tutor', {
        grade,
        curriculum,
        subject,
        topic,
        question,
      });

      setAnswer(response.data.answer);
    } catch {
      setAnswer('The AI Tutor could not respond right now. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const chooseSubject = (name: string) => {
    setSubject(name);
    setTopic((topicMap[name] || ['Introduction'])[0]);
    document.getElementById('study')?.scrollIntoView({ behavior: 'smooth' });
  };

  const startStudyMode = async () => {
    setStudyMode(true);
    setStudyLoading(true);
    setStudyLesson('');
    setStudyExercise('');
    setStudyFeedback('');
    setMastered(false);

    try {
      const response = await api.post('/api/study', {
        grade,
        curriculum,
        subject,
        topic,
        term,
      });

      setStudyLesson(response.data.lesson);
      setStudyExercise(response.data.exercise);
    } catch {
      setStudyLesson('Study Mode could not load right now. Please try again.');
    } finally {
      setStudyLoading(false);
    }
  };

  const checkStudyAnswer = async () => {
    const input = document.getElementById('study-answer') as HTMLTextAreaElement | null;

    if (!input?.value.trim()) return;

    setStudyLoading(true);
    setStudyFeedback('');

    try {
      const response = await api.post('/api/study/check', {
        grade,
        curriculum,
        subject,
        topic,
        exercise: studyExercise,
        answer: input.value,
      });

      setMastered(Boolean(response.data.mastered));
      setStudyFeedback(response.data.feedback);
    } catch {
      setStudyFeedback('I could not check the answer right now. Please try again.');
    } finally {
      setStudyLoading(false);
    }
  };

  return (
    <div className="app">
      <nav className="nav">
        <a href="#home" className="brand">
          Edu<span>Pulse</span> <small>SA</small>
        </a>

        <div className={menu ? 'nav-links open' : 'nav-links'}>
          <a href="#study" onClick={() => setMenu(false)}>Study</a>
          <a href="#subjects" onClick={() => setMenu(false)}>Subjects</a>
          <a href="#sources" onClick={() => setMenu(false)}>Sources</a>
          <a href="#youtube" onClick={() => setMenu(false)}>YouTube</a>
          <a href="#papers" onClick={() => setMenu(false)}>Past Papers</a>
        </div>

        <button
          className="menu-button"
          onClick={() => setMenu(!menu)}
          aria-label="Menu"
        >
          {menu ? <X /> : <Menu />}
        </button>
      </nav>

      <header id="home" className="hero">
        <div className="hero-glow" />

        <div className="hero-copy">
          <p className="eyebrow">
            MAHLANGU & MASONTO TECH FOUNDATION • EST. 2026
          </p>

          <p className="founders-label">FOUNDERS</p>

          <h1>
            Nkululeko Mahlangu <span>&</span> Thabang Masonto
         
