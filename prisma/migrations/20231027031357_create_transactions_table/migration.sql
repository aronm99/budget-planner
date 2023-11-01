-- CreateTable
CREATE TABLE "Transactions" (
    "pId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "userPId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("pId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_id_key" ON "Transactions"("id");

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_userPId_fkey" FOREIGN KEY ("userPId") REFERENCES "User"("pId") ON DELETE RESTRICT ON UPDATE CASCADE;
