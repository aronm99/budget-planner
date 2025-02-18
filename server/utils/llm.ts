import OpenAI from 'openai';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const runtimeConfig = useRuntimeConfig();

interface ChatCompletionProps {
  modelType?: 'reason' | 'gen';
  prompt: string;
  systemPrompt?: string;
  history?: { role: string, content: string }[];
  jsonSchema?: any;
  name?: string;
}

export async function chatCompletion({ prompt, systemPrompt, history, jsonSchema, name, modelType = 'reason' }: ChatCompletionProps) {
  // const response = await openai.chat.completions.create({
  //   messages: [{ role: 'user', content }],
  //   model: 'gpt-3.5-turbo',
  // });
  
  // return response.choices[0].message.content
  let model: string;
  switch (modelType) {
    case 'reason':
      model = runtimeConfig.reasonModel;
      break;
    case 'gen':
      model = runtimeConfig.genModel;
  }

  const hashedJson = JSON.stringify({
    systemPrompt,
    prompt,
    history,
    jsonSchema,
    model
  });

  const hash = crypto.createHash('sha256').update(hashedJson).digest('hex');

  const cachedLlmResponse = await prisma.lLMCache.findUnique({
    where: { hash },
    select: {
      response: true
    }
  });

  if (cachedLlmResponse) {
    return cachedLlmResponse.response;
  }
  
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
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
          model,
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
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      let llmResponse: any = result.choices[0].message.content;

      if (typeof llmResponse === 'string' && jsonSchema) {
        llmResponse = JSON.parse(llmResponse);
      }
      
      try {
        await prisma.lLMCache.create({
          data: { hash, systemPrompt, prompt, history, jsonSchema, model, response: llmResponse }
        });
      } catch (error) {
        console.log('Skipping cache creation for hash', hash);
      }

      return llmResponse;

    } catch (error: any) {
      const isTimeout = error.name === 'TimeoutError' || 
                       error.message?.includes('timeout') ||
                       error.message?.includes('ETIMEDOUT');
      
      if (!isTimeout || attempt === maxRetries - 1) {
        console.error('Error fetching from LLM', error);
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};