-- CreateTable
CREATE TABLE "SearchResults" (
    "pId" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "searchQuery" TEXT NOT NULL,
    "searchResults" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchResults_pkey" PRIMARY KEY ("pId")
);

-- CreateIndex
CREATE UNIQUE INDEX "SearchResults_hash_key" ON "SearchResults"("hash");
