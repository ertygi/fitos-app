require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const WORKOUTS_DATA = [
    {
        id: 1,
        name: "Upper Body Strength",
        description: "Focuses on building mass and strength in the back, chest, and shoulders using classic compound and isolation movements.",
        duration: "60 mins",
        exercises: [ /* Existing exercises... */ ]
    },
    {
        id: 2,
        name: "Lower Body & Core",
        description: "A comprehensive workout to build foundational leg strength and core stability.",
        duration: "50 mins",
        exercises: [ /* Existing exercises... */ ]
    },
    {
        id: 3,
        name: "Ganithenics 35-Min Full-Body Workout",
        description: "Workout Type: Mixed Reps & Time (Bodyweight Only). Goal: Strength, mobility, and control. Structure: 3 Rounds of 7 exercises, with 30s rest between exercises & 60s between rounds.",
        duration: "35 mins",
        exercises: [ /* Existing exercises... */ ]
    },
    {
        id: 4, // New workout to hold imported exercises
        name: "Imported from JSON",
        description: "Exercises imported from your custom JSON file.",
        duration: "Varies",
        exercises: [] // This will be populated by the import script
    }
];


async function createTables() {
  console.log("Starting table creation...");
  const client = await pool.connect();
  try {
    await client.query('DROP TABLE IF EXISTS history, exercises, workouts CASCADE;');
    console.log("Existing tables dropped.");

    await client.query(`CREATE TABLE workouts (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, description TEXT, duration VARCHAR(100));`);
    console.log("Workouts table created.");

    // ADDED a new image_url column
    await client.query(`
      CREATE TABLE exercises (
        id SERIAL PRIMARY KEY,
        workout_id INTEGER REFERENCES workouts(id),
        name VARCHAR(255) NOT NULL,
        reps VARCHAR(100),
        duration_seconds INTEGER,
        type VARCHAR(50),
        difficulty VARCHAR(50),
        equipment VARCHAR(100),
        video_urls TEXT,
        target_muscles TEXT,
        image_url TEXT 
      );
    `);
    console.log("Exercises table created with image_url column.");

    await client.query(`CREATE TABLE history (id SERIAL PRIMARY KEY, workout_id INTEGER REFERENCES workouts(id), completed_at TIMESTAMPTZ NOT NULL);`);
    console.log("History table created.");

  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    client.release();
  }
}

async function populateData() {
    console.log("Populating database with initial data...");
    const client = await pool.connect();
    try {
        for (const workout of WORKOUTS_DATA) {
            const workoutRes = await client.query(
                'INSERT INTO workouts (id, name, description, duration) VALUES ($1, $2, $3, $4) RETURNING id',
                [workout.id, workout.name, workout.description, workout.duration]
            );
            const workoutId = workoutRes.rows[0].id;
            if (workout.exercises.length === 0) continue; // Skip if no exercises

            for (const ex of workout.exercises) {
                await client.query(
                    'INSERT INTO exercises (workout_id, name, reps, duration_seconds, type, difficulty, equipment, video_urls, target_muscles) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                    [workoutId, ex.name, ex.reps, ex.duration || null, ex.type, ex.difficulty, ex.equipment, JSON.stringify(ex.video_urls), ex.target_muscles]
                );
            }
        }
        console.log("Data population complete.");
    } catch(err) {
        console.error("Error populating data:", err);
    } finally {
        client.release();
    }
}


async function main() {
    await createTables();
    await populateData();
    pool.end();
}

main();