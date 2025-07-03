require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
// The ID of the workout you want to add these exercises to.
// We created a workout with ID=4 in the setup script for this purpose.
const TARGET_WORKOUT_ID = 4;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function importExercises() {
  console.log('Reading exercises.json...');
  const filePath = path.join(__dirname, 'exercises.json');
  let exercisesToImport;

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    exercisesToImport = JSON.parse(fileContent);
  } catch (err) {
    console.error('Error: Could not read or parse exercises.json. Make sure the file exists in the backend folder and is valid JSON.', err);
    return;
  }

  console.log(`Found ${exercisesToImport.length} exercises to import.`);
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start a transaction

    for (const ex of exercisesToImport) {
      const videoUrlsJson = JSON.stringify(ex["Video URL"] ? [ex["Video URL"]] : []);
      
      // A simple mapping from the JSON "Muscle Group" to your schema.
      // You may need to adjust this if your JSON contains different names.
      const muscleGroupsJson = JSON.stringify(ex["Muscle Group"] ? [ex["Muscle Group"].toLowerCase().replace(/ /g, '_')] : []);

      await client.query(
        `INSERT INTO exercises (workout_id, name, level, equipment, video_urls, image_url, target_muscles, reps, type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, '10-12 reps, 3 sets', 'reps')`, // Using placeholder reps/type
        [
          TARGET_WORKOUT_ID,
          ex["Exercise Name"],
          ex["Level"],
          ex["Equipment"],
          ex["Video URL"],
          ex["GIF"],
          ex["Muscle Group"],
        ]
      );
      console.log(`Imported: ${ex["Exercise Name"]}`);
    }

    await client.query('COMMIT'); // Commit the transaction
    console.log('Successfully imported all exercises.');
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback on error
    console.error('Error importing exercises:', err);
  } finally {
    client.release();
    pool.end();
  }
}

importExercises();