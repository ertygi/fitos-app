// -----------------------------------------------------------------
// FILE: backend/routes/generator.js (Updated)
// The prompt now asks the Gemini API to include instructions.
// -----------------------------------------------------------------
const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

router.post('/', async (req, res) => {
    const { level, equipment, muscles, duration, goal } = req.body;
    
    const availableEquipment = Object.keys(equipment).filter(key => equipment[key]).join(', ') || 'none';
    const targetMuscles = Object.keys(muscles).filter(key => muscles[key]).join(', ');

    // UPDATED PROMPT: Now requests an 'instructions' field.
    const prompt = `
        Generate a workout routine based on these criteria:
        - Goal: ${goal}
        - Fitness Level: ${level}
        - Duration: ${duration}
        - Available Equipment: ${availableEquipment}
        - Target Muscles: ${targetMuscles}

        IMPORTANT: Respond with ONLY a valid JSON object in the following format. Do not include any other text, greetings, or explanations.
        
        {
          "name": "Your Custom Workout",
          "description": "A brief, one-sentence description of the workout generated.",
          "exercises": [
            {
              "name": "Exercise Name",
              "reps": "Reps or Time (e.g., '10-12 reps' or '45 seconds')",
              "target_muscle": "A single primary muscle group",
              "equipment": "Equipment Name",
              "level": "Difficulty Level",
              "type": "reps or time",
              "instructions": "A step-by-step guide on how to perform the exercise, formatted as a single string with newlines."
            }
          ]
        }
    `;

    try {
        console.log("Sending prompt to Gemini API...");
        const geminiResponse = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        });

        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.json();
            throw new Error(errorBody.error.message || 'The AI model could not generate a workout.');
        }

        const geminiData = await geminiResponse.json();
        const aiResponseText = geminiData.candidates[0].content.parts[0].text;
        const jsonString = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const generatedWorkout = JSON.parse(jsonString);

        generatedWorkout.id = `gen-${Date.now()}`;
        generatedWorkout.duration = duration;
        
        console.log("Successfully received and parsed workout from Gemini.");
        res.json({ workout: generatedWorkout });

    } catch (err) {
        console.error("Error in workout generation process:", err);
        res.status(500).json({ error: 'Failed to generate workout. Please check the backend logs.' });
    }
});

module.exports = router;
