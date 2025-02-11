import OpenAI from 'openai';

const runtimeConfig = useRuntimeConfig();

export async function chatCompletion(prompt: string, systemPrompt?: string, history?: { role: string, content: string }[], jsonSchema?: any, name?: string) {
  // const response = await openai.chat.completions.create({
  //   messages: [{ role: 'user', content }],
  //   model: 'gpt-3.5-turbo',
  // });
  
  // return response.choices[0].message.content

  const response = await fetch('http://localhost:1234/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...(history ? history : []),
        { role: 'user', content: prompt },
      ],
      model: runtimeConfig.model,
      stream: false,
      response_format: jsonSchema ? {
        type: 'json_schema',
        json_schema: {
          name: name || 'response',
          strict: 'true',
          schema: jsonSchema
        }
      } : undefined
    })
  });

  const result = await response.json();

  if (typeof result.choices[0].message.content === 'string' && jsonSchema) {
    return JSON.parse(result.choices[0].message.content);
  }
  return result.choices[0].message.content;
};