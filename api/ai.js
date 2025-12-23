import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { type, data } = req.body;

    try {
        let prompt = '';
        let systemMessage = '';
        let jsonFormat = false;

        switch (type) {
            case 'quiz':
                systemMessage = `You are an expert coding interviewer. Generate a quiz with 3 Multiple Choice Questions (MCQs) and 1 short coding challenge based on the provided topics. 
                Return ONLY valid JSON in the following format:
                {
                    "mcqs": [
                        {
                            "question": "Question text",
                            "options": ["A", "B", "C", "D"],
                            "correctAnswer": 0,
                            "explanation": "Why this is correct"
                        }
                    ],
                    "codingChallenge": {
                        "title": "Problem Title",
                        "description": "Problem description",
                        "starterCode": "function solution() {}",
                        "testCases": [{"input": "...", "output": "..."}]
                    }
                }`;
                prompt = `Topics: ${data.topics.join(', ')}. Difficulty: ${data.difficulty || 'Medium'}.`;
                jsonFormat = true;
                break;

            case 'review':
                systemMessage = `You are a senior software engineer. Review the following code. Provide constructive feedback, point out potential bugs, time complexity analysis, and a better approach if applicable.
                Return ONLY valid JSON in the following format:
                {
                    "bugs": ["bug 1", "bug 2"],
                    "feedback": "General feedback",
                    "complexity": "O(n)",
                    "betterApproach": "Description of better approach"
                }`;
                prompt = `Problem: ${data.problemTitle}\nCode:\n${data.code}`;
                jsonFormat = true;
                break;

            case 'hint':
                systemMessage = `You are a helpful coding mentor. Provide a subtle hint for the problem without giving away the full solution.`;
                prompt = `Problem: ${data.problemTitle}\nDescription: ${data.problemDescription}\nCurrent Code:\n${data.code}`;
                break;

            case 'rewrite_notes':
                systemMessage = `You are an expert technical writer. Rewrite the following notes in clean, structured Markdown. 
                - Improve clarity, grammar, and flow.
                - Use headings, bullet points, and code blocks where appropriate.
                - Keep the tone professional and educational.
                - Do not lose any technical details.`;
                prompt = `Notes to rewrite:\n${data.notes}`;
                break;

            default:
                return res.status(400).json({ error: 'Invalid request type' });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: prompt }
            ],
            model: 'openai/gpt-oss-120b',
            temperature: 0.7,
            response_format: jsonFormat ? { type: 'json_object' } : { type: 'text' },
        });

        const result = completion.choices[0]?.message?.content;

        if (jsonFormat) {
            res.status(200).json(JSON.parse(result));
        } else {
            res.status(200).json({ message: result });
        }

    } catch (error) {
        console.error('AI API Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
