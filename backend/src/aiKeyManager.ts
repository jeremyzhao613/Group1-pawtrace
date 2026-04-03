export function getAiKeys(): { DASHSCOPE_API_KEY: string } {
  return {
    DASHSCOPE_API_KEY: process.env.DASHSCOPE_API_KEY || '',
  };
}
