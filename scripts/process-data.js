import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDataPath = path.join(__dirname, '../src/seed_data.json');
const outputPath = path.join(__dirname, '../src/data/questions.json');

// Create src/data directory if it doesn't exist
const dataDir = path.dirname(outputPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

// Helper to determine difficulty based on week/phase
function getDifficulty(day) {
    if (day <= 21) return 'Easy'; // Weeks 1-3
    if (day <= 41) return 'Medium'; // Weeks 4-6
    if (day <= 58) return 'Hard'; // Weeks 7-8
    return 'Mixed'; // Final weeks
}

const processedData = seedData.map((dayItem) => {
    const questions = [];
    const week = Math.ceil(dayItem.day / 7);

    // Parse coding questions
    if (dayItem.coding_questions) {
        // Handle special cases like "MOCK TEST" or "REVISION"
        if (dayItem.coding_questions.includes('MOCK TEST') || dayItem.coding_questions.includes('REVISION') || dayItem.coding_questions.includes('FINAL ASSESSMENT')) {
            questions.push({
                id: `d${dayItem.day}-special`,
                title: dayItem.coding_questions,
                type: 'special',
                topic: dayItem.theme,
                difficulty: 'N/A'
            });
        } else {
            // Split by comma, but be careful about parentheses
            const parts = dayItem.coding_questions.split(/,(?![^(]*\))/).map(s => s.trim()).filter(s => s);
            parts.forEach((part, index) => {
                questions.push({
                    id: `d${dayItem.day}-q${index + 1}`,
                    title: part,
                    type: 'coding',
                    topic: dayItem.theme,
                    difficulty: getDifficulty(dayItem.day)
                });
            });
        }
    }

    // Parse system design
    if (dayItem.system_design) {
        questions.push({
            id: `d${dayItem.day}-sd`,
            title: dayItem.system_design,
            type: 'system-design',
            topic: 'System Design',
            difficulty: getDifficulty(dayItem.day) // Rough approximation
        });
    }

    return {
        ...dayItem,
        week,
        questions
    };
});

fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2));
console.log(`Processed ${processedData.length} days. Data saved to ${outputPath}`);
