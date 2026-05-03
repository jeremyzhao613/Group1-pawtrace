import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const targetUsers = 107;
const suzhouUsers = 75;
const demoPrefix = 'demo-monitor';
const password = 'demo123';
const seedSource = 'demo-monitor-seed-v2';

const firstNames = [
  'Yiran', 'Minghao', 'Zihan', 'Jiaqi', 'Haoran', 'Yuxin', 'Siyu', 'Chenxi',
  'Xinyi', 'Zeyu', 'Ruoxi', 'Jingyi', 'Yuchen', 'Qianwen', 'Haoyu', 'Shiyi',
  'Wenjie', 'Yutong', 'Kexin', 'Junhao', 'Anqi', 'Yiming', 'Xuan', 'Mohan',
  'Rui', 'Jiarui', 'Xiaotong', 'Tianyi', 'Yue', 'Zimo', 'Leyi', 'Zhuo',
];
const lastNames = [
  'Chen', 'Li', 'Wang', 'Zhang', 'Liu', 'Xu', 'Zhao', 'Wu', 'Zhou', 'Sun',
  'Gu', 'Ma', 'Hu', 'Gao', 'Lin', 'Shen', 'Tang', 'Jiang', 'Qian', 'Fang',
];
const suzhouRegions = [
  'Suzhou SIP', 'Suzhou Gusu', 'Suzhou Wuzhong', 'Suzhou Xiangcheng',
  'Suzhou New District', 'Suzhou Wujiang', 'Suzhou Kunshan', 'Suzhou Taicang',
];
const otherRegions = [
  'Shanghai Xuhui', 'Shanghai Pudong', 'Nanjing Gulou', 'Nanjing Jiangning',
  'Hangzhou Xihu', 'Hangzhou Binjiang', 'Wuxi Binhu', 'Taicang Downtown',
  'Beijing Haidian', 'Chengdu High-Tech',
];
const contacts = ['WeChat', 'Email', 'Phone'];
const petNames = [
  'Mocha', 'Pixel', 'Mochi', 'Kiko', 'Luna', 'Nori', 'Biscuit', 'Coco',
  'Milo', 'Taro', 'Dudu', 'Pudding', 'Lucky', 'Nana', 'Dango', 'Cookie',
];
const petTypes = ['Dog', 'Cat', 'Rabbit'];
const breeds = [
  'Corgi', 'Border Collie', 'Ragdoll', 'Siamese', 'Shiba', 'Mixed',
  'Lop Rabbit', 'Golden Retriever', 'British Shorthair', 'Poodle',
];
const products = [
  { name: 'PawTrace Smart Collar', price: 399.8, type: 'product' },
  { name: 'GPS Tag Battery Pack', price: 88.6, type: 'product' },
  { name: 'Pet Care Report Plus Plan', price: 38.9, type: 'subscription' },
  { name: 'Premium AI Care Renewal', price: 58.7, type: 'subscription' },
  { name: 'Campus Meet Vet Voucher', price: 128.5, type: 'product' },
  { name: 'Telemetry Cloud Storage Add-on', price: 18.8, type: 'subscription' },
  { name: 'Reflective Collar Accessory', price: 46.7, type: 'product' },
];
const chatTopics = [
  'My pet has been eating less than usual after the rainy weekend.',
  'Can you help plan a weekly nutrition schedule with lighter dinners?',
  'The GPS collar sent a lost alert near the Suzhou SIP lakeside path.',
  'My dog barks for about 7.5 minutes when I leave the apartment.',
  'Can we arrange a playdate with nearby pets this Friday evening?',
  'The M5Stack reading shows a higher heart-rate trend after a long walk.',
  'The battery dropped from 71.4% to 46.8% faster than yesterday.',
  'Could the care report compare sleep time and activity for this week?',
];
const aiReplies = [
  'PawTrace suggests a 24-hour observation window, hydration checks, and a lighter evening meal.',
  'The pattern looks activity-related. Reduce walk intensity by about 12% and recheck tomorrow.',
  'Set a smaller geofence around the usual route and keep the collar charged above 42%.',
  'Use a short departure routine and log the next two barking windows for comparison.',
  'The profile matches nearby low-risk companions. Keep the first meeting under 18 minutes.',
  'The reading is elevated but not isolated. Compare it with temperature and recent steps.',
];
const cityCenters: Record<string, { lat: number; lon: number }> = {
  Suzhou: { lat: 31.2989, lon: 120.5853 },
  Shanghai: { lat: 31.2304, lon: 121.4737 },
  Nanjing: { lat: 32.0603, lon: 118.7969 },
  Hangzhou: { lat: 30.2741, lon: 120.1551 },
  Wuxi: { lat: 31.4912, lon: 120.3119 },
  Taicang: { lat: 31.4591, lon: 121.1298 },
  Beijing: { lat: 39.9042, lon: 116.4074 },
  Chengdu: { lat: 30.5728, lon: 104.0668 },
};

function pick<T>(list: T[], index: number): T {
  return list[index % list.length];
}

function randomUnit(index: number, salt = 0) {
  const x = Math.sin(index * 9301 + salt * 49297) * 233280;
  return x - Math.floor(x);
}

function rounded(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function jitter(index: number, salt: number, min: number, max: number, digits = 1) {
  return rounded(min + randomUnit(index, salt) * (max - min), digits);
}

function intJitter(index: number, salt: number, min: number, max: number) {
  return Math.floor(min + randomUnit(index, salt) * (max - min + 1));
}

function daysAgo(days: number, hourOffset = 0, minuteOffset = 0) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000 + hourOffset * 60 * 60 * 1000 + minuteOffset * 60 * 1000);
}

function isoDaysAgo(days: number, hourOffset = 0, minuteOffset = 0) {
  return daysAgo(days, hourOffset, minuteOffset).toISOString();
}

function demoUserId(index: number) {
  return `${demoPrefix}-user-${String(index).padStart(3, '0')}`;
}

function demoPetId(userIndex: number, petIndex: number) {
  return `${demoPrefix}-pet-${String(userIndex).padStart(3, '0')}-${petIndex}`;
}

function cityFromRegion(region: string) {
  return region.split(' ')[0] || region;
}

function regionForIndex(index: number) {
  const isSuzhou = ((index * 37) % targetUsers) < suzhouUsers;
  return isSuzhou
    ? pick(suzhouRegions, index * 5)
    : pick(otherRegions, index * 7);
}

function coordinatesFor(city: string, index: number, sampleIndex = 0) {
  const center = cityCenters[city] || cityCenters.Suzhou;
  return {
    lat: rounded(center.lat + jitter(index + sampleIndex, 41, -0.035, 0.035, 5), 5),
    lon: rounded(center.lon + jitter(index + sampleIndex, 42, -0.035, 0.035, 5), 5),
  };
}

function displayNameFor(index: number) {
  return `${pick(lastNames, index * 5)} ${pick(firstNames, index * 11)}`;
}

function usernameFor(index: number, city: string) {
  const prefix = city === 'Suzhou' ? 'sz' : city.slice(0, 2).toLowerCase();
  return `pt-${prefix}-${String(index).padStart(3, '0')}`;
}

async function resetDemoData() {
  const whereId = { id: { startsWith: demoPrefix } };
  const whereUserId = { userId: { startsWith: demoPrefix } };
  const [
    monitoringChatLogs,
    monitoringPurchases,
    monitoringPetProfiles,
    monitoringUserProfiles,
    chatMessages,
    healthMeasurements,
    locationPoints,
    lastLocations,
    pets,
    users,
  ] = await prisma.$transaction([
    prisma.monitoringChatLog.deleteMany({ where: whereId }),
    prisma.monitoringPurchase.deleteMany({ where: whereId }),
    prisma.monitoringPetProfile.deleteMany({ where: whereId }),
    prisma.monitoringUserProfile.deleteMany({ where: whereId }),
    prisma.chatMessage.deleteMany({ where: whereId }),
    prisma.healthMeasurement.deleteMany({ where: whereId }),
    prisma.locationPoint.deleteMany({ where: whereId }),
    prisma.lastLocation.deleteMany({ where: whereUserId }),
    prisma.pet.deleteMany({ where: whereId }),
    prisma.user.deleteMany({ where: whereId }),
  ]);

  return {
    monitoringChatLogs: monitoringChatLogs.count,
    monitoringPurchases: monitoringPurchases.count,
    monitoringPetProfiles: monitoringPetProfiles.count,
    monitoringUserProfiles: monitoringUserProfiles.count,
    chatMessages: chatMessages.count,
    healthMeasurements: healthMeasurements.count,
    locationPoints: locationPoints.count,
    lastLocations: lastLocations.count,
    pets: pets.count,
    users: users.count,
  };
}

async function createDemoUsers() {
  const passwordHash = await bcrypt.hash(password, 10);
  const demoUsers = [];

  for (let i = 1; i <= targetUsers; i += 1) {
    const region = regionForIndex(i);
    const city = cityFromRegion(region);
    const username = usernameFor(i, city);
    const careCadence = jitter(i, 9, 2.4, 6.8, 1);
    const user = await prisma.user.create({
      data: {
        id: demoUserId(i),
        username,
        passwordHash,
        displayName: displayNameFor(i),
        avatar: '',
        bio: `Demo PawTrace profile in ${region}; care check cadence ${careCadence}/week.`,
        campus: region,
        contact: `${pick(contacts, i)} ${username}`,
      },
    });
    demoUsers.push({ user, index: i, region, city, careCadence });
  }

  return demoUsers;
}

async function seedProfiles(demoUsers: Awaited<ReturnType<typeof createDemoUsers>>) {
  let petCount = 0;
  let telemetryCount = 0;
  let locationCount = 0;
  let chatCount = 0;
  let monitorChatCount = 0;
  let purchaseCount = 0;
  let suzhouCount = 0;

  for (const entry of demoUsers) {
    const { user, index: i, region, city, careCadence } = entry;
    if (city === 'Suzhou') suzhouCount += 1;
    const capturedAt = daysAgo(intJitter(i, 1, 0, 32), -intJitter(i, 2, 0, 7), -intJitter(i, 3, 0, 45));
    const mainPetName = pick(petNames, i * 3);
    const mainPetType = pick(petTypes, i * 7);
    const petSlots = 1 + (randomUnit(i, 31) > 0.82 ? 1 : 0);

    await prisma.monitoringUserProfile.create({
      data: {
        id: `${demoPrefix}-profile-${String(i).padStart(3, '0')}`,
        capturedAt,
        profileJson: {
          username: user.username,
          displayName: user.displayName,
          campus: region,
          city,
          contact: user.contact,
          mainPetName,
          mainPetType,
          careCadence,
        },
        personalInfoJson: {
          username: user.username,
          displayName: user.displayName,
          contact: user.contact,
          city,
        },
        metadataJson: {
          source: seedSource,
          cohort: 'synthetic-107-realistic',
          userId: user.id,
          username: user.username,
          city,
          suzhouTargetShare: rounded((suzhouUsers / targetUsers) * 100, 1),
        },
      },
    });

    for (let p = 1; p <= petSlots; p += 1) {
      const petId = demoPetId(i, p);
      const petName = p === 1 ? mainPetName : pick(petNames, i * 5 + p);
      const petType = p === 1 ? mainPetType : pick(petTypes, i + p);
      const breed = pick(breeds, i * 2 + p);
      const ageYears = rounded(jitter(i + p, 11, 0.8, 9.4, 1), 1);
      const weightKg = rounded(jitter(i + p, 12, petType === 'Cat' ? 3.1 : 5.2, petType === 'Dog' ? 26.8 : 8.6, 1), 1);
      const health = pick([
        `Vitals stable; average rest window ${jitter(i, 13, 6.4, 10.2, 1)}h.`,
        `Activity is ${jitter(i, 14, 8.5, 18.7, 1)}% above the 14-day baseline.`,
        `Diet plan adjusted; target weight variance ${jitter(i, 15, 1.2, 4.9, 1)}%.`,
        `Hydration watch after walks longer than ${jitter(i, 16, 22.5, 48.5, 1)} minutes.`,
      ], i + p);

      await prisma.pet.create({
        data: {
          id: petId,
          ownerId: user.id,
          name: petName,
          type: petType,
          breed,
          age: `${ageYears} years`,
          gender: randomUnit(i + p, 17) > 0.48 ? 'Female' : 'Male',
          avatar: `/assets/${1 + ((i + p) % 6)}.png`,
          traits: ['Demo profile', pick(['Friendly', 'Curious', 'Active', 'Calm', 'Shy'], i + p), `${weightKg} kg`],
          health,
          status: `${region} care profile updated ${jitter(i, 18, 1.6, 9.8, 1)} days ago.`,
        },
      });
      petCount += 1;

      await prisma.monitoringPetProfile.create({
        data: {
          id: `${demoPrefix}-petprofile-${String(i).padStart(3, '0')}-${p}`,
          capturedAt,
          ownerLabel: user.displayName,
          petJson: {
            id: petId,
            name: petName,
            type: petType,
            breed,
            age: `${ageYears} years`,
            gender: randomUnit(i + p, 17) > 0.48 ? 'Female' : 'Male',
            health,
            weightKg,
          },
          metadataJson: {
            source: seedSource,
            userId: user.id,
            username: user.username,
            city,
            region,
          },
        },
      });
    }

    const telemetrySamples = 11 + intJitter(i, 21, 0, 13);
    for (let s = 0; s < telemetrySamples; s += 1) {
      const timestamp = isoDaysAgo((i + s) % 29, -intJitter(i + s, 22, 0, 9), -intJitter(i + s, 23, 0, 50));
      const deviceId = `${demoPrefix}-m5-${String(((i * 7 + s * 3) % 31) + 1).padStart(2, '0')}`;
      const coords = coordinatesFor(city, i, s);
      await prisma.healthMeasurement.create({
        data: {
          id: `${demoPrefix}-health-${String(i).padStart(3, '0')}-${String(s).padStart(2, '0')}`,
          userId: user.id,
          deviceId,
          tagId: demoPetId(i, 1),
          timestamp,
          heartRateBpm: jitter(i + s, 24, 67.4, 139.8, 1),
          soundLevelDb: jitter(i + s, 25, 34.6, 71.9, 1),
          batteryPct: jitter(i + s, 26, 21.5, 96.8, 1),
          steps: intJitter(i + s, 27, 420, 7420),
          tempC: jitter(i + s, 28, 36.6, 39.4, 1),
          accelPeak: jitter(i + s, 29, 0.18, 2.85, 2),
          activity: pick(['REST', 'WALK', 'PLAY', 'SLEEP', 'TRANSIT'], i + s),
          lat: coords.lat,
          lon: coords.lon,
          locationAccuracy: jitter(i + s, 30, 4.8, 28.6, 1),
          quality: randomUnit(i + s, 32) > 0.91 ? 'review' : 'stable',
          metadata: {
            source: seedSource,
            city,
            region,
            petId: demoPetId(i, 1),
            locationValid: true,
            gpsFix: intJitter(i + s, 33, 1, 3),
            gpsSatsUsed: intJitter(i + s, 34, 7, 18),
            gpsHdop: jitter(i + s, 35, 0.68, 2.45, 2),
            distanceM: jitter(i + s, 36, 84.5, 1860.7, 1),
            activityScore: jitter(i + s, 37, 31.6, 92.4, 1),
            spo2Pct: jitter(i + s, 38, 94.1, 99.3, 1),
            batteryMv: intJitter(i + s, 39, 3620, 4170),
            wifiRssi: -intJitter(i + s, 40, 42, 82),
          },
          receivedAt: timestamp,
        },
      });
      telemetryCount += 1;
    }

    const locationSamples = 1 + intJitter(i, 43, 0, 3);
    for (let l = 0; l < locationSamples; l += 1) {
      const coords = coordinatesFor(city, i, l + 50);
      const timestamp = isoDaysAgo((i + l) % 18, -intJitter(i + l, 44, 0, 8), -intJitter(i + l, 45, 0, 45));
      await prisma.locationPoint.create({
        data: {
          id: `${demoPrefix}-loc-${String(i).padStart(3, '0')}-${l}`,
          source: seedSource,
          tagId: demoPetId(i, 1),
          deviceId: `${demoPrefix}-m5-${String(((i * 7) % 31) + 1).padStart(2, '0')}`,
          userId: user.id,
          timestamp,
          lat: coords.lat,
          lon: coords.lon,
          accuracy: jitter(i + l, 46, 5.2, 31.4, 1),
          altitude: jitter(i + l, 47, 1.5, 26.8, 1),
        },
      });
      locationCount += 1;
      if (l === 0) {
        await prisma.lastLocation.create({
          data: {
            userId: user.id,
            lat: coords.lat,
            lon: coords.lon,
            accuracy: jitter(i + l, 46, 5.2, 31.4, 1),
            timestamp,
            source: seedSource,
          },
        });
      }
    }

    const contactId = `${user.id}:pawtrace-care`;
    const sessionCount = 1 + (randomUnit(i, 51) > 0.55 ? 1 : 0) + (randomUnit(i, 52) > 0.88 ? 1 : 0);
    for (let session = 0; session < sessionCount; session += 1) {
      const topic = pick(chatTopics, i + session * 3);
      const reply = pick(aiReplies, i + session * 5);
      const createdAt = daysAgo((i + session) % 24, -session, -intJitter(i + session, 53, 0, 50));
      await prisma.chatMessage.create({
        data: {
          id: `${demoPrefix}-chat-${String(i).padStart(3, '0')}-${session}-user`,
          contactId,
          role: 'user',
          content: topic,
          createdAt,
        },
      });
      await prisma.chatMessage.create({
        data: {
          id: `${demoPrefix}-chat-${String(i).padStart(3, '0')}-${session}-assistant`,
          contactId,
          role: 'assistant',
          content: reply,
          createdAt: daysAgo((i + session) % 24, -session, 3 - intJitter(i + session, 54, 0, 40)),
        },
      });
      chatCount += 2;
      if (randomUnit(i + session, 55) > 0.72) {
        await prisma.chatMessage.create({
          data: {
            id: `${demoPrefix}-chat-${String(i).padStart(3, '0')}-${session}-follow`,
            contactId,
            role: 'user',
            content: `Follow-up: today the route was ${jitter(i + session, 56, 0.8, 4.7, 1)} km and appetite looked ${jitter(i + session, 57, 61.5, 95.2, 1)}%.`,
            createdAt: daysAgo((i + session) % 24, -session, 8 - intJitter(i + session, 58, 0, 38)),
          },
        });
        chatCount += 1;
      }

      await prisma.monitoringChatLog.create({
        data: {
          id: `${demoPrefix}-monitor-chat-${String(i).padStart(3, '0')}-${session}`,
          contactId,
          messagesJson: [{ role: 'user', content: topic }],
          reply,
          capturedAt: createdAt,
        },
      });
      monitorChatCount += 1;
    }

    const purchaseSlots = (randomUnit(i, 61) < 0.72 ? 1 : 0) + (randomUnit(i, 62) > 0.87 ? 1 : 0);
    for (let p = 0; p < purchaseSlots; p += 1) {
      const product = pick(products, i + p * 4);
      const quantity = 1 + (randomUnit(i + p, 63) > 0.86 ? 1 : 0);
      const price = rounded(product.price + jitter(i + p, 64, -3.4, 4.8, 1), 1);
      const purchaseId = `${demoPrefix}-purchase-${String(i).padStart(3, '0')}-${p}`;
      await prisma.monitoringPurchase.create({
        data: {
          id: purchaseId,
          capturedAt: daysAgo(intJitter(i + p, 65, 0, 59), -intJitter(i + p, 66, 0, 9), -intJitter(i + p, 67, 0, 50)),
          purchaseJson: {
            id: purchaseId,
            name: product.name,
            price,
            quantity,
            type: product.type,
            note: `${region} order; distance ${jitter(i + p, 68, 0.6, 6.9, 1)} km from usual route`,
          },
          metadataJson: {
            source: product.type === 'subscription' ? 'app-plan' : 'storefront',
            username: user.username,
            userId: user.id,
            city,
            region,
            ...(product.type === 'subscription' ? { plan: product.name } : {}),
          },
        },
      });
      purchaseCount += 1;
    }
  }

  return {
    users: demoUsers.length,
    suzhouUsers: suzhouCount,
    suzhouShare: rounded((suzhouCount / demoUsers.length) * 100, 1),
    petCount,
    telemetryCount,
    locationCount,
    chatCount,
    monitorChatCount,
    purchaseCount,
  };
}

async function main() {
  const removed = await resetDemoData();
  const demoUsers = await createDemoUsers();
  const seeded = await seedProfiles(demoUsers);
  const appUsers = await prisma.user.count();
  console.log('[monitor-demo-seed]', JSON.stringify({
    targetUsers,
    requestedSuzhouShare: `${rounded((suzhouUsers / targetUsers) * 100, 1)}%`,
    removed,
    appUsers,
    ...seeded,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
