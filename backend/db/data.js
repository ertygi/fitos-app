const WORKOUTS_DATA = [
    {
        id: 1, name: "Upper Body Strength",
        description: "Focuses on building mass and strength in the back, chest, and shoulders using classic compound and isolation movements.",
        duration: "60 mins",
        // This now just lists the names of the exercises for this workout.
        exerciseNames: [
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
    { id: 1, name: "Ertil", preferences: { goal: ['Gain Strength', 'Gain muscle'], level: 'Intermediate' } },
    { id: 2, name: "Barbara", preferences: { goal: 'Lose Weight', level: 'Beginner' } }
];

module.exports = { WORKOUTS_DATA, USERS_DATA };