import {
    GoogleGenAI,
    HarmCategory,
    HarmBlockThreshold
} from '@google/genai';

// ✅ Move this OUTSIDE main() function
const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    }
];

async function main() {
    // ❌ Remove ai definition from here since it's now above
    const config = {
        thinkingConfig: {
            thinkingBudget: -1,
        },
        responseMimeType: 'text/plain',
        safetySettings, // ✅ Add safety settings here too
    };
    const model = 'gemini-2.5-pro';
    const contents = [
        {
            role: 'user',
            parts: [
                {
                    text: `INSERT_INPUT_HERE`,
                },
            ],
        },
    ];

    const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
    });

    for await (const chunk of response) {
        console.log(chunk.text);
    }
}

main();

// ✅ Now this will work because ai is defined above
export const chatSession = ai.chats.create({
    model: 'gemini-2.5-pro',
    config: {
        safetySettings,
    }
});
// In your @/scripts/index.ts file - add these exports:
export { ai, safetySettings };