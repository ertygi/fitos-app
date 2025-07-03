const WORKOUTS_DATA = [
    {
        id: 1, name: "Upper Body Strength",
        description: "Focuses on building mass and strength in the back, chest, and shoulders using classic compound and isolation movements.",
        duration: "60 mins",
        exerciseNames: [ // The seed script will find these exercises by name and link them
            "Chin Ups",
            "Barbell Bench Press",
            "Dumbbell Lateral Raise",
            "Cable Push Down"
        ]
    },
    {
        id: 2, name: "Lower Body & Core",
        description: "A comprehensive workout to build foundational leg strength and core stability.",
        duration: "50 mins",
        exerciseNames: [
            "Barbell High Bar Squat",
            "Bodyweight Squat",
            "Hand Plank",
            "Kettlebell Russian Twist"
        ]
    },
    {
        id: 3, name: "Ganithenics 35-Min Full-Body Workout",
        description: "Workout Type: Mixed Reps & Time (Bodyweight Only). Goal: Strength, mobility, and control. Structure: 3 Rounds of 7 exercises, with 30s rest between exercises & 60s between rounds.",
        duration: "35 mins",
        exerciseNames: [
            "Push-ups",
            "Air Squats",
            "Plank Shoulder Taps",
            "Superman Hold",
            "Reverse Lunges",
            "Leg Raises",
            "Mountain Climbers"
        ]
    }
];

const USERS_DATA = [
{ id: 1, name: "Gani", email: "gani@fitos.com", role: "admin", preferences: { goal: 'Gain Strength', level: 'Advanced' } },
{ id: 2, name: "Ertil", email: "ertil@gani.al", role: "user", preferences: { goal: ['Gain Strength', 'Gain Muscle'], level: 'Intermediate' } },
];

module.exports = { WORKOUTS_DATA, USERS_DATA };