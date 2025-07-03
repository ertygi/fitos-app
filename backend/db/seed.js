const pool = require('./pool');
const { WORKOUTS_DATA, USERS_DATA } = require('./data');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const importExercisesFlag = process.argv.includes('--import-exercises');

const createTablesQuery = `
    DROP TABLE IF EXISTS history, workout_exercises, exercises, workouts, users CASCADE;

    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user'
    );

    CREATE TABLE workouts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        duration VARCHAR(100),
        is_public BOOLEAN DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
    );
    
    CREATE TABLE exercises (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        instructions  TEXT,
        target_muscle VARCHAR(255),
        level VARCHAR(50),
        equipment VARCHAR(100),
        video_url TEXT,
        image_url TEXT
    );
    
    CREATE TABLE workout_exercises (
        workout_id INTEGER REFERENCES workouts(id) ON DELETE CASCADE,
        exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
        PRIMARY KEY (workout_id, exercise_id)
    );

    CREATE TABLE history (
        id SERIAL PRIMARY KEY,
        workout_id INTEGER REFERENCES workouts(id),
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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

        const exerciseNameToIdMap = new Map();

        if (importExercisesFlag) {
            console.log('--- Full Reset: Importing all exercises from JSON ---');
            const filePath = path.join(__dirname, '../exercises.json'); 
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const exercisesToImport = JSON.parse(fileContent);

            console.log(`Importing ${exercisesToImport.length} exercises...`);
            for (const ex of exercisesToImport) {
                // CORRECTED: Skip exercise if the name is missing
                if (!ex["Exercise Name"]) {
                    console.warn("Skipping exercise with no name:", ex);
                    continue;
                }

                const res = await client.query(
                    `INSERT INTO exercises (name, target_muscle, level, equipment, video_url, image_url)
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                    [
                        ex["Exercise Name"],
                        ex["Muscle Group"] || null, // Use null if value is missing
                        ex["Level"] || null,
                        ex["Equipment"] || null,
                        ex["Video URL"] || null,
                        ex["GIF"] || null
                    ]
                );
                exerciseNameToIdMap.set(ex["Exercise Name"], res.rows[0].id);
            }
            console.log("All exercises imported successfully.");
        } else {
            console.log("--- Fast Reset: Loading existing exercises from DB ---");
            const res = await client.query('SELECT id, name FROM exercises');
            res.rows.forEach(row => exerciseNameToIdMap.set(row.name, row.id));
            console.log(`Loaded ${exerciseNameToIdMap.size} existing exercises.`);
        }

        console.log("Populating users...");
        const saltRounds = 10;
        const defaultPassword = process.env.DEFAULT_SEED_PASSWORD || 'MyPassw0rd';

        for (const user of USERS_DATA) {
            const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds); 
            await client.query(
                'INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)',
                [user.id, user.name, user.email, hashedPassword, user.role]
            );
        }
        console.log("Users populated.");

        console.log("Populating pre-made workouts and linking exercises...");
        for (const workout of WORKOUTS_DATA) {
             const workoutRes = await client.query(
                'INSERT INTO workouts (id, name, description, duration) VALUES ($1, $2, $3, $4) RETURNING id',
                [workout.id, workout.name, workout.description, workout.duration]
            );
            const workoutId = workoutRes.rows[0].id;

            for (const exerciseName of workout.exerciseNames) {
                const exerciseId = exerciseNameToIdMap.get(exerciseName);
                if (exerciseId) {
                    await client.query(
                        'INSERT INTO workout_exercises (workout_id, exercise_id) VALUES ($1, $2)',
                        [workoutId, exerciseId]
                    );
                } else {
                    console.warn(`Warning: Exercise "${exerciseName}" for workout "${workout.name}" was not found and was not linked.`);
                }
            }
        }
        console.log("Pre-made workouts populated and linked.");
        
        console.log("Resetting primary key sequences...");
        await client.query("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));");
        await client.query("SELECT setval('workouts_id_seq', (SELECT MAX(id) FROM workouts));");
        if (importExercisesFlag) {
            await client.query("SELECT setval('exercises_id_seq', (SELECT MAX(id) FROM exercises));");
        }
        console.log("Sequences reset.");

        console.log("Database setup complete!");

    } catch (err) {
        console.error("Error setting up database:", err);
    } finally {
        if (client) client.release();
        pool.end();
    }
}

setupDatabase();