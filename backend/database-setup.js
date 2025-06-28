// Filename: backend/database-setup.js
// Description: This script creates the SQLite database with new columns for video and image URLs.
// Run this file once after deleting your old fitness.db file.

const sqlite3 = require('sqlite3').verbose();

// --- UPDATED WORKOUT DATA ---
const WORKOUTS_DATA = [
    {
        id: 1,
        name: "Traps Workout",
        description: "Full body focus with an emphasis on traps.",
        duration: "45 mins",
        exercises: [
            { name: "Chin Ups", reps: "3-6 reps, 3 sets", type: "reps", video_urls: ["https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-chinup-front.mp4"], svg_front_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Front", svg_back_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Back" },
            { name: "Push Up", reps: "3-5 reps, 2 sets", type: "reps", video_urls: ["https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-push-up-front.mp4"], svg_front_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Front", svg_back_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Back" },
            { name: "Hand Plank", duration: 45, reps: "45s, 3 sets", type: "time", video_urls: ["https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-hand-plank-side_GnZ2NZh.mp4#t=0.1", "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-hand-plank-front_ZnMlFBF.mp4#t=0.1"], svg_front_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Front", svg_back_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Back" },
            { name: "Hand Side Plank", duration: 30, reps: "30s, 2 sets", type: "time", video_urls: ["https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-hand-side-plank-front.mp4#t=0.1", "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-hand-side-plank-side.mp4#t=0.1"], svg_front_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Front", svg_back_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Back" },
            { name: "Bench Dips", reps: "4-9 reps, 2 sets", type: "reps", video_urls: ["https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-bench-dips-front.mp4#t=0.1", "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-bench-dips-side.mp4#t=0.1"], svg_front_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Front", svg_back_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Back" },
            { name: "Dead Hang", duration: 30, reps: "30s, 3 sets", type: "time", video_urls: ["https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-dead-hang-front.mp4#t=0.1", "https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-dead-hang-side.mp4#t=0.1"], svg_front_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Front", svg_back_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Back" }
        ],
    },
    {
        id: 2,
        name: "Morning Mobility",
        description: "A quick routine to wake up your body.",
        duration: "15 mins",
        exercises: [
            { name: "Cat-Cow", reps: "10 reps", type: "reps", video_urls: [], svg_front_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Front", svg_back_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Back" },
            { name: "Downward Dog", duration: 45, reps: "45s", type: "time", video_urls: [], svg_front_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Front", svg_back_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Back" },
             { name: "Glute Bridge", reps: "15 reps, 3 sets", type: "reps", video_urls: ["https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-glute-bridge-front.mp4","https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-glute-bridge-side.mp4"], svg_front_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Front", svg_back_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Back" }
        ],
    },
    {
        id: 3,
        name: "Barbell Essentials",
        description: "Core barbell strength movements.",
        duration: "60 mins",
        exercises: [
            { name: "Barbell High Bar Squat", reps: "5 reps, 3 sets", type: "reps", video_urls: ["https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-high-bar-squat-front.mp4", "https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-high-bar-squat-side.mp4"], svg_front_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Front", svg_back_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Back" },
            { name: "Barbell Bench Press", reps: "5 reps, 3 sets", type: "reps", video_urls: ["https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-bench-press-front.mp4", "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-bench-press-side_KciuhbB.mp4"], svg_front_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Front", svg_back_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Back" },
            { name: "Barbell Overhead Press", reps: "8 reps, 3 sets", type: "reps", video_urls: ["https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-overhead-press-front.mp4", "https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-overhead-press-side.mp4"], svg_front_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Front", svg_back_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Back" },
            { name: "Barbell Romanian Deadlift", reps: "8-10 reps, 3 sets", type: "reps", video_urls: ["https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-romanian-deadlift-front.mp4", "https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-romanian-deadlift-side_dnNh5UH.mp4"], svg_front_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Front", svg_back_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Back" }
        ]
    },
    {
        id: 4,
        name: "Dumbbell Strength",
        description: "A classic dumbbell workout routine.",
        duration: "45 mins",
        exercises: [
            { name: "Dumbbell Curl", reps: "10-12 reps, 3 sets", type: "reps", video_urls: ["https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-curl-front.mp4", "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-curl-side.mp4"], svg_front_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Front", svg_back_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Back" },
            { name: "Dumbbell Lateral Raise", reps: "12-15 reps, 3 sets", type: "reps", video_urls: ["https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-lateral-raise-front.mp4", "https://media.musclewiki.com/media/uploads/videos/branded/male-Dumbbells-dumbbell-lateral-raise-side.mp4"], svg_front_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Front", svg_back_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Back" },
            { name: "Dumbbell Goblet Squat", reps: "10 reps, 3 sets", type: "reps", video_urls: ["https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-goblet-squat-front.mp4", "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-goblet-squat-side.mp4"], svg_front_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Front", svg_back_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Back" },
            { name: "Dumbbell Bench Press", reps: "8-10 reps, 3 sets", type: "reps", video_urls: ["https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-bench-press-front_y8zKZJl.mp4", "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-bench-press-side_rqe1iTe.mp4"], svg_front_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Front", svg_back_url: "https://placehold.co/150x300/1e1e1e/00e5ff?text=Back" },
        ]
    }
];

// --- DATABASE INITIALIZATION ---
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
        // Drop existing tables to ensure a clean slate
        db.run(`DROP TABLE IF EXISTS exercises`);
        db.run(`DROP TABLE IF EXISTS workouts`);
        db.run(`DROP TABLE IF EXISTS history`);
        console.log("Existing tables dropped.");

        // Create Workouts Table
        db.run(`CREATE TABLE workouts (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            duration TEXT
        )`, (err) => {
            if (err) console.error("Error creating workouts table", err);
            else console.log("Workouts table created.");
        });

        // Create Exercises Table with new columns
        db.run(`CREATE TABLE exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workout_id INTEGER,
            name TEXT NOT NULL,
            reps TEXT,
            duration_seconds INTEGER,
            type TEXT,
            video_urls TEXT,
            svg_front_url TEXT,
            svg_back_url TEXT,
            FOREIGN KEY (workout_id) REFERENCES workouts(id)
        )`, (err) => {
            if (err) console.error("Error creating exercises table", err);
            else console.log("Exercises table created with new columns.");
        });

        // Create History Table
        db.run(`CREATE TABLE history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workout_id INTEGER,
            completed_at TEXT NOT NULL,
            FOREIGN KEY (workout_id) REFERENCES workouts(id)
        )`, (err) => {
            if (err) console.error("Error creating history table", err);
            else {
                console.log("History table created.");
                populateData();
            }
        });
    });
}

function populateData() {
    db.serialize(() => {
        const workoutStmt = db.prepare("INSERT INTO workouts (id, name, description, duration) VALUES (?, ?, ?, ?)");
        // Updated INSERT statement to handle JSON stringified array for video_urls
        const exerciseStmt = db.prepare("INSERT INTO exercises (workout_id, name, reps, duration_seconds, type, video_urls, svg_front_url, svg_back_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

        console.log("Populating database with initial data...");
        WORKOUTS_DATA.forEach(workout => {
            workoutStmt.run(workout.id, workout.name, workout.description, workout.duration);
            workout.exercises.forEach(ex => {
                // We stringify the array of video URLs before inserting it into the TEXT column
                const videoUrlsJson = JSON.stringify(ex.video_urls);
                exerciseStmt.run(workout.id, ex.name, ex.reps, ex.duration || null, ex.type, videoUrlsJson, ex.svg_front_url, ex.svg_back_url);
            });
        });
        console.log("Data population complete.");

        workoutStmt.finalize();
        exerciseStmt.finalize();
        db.close((err) => {
            if(err) console.error("Error closing db", err);
            else console.log("Database connection closed.");
        });
    });
}
