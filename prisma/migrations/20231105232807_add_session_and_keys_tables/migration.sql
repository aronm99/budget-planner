-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profile_image" TEXT;

-- CreateTable
CREATE TABLE "user_session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "active_expires" BIGINT NOT NULL,
    "idle_expires" BIGINT NOT NULL,

    CONSTRAINT "user_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_key" (
    "id" TEXT NOT NULL,
    "hashed_password" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "user_key_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_session_id_key" ON "user_session"("id");

-- CreateIndex
CREATE INDEX "user_session_user_id_idx" ON "user_session"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_key_id_key" ON "user_key"("id");

-- CreateIndex
CREATE INDEX "user_key_user_id_idx" ON "user_key"("user_id");

-- AddForeignKey
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_key" ADD CONSTRAINT "user_key_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
