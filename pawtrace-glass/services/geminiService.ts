/**
 * Converts a File object to a Base64 string suitable for the Gemini API.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,") to get raw base64
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Calls the backend for visual veterinary analysis.
 */
export const analyzePetHealth = async (
  imageBase64: string,
  mimeType: string,
  symptoms: string
): Promise<string> => {
  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3000';
  const url = `${backendBaseUrl}/api/ai/gemini-diagnosis`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, symptoms })
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Backend diagnosis failed');
  }

  const data = await response.json();
  return data?.result || "Unable to generate analysis. Please try a clearer photo.";
};

/**
 * Generates text-based advice for Health, Behavior, or Diet (via backend).
 */
export const generatePetAdvice = async (
  type: 'health' | 'behavior' | 'diet',
  context: string
): Promise<string> => {
  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3000';
  const url = `${backendBaseUrl}/api/ai/gemini-advice`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service: type,
      context,
      profile: {},
      pets: []
    })
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Backend advice failed');
  }

  const data = await response.json();
  return data?.result || 'Unable to generate advice at this time.';
};