const pool = require('./pool');
const { WORKOUTS_DATA, USERS_DATA } = require('./data');
const fs = require('fs');
const path = require('path');

const createTablesQuery = `
    DROP TABLE IF EXISTS history, workout_exercises, exercises, workouts, users CASCADE;

    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        preferences JSONB
    );

    CREATE TABLE workouts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        duration VARCHAR(100)
    );
    
    CREATE TABLE exercises (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        reps VARCHAR(100),
        duration_seconds INTEGER,
        type VARCHAR(50),
        difficulty VARCHAR(50),
        equipment VARCHAR(100),
        video_urls JSONB,
        target_muscles JSONB,
        image_url TEXT
    );
    
    -- New "joining" table for the many-to-many relationship
    CREATE TABLE workout_exercises (
        workout_id INTEGER REFERENCES workouts(id) ON DELETE CASCADE,
        exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
        PRIMARY KEY (workout_id, exercise_id)
    );

    CREATE TABLE history (
        id SERIAL PRIMARY KEY,
        workout_id INTEGER REFERENCES workouts(id),
        user_id INTEGER REFERENCES users(id),
        completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
`;

async function setupDatabase() {
    let client;
    try {
        client = await pool.connect();
        
        console.log("Creating tables...");
        await client.query(createTablesQuery);
        console.log("Tables created successfully.");

        // --- Step 1: Import all exercises from JSON ---
        console.log('Reading exercises.json...');
        const filePath = path.join(__dirname, '../exercises.json'); // Assumes exercises.json is in the backend folder
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const exercisesToImport = JSON.parse(fileContent);

        const exerciseNameToIdMap = new Map();

        console.log(`Importing ${exercisesToImport.length} exercises...`);
        for (const ex of exercisesToImport) {
            const videoUrlsJson = JSON.stringify(ex["Video URL"] ? [ex["Video URL"]] : []);
            const muscleGroupsJson = JSON.stringify(ex["Muscle Group"] ? [ex["Muscle Group"].toLowerCase().replace(/ /g, '_')] : []);

            const res = await client.query(
                `INSERT INTO exercises (name, difficulty, equipment, video_urls, image_url, target_muscles, reps, type)
                 VALUES ($1, $2, $3, $4, $5, $6, '10-12 reps', 'reps') RETURNING id`,
                [ex["Exercise Name"], ex["Level"], ex["Equipment"], videoUrlsJson, ex["GIF"], muscleGroupsJson]
            );
            exerciseNameToIdMap.set(ex["Exercise Name"], res.rows[0].id);
        }
        console.log("All exercises imported successfully.");

        // --- Step 2: Populate users and workouts ---
        console.log("Populating users and workouts...");
        for (const user of USERS_DATA) {
            await client.query('INSERT INTO users (id, name, preferences) VALUES ($1, $2, $3)', [user.id, user.name, user.preferences]);
        }
        for (const workout of WORKOUTS_DATA) {
            await client.query('INSERT INTO workouts (id, name, description, duration) VALUES ($1, $2, $3, $4)', [workout.id, workout.name, workout.description, workout.duration]);
        }
        console.log("Users and workouts populated.");

        // --- Step 3: Link workouts to exercises ---
        console.log("Linking workouts to exercises...");
        for (const workout of WORKOUTS_DATA) {
            for (const exerciseName of workout.exerciseNames) {
                const exerciseId = exerciseNameToIdMap.get(exerciseName);
                if (exerciseId) {
                    await client.query('INSERT INTO workout_exercises (workout_id, exercise_id) VALUES ($1, $2)', [workout.id, exerciseId]);
                } else {
                    console.warn(`Warning: Exercise "${exerciseName}" not found in exercises.json for workout "${workout.name}".`);
                }
            }
        }
        console.log("Linking complete.");
        
        console.log("Database setup complete!");

    } catch (err) {
        console.error("Error setting up database:", err);
    } finally {
        if (client) client.release();
        pool.end();
    }
}

setupDatabase();