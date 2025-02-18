-- CreateTable
CREATE TABLE "LLMCache" (
    "pId" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "systemPrompt" TEXT,
    "prompt" TEXT NOT NULL,
    "history" JSONB,
    "response" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LLMCache_pkey" PRIMARY KEY ("pId")
);

-- CreateIndex
CREATE UNIQUE INDEX "LLMCache_hash_key" ON "LLMCache"("hash");
