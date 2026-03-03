import os
import json
import sqlite3
from datetime import date
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")

DATABASE = os.environ.get(
    "DATABASE_PATH",
    os.path.join(os.path.dirname(__file__), "todo.db"),
)


# ── Database helpers ──────────────────────────────────────────────────────────


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


@app.teardown_appcontext
def close_db(exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = get_db()
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS lists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            icon TEXT DEFAULT '📁',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            completed INTEGER DEFAULT 0,
            due_date TEXT,
            list_id INTEGER,
            tags TEXT DEFAULT '[]',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS subtasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
        );
        """
    )
    db.commit()


def seed_db():
    db = get_db()

    if db.execute("SELECT COUNT(*) FROM lists").fetchone()[0] > 0:
        return

    db.executemany(
        "INSERT INTO lists (name, icon) VALUES (?, ?)",
        [("Personal", "🏠"), ("Work", "💼")],
    )

    today = date.today().isoformat()

    tasks = [
        (
            "Design landing page mockup",
            "Create high-fidelity mockups for the new landing page redesign",
            0,
            today,
            2,
            '["design", "urgent"]',
        ),
        (
            "Weekly team standup",
            "Prepare agenda and talking points for the weekly standup",
            0,
            today,
            2,
            '["meeting"]',
        ),
        (
            "Buy groceries",
            "Milk, eggs, bread, vegetables, fruits",
            0,
            today,
            1,
            '["shopping"]',
        ),
        (
            "Read 30 pages of book",
            "Continue reading 'Atomic Habits' by James Clear",
            1,
            today,
            1,
            '["reading", "self-improvement"]',
        ),
        (
            "Fix authentication bug",
            "Users are getting logged out unexpectedly after 10 minutes",
            0,
            today,
            2,
            '["bug", "urgent"]',
        ),
        (
            "Plan weekend trip",
            "Research destinations and book accommodation",
            0,
            today,
            1,
            '["travel", "personal"]',
        ),
    ]

    db.executemany(
        """
        INSERT INTO tasks
        (title, description, completed, due_date, list_id, tags)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        tasks,
    )

    subtasks = [
        (1, "Research competitor designs", 1),
        (1, "Create wireframes", 0),
        (1, "Design in Figma", 0),
        (3, "Milk", 0),
        (3, "Eggs", 1),
        (3, "Bread", 0),
        (3, "Vegetables", 0),
        (5, "Reproduce the bug", 1),
        (5, "Check token expiry logic", 0),
        (5, "Write unit tests", 0),
    ]

    db.executemany(
        """
        INSERT INTO subtasks (task_id, title, completed)
        VALUES (?, ?, ?)
        """,
        subtasks,
    )

    db.commit()


# ── Serialization helpers ─────────────────────────────────────────────────────


def task_to_dict(row):
    d = dict(row)
    d["tags"] = json.loads(d.get("tags") or "[]")
    d["completed"] = bool(d["completed"])
    return d


def subtask_to_dict(row):
    d = dict(row)
    d["completed"] = bool(d["completed"])
    return d


# ── List endpoints ────────────────────────────────────────────────────────────


@app.route("/api/lists", methods=["GET"])
def get_lists():
    rows = get_db().execute(
        "SELECT * FROM lists ORDER BY id"
    ).fetchall()
    return jsonify([dict(r) for r in rows])


@app.route("/api/lists", methods=["POST"])
def create_list():
    data = request.get_json(force=True)
    name = data.get("name", "").strip()
    icon = data.get("icon", "📁")

    if not name:
        return jsonify({"error": "name is required"}), 400

    db = get_db()

    cur = db.execute(
        "INSERT INTO lists (name, icon) VALUES (?, ?)",
        (name, icon),
    )
    db.commit()

    row = db.execute(
        "SELECT * FROM lists WHERE id = ?",
        (cur.lastrowid,),
    ).fetchone()

    return jsonify(dict(row)), 201


@app.route("/api/lists/<int:list_id>", methods=["DELETE"])
def delete_list(list_id):
    db = get_db()
    db.execute("DELETE FROM lists WHERE id = ?", (list_id,))
    db.commit()
    return "", 204


# ── Task endpoints ────────────────────────────────────────────────────────────


@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    db = get_db()
    list_filter = request.args.get("list")

    if list_filter:
        rows = db.execute(
            "SELECT * FROM tasks WHERE list_id = ? ORDER BY created_at DESC",
            (list_filter,),
        ).fetchall()
    else:
        rows = db.execute(
            "SELECT * FROM tasks ORDER BY created_at DESC"
        ).fetchall()

    tasks = []

    for row in rows:
        t = task_to_dict(row)
        subs = db.execute(
            "SELECT * FROM subtasks WHERE task_id = ?",
            (t["id"],),
        ).fetchall()
        t["subtasks"] = [subtask_to_dict(s) for s in subs]
        tasks.append(t)

    return jsonify(tasks)


@app.route("/api/tasks", methods=["POST"])
def create_task():
    data = request.get_json(force=True)
    title = data.get("title", "").strip()

    if not title:
        return jsonify({"error": "title is required"}), 400

    db = get_db()

    cur = db.execute(
        """
        INSERT INTO tasks
        (title, description, due_date, list_id, tags)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            title,
            data.get("description", ""),
            data.get("due_date"),
            data.get("list_id"),
            json.dumps(data.get("tags", [])),
        ),
    )

    db.commit()
    task_id = cur.lastrowid

    for sub in data.get("subtasks", []):
        sub_title = sub.get("title", "").strip()
        if sub_title:
            db.execute(
                """
                INSERT INTO subtasks (task_id, title, completed)
                VALUES (?, ?, ?)
                """,
                (
                    task_id,
                    sub_title,
                    int(sub.get("completed", False)),
                ),
            )

    db.commit()

    row = db.execute(
        "SELECT * FROM tasks WHERE id = ?",
        (task_id,),
    ).fetchone()

    t = task_to_dict(row)

    subs = db.execute(
        "SELECT * FROM subtasks WHERE task_id = ?",
        (task_id,),
    ).fetchall()

    t["subtasks"] = [subtask_to_dict(s) for s in subs]

    return jsonify(t), 201


@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json(force=True)
    db = get_db()

    existing = db.execute(
        "SELECT * FROM tasks WHERE id = ?",
        (task_id,),
    ).fetchone()

    if not existing:
        return jsonify({"error": "task not found"}), 404

    db.execute(
        """
        UPDATE tasks
        SET title = ?, description = ?, completed = ?, due_date = ?,
            list_id = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            data.get("title", existing["title"]),
            data.get("description", existing["description"]),
            int(data.get("completed", existing["completed"])),
            data.get("due_date", existing["due_date"]),
            data.get("list_id", existing["list_id"]),
            json.dumps(data.get("tags", json.loads(existing["tags"] or "[]"))),
            task_id,
        ),
    )

    if "subtasks" in data:
        db.execute("DELETE FROM subtasks WHERE task_id = ?", (task_id,))

        for sub in data["subtasks"]:
            sub_title = sub.get("title", "").strip()
            if sub_title:
                db.execute(
                    """
                    INSERT INTO subtasks (task_id, title, completed)
                    VALUES (?, ?, ?)
                    """,
                    (
                        task_id,
                        sub_title,
                        int(sub.get("completed", False)),
                    ),
                )

    db.commit()

    row = db.execute(
        "SELECT * FROM tasks WHERE id = ?",
        (task_id,),
    ).fetchone()

    t = task_to_dict(row)

    subs = db.execute(
        "SELECT * FROM subtasks WHERE task_id = ?",
        (task_id,),
    ).fetchall()

    t["subtasks"] = [subtask_to_dict(s) for s in subs]

    return jsonify(t)


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    db = get_db()
    db.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    db.commit()
    return "", 204


# ── Boot ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    with app.app_context():
        init_db()
        seed_db()

    port = int(os.environ.get("PORT", 5000))
    app.run(
        host="0.0.0.0",
        port=port,
        debug=os.getenv("FLASK_ENV") == "development",
    )
