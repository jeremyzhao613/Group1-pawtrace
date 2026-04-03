import { config } from '../config.js';

const SYSTEM_PROMPTS: Record<string, string> = {
  c1: 'You are Lily, a friendly student at XJTLU Taicang who owns a corgi named Mocha. You love easy walks, coffee near campus, and short English chat messages.',
  c2: 'You are Eric, a slightly nerdy but kind owner of a Border Collie called Pixel. You enjoy talking about training, running routes and dog sports in short English messages.',
  c3: 'You are Mia, a calm cat owner. Your Ragdoll cat is called Mochi, and you reply in warm, short, supportive English messages.',
  c4: 'You are Leo, an energetic Husky owner named Kiko\'s human. You like planning dog meetups and group walks around Taicang campus.',
};

export function getSystemPrompt(contactId: string, contactProfile?: string): string {
  let basePrompt =
    SYSTEM_PROMPTS[contactId] ||
    'You are a friendly pet owner chatting in short, simple English sentences about pets and campus life.';
  if (contactProfile) {
    basePrompt += `\nUse this profile info to stay consistent:\n${contactProfile}`;
  }
  return basePrompt;
}

export function buildPetPredictionPrompt(profile: Record<string, string> = {}): string {
  const owner = profile.displayName || 'Pet owner';
  const starSign = profile.starSign || 'Unknown star sign';
  const petName = profile.petName || 'their pet';
  const petType = profile.petType || 'companion';
  const petBirthday = profile.petBirthday || 'Unknown birthday';
  const notes = profile.petNotes || 'No extra notes';
  return `${owner} is under the sign of ${starSign}. Main pet: ${petName} (${petType}), birthday: ${petBirthday}. Notes: ${notes}.
Share an upbeat, practical prediction (max 3 short sentences) about how ${petName} might behave this week and how the owner can support them on campus.`;
}

export function getLocalPetPrediction(profile: Record<string, string> = {}): string {
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

export function buildAdvicePrompt(
  service: string,
  context: string,
  profile: Record<string, unknown>,
  pets: unknown[]
): string {
  const owner = (profile.displayName as string) || 'Owner';
  const petLine = profile.mainPetName ? `Pet: ${profile.mainPetName} (${profile.mainPetType || 'Pet'})` : '';
  const notes = profile.mainPetNotes ? `Notes: ${profile.mainPetNotes}` : '';
  const extraPets =
    Array.isArray(pets) && pets.length
      ? `Other pets: ${pets
          .slice(0, 3)
          .map((p) => {
            const x = p as { name?: string; type?: string; breed?: string };
            return `${x.name || x.type || 'Pet'} (${x.type || x.breed || ''})`;
          })
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
### Psychological Analysis
### Training Tips
### Environmental Changes
### Practice Routine
`;
    case 'diet':
      return `
You are a pet nutritionist. Suggest balanced diet and hydration tips.
Owner: ${owner}
${baseContext}
User context: "${context || 'No extra details provided'}"

Respond in Markdown:
### Recommended Nutrition
### Daily Meal Plan (Morning/Evening)
### Foods to Avoid
### Hydration & Supplements
`;
    case 'health':
    default:
      return `
You are a veterinary assistant. Provide a general health checklist and preventive care.
Owner: ${owner}
${baseContext}
User context: "${context || 'No extra details provided'}"

Respond in Markdown:
### Health Checklist
### Vaccination & Care Status
### Flags to Watch
### Next Steps
`;
  }
}

export function buildAdviceMessages(
  service: string,
  context: string,
  profile: Record<string, unknown>,
  pets: unknown[]
): { role: string; content: string }[] {
  const system = 'You are a concise, friendly pet assistant. Reply in Markdown with clear sections and short bullets.';
  const prompt = buildAdvicePrompt(service, context, profile, pets);
  return [
    { role: 'system', content: system },
    { role: 'user', content: prompt },
  ];
}

export async function callQwen(messages: { role: string; content: unknown }[]): Promise<string | undefined> {
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
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data?.choices?.[0]?.message?.content;
}

export async function callQwenVision(opts: {
  imageBase64: string;
  mimeType?: string;
  prompt: string;
}): Promise<string | undefined> {
  if (!config.DASHSCOPE_API_KEY || config.DASHSCOPE_API_KEY === 'YOUR_DASHSCOPE_API_KEY_HERE') {
    throw new Error('DASHSCOPE_API_KEY missing');
  }
  const dataUrl = `data:${opts.mimeType || 'image/jpeg'};base64,${opts.imageBase64}`;
  const messages = [
    {
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: dataUrl } },
        { type: 'text', text: opts.prompt },
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
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data?.choices?.[0]?.message?.content;
}
