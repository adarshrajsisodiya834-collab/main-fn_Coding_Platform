import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Code2,
  Terminal,
  BookOpen,
  ChartNoAxesCombined,
  Users,
  Settings,
  Menu,
  X,
  ArrowRight,
  Play,
  Send,
  Search,
  Sun,
  Moon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  LogOut,
  Shield,
  Plug,
  Activity,
  Target,
  Layers,
  House,
  Info,
  Mail,
  History,
  PanelLeftClose,
} from "lucide-react";
import axios from "axios";
import "./style.css";
const API = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/$/, "");
const http = axios.create({ baseURL: API });
http.interceptors.request.use((c) => {
  const t = localStorage.getItem("codex_token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
const LANGS = [
  {
    label: "Python",
    value: "python",
    ext: "main.py",
    code: 'name = input("Enter your name: ")\nprint(f"Hello, {name}!")',
    stdin: "Adarsh",
  },
  {
    label: "C",
    value: "c",
    ext: "main.c",
    code: '#include <stdio.h>\nint main(void) {\n    printf("Hello, main( )!\\n");\n    return 0;\n}',
    stdin: "",
  },
  {
    label: "C++",
    value: "cpp",
    ext: "main.cpp",
    code: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, main( )!" << endl;\n    return 0;\n}',
    stdin: "",
  },
  {
    label: "Java",
    value: "java",
    ext: "Main.java",
    code: 'public class Main {\n    public static void main(String[] args) {\n            System.out.println("Hello, main( )!");\n    }\n}',
    stdin: "",
  },
  {
    label: "JavaScript",
    value: "javascript",
    ext: "main.js",
    code: 'const greeting = "Hello, main( )!";\nconsole.log(greeting);',
    stdin: "",
  },
  {
    label: "C#",
    value: "csharp",
    ext: "Program.cs",
    code: 'using System;\nclass Program {\n    static void Main() {\n            Console.WriteLine("Hello, main( )!");\n    }\n}',
    stdin: "",
  },
];
const seedProblems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    topics: ["Arrays", "Hashing"],
    patterns: ["Hash Map"],
    acceptance: 52,
    description:
      "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.",
    example: "nums = [2,7,11,15], target = 9\nOutput: [0,1]",
    starter:
      "class Solution:\n    def twoSum(self, nums, target):\n        # Write your solution\n        pass",
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    topics: ["Strings", "Stack"],
    patterns: ["Stack", "Matching"],
    acceptance: 48,
    description:
      "Given a string s containing brackets, determine whether the input string is valid.",
    example: 's = "()[]{}"\nOutput: true',
    starter: "class Solution:\n    def isValid(self, s):\n        pass",
  },
  {
    id: 3,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topics: ["Strings", "Hashing"],
    patterns: ["Sliding Window", "Frequency Tracking"],
    acceptance: 39,
    description:
      "Find the length of the longest substring without repeating characters.",
    example: 's = "abcabcbb"\nOutput: 3',
    starter:
      "class Solution:\n    def lengthOfLongestSubstring(self, s):\n        pass",
  },
  {
    id: 4,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    topics: ["Linked List"],
    patterns: ["Two Pointers"],
    acceptance: 47,
    description: "Merge two sorted linked lists and return the merged list.",
    example: "list1 = [1,2,4], list2 = [1,3,4]\nOutput: [1,1,2,3,4,4]",
    starter:
      "class Solution:\n    def mergeTwoLists(self, list1, list2):\n        pass",
  },
  {
    id: 5,
    title: "Maximum Subarray",
    difficulty: "Medium",
    topics: ["Arrays", "Dynamic Programming"],
    patterns: ["Kadane’s Algorithm", "Dynamic Programming"],
    acceptance: 44,
    description:
      "Find the contiguous subarray with the largest sum and return its sum.",
    example: "nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6",
    starter: "class Solution:\n    def maxSubArray(self, nums):\n        pass",
  },
  {
    id: 6,
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    topics: ["Trees", "BFS"],
    patterns: ["Breadth-First Search"],
    acceptance: 41,
    description:
      "Return the level order traversal of a binary tree’s node values.",
    example: "root = [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]",
    starter: "class Solution:\n    def levelOrder(self, root):\n        pass",
  },
  {
    id: 7,
    title: "Number of Islands",
    difficulty: "Medium",
    topics: ["Graphs", "Matrix"],
    patterns: ["DFS", "BFS"],
    acceptance: 36,
    description:
      "Count the number of islands in a grid of land and water cells.",
    example: 'grid = [["1","1","0"],["1","0","0"],["0","0","1"]]\nOutput: 2',
    starter: "class Solution:\n    def numIslands(self, grid):\n        pass",
  },
  {
    id: 8,
    title: "Coin Change",
    difficulty: "Hard",
    topics: ["Dynamic Programming"],
    patterns: ["Dynamic Programming", "Unbounded Knapsack"],
    acceptance: 31,
    description:
      "Return the fewest number of coins needed to make up a given amount, or -1 if impossible.",
    example: "coins = [1,2,5], amount = 11\nOutput: 3",
    starter:
      "class Solution:\n    def coinChange(self, coins, amount):\n        pass",
  },
];
const patternList = [
  "All patterns",
  "Hash Map",
  "Sliding Window",
  "Two Pointers",
  "Stack",
  "Binary Search",
  "Breadth-First Search",
  "DFS",
  "Dynamic Programming",
  "Backtracking",
  "Kadane’s Algorithm",
];
function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("codex_user"));
    } catch {
      return null;
    }
  });
  const logout = () => {
    localStorage.removeItem("codex_token");
    localStorage.removeItem("codex_user");
    setUser(null);
  };
  return { user, setUser, logout };
}
function App() {
  const { user, setUser, logout } = useAuth();
  const [mobile, setMobile] = useState(false),
    [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          main<span>( )</span>
        </Link>
        <nav className={mobile ? "nav open" : "nav"}>
          <Link to="/">Home</Link>
          <Link to="/compiler">Compiler</Link>
          <Link to="/problems">Problems</Link>
          <Link to="/learn">Learn</Link>
          <Link to="/about">About</Link>
          {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        </nav>
        <div className="top-actions">
          <button
            className="icon-btn"
            title="Toggle theme"
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          {user ? (
            <>
              <Link
                className="profile-chip"
                to={user.role === "admin" ? "/admin" : "/dashboard"}
              >
                {user.username || user.email?.split("@")[0]}
              </Link>
              <button className="btn btn-small" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-small btn-ghost" to="/login">
                Login
              </Link>
              <Link className="btn btn-small btn-yellow" to="/register">
                Sign up
              </Link>
            </>
          )}
          <button
            className="icon-btn mobile-menu"
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/compiler" element={<Compiler user={user} />} />
          <Route path="/problems" element={<Problems />} />
          <Route
            path="/problems/:id"
            element={<ProblemWorkspace user={user} />}
          />
          <Route path="/learn" element={<Learn />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/admin" element={<Admin user={user} />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Legal title="Privacy Policy" />} />
          <Route path="/terms" element={<Legal title="Terms of Service" />} />
          <Route
            path="/login"
            element={<Auth mode="login" setUser={setUser} />}
          />
          <Route
            path="/register"
            element={<Auth mode="register" setUser={setUser} />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
function AdSlot({ label = "SPONSOR SPACE" }) {
  return (
    <div className="ad-slot">
      <span>{label}</span>
      <small>Reserved for relevant, privacy-conscious partners</small>
    </div>
  );
}
function Home() {
  return (
    <>
      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" /> YOUR NEXT LINE STARTS HERE
          </div>
          <h1>
            CODE.
            <br />
            PRACTISE.
            <br />
            <mark>GROW.</mark>
          </h1>
          <p className="hero-text">
            A simple, powerful place to write code, practise patterns, and build
            real programming confidence.
          </p>
          <div className="hero-actions">
            <Link to="/compiler" className="btn btn-yellow btn-large">
              Start coding <ArrowRight size={18} />
            </Link>
            <Link to="/problems" className="btn btn-large btn-ghost">
              Explore problems
            </Link>
          </div>
          <div className="hero-tags">
            <span>NO SETUP</span>
            <span>6 LANGUAGES</span>
            <span>BUILT FOR LEARNING</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="art-label">// YOUR WORKSPACE</div>
          <div className="fake-window">
            <div className="window-top">
              <i />
              <i />
              <i />
              <span>main.py</span>
            </div>
            <pre>
              <b>01</b> <em>def</em> <strong>hello</strong>():
              <br />
              <b>02</b> message = <q>"Keep building."</q>
              <br />
              <b>03</b> <em>print</em>(message)
              <br />
              <b>04</b>
              <br />
              <b>05</b> hello()
              <br />
              <br />
              <label>▶ RUN SUCCESSFUL</label>
            </pre>
          </div>
          <div className="yellow-note">
            BUILD
            <br />
            RUN
            <br />
            LEARN
            <br />
            REPEAT ↗
          </div>
          <div className="art-bottom">LESS SCROLLING. MORE SOLVING.</div>
        </div>
        <div className="hero-stats">
          <Stat value="6" label="Programming languages" />
          <Stat value="PATTERN-FIRST" label="Problem discovery" />
          <Stat value="FREE TO START" label="No setup required" />
        </div>
      </section>
      <section className="wrap section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE TOOLKIT</span>
            <h2>
              Everything you need.
              <br />
              <u>Nothing in your way.</u>
            </h2>
          </div>
          <Link to="/features" className="text-link">
            Explore features <ArrowRight size={16} />
          </Link>
        </div>
        <div className="feature-grid">
          <Feature
            number="01"
            icon={<Terminal />}
            title="Code in your browser"
            text="Write, run, and debug in six languages. No local setup or downloads."
            link="/compiler"
            action="Open compiler"
          />
          <Feature
            number="02"
            icon={<Layers />}
            title="Practise by pattern"
            text="Find problems by technique—not by endless scrolling through a question bank."
            link="/problems"
            action="Find your pattern"
          />
          <Feature
            number="03"
            icon={<Target />}
            title="Build consistency"
            text="Track attempts and accepted solutions as your practice grows."
            link="/dashboard"
            action="View progress"
          />
        </div>
      </section>
      <section className="dark-band">
        <div className="wrap band-inner">
          <div>
            <span className="eyebrow">YOUR NEXT MOVE</span>
            <h2>
              One problem at a time.
              <br />
              <mark>Real progress.</mark>
            </h2>
          </div>
          <Link to="/problems" className="btn btn-yellow btn-large">
            Find a problem <ArrowRight />
          </Link>
        </div>
      </section>
      <section className="wrap section">
        <AdSlot />
        <div className="section-heading compact">
          <div>
            <span className="eyebrow">START SMALL. GET BETTER.</span>
            <h2>Popular practice</h2>
          </div>
          <Link to="/problems" className="text-link">
            All problems <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mini-problems">
          {seedProblems.slice(0, 4).map((p, i) => (
            <Link to={`/problems/${p.id}`} className="mini-problem" key={p.id}>
              <span className="problem-num">0{i + 1}</span>
              <div>
                <b>{p.title}</b>
                <small>{p.patterns.join(" · ")}</small>
              </div>
              <span className={`difficulty ${p.difficulty.toLowerCase()}`}>
                {p.difficulty}
              </span>
              <ChevronRight />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
function Stat({ value, label }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
function Feature({ number, icon, title, text, link, action }) {
  return (
    <article className="feature-card">
      <div className="feature-top">
        <span>{number} / 03</span>
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <Link to={link} className="text-link">
        {action} <ArrowRight size={16} />
      </Link>
    </article>
  );
}
function Compiler({ user }) {
  const [lang, setLang] = useState(LANGS[0]),
    [code, setCode] = useState(LANGS[0].code),
    [stdin, setStdin] = useState(LANGS[0].stdin),
    [result, setResult] = useState(null),
    [busy, setBusy] = useState(false);
  const [theme, setTheme] = useState("vs-dark");
  function changeLang(v) {
    const l = LANGS.find((x) => x.value === v) || LANGS[0];
    setLang(l);
    setCode(l.code);
    setStdin(l.stdin);
    setResult(null);
  }
  async function execute() {
    setBusy(true);
    setResult(null);
    try {
      const r = await http.post("/execute", {
        language: lang.value,
        source_code: code,
        stdin,
      });
      setResult(r.data);
      if (user)
        http
          .post("/events", {
            event_type: "code_run",
            metadata: { language: lang.value, status: r.data.status },
          })
          .catch(() => {});
    } catch (e) {
      setResult({
        status: "error",
        stderr:
          e.response?.data?.detail ||
          "Execution service is unavailable. Configure JUDGE0_API_URL and JUDGE0_API_KEY in the backend environment.",
        stdout: "",
        execution_time_ms: null,
      });
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="wrap page-space">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">PLAYGROUND / 001</span>
          <h1>
            Online <mark>compiler.</mark>
          </h1>
          <p>Write it. Run it. Learn from what happens.</p>
        </div>
        <span className="status-pill">
          <span className="live-dot" /> EXECUTION WORKSPACE
        </span>
      </div>
      <div className="compiler-shell">
        <aside className="language-rail">
          <b className="rail-label">LANGUAGES</b>
          {LANGS.map((l) => (
            <button
              key={l.value}
              onClick={() => changeLang(l.value)}
              className={
                lang.value === l.value
                  ? "language-item active"
                  : "language-item"
              }
            >
              <Code2 size={16} />
              {l.label}
            </button>
          ))}
          <div className="rail-note">
            TIP / 001
            <br />
            <small>Start with the example, then make it yours.</small>
          </div>
        </aside>
        <section className="editor-area">
          <div className="editor-toolbar">
            <span className="file-tab">
              <Code2 size={14} />
              {lang.ext}
            </span>
            <div className="toolbar-actions">
              <button
                className="btn btn-ghost btn-small"
                onClick={() =>
                  setTheme(theme === "vs-dark" ? "light" : "vs-dark")
                }
              >
                {theme === "vs-dark" ? "Light" : "Dark"} theme
              </button>
              <button
                className="btn btn-ghost btn-small"
                onClick={() => {
                  setCode(lang.code);
                  setResult(null);
                }}
              >
                Reset
              </button>
              <button
                className="btn btn-yellow btn-small"
                onClick={execute}
                disabled={busy}
              >
                {busy ? (
                  "Running…"
                ) : (
                  <>
                    <Play size={14} fill="currentColor" /> Run code
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="monaco-wrap">
            <Editor
              height="410px"
              language={
                lang.value === "csharp"
                  ? "csharp"
                  : lang.value === "cpp"
                    ? "cpp"
                    : lang.value
              }
              value={code}
              onChange={(v) => setCode(v || "")}
              theme={theme}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 18 },
                fontFamily: "JetBrains Mono, monospace",
                wordWrap: "on",
                tabSize: 4,
              }}
            />
          </div>
          <div className="console-grid">
            <div className="console-panel">
              <div className="console-head">
                CUSTOM INPUT <span>STDIN</span>
              </div>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter input for your program…"
              />
            </div>
            <div className="console-panel">
              <div className="console-head">
                OUTPUT{" "}
                {result && (
                  <span
                    className={
                      result.status === "success" ? "good-text" : "bad-text"
                    }
                  >
                    {result.status?.toUpperCase()}
                  </span>
                )}
              </div>
              <pre className="output-text">
                {result
                  ? result.stdout ||
                    result.stderr ||
                    result.message ||
                    "Program finished without output"
                  : "Your output will appear here after you run the code."}
                {result?.execution_time_ms != null && (
                  <small>
                    \n\nExecution time: {result.execution_time_ms} ms
                  </small>
                )}
              </pre>
            </div>
          </div>
          <div className="workspace-foot">
            <span>
              <Shield size={14} /> Isolated execution service
            </span>
            <span>Save your progress by signing in</span>
          </div>
        </section>
      </div>
      <p className="subtle-note">
        Never run code you don't trust locally. main( ) sends code to its
        configured execution provider to run in an isolated environment.
      </p>
    </div>
  );
}
function Problems() {
  const [problems, setProblems] = useState(seedProblems),
    [q, setQ] = useState(""),
    [difficulty, setDifficulty] = useState("All"),
    [pattern, setPattern] = useState("All patterns"),
    [topic, setTopic] = useState("All topics");
  useEffect(() => {
    http
      .get("/problems")
      .then((r) => {
        if (r.data?.length)
          setProblems(
            r.data.map((p) => ({
              ...p,
              patterns: p.patterns || [],
              topics: p.topics || [],
            })),
          );
      })
      .catch(() => {});
  }, []);
  const topics = [...new Set(problems.flatMap((p) => p.topics || []))].sort();
  const filtered = problems.filter(
    (p) =>
      (
        p.title +
        " " +
        (p.topics || []).join(" ") +
        " " +
        (p.patterns || []).join(" ")
      )
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (difficulty === "All" || p.difficulty === difficulty) &&
      (pattern === "All patterns" || (p.patterns || []).includes(pattern)) &&
      (topic === "All topics" || (p.topics || []).includes(topic)),
  );
  return (
    <div className="wrap page-space">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">THE PROBLEM LIBRARY</span>
          <h1>
            Find your <mark>pattern.</mark>
          </h1>
          <p>Practise the technique behind the problem.</p>
        </div>
        <span className="counter-box">
          {filtered.length.toString().padStart(2, "0")} <small>PROBLEMS</small>
        </span>
      </div>
      <div className="filter-bar">
        <label className="search-box">
          <Search size={17} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search problems or concepts…"
          />
        </label>
        <select value={pattern} onChange={(e) => setPattern(e.target.value)}>
          {patternList.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option>All topics</option>
          {topics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          {["All", "Easy", "Medium", "Hard"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <div className="pattern-chips">
        <span>QUICK PATTERNS</span>
        {patternList.slice(1, 7).map((p) => (
          <button
            className={pattern === p ? "chip selected" : "chip"}
            onClick={() => setPattern(pattern === p ? "All patterns" : p)}
            key={p}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="problem-table">
        <div className="table-head">
          <span>#</span>
          <span>PROBLEM</span>
          <span>PATTERNS</span>
          <span>LEVEL</span>
          <span />
        </div>
        {filtered.map((p, i) => (
          <Link to={`/problems/${p.id}`} className="problem-row" key={p.id}>
            <span className="problem-num">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="problem-name">
              <b>{p.title}</b>
              <small>{(p.topics || []).join(" · ")}</small>
            </div>
            <div className="tag-list">
              {(p.patterns || []).slice(0, 2).map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
            <span className={`difficulty ${p.difficulty.toLowerCase()}`}>
              {p.difficulty}
            </span>
            <ChevronRight size={18} />
          </Link>
        ))}
        {!filtered.length && (
          <div className="empty-state">
            <Search size={26} />
            <b>No matching problems yet.</b>
            <span>Try a different search or pattern.</span>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setQ("");
                setPattern("All patterns");
                setTopic("All topics");
                setDifficulty("All");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
      <AdSlot label="LEARNING RESOURCES" />
    </div>
  );
}
function ProblemWorkspace({ user }) {
  const { id } = useParams(),
    navigate = useNavigate(),
    p = seedProblems.find((x) => x.id === Number(id));
  const [lang, setLang] = useState(LANGS[0]),
    [code, setCode] = useState(p?.starter || LANGS[0].code),
    [output, setOutput] = useState("Run your code to see the output."),
    [status, setStatus] = useState("Ready");
  if (!p) return <NotFound />;
  async function run(submit = false) {
    setStatus("Running");
    try {
      const r = await http.post(
        submit ? "/submissions" : "/execute",
        submit
          ? {
              problem_id: p.id,
              language: lang.value,
              source_code: code,
              stdin: "",
            }
          : { language: lang.value, source_code: code, stdin: "" },
      );
      setOutput(
        r.data.stdout ||
          r.data.stderr ||
          r.data.verdict ||
          JSON.stringify(r.data),
      );
      setStatus(r.data.verdict || r.data.status || "Complete");
    } catch (e) {
      setOutput(
        e.response?.data?.detail || "Could not reach the execution service.",
      );
      setStatus("Service unavailable");
    }
  }
  return (
    <div className="wrap page-space">
      <button className="back-link" onClick={() => navigate("/problems")}>
        ← Back to problems
      </button>
      <div className="problem-work-layout">
        <section className="problem-description">
          <span className={`difficulty ${p.difficulty.toLowerCase()}`}>
            {p.difficulty}
          </span>
          <h1>{p.title}</h1>
          <div className="tag-list">
            {p.topics.map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
            {p.patterns.map((t) => (
              <span className="tag yellow-tag" key={t}>
                {t}
              </span>
            ))}
          </div>
          <h3>Problem</h3>
          <p>{p.description}</p>
          <h3>Example</h3>
          <pre className="example-block">{p.example}</pre>
          <h3>Think in patterns</h3>
          <p className="subtle-note">
            Identify the invariant or data structure that helps solve this
            problem efficiently. Try a straightforward approach before
            optimising.
          </p>
        </section>
        <section className="problem-editor">
          <div className="editor-toolbar">
            <select
              value={lang.value}
              onChange={(e) => {
                const l = LANGS.find((x) => x.value === e.target.value);
                setLang(l);
                setCode(l.code);
              }}
            >
              {LANGS.map((l) => (
                <option value={l.value} key={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            <div className="toolbar-actions">
              <button
                className="btn btn-ghost btn-small"
                onClick={() => setCode(p.starter)}
              >
                Reset
              </button>
              <button
                className="btn btn-ghost btn-small"
                onClick={() => run(false)}
              >
                <Play size={14} /> Run
              </button>
              <button
                className="btn btn-yellow btn-small"
                onClick={() => run(true)}
              >
                <Send size={14} /> Submit
              </button>
            </div>
          </div>
          <Editor
            height="430px"
            language={lang.value === "cpp" ? "cpp" : lang.value}
            value={code}
            onChange={(v) => setCode(v || "")}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
              padding: { top: 16 },
            }}
          />
          <div className="console-panel result-panel">
            <div className="console-head">
              RESULT <span>{status}</span>
            </div>
            <pre className="output-text">{output}</pre>
          </div>
          {!user && (
            <p className="subtle-note">
              Sign in to keep a record of your submissions.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
function Learn() {
  const paths = [
    [
      "01",
      "Arrays & Hashing",
      "Build intuition for lookup, counting, and frequency maps.",
      "Hash Map",
    ],
    [
      "02",
      "Two Pointers",
      "Learn when moving two indices can eliminate work.",
      "Two Pointers",
    ],
    [
      "03",
      "Sliding Window",
      "Turn repeated substring and subarray work into a linear pass.",
      "Sliding Window",
    ],
    [
      "04",
      "Stacks & Queues",
      "Manage order, matching, and monotonic relationships.",
      "Stack",
    ],
    [
      "05",
      "Trees & Graphs",
      "Explore traversal, search, and connected structures.",
      "Breadth-First Search",
    ],
    [
      "06",
      "Dynamic Programming",
      "Break problems into overlapping subproblems.",
      "Dynamic Programming",
    ],
  ];
  return (
    <div className="wrap page-space">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">LEARNING PATHS / IN PROGRESS</span>
          <h1>
            Learn the <mark>pattern.</mark>
          </h1>
          <p>
            Short, focused routes through the ideas behind common coding
            problems.
          </p>
        </div>
      </div>
      <div className="path-grid">
        {paths.map(([n, t, d, p]) => (
          <Link
            to={`/problems`}
            key={n}
            onClick={() => sessionStorage.setItem("codex-pattern", p)}
            className="path-card"
          >
            <span className="path-number">{n}</span>
            <div>
              <h3>{t}</h3>
              <p>{d}</p>
              <span className="text-link">
                Explore problems <ArrowRight size={15} />
              </span>
            </div>
            <ChevronRight />
          </Link>
        ))}
      </div>
      <div className="callout">
        <b>Future update</b>
        <p>
          Career-specific and company-specific preparation paths will build on
          the same problem classification system.
        </p>
      </div>
    </div>
  );
}
function Dashboard({ user }) {
  const [subs, setSubs] = useState([]);
  useEffect(() => {
    if (user)
      http
        .get("/submissions")
        .then((r) => setSubs(r.data || []))
        .catch(() => {});
  }, [user]);
  const accepted = subs.filter(
    (s) => s.verdict === "Accepted" || s.status === "success",
  ).length;
  return (
    <div className="wrap page-space">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">YOUR SPACE / DASHBOARD</span>
          <h1>
            {user
              ? `Welcome back, ${user.username || "coder"}.`
              : "Your progress, in one place."}
          </h1>
          <p>Every attempt is practice. Keep going.</p>
        </div>
        {!user && (
          <Link to="/login" className="btn btn-yellow">
            Sign in to sync <ArrowRight size={16} />
          </Link>
        )}
      </div>
      <div className="metric-grid">
        <Metric
          icon={<CheckCircle2 />}
          label="Accepted submissions"
          value={user ? accepted : "—"}
          note="Based on recorded submissions"
        />
        <Metric
          icon={<Code2 />}
          label="Total submissions"
          value={user ? subs.length : "—"}
          note="Your attempts, all together"
        />
        <Metric
          icon={<Target />}
          label="Patterns explored"
          value="6+"
          note="Start with one you find tricky"
        />
        <Metric
          icon={<Activity />}
          label="Consistency"
          value="Keep going"
          note="Small sessions add up"
        />
      </div>
      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-title">
            <h3>Recent submissions</h3>
            <History size={18} />
          </div>
          {!user ? (
            <div className="empty-state">
              <p>Sign in to see your saved activity.</p>
              <Link to="/login" className="btn btn-ghost">
                Login
              </Link>
            </div>
          ) : subs.length === 0 ? (
            <div className="empty-state">
              <Code2 />
              <b>Your first submission starts here.</b>
              <Link to="/problems" className="text-link">
                Browse problems <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            subs.slice(0, 8).map((s, i) => (
              <div className="activity-row" key={s.id || i}>
                <span className="activity-icon">
                  <Code2 size={15} />
                </span>
                <div>
                  <b>{s.problem_title || `Code run · ${s.language}`}</b>
                  <small>
                    {s.language} ·{" "}
                    {new Date(s.created_at || Date.now()).toLocaleString()}
                  </small>
                </div>
                <span className="tag">{s.verdict || s.status}</span>
              </div>
            ))
          )}
        </div>
        <div className="panel">
          <div className="panel-title">
            <h3>Suggested next steps</h3>
            <Target size={18} />
          </div>
          {[
            [
              "Choose one pattern",
              "Focus on one technique at a time.",
              "/learn",
            ],
            [
              "Solve a small problem",
              "Build momentum with an Easy challenge.",
              "/problems",
            ],
            [
              "Try another language",
              "Compare how different languages express the same idea.",
              "/compiler",
            ],
          ].map(([a, b, c]) => (
            <Link className="next-step" to={c} key={a}>
              <span>
                <b>{a}</b>
                <small>{b}</small>
              </span>
              <ArrowRight size={17} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
function Metric({ icon, label, value, note }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
function Admin({ user }) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [period, setPeriod] = useState("30");
  useEffect(() => {
    if (!user || user.role !== "admin") {
      setError(
        "Admin access is restricted. Sign in with an administrator account.",
      );
      return;
    }
    http
      .get(`/admin/analytics?days=${period}`)
      .then((r) => setData(r.data))
      .catch((e) =>
        setError(e.response?.data?.detail || "Could not load analytics."),
      );
  }, [user, period]);
  const activity = data?.daily_activity || [],
    langs = data?.language_usage || [],
    outcomes = data?.outcomes || [];
  if (!user || user.role !== "admin")
    return (
      <div className="wrap page-space">
        <div className="restricted">
          <Shield size={40} />
          <h1>
            Admin <mark>access only.</mark>
          </h1>
          <p>{error || "Sign in with an administrator account to continue."}</p>
          <Link to="/login" className="btn btn-yellow">
            Sign in
          </Link>
        </div>
      </div>
    );
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link className="brand" to="/">
          main<span>( )</span>
        </Link>
        <span className="eyebrow">CONTROL ROOM</span>
        {[
          ["Overview", ChartNoAxesCombined],
          ["Users", Users],
          ["Problems", BookOpen],
          ["Executions", Terminal],
          ["Ads & plugins", Plug],
          ["System health", Activity],
        ].map(([t, I]) => (
          <a
            href={`#${t.toLowerCase().replaceAll(" ", "-").replace("&-", "")}`}
            key={t}
            className={t === "Overview" ? "admin-nav active" : "admin-nav"}
          >
            <I size={17} />
            {t}
          </a>
        ))}
        <div className="admin-side-foot">
          <Shield size={16} /> ADMINISTRATOR
          <br />
          <small>Private workspace</small>
        </div>
      </aside>
      <section className="admin-content">
        <div className="admin-header">
          <div>
            <span className="eyebrow">PLATFORM INSIGHTS</span>
            <h1>
              Overview<span className="yellow-period">.</span>
            </h1>
          </div>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
        {error && <div className="notice">{error}</div>}
        {!data ? (
          <div className="loading-box">Loading real platform data…</div>
        ) : (
          <>
            <div className="admin-metrics">
              <AdminMetric label="TOTAL USERS" value={data.total_users} />
              <AdminMetric
                label="CODE EXECUTIONS"
                value={data.total_executions}
              />
              <AdminMetric label="SUBMISSIONS" value={data.total_submissions} />
              <AdminMetric label="ACCEPTED" value={data.accepted_submissions} />
            </div>
            <div className="admin-charts">
              <ChartCard title="User & execution activity" id="analytics">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={activity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="users"
                      name="New users"
                      stroke="#c9a900"
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="executions"
                      name="Executions"
                      stroke="#171717"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Language popularity">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={langs}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                    <XAxis dataKey="language" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f5d900" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Execution outcomes">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={outcomes}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={82}
                      label
                    >
                      {outcomes.map((x, i) => (
                        <Cell
                          key={x.status}
                          fill={
                            ["#f5d900", "#242424", "#8b8b8b", "#e67e22"][i % 4]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
              <div className="chart-card" id="users">
                <div className="panel-title">
                  <h3>Recent user activity</h3>
                  <Users size={18} />
                </div>
                {(data.recent_activity || []).length ? (
                  data.recent_activity.map((a, i) => (
                    <div className="activity-row" key={i}>
                      <span className="activity-icon">
                        <Activity size={15} />
                      </span>
                      <div>
                        <b>{a.event_type || a.type || "Activity"}</b>
                        <small>
                          {a.username || "Guest"} ·{" "}
                          {new Date(a.created_at).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <b>No activity recorded yet.</b>
                    <small>
                      Real events will appear here as people use main( ).
                    </small>
                  </div>
                )}
              </div>
            </div>
            <div className="admin-bottom-grid">
              <div className="panel" id="problems">
                <div className="panel-title">
                  <h3>Problem library</h3>
                  <Link to="/problems" className="text-link">
                    View <ArrowRight size={14} />
                  </Link>
                </div>
                <p className="subtle-note">
                  Manage classifications and curated problem content through the
                  backend admin API. Pattern, career, and company metadata are
                  supported by the planned data model.
                </p>
              </div>
              <div className="panel" id="ads-plugins">
                <div className="panel-title">
                  <h3>Ads & plugins</h3>
                  <Plug size={18} />
                </div>
                <div className="plugin-row">
                  <span>
                    <b>Google AdSense</b>
                    <small>Provider integration · configuration required</small>
                  </span>
                  <span className="tag">Not configured</span>
                </div>
                <div className="plugin-row">
                  <span>
                    <b>Cuelinks</b>
                    <small>
                      Affiliate integration · configuration required
                    </small>
                  </span>
                  <span className="tag">Not configured</span>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
function AdminMetric({ label, value }) {
  return (
    <div className="admin-metric">
      <span>{label}</span>
      <strong>{Number(value || 0).toLocaleString()}</strong>
      <small>Recorded platform data</small>
    </div>
  );
}
function ChartCard({ title, children, id }) {
  return (
    <div className="chart-card" id={id}>
      <div className="panel-title">
        <h3>{title}</h3>
        <span className="chart-mark">↗</span>
      </div>
      {children}
    </div>
  );
}
function About() {
  return (
    <StaticPage
      eyebrow="WHY main( )"
      title={
        <>
          A place to <mark>get better.</mark>
        </>
      }
      intro="main( ) is a straightforward coding workspace for people learning to program and people practising for what comes next."
    >
      <div className="about-cards">
        <div>
          <Code2 />
          <h3>Accessible</h3>
          <p>Open the editor and start writing. Less setup, more learning.</p>
        </div>
        <div>
          <Layers />
          <h3>Pattern-first</h3>
          <p>
            Discover problems by the underlying technique, not just a long list.
          </p>
        </div>
        <div>
          <Shield />
          <h3>Built thoughtfully</h3>
          <p>
            Secure execution, clear feedback, and an interface designed for
            focus.
          </p>
        </div>
      </div>
      <p className="subtle-note">
        main( ) is an independent learning platform and is not affiliated with
        any company whose interview preparation may be represented in future
        learning tracks.
      </p>
    </StaticPage>
  );
}
function Features() {
  return (
    <StaticPage
      eyebrow="WHAT YOU CAN DO"
      title={
        <>
          Tools that stay <mark>out of your way.</mark>
        </>
      }
      intro="A focused toolkit for writing code, learning techniques, and measuring progress."
    >
      <div className="feature-grid">
        <Feature
          number="01"
          icon={<Terminal />}
          title="Browser compiler"
          text="Run C, C++, Java, Python, JavaScript, and C# using an isolated execution provider."
          link="/compiler"
          action="Try the compiler"
        />
        <Feature
          number="02"
          icon={<Layers />}
          title="Pattern discovery"
          text="Filter a growing library by problem topic, difficulty, and solving pattern."
          link="/problems"
          action="Browse problems"
        />
        <Feature
          number="03"
          icon={<ChartNoAxesCombined />}
          title="Activity insights"
          text="Signed-in users can review recorded submissions; administrators can inspect aggregate platform metrics."
          link="/dashboard"
          action="Your dashboard"
        />
      </div>
    </StaticPage>
  );
}
function FAQ() {
  const items = [
    [
      "Do I need to install anything?",
      "No local compiler is needed for the browser workspace. Code execution requires the platform’s configured execution service.",
    ],
    [
      "Which languages are supported?",
      "C, C++, Java, Python, JavaScript, and C# are planned and exposed in the workspace. Actual availability depends on the configured Judge0 instance and its language versions.",
    ],
    [
      "Can I use main( ) without an account?",
      "Basic compiler access is designed to be available to guests. Accounts are needed for persistent personal history and dashboard features.",
    ],
    [
      "How are problems organised?",
      "Problems can be filtered by topic, difficulty, and patterns. Guided career and company tracks are planned future extensions.",
    ],
    [
      "Is submitted code private?",
      "Code is sent to the configured execution provider to run. Do not submit secrets or sensitive information. Review the deployment privacy policy for the provider configuration.",
    ],
  ];
  return (
    <StaticPage
      eyebrow="HELP DESK"
      title={
        <>
          Good questions.
          <br />
          <mark>Clear answers.</mark>
        </>
      }
      intro="A few things to know before you get started."
    >
      <div className="faq-list">
        {items.map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <span>+</span>
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
      <p>
        Still stuck?{" "}
        <Link className="text-link" to="/contact">
          Send feedback <ArrowRight size={15} />
        </Link>
      </p>
    </StaticPage>
  );
}
function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" }),
    [sent, setSent] = useState(false);
  async function submit(e) {
    e.preventDefault();
    try {
      await http.post("/feedback", form);
      setSent(true);
    } catch {
      const old = JSON.parse(localStorage.getItem("codex_feedback") || "[]");
      old.push({ ...form, created_at: new Date().toISOString() });
      localStorage.setItem("codex_feedback", JSON.stringify(old));
      setSent(true);
    }
  }
  return (
    <StaticPage
      eyebrow="CONTACT / FEEDBACK"
      title={
        <>
          Let's make it <mark>better.</mark>
        </>
      }
      intro="Found a bug, have an idea, or want to tell us what would help you learn? Send a note."
    >
      <form className="form-card contact-form" onSubmit={submit}>
        {sent ? (
          <div className="success-message">
            <CheckCircle2 size={30} />
            <h3>Thanks for the feedback.</h3>
            <p>
              Your message has been recorded where the service is available.
            </p>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setSent(false);
                setForm({ name: "", email: "", message: "" });
              }}
            >
              Send another
            </button>
          </div>
        ) : (
          <>
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
              />
            </label>
            <label>
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Message
              <textarea
                required
                minLength={8}
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us what's on your mind…"
              />
            </label>
            <button className="btn btn-yellow btn-large">
              Send feedback <ArrowRight size={17} />
            </button>
          </>
        )}
      </form>
    </StaticPage>
  );
}
function Legal({ title }) {
  return (
    <StaticPage
      eyebrow="POLICIES"
      title={
        <>
          {title}
          <mark>.</mark>
        </>
      }
      intro="This page is a starter policy document and must be reviewed and adapted before public launch."
    >
      <div className="legal-copy">
        <h3>Information and use</h3>
        <p>
          main( ) processes account information, submitted source code,
          execution metadata, and feedback to provide the service. Do not submit
          passwords, secrets, or sensitive personal information as code or
          input.
        </p>
        <h3>Third-party services</h3>
        <p>
          Code may be transmitted to a configured code execution provider.
          Future analytics, advertising, or affiliate integrations may involve
          third-party providers and should be disclosed here before activation.
        </p>
        <h3>Security and retention</h3>
        <p>
          Reasonable safeguards should protect account and submission data.
          Retention, deletion, cookie consent, contact details, and
          jurisdiction-specific disclosures must be finalised by the platform
          operator before production launch.
        </p>
        <h3>Contact</h3>
        <p>
          Use the Contact page for questions or data-related requests. Replace
          this placeholder policy with reviewed terms appropriate to your
          deployment and applicable law.
        </p>
      </div>
    </StaticPage>
  );
}
function StaticPage({ eyebrow, title, intro, children }) {
  return (
    <div className="wrap page-space static-page">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p className="static-intro">{intro}</p>
      <div className="static-body">{children}</div>
    </div>
  );
}
function Auth({ mode, setUser }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    nav = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await http.post(
        mode === "login" ? "/auth/login" : "/auth/register",
        mode === "login"
          ? { email: form.email, password: form.password }
          : form,
      );
      localStorage.setItem("codex_token", r.data.access_token);
      localStorage.setItem("codex_user", JSON.stringify(r.data.user));
      setUser(r.data.user);
      nav(r.data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (e) {
      setError(
        e.response?.data?.detail ||
          "Could not connect to the backend. Start the API and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <Link to="/" className="brand centered">
          main<span>( )</span>
        </Link>
        <span className="eyebrow">YOUR NEXT CHAPTER</span>
        <h1>{mode === "login" ? "Welcome back." : "Create your account."}</h1>
        <p>
          {mode === "login"
            ? "Pick up where you left off."
            : "Start building your coding practice."}
        </p>
        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              Username
              <input
                required
                minLength={3}
                maxLength={40}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Choose a username"
              />
            </label>
          )}
          <label>
            Email address
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              required
              minLength={8}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 8 characters"
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <button
            disabled={busy}
            className="btn btn-yellow btn-large full-width"
          >
            {busy
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}{" "}
            <ArrowRight size={16} />
          </button>
        </form>
        <div className="auth-switch">
          {mode === "login" ? (
            <>
              New to main( )? <Link to="/register">Create an account</Link>
            </>
          ) : (
            <>
              Already have an account? <Link to="/login">Sign in</Link>
            </>
          )}
        </div>
        <small className="fine-print">
          By continuing, you agree to use the platform responsibly.
        </small>
      </div>
    </div>
  );
}
function NotFound() {
  return (
    <div className="wrap page-space not-found">
      <span className="eyebrow">ERROR / 404</span>
      <h1>
        Lost in the <mark>code?</mark>
      </h1>
      <p>This page doesn't exist—or it moved.</p>
      <Link to="/" className="btn btn-yellow">
        Back to home <ArrowRight size={16} />
      </Link>
    </div>
  );
}
function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-main">
        <div>
          <Link to="/" className="brand">
            main<span>( )</span>
          </Link>
          <p>Code. Practise. Grow.</p>
          <small>Built for the next line you write.</small>
        </div>
        <div>
          <b>EXPLORE</b>
          <Link to="/compiler">Compiler</Link>
          <Link to="/problems">Problems</Link>
          <Link to="/learn">Learn</Link>
        </div>
        <div>
          <b>main( )</b>
          <Link to="/about">About</Link>
          <Link to="/features">Features</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/faq">FAQ</Link>
        </div>
        <div>
          <b>POLICIES</b>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} main( ). Keep building.</span>
        <span>MADE FOR LEARNERS ↗</span>
      </div>
    </footer>
  );
}
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
