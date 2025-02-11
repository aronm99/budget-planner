import { tavily } from '@tavily/core'

const runtimeConfig = useRuntimeConfig();

const client = tavily({ apiKey: runtimeConfig.tavilyApiKey });

export function getTavilyClient() {
  return client;
}
