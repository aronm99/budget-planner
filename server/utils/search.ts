import { tavily, TavilySearchResponse } from '@tavily/core'
import { PrismaClient } from "@prisma/client";
import crypto from 'crypto';

const prisma = new PrismaClient();

const runtimeConfig = useRuntimeConfig();

const client = tavily({ apiKey: runtimeConfig.tavilyApiKey });

export function getTavilyClient() {
  return client;
}

export function getSearchHash(searchQuery: string) {
  return crypto.createHash('sha256').update(searchQuery).digest('hex');
}

export async function getSearchResults(searchQuery: string, includeAnswer: boolean = false) {
  const hash = getSearchHash(searchQuery);
  let searchResults: TavilySearchResponse;
  const existingResults = await prisma.searchResults.findUnique({
    where: { hash },
    select: {
      searchResults: true
    }
  });

  if (!existingResults) {
    try {
      searchResults = await client.search(searchQuery, {
        includeAnswer
      });
      
      try {
        await prisma.searchResults.create({
          data: { hash, searchQuery, searchResults }
        });
      } catch (error) {
        console.log('Skipping tavily cache creation for hash', hash);
      }
    } catch (error) {
      const err = error as any;
      if ('response' in err && 'data' in err.response) {
        console.error('Error fetching from Tavily', err.response.data, searchQuery);
        throw err.response.data;
      } else {
        console.error('Error fetching from Tavily', error);
        throw error;
      }
    }
  } else {
    searchResults = existingResults.searchResults as TavilySearchResponse;
  }

  return searchResults;
}

