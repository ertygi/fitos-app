// Filename: backend/database-setup.js
// Description: This script creates the SQLite database and tables, 
// and populates them with initial workout data. Run this file once.

const sqlite3 = require('sqlite3').verbose();

// --- WORKOUT DATA (The source of truth for our database) ---
const WORKOUTS_DATA = [
    {
        id: 1,
        name: "Traps Workout",
        description: "Full body focus with an emphasis on traps.",
        duration: "45 mins",
        exercises: [
            { name: "Chin Ups", reps: "3-6 reps, 3 sets", type: "reps" },
            { name: "Push Up", reps: "3-5 reps, 2 sets", type: "reps" },
            { name: "Hand Plank", duration: 45, reps: "45s, 3 sets", type: "time" },
            { name: "Hand Side Plank", duration: 30, reps: "30s, 2 sets", type: "time" },
            { name: "Supermans", reps: "10-15 reps, 3 sets", type: "reps" },
            { name: "Bench Dips", reps: "4-9 reps, 2 sets", type: "reps" },
            { name: "Forward Lunges", reps: "8-12 reps, 3 sets", type: "reps" },
            { name: "Elevated Pike Press", reps: "6-10 reps, 3 sets", type: "reps" },
            { name: "Calf Raises", reps: "8-12 reps, 3 sets", type: "reps" },
            { name: "Dead Hang", duration: 30, reps: "30s, 3 sets", type: "time" },
        ],
    },
    {
        id: 2,
        name: "Morning Mobility",
        description: "A quick routine to wake up your body.",
        duration: "15 mins",
        exercises: [
            { name: "Cat-Cow", reps: "10 reps", type: "reps" },
            { name: "Thoracic Spine Windmills", reps: "8 per side", type: "reps" },
            { name: "Walking Hip Flexor Stretch", duration: 60, reps: "60s", type: "time" },
            { name: "Downward Dog", duration: 45, reps: "45s", type: "time" },
            { name: "Child's Pose", duration: 60, reps: "60s", type: "time" },
        ],
    },
    {
        id: 3,
        name: "Core Crusher",
        description: "A short but intense abdominal workout.",
        duration: "20 mins",
        exercises: [
            { name: "Crunches", reps: "20 reps, 3 sets", type: "reps" },
            { name: "Leg Raises", reps: "15 reps, 3 sets", type: "reps" },
            { name: "Plank", duration: 60, reps: "60s, 3 sets", type: "time" },
            { name: "Russian Twists", reps: "20 reps (10 per side), 3 sets", type: "reps" },
            { name: "Bicycle Crunches", duration: 45, reps: "45s, 3 sets", type: "time" },
        ],
    },
];

// --- DATABASE INITIALIZATION ---

// This will create the fitness.db file in the `backend` directory
const db = new sqlite3.Database('./fitness.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTables();
    }
});

function createTables() {
    db.serialize(() => {
        // Create Workouts Table
        db.run(`CREATE TABLE IF NOT EXISTS workouts (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            duration TEXT
        )`, (err) => {
            if (err) console.error("Error creating workouts table", err);
            else console.log("Workouts table created or already exists.");
        });

        // Create Exercises Table
        db.run(`CREATE TABLE IF NOT EXISTS exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workout_id INTEGER,
            name TEXT NOT NULL,
            reps TEXT,
            duration_seconds INTEGER,
            type TEXT,
            FOREIGN KEY (workout_id) REFERENCES workouts(id)
        )`, (err) => {
            if (err) console.error("Error creating exercises table", err);
            else console.log("Exercises table created or already exists.");
        });

        // Create History Table
        db.run(`CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workout_id INTEGER,
            completed_at TEXT NOT NULL,
            FOREIGN KEY (workout_id) REFERENCES workouts(id)
        )`, (err) => {
            if (err) console.error("Error creating history table", err);
            else {
                console.log("History table created or already exists.");
                // Populate data after all tables are confirmed to exist
                populateData();
            }
        });
    });
}

function populateData() {
    db.serialize(() => {
        const workoutStmt = db.prepare("INSERT INTO workouts (id, name, description, duration) VALUES (?, ?, ?, ?)");
        const exerciseStmt = db.prepare("INSERT INTO exercises (workout_id, name, reps, duration_seconds, type) VALUES (?, ?, ?, ?, ?)");

        db.get("SELECT COUNT(*) as count FROM workouts", (err, row) => {
            if (row.count === 0) {
                 console.log("Populating database with initial data...");
                WORKOUTS_DATA.forEach(workout => {
                    workoutStmt.run(workout.id, workout.name, workout.description, workout.duration);
                    workout.exercises.forEach(ex => {
                        exerciseStmt.run(workout.id, ex.name, ex.reps, ex.duration || null, ex.type);
                    });
                });
                console.log("Data population complete.");
            } else {
                console.log("Database already populated.");
            }
            workoutStmt.finalize();
            exerciseStmt.finalize();
            db.close((err) => {
                if(err) console.error("Error closing db", err);
                else console.log("Database connection closed.");
            });
        });
    });
}

