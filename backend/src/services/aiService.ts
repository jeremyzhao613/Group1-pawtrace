import OpenAI from 'openai';
import type {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';
import { config } from '../config.js';

type ChatMessage = { role: string; content: unknown };
type DashScopeChatParams = ChatCompletionCreateParamsNonStreaming & {
  enable_thinking?: boolean;
};

const DASHSCOPE_BASE_URL = config.DASHSCOPE_BASE_URL;

export const QWEN_TEXT_MODEL = config.QWEN_TEXT_MODEL;
export const QWEN_VISION_MODEL = config.QWEN_VISION_MODEL;

let dashScopeClient: OpenAI | null = null;

const SYSTEM_PROMPTS: Record<string, string> = {
  c1: 'You are Lily, a friendly student at XJTLU Taicang who owns a corgi named Mocha. You love easy walks, coffee near campus, and casual pet-owner chat.',
  c2: 'You are Eric, a slightly nerdy but kind owner of a Border Collie called Pixel. You enjoy talking about training, running routes and dog sports.',
  c3: 'You are Mia, a calm cat owner. Your Ragdoll cat is called Mochi, and you reply in warm, supportive pet-owner messages.',
  c4: 'You are Leo, an energetic Husky owner named Kiko\'s human. You like planning dog meetups and group walks around Taicang campus.',
};

export function getSystemPrompt(contactId: string, contactProfile?: string): string {
  let basePrompt =
    SYSTEM_PROMPTS[contactId] ||
    'You are a friendly pet owner chatting naturally about pets and campus life.';
  if (contactProfile) {
    basePrompt += `\nUse this profile info to stay consistent:\n${contactProfile}`;
  }
  basePrompt += `
Conversation style:
- Always reply in English, even when the latest user message is written in another language.
- Write 2 to 4 natural chat sentences, not a single generic acknowledgement.
- React to the user's latest message, add one useful pet-related detail, and ask one light follow-up question when it fits.
- Stay in character as this pet owner. Do not mention that you are an AI or a language model.`;
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

export function hasDashScopeKey(): boolean {
  const key = String(config.DASHSCOPE_API_KEY || '').trim();
  return Boolean(key) && key !== 'YOUR_DASHSCOPE_API_KEY_HERE';
}

function getDashScopeClient(): OpenAI {
  if (!hasDashScopeKey()) {
    throw new Error('DASHSCOPE_API_KEY missing');
  }
  if (!dashScopeClient) {
    dashScopeClient = new OpenAI({
      apiKey: config.DASHSCOPE_API_KEY,
      baseURL: DASHSCOPE_BASE_URL,
    });
  }
  return dashScopeClient;
}

function normalizeChatMessages(messages: ChatMessage[]): ChatCompletionMessageParam[] {
  return messages
    .map((msg) => {
      const role = msg.role === 'system' || msg.role === 'assistant' ? msg.role : 'user';
      const content = typeof msg.content === 'string' ? msg.content : msg.content;
      return { role, content } as ChatCompletionMessageParam;
    })
    .filter((msg) => {
      if (typeof msg.content === 'string') return msg.content.trim().length > 0;
      return Boolean(msg.content);
    });
}

export function getLocalAdvice(service: string, profile: Record<string, unknown> = {}): string {
  const petName = typeof profile.mainPetName === 'string' && profile.mainPetName.trim()
    ? profile.mainPetName.trim()
    : 'your pet';
  switch (service) {
    case 'behavior':
      return `
### Psychological Analysis
- ${petName} may be reacting to routine, environment, or attention changes rather than a single fixed cause.

### Training Tips
- Reward calm behavior quickly and keep practice sessions short.
- Record when the behavior appears, what happened before it, and how long it lasts.

### Environmental Changes
- Reduce sudden noise, crowding, or unfamiliar handling during the next few days.

### Practice Routine
- Try two 5-minute sessions daily with one simple cue and a high-value reward.
`;
    case 'diet':
      return `
### Recommended Nutrition
- Keep meals consistent and avoid changing multiple foods at once.

### Daily Meal Plan (Morning/Evening)
- Morning: regular portion plus fresh water.
- Evening: regular portion after activity, with treats counted separately.

### Foods to Avoid
- Avoid chocolate, grapes, onions, alcohol, and high-fat leftovers.

### Hydration & Supplements
- Track water intake and ask a veterinarian before adding supplements.
`;
    case 'health':
    default:
      return `
### Health Checklist
- Check appetite, water intake, stool, energy, breathing, skin, ears, eyes, and gait.

### Vaccination & Care Status
- Keep vaccine, deworming, flea/tick, and recent visit notes updated.

### Flags to Watch
- Contact a veterinarian if symptoms worsen, repeat, or include pain, breathing trouble, vomiting, collapse, or refusal to eat.

### Next Steps
- Save photos, times, and behavior notes so changes are easier to compare.
`;
  }
}

export function getLocalDiagnosis(symptoms = ''): string {
  const symptomText = symptoms.trim()
    ? `The reported symptoms were: ${symptoms.trim()}`
    : 'No symptoms were provided, so this is a general visual-care checklist.';
  return `
### Visual Analysis
- ${symptomText}
- Use this as an observation note only; image quality and angle can hide important details.

### Potential Causes
- Common causes can include irritation, minor injury, stress, diet change, parasites, infection, or environmental exposure.

### Severity Assessment
- Monitor mild, short-lived signs closely.
- Treat breathing issues, collapse, severe pain, repeated vomiting, bleeding, or fast deterioration as urgent.

### Recommended Actions
- Take clear follow-up photos, record timing and behavior, and contact a veterinarian if signs persist or worsen.

**Disclaimer:** This is not a veterinary diagnosis.
`;
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

async function callDashScopeChat(model: string, messages: ChatMessage[]): Promise<string | undefined> {
  const client = getDashScopeClient();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.AI_TIMEOUT_MS);
  try {
    const completion = await client.chat.completions.create(
      {
        model,
        messages: normalizeChatMessages(messages),
        stream: false,
        enable_thinking: config.QWEN_ENABLE_THINKING,
      } as DashScopeChatParams,
      { signal: controller.signal }
    );
    const content = completion.choices?.[0]?.message?.content;
    return typeof content === 'string' && content.trim() ? content.trim() : undefined;
  } finally {
    clearTimeout(timer);
  }
}

export async function callQwen(messages: ChatMessage[]): Promise<string | undefined> {
  return callDashScopeChat(QWEN_TEXT_MODEL, messages);
}

export async function callQwenVision(opts: {
  imageBase64: string;
  mimeType?: string;
  prompt: string;
}): Promise<string | undefined> {
  if (!hasDashScopeKey()) {
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
  return callDashScopeChat(QWEN_VISION_MODEL, messages);
}
