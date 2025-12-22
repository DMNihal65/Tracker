export async function fetchProgress() {
    const response = await fetch('/api/progress');
    if (!response.ok) {
        throw new Error('Failed to fetch progress');
    }
    return response.json();
}

export async function updateProgress(questionId, completed, notes, code) {
    const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            question_id: questionId,
            completed,
            notes,
            code,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to update progress');
    }
    return response.json();
}
