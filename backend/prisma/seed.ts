import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const defaultPets = [
  {
    id: 'p1',
    name: 'Mocha',
    type: 'Dog',
    breed: 'Corgi',
    age: '2 years',
    gender: 'Male',
    avatar: '/assets/1.png',
    traits: ['Friendly', 'Food-motivated', 'Short legs, fast heart'],
    health: 'Vaccinations up to date. Last vet check 2 months ago.',
    status: 'Always ready for a fetch session.',
  },
  {
    id: 'p2',
    name: 'Pixel',
    type: 'Dog',
    breed: 'Border Collie',
    age: '3 years',
    gender: 'Female',
    avatar: '/assets/2.png',
    traits: ['Smart', 'High energy', 'Ball addict'],
    health: 'Needs daily long walks. Joint check scheduled next month.',
    status: 'Learning trick combos every week.',
  },
  {
    id: 'p3',
    name: 'Mochi',
    type: 'Cat',
    breed: 'Ragdoll',
    age: '1 year',
    gender: 'Female',
    avatar: '/assets/3.png',
    traits: ['Quiet', 'Cuddly', 'Window watcher'],
    health: 'Indoor only, spayed, no known issues.',
    status: 'Prefers sunlit shelves and calm corners.',
  },
  {
    id: 'p4',
    name: 'Kiko',
    type: 'Dog',
    breed: 'Husky',
    age: '4 years',
    gender: 'Female',
    avatar: '/assets/4.png',
    traits: ['Pack leader', 'Snow lover'],
    health: 'Energetic and strong, needs long runs.',
    status: 'Dreaming about weekend meetups.',
  },
  {
    id: 'p5',
    name: 'Luna',
    type: 'Cat',
    breed: 'Siamese',
    age: '2 years',
    gender: 'Female',
    avatar: '/assets/5.png',
    traits: ['Playful', 'Curious', 'Talkative'],
    health: 'Indoor only, loves puzzles.',
    status: 'Chasing laser dots when not napping.',
  },
];

const defaultUsers = [
  {
    id: 'u1',
    username: 'demo',
    displayName: 'Pet Lover',
    avatar: '',
    bio: 'Welcome to PawTrace!',
    campus: 'Taicang',
    contact: 'WeChat',
  },
  {
    id: 'u2',
    username: 'mila',
    displayName: 'Mila',
    avatar: '',
    bio: 'Cat person, art lover',
    campus: 'Shanghai',
    contact: 'Email',
  },
  {
    id: 'u3',
    username: 'rocky',
    displayName: 'Rocky',
    avatar: '',
    bio: 'Dog walker & plant dad',
    campus: 'Beijing',
    contact: 'Phone',
  },
  {
    id: 'u4',
    username: 'lily',
    displayName: 'Lily',
    avatar: '',
    bio: 'Event planner for pet meetups',
    campus: 'Taicang',
    contact: 'WeChat',
  },
];

async function main() {
  const n = await prisma.pet.count();
  if (n > 0) {
    console.log('[seed] 已有数据，跳过');
    return;
  }

  const passwordHash = await bcrypt.hash('demo123', 10);

  for (const u of defaultUsers) {
    await prisma.user.create({
      data: {
        id: u.id,
        username: u.username,
        passwordHash,
        displayName: u.displayName,
        avatar: u.avatar,
        bio: u.bio,
        campus: u.campus,
        contact: u.contact,
      },
    });
  }

  for (const p of defaultPets) {
    await prisma.pet.create({
      data: {
        id: p.id,
        ownerId: null,
        name: p.name,
        type: p.type,
        breed: p.breed,
        age: p.age,
        gender: p.gender,
        avatar: p.avatar,
        traits: p.traits,
        health: p.health,
        status: p.status,
      },
    });
  }

  console.log('[seed] 演示用户/宠物已写入（登录 demo / demo123）');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
