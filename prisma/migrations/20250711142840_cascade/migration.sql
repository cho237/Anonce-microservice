-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Anonce" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Anonce_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Anonce" ("authorId", "content", "createdAt", "id", "title", "updatedAt") SELECT "authorId", "content", "createdAt", "id", "title", "updatedAt" FROM "Anonce";
DROP TABLE "Anonce";
ALTER TABLE "new_Anonce" RENAME TO "Anonce";
CREATE TABLE "new_Read" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "anonceId" TEXT NOT NULL,
    "readAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Read_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Read_anonceId_fkey" FOREIGN KEY ("anonceId") REFERENCES "Anonce" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Read" ("anonceId", "id", "readAt", "userId") SELECT "anonceId", "id", "readAt", "userId" FROM "Read";
DROP TABLE "Read";
ALTER TABLE "new_Read" RENAME TO "Read";
CREATE UNIQUE INDEX "Read_userId_anonceId_key" ON "Read"("userId", "anonceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
