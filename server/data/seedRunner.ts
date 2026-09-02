import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { UserModel, ListingModel, ClaimModel } from '../models/schemas.js';
import { SEED_USERS, SEED_LISTINGS, SEED_CLAIMS } from './seedData.js';

async function runSeed() {
  console.log('[Seed] Starting database seeding process...');
  const connected = await connectDB();

  if (connected) {
    try {
      await UserModel.deleteMany({});
      await ListingModel.deleteMany({});
      await ClaimModel.deleteMany({});

      await UserModel.insertMany(SEED_USERS);
      await ListingModel.insertMany(SEED_LISTINGS);
      await ClaimModel.insertMany(SEED_CLAIMS);

      console.log(`[Seed] Seeded ${SEED_USERS.length} users, ${SEED_LISTINGS.length} listings, and ${SEED_CLAIMS.length} claims into MongoDB successfully!`);
    } catch (err) {
      console.error('[Seed] Failed to seed MongoDB:', err);
    } finally {
      await mongoose.disconnect();
    }
  } else {
    console.log('[Seed] Running in memory mode. Seed data is ready in memory store.');
  }
}

runSeed();
