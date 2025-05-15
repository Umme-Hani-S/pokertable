
import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import { hashPassword } from '../server/auth';
import {
  users,
  clubs,
  tables,
  players,
  tableSeats,
  tableSessions,
  playerTimeRecords,
  playerQueue,
  clubPlayerLimits
} from '../shared/schema';

async function main() {
  try {
    console.log('Setting up database with sample data...');

    // Drop existing tables in reverse order of dependencies
    await db.execute(sql`
      DROP TABLE IF EXISTS club_player_limits CASCADE;
      DROP TABLE IF EXISTS player_queue CASCADE;
      DROP TABLE IF EXISTS player_time_records CASCADE;
      DROP TABLE IF EXISTS table_seats CASCADE;
      DROP TABLE IF EXISTS table_sessions CASCADE;
      DROP TABLE IF EXISTS players CASCADE;
      DROP TABLE IF EXISTS tables CASCADE;
      DROP TABLE IF EXISTS clubs CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TYPE IF EXISTS user_role CASCADE;
      DROP TYPE IF EXISTS seat_status CASCADE;
    `);

    // Create enums
    await db.execute(sql`
      CREATE TYPE user_role AS ENUM ('admin', 'club_owner', 'dealer');
      CREATE TYPE seat_status AS ENUM ('Open', 'Playing', 'Break', 'Blocked', 'Closed');
    `);

    // Create admin user
    const adminPassword = await hashPassword('admin123');
    const adminUser = await db.insert(users).values({
      username: 'admin',
      password: adminPassword,
      email: 'admin@example.com',
      role: 'admin',
      fullName: 'Admin User',
      isActive: true
    }).returning();
    
    console.log('Created admin user:', adminUser[0].id);
    
    // Create club owner
    const ownerPassword = await hashPassword('owner123');
    const clubOwner = await db.insert(users).values({
      username: 'owner',
      password: ownerPassword,
      email: 'owner@example.com',
      role: 'club_owner',
      fullName: 'Club Owner',
      isActive: true
    }).returning();
    
    console.log('Created club owner:', clubOwner[0].id);
    
    // Create dealer
    const dealerPassword = await hashPassword('dealer123');
    const dealer = await db.insert(users).values({
      username: 'dealer',
      password: dealerPassword,
      email: 'dealer@example.com',
      role: 'dealer',
      fullName: 'Dealer User',
      isActive: true,
      clubOwnerId: clubOwner[0].id
    }).returning();
    
    console.log('Created dealer:', dealer[0].id);
    
    // Create a club
    const club = await db.insert(clubs).values({
      name: 'Sample Poker Club',
      ownerId: clubOwner[0].id,
      address: '123 Poker St, Las Vegas, NV',
      phoneNumber: '555-123-4567',
      licenseLimit: 5,
      isActive: true
    }).returning();
    
    console.log('Created club:', club[0].id);
    
    // Create club player limits
    const clubLimits = await db.insert(clubPlayerLimits).values({
      clubId: club[0].id,
      maxPlayers: 50,
      currentPlayers: 0,
      updatedBy: adminUser[0].id
    }).returning();
    
    console.log('Created club player limits:', clubLimits[0].id);
    
    // Create a table
    const pokerTable = await db.insert(tables).values({
      name: 'Main Table',
      clubId: club[0].id,
      dealerId: dealer[0].id,
      maxSeats: 9,
      isActive: true
    }).returning();
    
    console.log('Created table:', pokerTable[0].id);
    
    // Create sample players
    const samplePlayers = await Promise.all([
      db.insert(players).values({
        name: 'John Smith',
        clubId: club[0].id,
        email: 'john@example.com',
        phoneNumber: '555-111-2222',
        notes: 'Regular player'
      }).returning(),
      db.insert(players).values({
        name: 'Emma Johnson',
        clubId: club[0].id,
        email: 'emma@example.com',
        phoneNumber: '555-222-3333',
        notes: 'Prefers seat 3'
      }).returning(),
      db.insert(players).values({
        name: 'Michael Brown',
        clubId: club[0].id,
        email: 'michael@example.com',
        phoneNumber: '555-333-4444',
        notes: 'VIP player'
      }).returning()
    ]);
    
    const playerList = samplePlayers.map(p => p[0]);
    console.log(`Created ${playerList.length} sample players`);
    
    // Create table session
    const session = await db.insert(tableSessions).values({
      tableId: pokerTable[0].id,
      dealerId: dealer[0].id,
      name: 'Evening Session',
      isActive: true,
      startTime: new Date()
    }).returning();
    
    console.log('Created table session:', session[0].id);
    
    // Create table seats
    const seats = [];
    for (let i = 1; i <= pokerTable[0].maxSeats; i++) {
      const seatStatus = i <= 3 ? 'Open' : 'Closed';
      
      const seat = await db.insert(tableSeats).values({
        tableId: pokerTable[0].id,
        position: i,
        status: seatStatus,
        playerId: null,
        sessionId: session[0].id,
        timeElapsed: 0
      }).returning();
      
      seats.push(seat[0]);
    }
    
    console.log(`Created ${seats.length} table seats`);
    
    // Add players to queue
    const queueEntries = await Promise.all([
      db.insert(playerQueue).values({
        clubId: club[0].id,
        playerId: playerList[0].id,
        tableId: pokerTable[0].id,
        priority: 1,
        status: 'waiting',
        notes: 'Next player up'
      }).returning(),
      db.insert(playerQueue).values({
        clubId: club[0].id,
        playerId: playerList[1].id,
        tableId: pokerTable[0].id,
        priority: 2,
        status: 'waiting',
        notes: ''
      }).returning()
    ]);
    
    console.log(`Created ${queueEntries.length} queue entries`);
    console.log('\nSample data setup complete!');
    console.log('\nSample credentials:');
    console.log('Admin: username=admin, password=admin123');
    console.log('Club Owner: username=owner, password=owner123');
    console.log('Dealer: username=dealer, password=dealer123');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

main().catch(console.error);
