const mongoose = require("mongoose");

// Grading scale helper
const calculateGrade = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 85) return "A";
    if (percentage >= 80) return "A-";
    if (percentage >= 75) return "B+";
    if (percentage >= 70) return "B";
    if (percentage >= 65) return "B-";
    if (percentage >= 60) return "C+";
    if (percentage >= 55) return "C";
    if (percentage >= 50) return "C-";
    if (percentage >= 45) return "D";
    return "F";
};

const assessmentSchema = new mongoose.Schema({
    totalMarks: { type: Number, default: 0, min: 0 },
    obtainedMarks: { type: Number, default: 0, min: 0 },
    percentage: { type: Number, default: 0 },
    grade: { type: String, default: "N/A" },
    isEntered: { type: Boolean, default: false },
});

const gradeSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        // Assessment components
        assignment: { type: assessmentSchema, default: () => ({}) },
        quiz: { type: assessmentSchema, default: () => ({}) },
        mid: { type: assessmentSchema, default: () => ({}) },
        final: { type: assessmentSchema, default: () => ({}) },

        // Aggregated totals (auto-calculated)
        totalMarks: { type: Number, default: 0 },
        obtainedMarks: { type: Number, default: 0 },
        overallPercentage: { type: Number, default: 0 },
        overallGrade: { type: String, default: "N/A" },
        passFail: { type: String, enum: ["Pass", "Fail", "Pending"], default: "Pending" },

        // Locking
        isLocked: { type: Boolean, default: false },
        lockedAt: { type: Date },
        lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

        semester: { type: String, default: "" },
    },
    { timestamps: true }
);

// Unique: one grade record per student per subject
gradeSchema.index({ student: 1, subject: 1 }, { unique: true });

// Auto-calculate aggregated fields before saving
gradeSchema.pre("save", function (next) {
    const components = ["assignment", "quiz", "mid", "final"];

    let totalMarks = 0;
    let obtainedMarks = 0;

    components.forEach((comp) => {
        const c = this[comp];
        if (c && c.isEntered) {
            // Clamp obtained to total
            if (c.obtainedMarks > c.totalMarks) c.obtainedMarks = c.totalMarks;

            // Component-level percentage and grade
            c.percentage = c.totalMarks > 0
                ? Math.round((c.obtainedMarks / c.totalMarks) * 100 * 100) / 100
                : 0;
            c.grade = calculateGrade(c.percentage);

            totalMarks += c.totalMarks;
            obtainedMarks += c.obtainedMarks;
        }
    });

    this.totalMarks = totalMarks;
    this.obtainedMarks = obtainedMarks;

    if (totalMarks > 0) {
        this.overallPercentage =
            Math.round((obtainedMarks / totalMarks) * 100 * 100) / 100;
        this.overallGrade = calculateGrade(this.overallPercentage);
        this.passFail = this.overallPercentage >= 50 ? "Pass" : "Fail";
    } else {
        this.overallPercentage = 0;
        this.overallGrade = "N/A";
        this.passFail = "Pending";
    }

    next();
});

module.exports = mongoose.model("Grade", gradeSchema);