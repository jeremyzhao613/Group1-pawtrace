-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT,
    "displayName" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "campus" TEXT NOT NULL DEFAULT '',
    "contact" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Pet',
    "breed" TEXT NOT NULL DEFAULT 'Unknown',
    "age" TEXT NOT NULL DEFAULT 'Unknown',
    "gender" TEXT NOT NULL DEFAULT 'Unknown',
    "avatar" TEXT NOT NULL,
    "traits" JSONB NOT NULL DEFAULT '[]',
    "health" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationPoint" (
    "id" TEXT NOT NULL,
    "source" TEXT,
    "tagId" TEXT,
    "deviceId" TEXT,
    "userId" TEXT,
    "timestamp" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "altitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LastLocation" (
    "userId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "timestamp" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'app-gps',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LastLocation_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "HealthMeasurement" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT,
    "userId" TEXT,
    "tagId" TEXT,
    "timestamp" TEXT NOT NULL,
    "heartRateBpm" DOUBLE PRECISION,
    "soundLevelDb" DOUBLE PRECISION,
    "batteryPct" DOUBLE PRECISION,
    "steps" DOUBLE PRECISION,
    "tempC" DOUBLE PRECISION,
    "accelPeak" DOUBLE PRECISION,
    "activity" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "locationAccuracy" DOUBLE PRECISION,
    "locationTimestamp" TEXT,
    "quality" TEXT,
    "metadata" JSONB,
    "receivedAt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StickyNote" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StickyNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitoringUserProfile" (
    "id" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileJson" JSONB NOT NULL,
    "personalInfoJson" JSONB,
    "metadataJson" JSONB,

    CONSTRAINT "MonitoringUserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitoringPetProfile" (
    "id" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerLabel" TEXT NOT NULL,
    "petJson" JSONB NOT NULL,
    "metadataJson" JSONB,

    CONSTRAINT "MonitoringPetProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitoringPurchase" (
    "id" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purchaseJson" JSONB NOT NULL,
    "metadataJson" JSONB,

    CONSTRAINT "MonitoringPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitoringChatLog" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "messagesJson" JSONB NOT NULL,
    "reply" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonitoringChatLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "ChatMessage_contactId_idx" ON "ChatMessage"("contactId");

-- CreateIndex
CREATE INDEX "LocationPoint_userId_idx" ON "LocationPoint"("userId");

-- CreateIndex
CREATE INDEX "LocationPoint_deviceId_idx" ON "LocationPoint"("deviceId");

-- CreateIndex
CREATE INDEX "HealthMeasurement_userId_idx" ON "HealthMeasurement"("userId");

-- CreateIndex
CREATE INDEX "HealthMeasurement_deviceId_idx" ON "HealthMeasurement"("deviceId");

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LastLocation" ADD CONSTRAINT "LastLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

