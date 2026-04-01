const config = require('../config');

const SYSTEM_PROMPTS = {
  c1: "You are Lily, a friendly student at XJTLU Taicang who owns a corgi named Mocha. You love easy walks, coffee near campus, and short English chat messages.",
  c2: "You are Eric, a slightly nerdy but kind owner of a Border Collie called Pixel. You enjoy talking about training, running routes and dog sports in short English messages.",
  c3: "You are Mia, a calm cat owner. Your Ragdoll cat is called Mochi, and you reply in warm, short, supportive English messages.",
  c4: "You are Leo, an energetic Husky owner named Kiko's human. You like planning dog meetups and group walks around Taicang campus.",
};

function getSystemPrompt(contactId, contactProfile) {
  let basePrompt =
    SYSTEM_PROMPTS[contactId] ||
    "You are a friendly pet owner chatting in short, simple English sentences about pets and campus life.";
  if (contactProfile) {
    basePrompt += `\nUse this profile info to stay consistent:\n${contactProfile}`;
  }
  return basePrompt;
}

function buildPetPredictionPrompt(profile = {}) {
  const owner = profile.displayName || 'Pet owner';
  const starSign = profile.starSign || 'Unknown star sign';
  const petName = profile.petName || 'their pet';
  const petType = profile.petType || 'companion';
  const petBirthday = profile.petBirthday || 'Unknown birthday';
  const notes = profile.petNotes || 'No extra notes';
  return `${owner} is under the sign of ${starSign}. Main pet: ${petName} (${petType}), birthday: ${petBirthday}. Notes: ${notes}.
Share an upbeat, practical prediction (max 3 short sentences) about how ${petName} might behave this week and how the owner can support them on campus.`;
}

function getLocalPetPrediction(profile = {}) {
  const petName = profile.petName || 'Your pet';
  const starSign = profile.starSign ? `${profile.starSign} energy` : 'campus energy';
  const moods = [
    'will crave extra sunlight around the quad',
    'might ask for surprise snack breaks',
    'could bounce between zoomies and cuddle mode',
    'is likely to make a new friend near the café',
    'will pay close attention to your tone of voice',
  ];
  const focus = moods[Math.floor(Math.random() * moods.length)];
  return `${petName} ${focus} thanks to ${starSign}. Sprinkle in a longer walk and a familiar toy to keep them grounded.`;
}

function buildGeminiAdvicePrompt(service = 'health', context = '', profile = {}, pets = []) {
  const owner = profile.displayName || 'Owner';
  const petLine = profile.mainPetName ? `Pet: ${profile.mainPetName} (${profile.mainPetType || 'Pet'})` : '';
  const notes = profile.mainPetNotes ? `Notes: ${profile.mainPetNotes}` : '';
  const extraPets =
    Array.isArray(pets) && pets.length
      ? `Other pets: ${pets
          .slice(0, 3)
          .map((p) => `${p.name || p.type || 'Pet'} (${p.type || p.breed || ''})`)
          .join('; ')}`
      : '';
  const baseContext = [petLine, notes, extraPets].filter(Boolean).join('\n');
  switch (service) {
    case 'behavior':
      return `
You are a pet behavior specialist. Analyze the behavior and share positive reinforcement drills.
Owner: ${owner}
${baseContext}
User context: "${context || 'No extra details provided'}"

Respond in Markdown:
### 🧠 Psychological Analysis
### 🐕 Training Tips
### 🏠 Environmental Changes
### 🗓️ Practice Routine
`;
    case 'diet':
      return `
You are a pet nutritionist. Suggest balanced diet and hydration tips.
Owner: ${owner}
${baseContext}
User context: "${context || 'No extra details provided'}"

Respond in Markdown:
### 🥩 Recommended Nutrition
### 🥣 Daily Meal Plan (Morning/Evening)
### 🚫 Foods to Avoid
### 💧 Hydration & Supplements
`;
    case 'health':
    default:
      return `
You are a veterinary assistant. Provide a general health checklist and preventive care.
Owner: ${owner}
${baseContext}
User context: "${context || 'No extra details provided'}"

Respond in Markdown:
### 📋 Health Checklist
### 💉 Vaccination & Care Status
### 🚩 Flags to Watch
### 🩺 Next Steps
`;
  }
}

function buildQwenAdviceMessages(service = 'health', context = '', profile = {}, pets = []) {
  const system = 'You are a concise, friendly pet assistant. Reply in Markdown with clear sections and short bullets.';
  const prompt = buildGeminiAdvicePrompt(service, context, profile, pets);
  return [
    { role: 'system', content: system },
    { role: 'user', content: prompt },
  ];
}

async function callQwen(messages = []) {
  if (!config.DASHSCOPE_API_KEY || config.DASHSCOPE_API_KEY === 'YOUR_DASHSCOPE_API_KEY_HERE') {
    throw new Error('DASHSCOPE_API_KEY missing');
  }
  const payload = { model: 'qwen-plus', messages };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.AI_TIMEOUT_MS);
  const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.DASHSCOPE_API_KEY}`,
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  });
  clearTimeout(timer);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Qwen API error');
  }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content;
}

async function callQwenVision({ imageBase64, mimeType, prompt }) {
  if (!config.DASHSCOPE_API_KEY || config.DASHSCOPE_API_KEY === 'YOUR_DASHSCOPE_API_KEY_HERE') {
    throw new Error('DASHSCOPE_API_KEY missing');
  }
  const dataUrl = `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;
  const messages = [
    {
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: dataUrl } },
        { type: 'text', text: prompt },
      ],
    },
  ];
  const payload = { model: 'qwen-vl-plus', messages };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.AI_TIMEOUT_MS);
  const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.DASHSCOPE_API_KEY}`,
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  });
  clearTimeout(timer);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Qwen-VL API error');
  }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content;
}

async function callGeminiVision({ imageBase64, mimeType, prompt }) {
  if (!config.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing');
  }
  const safeMime = mimeType || 'image/jpeg';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.AI_TIMEOUT_MS);

  const body = {
    contents: [
      {
        parts: [{ inlineData: { mimeType: safeMime, data: imageBase64 } }, { text: prompt }],
      },
    ],
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': config.GEMINI_API_KEY,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      }
    );
    clearTimeout(timer);
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Gemini Vision API error');
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join('\n\n');
    return text;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

module.exports = {
  getSystemPrompt,
  buildPetPredictionPrompt,
  getLocalPetPrediction,
  buildGeminiAdvicePrompt,
  buildQwenAdviceMessages,
  callQwen,
  callQwenVision,
  callGeminiVision,
};
