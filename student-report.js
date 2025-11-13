// Student Performance Report Generator
// Tracks student performance and generates downloadable evaluation reports

class StudentReportGenerator {
    constructor() {
        this.sessionData = {
            studentName: 'Student',
            date: new Date().toLocaleDateString(),
            startTime: new Date(),
            endTime: null,

            // Performance metrics
            totalProblems: 0,
            correctOnFirstTry: 0,
            correctWithHelp: 0,
            incorrectAttempts: 0,

            // Step solver tracking
            stepsCompleted: 0,
            stepsNeededRetry: 0,
            hintsUsed: 0,
            conceptsReviewed: [],

            // Problem-by-problem log
            problemLog: [],

            // Skills demonstrated
            skillsShown: {
                'Two-Step Equations': 0,
                'Combining Like Terms': 0,
                'Distributive Property': 0,
                'Variables on Both Sides': 0,
                'Problem Solving': 0,
                'Perseverance': 0
            },

            // Learning indicators
            struggledConcepts: [],
            masteredConcepts: [],

            // Effort indicators
            videoWatched: false,
            examplesViewed: false,
            completedLevel: false
        };
    }

    // Set student name
    setStudentName(name) {
        this.sessionData.studentName = name;
        console.log('📝 Student name updated:', name);
    }

    // Track when student starts a problem
    startProblem(equation, concept) {
        this.currentProblem = {
            equation: equation,
            concept: concept,
            startTime: new Date(),
            attempts: 0,
            hintsUsed: 0,
            stepsCompletedCorrectly: 0,
            stepsNeededRetry: 0,
            completed: false,
            correctOnFirstTry: false
        };
    }

    // Track each attempt at a step
    recordStepAttempt(stepNumber, isCorrect, usedHint = false) {
        if (!this.currentProblem) return;

        this.currentProblem.attempts++;

        if (usedHint) {
            this.currentProblem.hintsUsed++;
            this.sessionData.hintsUsed++;
        }

        if (isCorrect) {
            this.currentProblem.stepsCompletedCorrectly++;
            this.sessionData.stepsCompleted++;
        } else {
            this.currentProblem.stepsNeededRetry++;
            this.sessionData.stepsNeededRetry++;
        }
    }

    // Track when student completes a problem
    completeProblem(wasCorrect) {
        if (!this.currentProblem) return;

        this.currentProblem.completed = true;
        this.currentProblem.endTime = new Date();
        this.currentProblem.timeSpent = (this.currentProblem.endTime - this.currentProblem.startTime) / 1000; // seconds

        this.sessionData.totalProblems++;

        if (wasCorrect) {
            if (this.currentProblem.attempts <= 1 && this.currentProblem.stepsNeededRetry === 0) {
                this.sessionData.correctOnFirstTry++;
                this.currentProblem.correctOnFirstTry = true;
            } else {
                this.sessionData.correctWithHelp++;
            }

            // Track concept mastery
            if (!this.sessionData.masteredConcepts.includes(this.currentProblem.concept)) {
                this.sessionData.masteredConcepts.push(this.currentProblem.concept);
            }

            // Award skill points
            this.sessionData.skillsShown[this.currentProblem.concept]++;
            this.sessionData.skillsShown['Problem Solving']++;
        } else {
            this.sessionData.incorrectAttempts++;

            // Track struggling concepts
            if (!this.sessionData.struggledConcepts.includes(this.currentProblem.concept)) {
                this.sessionData.struggledConcepts.push(this.currentProblem.concept);
            }
        }

        // If student persevered through retries
        if (this.currentProblem.stepsNeededRetry > 0 && wasCorrect) {
            this.sessionData.skillsShown['Perseverance']++;
        }

        // Log the problem
        this.sessionData.problemLog.push({...this.currentProblem});
        this.currentProblem = null;
    }

    // Track video watching
    recordVideoWatched() {
        this.sessionData.videoWatched = true;
    }

    // Track examples viewed
    recordExamplesViewed() {
        this.sessionData.examplesViewed = true;
    }

    // Track level completion
    recordLevelCompleted(levelName, hasMastery) {
        this.sessionData.completedLevel = hasMastery;
        this.sessionData.levelName = levelName;
        this.sessionData.endTime = new Date();
    }

    // Calculate overall rating (A-F scale)
    calculateRating() {
        const accuracyScore = this.sessionData.totalProblems > 0
            ? (this.sessionData.correctOnFirstTry + this.sessionData.correctWithHelp) / this.sessionData.totalProblems
            : 0;

        const effortScore = (
            (this.sessionData.videoWatched ? 0.3 : 0) +
            (this.sessionData.examplesViewed ? 0.2 : 0) +
            (this.sessionData.completedLevel ? 0.5 : 0)
        );

        const overallScore = (accuracyScore * 0.7) + (effortScore * 0.3);

        if (overallScore >= 0.90) return 'A';
        if (overallScore >= 0.80) return 'B';
        if (overallScore >= 0.70) return 'C';
        if (overallScore >= 0.60) return 'D';
        return 'F';
    }

    // Calculate effort level
    calculateEffort() {
        let effortPoints = 0;

        if (this.sessionData.videoWatched) effortPoints += 25;
        if (this.sessionData.examplesViewed) effortPoints += 25;
        if (this.sessionData.totalProblems > 0) effortPoints += 25;
        if (this.sessionData.completedLevel) effortPoints += 25;

        if (effortPoints >= 90) return 'Excellent';
        if (effortPoints >= 75) return 'Good';
        if (effortPoints >= 50) return 'Fair';
        return 'Needs Improvement';
    }

    // Generate the evaluation report
    generateReport() {
        const totalCorrect = this.sessionData.correctOnFirstTry + this.sessionData.correctWithHelp;
        const accuracyPercent = this.sessionData.totalProblems > 0
            ? Math.round((totalCorrect / this.sessionData.totalProblems) * 100)
            : 0;

        const sessionDuration = this.sessionData.endTime
            ? Math.round((this.sessionData.endTime - this.sessionData.startTime) / 1000 / 60)
            : 0;

        const rating = this.calculateRating();
        const effort = this.calculateEffort();

        // Build report as HTML for better formatting
        const report = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Student Evaluation Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .report-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #667eea;
            margin: 0;
            font-size: 2rem;
        }
        .header .subtitle {
            color: #666;
            margin-top: 10px;
        }
        .section {
            margin: 30px 0;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .section h2 {
            color: #667eea;
            margin-top: 0;
            font-size: 1.3rem;
        }
        .grade-badge {
            display: inline-block;
            font-size: 3rem;
            font-weight: bold;
            color: ${rating === 'A' ? '#28a745' : rating === 'B' ? '#17a2b8' : rating === 'C' ? '#ffc107' : '#dc3545'};
            background: ${rating === 'A' ? '#d4edda' : rating === 'B' ? '#d1ecf1' : rating === 'C' ? '#fff3cd' : '#f8d7da'};
            padding: 20px 40px;
            border-radius: 50%;
            margin: 20px 0;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 15px 0;
        }
        .stat-item {
            background: white;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #e0e0e0;
        }
        .stat-label {
            font-weight: 600;
            color: #667eea;
            font-size: 0.9rem;
        }
        .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #333;
            margin-top: 5px;
        }
        .skills-list {
            list-style: none;
            padding: 0;
        }
        .skills-list li {
            padding: 10px;
            margin: 5px 0;
            background: white;
            border-radius: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .skill-name {
            font-weight: 600;
        }
        .skill-level {
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: bold;
        }
        .skill-high { background: #d4edda; color: #155724; }
        .skill-medium { background: #fff3cd; color: #856404; }
        .skill-low { background: #f8d7da; color: #721c24; }
        .strength { color: #28a745; font-weight: 600; }
        .need-improvement { color: #dc3545; font-weight: 600; }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            color: #666;
            font-size: 0.9rem;
        }
        @media print {
            body { background: white; margin: 0; }
            .report-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <h1>📊 Student Evaluation Report</h1>
            <div class="subtitle">
                ${this.sessionData.levelName || 'Pre-Algebra Practice'}<br>
                ${this.sessionData.date} • Session Duration: ${sessionDuration} minutes
            </div>
        </div>

        <div class="section">
            <h2>📈 Overall Performance</h2>
            <div style="text-align: center;">
                <div class="grade-badge">${rating}</div>
                <p><strong>Effort Level:</strong> ${effort}</p>
                <p><strong>Accuracy:</strong> ${accuracyPercent}% (${totalCorrect} of ${this.sessionData.totalProblems} problems correct)</p>
            </div>
        </div>

        <div class="section">
            <h2>✅ What They Did Well</h2>
            <ul>
                ${this.sessionData.correctOnFirstTry > 0 ?
                    `<li class="strength">Solved ${this.sessionData.correctOnFirstTry} problem(s) correctly on the first try! Shows strong understanding.</li>` : ''}
                ${this.sessionData.videoWatched ?
                    `<li class="strength">Watched the instructional video - engaged with learning materials.</li>` : ''}
                ${this.sessionData.examplesViewed ?
                    `<li class="strength">Reviewed worked examples - taking time to learn.</li>` : ''}
                ${this.sessionData.skillsShown['Perseverance'] > 0 ?
                    `<li class="strength">Showed perseverance by working through ${this.sessionData.skillsShown['Perseverance']} challenging problem(s).</li>` : ''}
                ${this.sessionData.masteredConcepts.length > 0 ?
                    `<li class="strength">Demonstrated mastery of: ${this.sessionData.masteredConcepts.join(', ')}</li>` : ''}
                ${totalCorrect === this.sessionData.totalProblems && this.sessionData.totalProblems > 0 ?
                    `<li class="strength">Perfect score! Completed all problems correctly.</li>` : ''}
            </ul>
            ${this.sessionData.correctOnFirstTry === 0 && !this.sessionData.videoWatched ?
                `<p><em>Student jumped directly to problems without preparation. Encourage watching videos first.</em></p>` : ''}
        </div>

        <div class="section">
            <h2>📚 Areas That Needed Help</h2>
            <ul>
                ${this.sessionData.stepsNeededRetry > 0 ?
                    `<li class="need-improvement">Needed to retry ${this.sessionData.stepsNeededRetry} step(s) - review these concepts.</li>` : ''}
                ${this.sessionData.hintsUsed > 0 ?
                    `<li>Used ${this.sessionData.hintsUsed} hint(s) during problem solving.</li>` : ''}
                ${this.sessionData.incorrectAttempts > 0 ?
                    `<li class="need-improvement">${this.sessionData.incorrectAttempts} problem(s) not completed correctly.</li>` : ''}
                ${this.sessionData.struggledConcepts.length > 0 ?
                    `<li class="need-improvement">Struggled with: ${this.sessionData.struggledConcepts.join(', ')} - recommend additional practice.</li>` : ''}
                ${!this.sessionData.videoWatched ?
                    `<li class="need-improvement">Did not watch instructional video - encourage video review for better understanding.</li>` : ''}
                ${!this.sessionData.examplesViewed ?
                    `<li class="need-improvement">Did not review worked examples - examples help reinforce concepts.</li>` : ''}
            </ul>
            ${this.sessionData.stepsNeededRetry === 0 && this.sessionData.incorrectAttempts === 0 ?
                `<p class="strength"><em>Excellent work! No major difficulties encountered.</em></p>` : ''}
        </div>

        <div class="section">
            <h2>📊 Detailed Performance Statistics</h2>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-label">Total Problems Attempted</div>
                    <div class="stat-value">${this.sessionData.totalProblems}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Correct on First Try</div>
                    <div class="stat-value">${this.sessionData.correctOnFirstTry}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Correct with Help</div>
                    <div class="stat-value">${this.sessionData.correctWithHelp}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Steps Completed</div>
                    <div class="stat-value">${this.sessionData.stepsCompleted}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Steps Needed Retry</div>
                    <div class="stat-value">${this.sessionData.stepsNeededRetry}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Hints Used</div>
                    <div class="stat-value">${this.sessionData.hintsUsed}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🎯 Skills Demonstrated</h2>
            <ul class="skills-list">
                ${Object.entries(this.sessionData.skillsShown)
                    .filter(([skill, count]) => count > 0)
                    .map(([skill, count]) => {
                        const level = count >= 5 ? 'high' : count >= 2 ? 'medium' : 'low';
                        const label = count >= 5 ? 'Strong' : count >= 2 ? 'Developing' : 'Beginning';
                        return `<li>
                            <span class="skill-name">${skill}</span>
                            <span class="skill-level skill-${level}">${label} (${count}x)</span>
                        </li>`;
                    })
                    .join('')}
            </ul>
            ${Object.values(this.sessionData.skillsShown).every(v => v === 0) ?
                `<p><em>Complete more problems to demonstrate skills.</em></p>` : ''}
        </div>

        <div class="section">
            <h2>💡 Recommendations</h2>
            <ul>
                ${accuracyPercent < 70 ?
                    `<li><strong>Review foundational concepts</strong> - Watch the instructional videos again and work through examples.</li>` : ''}
                ${this.sessionData.hintsUsed > 3 ?
                    `<li><strong>Practice without hints</strong> - Try solving similar problems independently to build confidence.</li>` : ''}
                ${this.sessionData.struggledConcepts.length > 0 ?
                    `<li><strong>Focus on:</strong> ${this.sessionData.struggledConcepts.join(', ')} - These topics need extra attention.</li>` : ''}
                ${!this.sessionData.videoWatched ?
                    `<li><strong>Watch instructional videos</strong> - Videos provide crucial explanations and strategies.</li>` : ''}
                ${accuracyPercent >= 90 ?
                    `<li><strong>Challenge yourself</strong> - Ready to advance to more complex problems!</li>` : ''}
                ${this.sessionData.completedLevel ?
                    `<li><strong>Great job completing the level!</strong> Continue to the next challenge.</li>` :
                    `<li><strong>Keep practicing</strong> - Complete the level to demonstrate mastery.</li>`}
            </ul>
        </div>

        <div class="footer">
            <p><strong>Florida B.E.S.T. Standard MA.8.AR.2.1:</strong> Multi-Step Linear Equations</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p style="color: #667eea; font-weight: 600;">🤖 Generated with Claude Code Learning Platform</p>
        </div>
    </div>
</body>
</html>
        `.trim();

        return report;
    }

    // Download report as HTML file
    downloadReport() {
        const report = this.generateReport();
        const blob = new Blob([report], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        // Format student name for filename (replace spaces with underscores)
        const studentNameFormatted = this.sessionData.studentName.replace(/\s+/g, '_');
        const levelNameFormatted = this.sessionData.levelName?.replace(/\s+/g, '_') || 'Level';
        const dateFormatted = this.sessionData.date.replace(/\//g, '-');

        const filename = `Student_Evaluation_${studentNameFormatted}_${levelNameFormatted}_${dateFormatted}.html`;

        link.href = url;
        link.download = filename;
        link.click();

        URL.revokeObjectURL(url);

        console.log('📥 Student evaluation report downloaded:', filename);
    }

    // Reset for new session
    reset() {
        this.sessionData = {
            studentName: 'Student',
            date: new Date().toLocaleDateString(),
            startTime: new Date(),
            endTime: null,
            totalProblems: 0,
            correctOnFirstTry: 0,
            correctWithHelp: 0,
            incorrectAttempts: 0,
            stepsCompleted: 0,
            stepsNeededRetry: 0,
            hintsUsed: 0,
            conceptsReviewed: [],
            problemLog: [],
            skillsShown: {
                'Two-Step Equations': 0,
                'Combining Like Terms': 0,
                'Distributive Property': 0,
                'Variables on Both Sides': 0,
                'Problem Solving': 0,
                'Perseverance': 0
            },
            struggledConcepts: [],
            masteredConcepts: [],
            videoWatched: false,
            examplesViewed: false,
            completedLevel: false
        };
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.studentReport = new StudentReportGenerator();

    // Check if student name is already stored
    const storedName = localStorage.getItem('studentName');
    if (storedName) {
        window.studentReport.setStudentName(storedName);
        // Hide name modal if it's showing
        document.getElementById('studentNameModal').style.display = 'none';
    } else {
        // Show name input modal
        showStudentNameModal();
    }
});

// Show student name input modal
function showStudentNameModal() {
    const modal = document.getElementById('studentNameModal');
    const input = document.getElementById('studentNameInput');
    const submitBtn = document.getElementById('submitNameBtn');

    modal.style.display = 'flex';

    // Focus input after a brief delay
    setTimeout(() => input.focus(), 100);

    // Handle submit button click
    submitBtn.onclick = () => {
        const name = input.value.trim();
        if (name.length > 0) {
            // Store name
            localStorage.setItem('studentName', name);
            window.studentReport.setStudentName(name);

            // Hide modal
            modal.style.display = 'none';

            console.log('✅ Student name set:', name);
        } else {
            // Show validation message
            input.style.borderColor = '#ff4444';
            input.placeholder = 'Please enter your name';
            setTimeout(() => {
                input.style.borderColor = '#667eea';
            }, 2000);
        }
    };

    // Handle Enter key
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });
}
