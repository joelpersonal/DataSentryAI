// Configure Ollama URL
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'tinyllama'; // Light, fast model for demo

/**
 * Generate completion from Ollama
 * @param {string} prompt 
 * @param {boolean} jsonMode 
 * @returns {Promise<string|object>}
 */
const checkModelAvailability = async () => {
    try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (!response.ok) return false;
        const data = await response.json();
        return data.models.some(m => m.name.includes(MODEL_NAME));
    } catch (error) {
        return false;
    }
};

const generateOllama = async (prompt, jsonMode = false) => {
    try {
        // Fail fast if model isn't ready
        const isAvailable = await checkModelAvailability();
        if (!isAvailable) {
            console.log(`ℹ️ Model '${MODEL_NAME}' not ready. Using fallback.`);
            throw new Error("Model not available");
        }

        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: prompt,
                stream: false,
                format: jsonMode ? 'json' : undefined
            }),
            signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
            throw new Error(`Ollama API Error: ${response.statusText}`);
        }

        const data = await response.json();

        if (jsonMode) {
            try {
                return typeof data.response === 'string' ? JSON.parse(data.response) : data.response;
            } catch (e) {
                console.warn("Ollama JSON parse error, returning raw:", e);
                return data.response;
            }
        }
        return data.response;
    } catch (error) {
        // Graceful fallback for demo
        if (jsonMode) return { normalized: "Mock Industry", function: "Sales", confidence: 0.85 };
        return "AI analysis unavailable (Model downloading...)";
    }
};

const normalizeIndustryAI = async (industry) => {
    const prompt = `Normalize this industry name to a standard SIC/NAICS category. Return JSON: {"normalized": "Industry Name"}. Input: "${industry}"`;
    return await generateOllama(prompt, true);
};

const mapJobFunctionAI = async (title) => {
    const prompt = `Map this job title to a standard function (Sales, Engineering, Marketing, Finance, HR, Operations, Legal, Executive, Product). Return JSON: {"function": "Function Name", "confidence": 0.8, "reason": "reason"}. Input: "${title}"`;
    return await generateOllama(prompt, true);
};

const explainIssueAI = async (recordStr) => {
    const prompt = `Explain why this record is invalid and suggest a fix in JSON. Input: ${recordStr}`;
    return await generateOllama(prompt, false);
};

module.exports = {
    generateOllama,
    normalizeIndustryAI,
    mapJobFunctionAI,
    explainIssueAI
};
