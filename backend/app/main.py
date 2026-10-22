import os, json, secrets, datetime, time
from dotenv import load_dotenv

load_dotenv()
from typing import Optional, Any
import httpx
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    func,
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship
from jose import jwt, JWTError
from passlib.context import CryptContext

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./codex.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
SECRET = os.getenv("JWT_SECRET", "local-development-secret-change-before-deploy")
ALGORITHM = "HS256"
EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(40), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)


class Problem(Base):
    __tablename__ = "problems"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String(20), default="Easy")
    topics_json = Column(Text, default="[]")
    patterns_json = Column(Text, default="[]")
    career_tracks_json = Column(Text, default="[]")
    company_tags_json = Column(Text, default="[]")
    prerequisites_json = Column(Text, default="[]")
    example = Column(Text, default="")
    starter_code = Column(Text, default="")
    published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class TestCase(Base):
    __tablename__ = "test_cases"
    id = Column(Integer, primary_key=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), index=True, nullable=False)
    input_data = Column(Text, default="")
    expected_output = Column(Text, nullable=False)
    is_sample = Column(Boolean, default=True)


class Submission(Base):
    __tablename__ = "submissions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), index=True, nullable=True)
    language = Column(String(30), nullable=False)
    source_code = Column(Text, nullable=False)
    verdict = Column(String(50), default="Queued")
    stdout = Column(Text, default="")
    stderr = Column(Text, default="")
    execution_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    user = relationship("User")
    problem = relationship("Problem")


class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    event_type = Column(String(60), nullable=False, index=True)
    metadata_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    user = relationship("User")


class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def json_list(value):
    try:
        return json.loads(value or "[]")
    except:
        return []


def user_public(u):
    return {
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "role": u.role,
        "created_at": u.created_at.isoformat() + "Z",
    }


def create_token(u):
    return jwt.encode(
        {
            "sub": str(u.id),
            "exp": datetime.datetime.utcnow()
            + datetime.timedelta(minutes=EXPIRE_MINUTES),
        },
        SECRET,
        algorithm=ALGORITHM,
    )


def get_current_user(
    token: Optional[str] = Depends(oauth2), db: Session = Depends(get_db)
):
    if not token:
        return None
    try:
        uid = int(jwt.decode(token, SECRET, algorithms=[ALGORITHM]).get("sub"))
    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    u = db.query(User).filter(User.id == uid, User.is_active == True).first()
    if not u:
        raise HTTPException(status_code=401, detail="Account unavailable")
    return u


def require_user(u=Depends(get_current_user)):
    if not u:
        raise HTTPException(status_code=401, detail="Sign in to continue")
    return u


def require_admin(u=Depends(require_user)):
    if u.role != "admin":
        raise HTTPException(status_code=403, detail="Administrator access required")
    return u


def log_event(db, user, event, metadata=None):
    db.add(
        Activity(
            user_id=user.id if user else None,
            event_type=event,
            metadata_json=json.dumps(metadata or {})[:3000],
        )
    )
    db.commit()


SEEDS = [
    (
        1,
        "Two Sum",
        "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.",
        "Easy",
        ["Arrays", "Hashing"],
        ["Hash Map"],
        "nums = [2,7,11,15], target = 9\nOutput: [0,1]",
        "class Solution:\n    def twoSum(self, nums, target):\n        pass",
    ),
    (
        2,
        "Valid Parentheses",
        "Given a string s containing brackets, determine whether the input string is valid.",
        "Easy",
        ["Strings", "Stack"],
        ["Stack", "Matching"],
        's = "()[]{}"\nOutput: true',
        "class Solution:\n    def isValid(self, s):\n        pass",
    ),
    (
        3,
        "Longest Substring Without Repeating Characters",
        "Find the length of the longest substring without repeating characters.",
        "Medium",
        ["Strings", "Hashing"],
        ["Sliding Window", "Frequency Tracking"],
        's = "abcabcbb"\nOutput: 3',
        "class Solution:\n    def lengthOfLongestSubstring(self, s):\n        pass",
    ),
    (
        4,
        "Merge Two Sorted Lists",
        "Merge two sorted linked lists and return the merged list.",
        "Easy",
        ["Linked List"],
        ["Two Pointers"],
        "list1 = [1,2,4], list2 = [1,3,4]\nOutput: [1,1,2,3,4,4]",
        "class Solution:\n    def mergeTwoLists(self, list1, list2):\n        pass",
    ),
    (
        5,
        "Maximum Subarray",
        "Find the contiguous subarray with the largest sum and return its sum.",
        "Medium",
        ["Arrays", "Dynamic Programming"],
        ["Kadane’s Algorithm", "Dynamic Programming"],
        "nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6",
        "class Solution:\n    def maxSubArray(self, nums):\n        pass",
    ),
    (
        6,
        "Binary Tree Level Order Traversal",
        "Return the level order traversal of a binary tree’s node values.",
        "Medium",
        ["Trees", "BFS"],
        ["Breadth-First Search"],
        "root = [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]",
        "class Solution:\n    def levelOrder(self, root):\n        pass",
    ),
    (
        7,
        "Number of Islands",
        "Count the number of islands in a grid of land and water cells.",
        "Medium",
        ["Graphs", "Matrix"],
        ["DFS", "Breadth-First Search"],
        'grid = [["1","1","0"],["1","0","0"],["0","0","1"]]\nOutput: 2',
        "class Solution:\n    def numIslands(self, grid):\n        pass",
    ),
    (
        8,
        "Coin Change",
        "Return the fewest number of coins needed to make up a given amount, or -1 if impossible.",
        "Hard",
        ["Dynamic Programming"],
        ["Dynamic Programming", "Unbounded Knapsack"],
        "coins = [1,2,5], amount = 11\nOutput: 3",
        "class Solution:\n    def coinChange(self, coins, amount):\n        pass",
    ),
]


def seed_database():
    db = SessionLocal()
    try:
        for row in SEEDS:
            p = db.query(Problem).filter(Problem.id == row[0]).first()
            if not p:
                p = Problem(
                    id=row[0],
                    title=row[1],
                    description=row[2],
                    difficulty=row[3],
                    topics_json=json.dumps(row[4]),
                    patterns_json=json.dumps(row[5]),
                    example=row[6],
                    starter_code=row[7],
                )
                db.add(p)
        admin_email = os.getenv("ADMIN_EMAIL", "").strip().lower()
        admin_password = os.getenv("ADMIN_PASSWORD", "")
        if (
            admin_email
            and admin_password
            and len(admin_password) >= 12
            and not db.query(User).filter(User.email == admin_email).first()
        ):
            db.add(
                User(
                    username="admin",
                    email=admin_email,
                    password_hash=pwd_context.hash(admin_password),
                    role="admin",
                )
            )
        db.commit()
    finally:
        db.close()


seed_database()
app = FastAPI(
    title="main( ) API",
    version="1.0.0",
    description="main( ) online coding and practice platform API",
)
origins = [
    x.strip()
    for x in os.getenv(
        "FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if x.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


class RegisterIn(BaseModel):
    username: str = Field(min_length=3, max_length=40, pattern=r"^[A-Za-z0-9_.-]+$")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ExecuteIn(BaseModel):
    language: str
    source_code: str = Field(min_length=1, max_length=50000)
    stdin: str = Field(default="", max_length=20000)


class SubmitIn(ExecuteIn):
    problem_id: int


class EventIn(BaseModel):
    event_type: str = Field(min_length=2, max_length=60)
    metadata: dict[str, Any] = {}


class FeedbackIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(min_length=8, max_length=5000)


class ProblemIn(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10)
    difficulty: str = "Easy"
    topics: list[str] = []
    patterns: list[str] = []
    career_tracks: list[str] = []
    company_tags: list[str] = []
    prerequisites: list[str] = []
    example: str = ""
    starter_code: str = ""
    published: bool = True


LANGUAGE_IDS = {
    "c": 50,
    "cpp": 54,
    "java": 62,
    "python": 71,
    "javascript": 63,
    "csharp": 51,
}
LANGUAGE_NAMES = {
    "c": "C",
    "cpp": "C++",
    "java": "Java",
    "python": "Python",
    "javascript": "JavaScript",
    "csharp": "C#",
}


def safe_text(v):
    return (v or "")[:20000]


async def execute_with_judge0(payload: ExecuteIn):
    lang = payload.language.lower()
    if lang not in LANGUAGE_IDS:
        raise HTTPException(status_code=422, detail="Unsupported language")
    if not payload.source_code.strip():
        raise HTTPException(status_code=422, detail="Source code cannot be empty")
    base = os.getenv("JUDGE0_API_URL", "https://ce.judge0.com").rstrip("/")
    headers = {"Content-Type": "application/json"}
    key = os.getenv("JUDGE0_API_KEY", "").strip()
    if key:
        headers["X-Auth-Token"] = key
    body = {
        "language_id": LANGUAGE_IDS[lang],
        "source_code": payload.source_code,
        "stdin": payload.stdin,
        "cpu_time_limit": 3.0,
        "cpu_extra_time": 1.0,
        "wall_time_limit": 8.0,
        "memory_limit": 128000,
        "max_file_size": 1000,
        "max_processes_and_or_threads": 30,
        "enable_network": False,
    }
    timeout = float(os.getenv("JUDGE0_TIMEOUT_SECONDS", "15"))
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.post(
                base + "/submissions?base64_encoded=false&wait=true",
                headers=headers,
                json=body,
            )
            if r.status_code == 401 or r.status_code == 403:
                raise HTTPException(
                    status_code=502,
                    detail="Execution provider rejected its credentials. Check the server-side Judge0 configuration.",
                )
            r.raise_for_status()
            data = r.json()
    except HTTPException:
        raise
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Execution timed out while waiting for the code runner. Try again.",
        )
    except (httpx.HTTPError, ValueError):
        raise HTTPException(
            status_code=503,
            detail="Code execution service is temporarily unavailable. Please try again shortly.",
        )
    status_name = (data.get("status") or {}).get("description", "Unknown")
    status_id = (data.get("status") or {}).get("id", 0)
    stdout = safe_text(data.get("stdout"))
    stderr = safe_text(data.get("stderr") or data.get("compile_output"))
    verdict = (
        "success" if status_id == 3 else ("timeout" if status_id in (5, 6) else "error")
    )
    return {
        "status": verdict,
        "verdict": status_name,
        "stdout": stdout,
        "stderr": stderr,
        "execution_time_ms": (
            round(float(data["time"]) * 1000) if data.get("time") else None
        ),
        "memory_kb": data.get("memory"),
        "token": data.get("token"),
    }


@app.get("/")
def root():
    return {"name": "main( ) API", "status": "ok", "docs": "/docs"}


@app.get("/api/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(__import__("sqlalchemy").text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False
    return {
        "status": "ok" if db_ok else "degraded",
        "database": "ok" if db_ok else "unavailable",
        "execution_provider_configured": bool(os.getenv("JUDGE0_API_URL")),
    }


@app.post("/api/auth/register")
def register(data: RegisterIn, db: Session = Depends(get_db), request: Request = None):
    email = data.email.lower()
    if (
        db.query(User)
        .filter((User.email == email) | (User.username == data.username))
        .first()
    ):
        raise HTTPException(
            status_code=409, detail="That email or username is already registered"
        )
    u = User(
        username=data.username,
        email=email,
        password_hash=pwd_context.hash(data.password),
        role="user",
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    log_event(db, u, "registration")
    return {
        "access_token": create_token(u),
        "token_type": "bearer",
        "user": user_public(u),
    }


@app.post("/api/auth/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.email == data.email.lower()).first()
    if not u or not pwd_context.verify(data.password, u.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not u.is_active:
        raise HTTPException(status_code=403, detail="This account is disabled")
    log_event(db, u, "login")
    return {
        "access_token": create_token(u),
        "token_type": "bearer",
        "user": user_public(u),
    }


@app.post("/api/auth/logout")
def logout():
    return {"status": "ok", "message": "Session cleared on client"}


@app.get("/api/auth/me")
def me(u=Depends(require_user)):
    return user_public(u)


@app.get("/api/languages")
def languages():
    return [{"id": k, "name": v, "available": True} for k, v in LANGUAGE_NAMES.items()]


@app.post("/api/execute")
async def execute(
    data: ExecuteIn,
    request: Request,
    db: Session = Depends(get_db),
    u=Depends(get_current_user),
):
    # Lightweight per-IP guard; production should additionally use a shared rate limiter at the edge.
    key = "codex_exec_" + (request.client.host if request.client else "unknown")
    now = time.time()
    hist = getattr(app.state, "exec_history", {})
    recent = [t for t in hist.get(key, []) if now - t < 60]
    if len(recent) >= 12:
        raise HTTPException(
            status_code=429,
            detail="Too many code runs. Please wait a minute and try again.",
        )
    recent.append(now)
    hist[key] = recent
    app.state.exec_history = hist
    result = await execute_with_judge0(data)
    sub = Submission(
        user_id=u.id if u else None,
        language=data.language,
        source_code=data.source_code,
        verdict=result["verdict"],
        stdout=result["stdout"],
        stderr=result["stderr"],
        execution_time_ms=result["execution_time_ms"],
    )
    db.add(sub)
    db.commit()
    log_event(
        db, u, "code_run", {"language": data.language, "status": result["status"]}
    )
    return result


@app.get("/api/problems")
def problems(
    q: Optional[str] = None,
    difficulty: Optional[str] = None,
    pattern: Optional[str] = None,
    topic: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Problem).filter(Problem.published == True)
    if difficulty and difficulty.lower() in ("easy", "medium", "hard"):
        query = query.filter(func.lower(Problem.difficulty) == difficulty.lower())
    out = []
    for p in query.order_by(Problem.id).all():
        topics = json_list(p.topics_json)
        patterns = json_list(p.patterns_json)
        if (
            q
            and q.lower()
            not in (
                p.title + " " + p.description + " " + " ".join(topics + patterns)
            ).lower()
        ):
            continue
        if pattern and pattern not in patterns:
            continue
        if topic and topic not in topics:
            continue
        out.append(
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "difficulty": p.difficulty,
                "topics": topics,
                "patterns": patterns,
                "career_tracks": json_list(p.career_tracks_json),
                "company_tags": json_list(p.company_tags_json),
                "prerequisites": json_list(p.prerequisites_json),
                "example": p.example,
                "starter": p.starter_code,
            }
        )
    return out


@app.get("/api/problems/{problem_id}")
def problem_detail(problem_id: int, db: Session = Depends(get_db)):
    p = (
        db.query(Problem)
        .filter(Problem.id == problem_id, Problem.published == True)
        .first()
    )
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    return {
        "id": p.id,
        "title": p.title,
        "description": p.description,
        "difficulty": p.difficulty,
        "topics": json_list(p.topics_json),
        "patterns": json_list(p.patterns_json),
        "career_tracks": json_list(p.career_tracks_json),
        "company_tags": json_list(p.company_tags_json),
        "prerequisites": json_list(p.prerequisites_json),
        "example": p.example,
        "starter": p.starter_code,
    }


@app.post("/api/submissions")
async def submit_solution(
    data: SubmitIn, db: Session = Depends(get_db), u=Depends(require_user)
):
    p = (
        db.query(Problem)
        .filter(Problem.id == data.problem_id, Problem.published == True)
        .first()
    )
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    # Until per-problem language harnesses/test cases are curated, do not claim an unverified solution is accepted.
    result = await execute_with_judge0(
        ExecuteIn(
            language=data.language, source_code=data.source_code, stdin=data.stdin
        )
    )
    verdict = (
        "Executed — evaluation pending"
        if result["status"] == "success"
        else result["verdict"]
    )
    s = Submission(
        user_id=u.id,
        problem_id=p.id,
        language=data.language,
        source_code=data.source_code,
        verdict=verdict,
        stdout=result["stdout"],
        stderr=result["stderr"],
        execution_time_ms=result["execution_time_ms"],
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    log_event(
        db,
        u,
        "problem_submission",
        {"problem_id": p.id, "language": data.language, "verdict": verdict},
    )
    return {
        "id": s.id,
        "verdict": verdict,
        "status": result["status"],
        "stdout": result["stdout"],
        "stderr": result["stderr"],
        "execution_time_ms": result["execution_time_ms"],
        "message": "Execution completed. Automated judging requires a problem-specific harness and hidden test cases.",
    }


@app.get("/api/submissions")
def submissions(db: Session = Depends(get_db), u=Depends(require_user)):
    rows = (
        db.query(Submission)
        .filter(Submission.user_id == u.id)
        .order_by(Submission.created_at.desc())
        .limit(100)
        .all()
    )
    return [
        {
            "id": s.id,
            "problem_id": s.problem_id,
            "problem_title": s.problem.title if s.problem else None,
            "language": s.language,
            "verdict": s.verdict,
            "status": s.verdict,
            "execution_time_ms": s.execution_time_ms,
            "created_at": s.created_at.isoformat() + "Z",
        }
        for s in rows
    ]


@app.get("/api/submissions/{submission_id}")
def submission_detail(
    submission_id: int, db: Session = Depends(get_db), u=Depends(require_user)
):
    s = db.query(Submission).filter(Submission.id == submission_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")
    if s.user_id != u.id and u.role != "admin":
        raise HTTPException(status_code=403, detail="You cannot access this submission")
    return {
        "id": s.id,
        "language": s.language,
        "source_code": s.source_code,
        "verdict": s.verdict,
        "stdout": s.stdout,
        "stderr": s.stderr,
        "created_at": s.created_at.isoformat() + "Z",
    }


@app.post("/api/events")
def create_event(
    data: EventIn, db: Session = Depends(get_db), u=Depends(get_current_user)
):
    allowed = {"code_run", "problem_view", "learning_path_view", "feedback_view"}
    if data.event_type not in allowed:
        raise HTTPException(status_code=422, detail="Unsupported event type")
    log_event(db, u, data.event_type, data.metadata)
    return {"status": "ok"}


@app.post("/api/feedback")
def feedback(data: FeedbackIn, db: Session = Depends(get_db)):
    f = Feedback(name=data.name, email=data.email.lower(), message=data.message)
    db.add(f)
    db.commit()
    log_event(db, None, "feedback_received")
    return {"status": "received", "message": "Thank you for the feedback"}


@app.get("/api/admin/analytics")
def analytics(
    days: int = 30, db: Session = Depends(get_db), admin=Depends(require_admin)
):
    days = max(1, min(days, 365))
    since = datetime.datetime.utcnow() - datetime.timedelta(days=days)
    total_users = db.query(User).count()
    total_exec = db.query(Submission).filter(Submission.problem_id.is_(None)).count()
    total_sub = db.query(Submission).filter(Submission.problem_id.is_not(None)).count()
    accepted = db.query(Submission).filter(Submission.verdict == "Accepted").count()
    activity = []
    for offset in range(days - 1, -1, -1):
        d = (datetime.datetime.utcnow() - datetime.timedelta(days=offset)).date()
        start = datetime.datetime.combine(d, datetime.time.min)
        end = start + datetime.timedelta(days=1)
        users = (
            db.query(User)
            .filter(User.created_at >= start, User.created_at < end)
            .count()
        )
        execs = (
            db.query(Submission)
            .filter(Submission.created_at >= start, Submission.created_at < end)
            .count()
        )
        if days > 45 and offset % max(1, days // 30) != 0:
            continue
        activity.append(
            {"date": d.strftime("%b %d"), "users": users, "executions": execs}
        )
    lang_rows = (
        db.query(Submission.language, func.count(Submission.id))
        .group_by(Submission.language)
        .all()
    )
    outcomes = (
        db.query(Submission.verdict, func.count(Submission.id))
        .group_by(Submission.verdict)
        .all()
    )
    recent = db.query(Activity).order_by(Activity.created_at.desc()).limit(15).all()
    return {
        "period_days": days,
        "total_users": total_users,
        "total_executions": total_exec,
        "total_submissions": total_sub,
        "accepted_submissions": accepted,
        "daily_activity": activity,
        "language_usage": [
            {"language": LANGUAGE_NAMES.get(k, k), "count": v} for k, v in lang_rows
        ],
        "outcomes": [{"status": k or "Unknown", "count": v} for k, v in outcomes],
        "recent_activity": [
            {
                "event_type": a.event_type,
                "username": a.user.username if a.user else "Guest",
                "created_at": a.created_at.isoformat() + "Z",
                "metadata": (
                    json_list(a.metadata_json)
                    if a.metadata_json.startswith("[")
                    else {}
                ),
            }
            for a in recent
        ],
    }


@app.get("/api/admin/users")
def admin_users(
    q: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    query = db.query(User)
    if q:
        query = query.filter(
            (User.username.ilike(f"%{q}%")) | (User.email.ilike(f"%{q}%"))
        )
    return [
        {
            **user_public(u),
            "is_active": u.is_active,
            "submission_count": db.query(Submission)
            .filter(Submission.user_id == u.id)
            .count(),
        }
        for u in query.order_by(User.created_at.desc())
        .limit(max(1, min(limit, 250)))
        .all()
    ]


@app.patch("/api/admin/users/{user_id}/status")
def set_user_status(
    user_id: int,
    active: bool,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    if u.id == admin.id and not active:
        raise HTTPException(
            status_code=400, detail="You cannot suspend your own account"
        )
    u.is_active = active
    db.commit()
    log_event(
        db, admin, "user_status_changed", {"target_user_id": u.id, "active": active}
    )
    return {"status": "ok", "user": user_public(u), "is_active": u.is_active}


@app.post("/api/admin/problems")
def create_problem(
    data: ProblemIn, db: Session = Depends(get_db), admin=Depends(require_admin)
):
    if data.difficulty not in ("Easy", "Medium", "Hard"):
        raise HTTPException(
            status_code=422, detail="Difficulty must be Easy, Medium, or Hard"
        )
    p = Problem(
        title=data.title,
        description=data.description,
        difficulty=data.difficulty,
        topics_json=json.dumps(data.topics),
        patterns_json=json.dumps(data.patterns),
        career_tracks_json=json.dumps(data.career_tracks),
        company_tags_json=json.dumps(data.company_tags),
        prerequisites_json=json.dumps(data.prerequisites),
        example=data.example,
        starter_code=data.starter_code,
        published=data.published,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return {"id": p.id, "title": p.title}


@app.put("/api/admin/problems/{problem_id}")
def update_problem(
    problem_id: int,
    data: ProblemIn,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    p = db.query(Problem).filter(Problem.id == problem_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    for key in (
        "title",
        "description",
        "difficulty",
        "example",
        "starter_code",
        "published",
    ):
        setattr(p, key, getattr(data, key))
    for key in ("topics", "patterns", "career_tracks", "company_tags", "prerequisites"):
        setattr(p, key + "_json", json.dumps(getattr(data, key)))
    db.commit()
    return {"status": "updated", "id": p.id}


@app.delete("/api/admin/problems/{problem_id}")
def delete_problem(
    problem_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)
):
    p = db.query(Problem).filter(Problem.id == problem_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    p.published = False
    db.commit()
    return {"status": "unpublished", "id": p.id}


@app.get("/api/admin/feedback")
def admin_feedback(db: Session = Depends(get_db), admin=Depends(require_admin)):
    return [
        {
            "id": f.id,
            "name": f.name,
            "email": f.email,
            "message": f.message,
            "created_at": f.created_at.isoformat() + "Z",
        }
        for f in db.query(Feedback)
        .order_by(Feedback.created_at.desc())
        .limit(100)
        .all()
    ]
