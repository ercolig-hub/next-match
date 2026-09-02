-- CreateTable
CREATE TABLE "match" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "match_user2Id_idx" ON "match"("user2Id");

-- CreateIndex
CREATE UNIQUE INDEX "match_user1Id_user2Id_key" ON "match"("user1Id", "user2Id");

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
