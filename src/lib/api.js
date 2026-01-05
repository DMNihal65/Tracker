// Legacy API functions for old progress table
export async function fetchProgress() {
    const response = await fetch('/api/progress');
    if (!response.ok) {
        throw new Error('Failed to fetch progress');
    }
    return response.json();
}

export async function updateProgress(questionId, completed, notes, code, extra = {}) {
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
            ...extra
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to update progress');
    }
    return response.json();
}

// New API functions for progress_v2 table (90-day calendar)
export async function fetchProgressV2() {
    const response = await fetch('/api/progress_v2');
    if (!response.ok) {
        throw new Error('Failed to fetch progress');
    }
    return response.json();
}

export async function updateProgressV2(questionId, completed, notes, code, extra = {}) {
    const response = await fetch('/api/progress_v2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            question_id: questionId,
            completed,
            notes,
            code,
            ...extra
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to update progress');
    }
    return response.json();
}
