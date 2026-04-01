/**
 * 从 legacy 的 pawtrace-db.json 导入用户与宠物（不覆盖已有 id）。
 * 用法: DATABASE_URL=... tsx scripts/importFromJson.ts [path/to/pawtrace-db.json]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type JsonDb = {
  pets?: Array<Record<string, unknown>>;
  users?: Array<Record<string, unknown>>;
};

async function main() {
  const argPath = process.argv[2];
  const defaultPath = path.join(__dirname, '..', 'data', 'pawtrace-db.json');
  const filePath = argPath ? path.resolve(argPath) : defaultPath;
  if (!fs.existsSync(filePath)) {
    console.error('文件不存在:', filePath);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as JsonDb;
  const pets = raw.pets || [];
  const users = raw.users || [];
  const hash = await bcrypt.hash('imported123', 10);

  for (const u of users) {
    const id = String(u.id || '');
    const username = String(u.username || '');
    if (!id || !username) continue;
    const exists = await prisma.user.findUnique({ where: { id } });
    if (exists) continue;
    await prisma.user.create({
      data: {
        id,
        username,
        passwordHash: hash,
        displayName: String(u.displayName || username),
        avatar: String(u.avatar || ''),
        bio: String(u.bio || ''),
        campus: String(u.campus || ''),
        contact: String(u.contact || ''),
      },
    });
    console.log('import user', id);
  }

  for (const p of pets) {
    const id = String(p.id || '');
    if (!id) continue;
    const exists = await prisma.pet.findUnique({ where: { id } });
    if (exists) continue;
    const traits = Array.isArray(p.traits) ? p.traits : [];
    await prisma.pet.create({
      data: {
        id,
        ownerId: null,
        name: String(p.name || 'Pet'),
        type: String(p.type || 'Pet'),
        breed: String(p.breed || 'Unknown'),
        age: String(p.age || 'Unknown'),
        gender: String(p.gender || 'Unknown'),
        avatar: String(p.avatar || '/assets/1.png'),
        traits,
        health: String(p.health || ''),
        status: String(p.status || ''),
      },
    });
    console.log('import pet', id);
  }

  console.log('完成');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
