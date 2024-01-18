import OpenAI from 'openai';

const runtimeConfig = useRuntimeConfig();

const openai = new OpenAI({
  apiKey: runtimeConfig.openAiApiKey, // This is the default and can be omitted
});

export async function chatCompletion(content: string) {
  const response = await openai.chat.completions.create({
    messages: [{ role: 'user', content }],
    model: 'gpt-3.5-turbo',
  });
  
  return response.choices[0].message.content
};