-- Create enum types
CREATE TYPE "public"."seat_status" AS ENUM('Open', 'Playing', 'Break', 'Blocked', 'Closed');
CREATE TYPE "public"."user_role" AS ENUM('admin', 'club_owner', 'dealer');

-- Create tables
CREATE TABLE "public"."club_player_limits" (
  "id" serial PRIMARY KEY NOT NULL,
  "clubId" integer UNIQUE,
  "maxPlayers" integer DEFAULT 100,
  "currentPlayers" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE "public"."users" (
  "id" serial PRIMARY KEY NOT NULL,
  "username" text UNIQUE NOT NULL,
  "password" text NOT NULL,
  "email" text,
  "name" text,
  "role" user_role DEFAULT 'dealer',
  "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE "public"."clubs" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "ownerId" integer,
  "maxTables" integer DEFAULT 3,
  "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE "public"."tables" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "clubId" integer,
  "dealerId" integer,
  "status" text DEFAULT 'inactive',
  "gameType" text,
  "stakes" text,
  "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE "public"."players" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "phone" text,
  "email" text,
  "clubId" integer,
  "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE "public"."table_sessions" (
  "id" serial PRIMARY KEY NOT NULL,
  "tableId" integer,
  "startTime" timestamp with time zone DEFAULT now(),
  "endTime" timestamp with time zone,
  "dealerId" integer,
  "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE "public"."table_seats" (
  "id" serial PRIMARY KEY NOT NULL,
  "tableId" integer,
  "position" integer NOT NULL,
  "status" seat_status DEFAULT 'Closed',
  "playerId" integer,
  "sessionId" integer,
  "playerName" text,
  "timeIn" timestamp with time zone,
  "timeOut" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE "public"."player_time_records" (
  "id" serial PRIMARY KEY NOT NULL,
  "player_id" integer,
  "table_id" integer,
  "session_id" integer,
  "time_in" timestamp with time zone,
  "time_out" timestamp with time zone,
  "elapsed_time" integer,
  "status" text,
  "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE "public"."player_queue" (
  "id" serial PRIMARY KEY NOT NULL,
  "player_id" integer,
  "club_id" integer,
  "table_id" integer,
  "position" integer,
  "status" text DEFAULT 'waiting',
  "player_name" text NOT NULL,
  "joined_at" timestamp with time zone DEFAULT now(),
  "created_at" timestamp with time zone DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE "public"."club_player_limits" ADD CONSTRAINT "club_player_limits_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;

ALTER TABLE "public"."clubs" ADD CONSTRAINT "clubs_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id");

ALTER TABLE "public"."tables" ADD CONSTRAINT "tables_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;
ALTER TABLE "public"."tables" ADD CONSTRAINT "tables_dealer_id_fkey" FOREIGN KEY ("dealer_id") REFERENCES "public"."users"("id");

ALTER TABLE "public"."players" ADD CONSTRAINT "players_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;

ALTER TABLE "public"."table_sessions" ADD CONSTRAINT "table_sessions_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id") ON DELETE CASCADE;
ALTER TABLE "public"."table_sessions" ADD CONSTRAINT "table_sessions_dealer_id_fkey" FOREIGN KEY ("dealer_id") REFERENCES "public"."users"("id");

ALTER TABLE "public"."table_seats" ADD CONSTRAINT "table_seats_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id") ON DELETE CASCADE;
ALTER TABLE "public"."table_seats" ADD CONSTRAINT "table_seats_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id");
ALTER TABLE "public"."table_seats" ADD CONSTRAINT "table_seats_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."table_sessions"("id");

ALTER TABLE "public"."player_time_records" ADD CONSTRAINT "player_time_records_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id");
ALTER TABLE "public"."player_time_records" ADD CONSTRAINT "player_time_records_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id");
ALTER TABLE "public"."player_time_records" ADD CONSTRAINT "player_time_records_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."table_sessions"("id");

ALTER TABLE "public"."player_queue" ADD CONSTRAINT "player_queue_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id");
ALTER TABLE "public"."player_queue" ADD CONSTRAINT "player_queue_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id");
ALTER TABLE "public"."player_queue" ADD CONSTRAINT "player_queue_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id");

-- Create unique indexes
CREATE UNIQUE INDEX "table_position_idx" ON "public"."table_seats" USING btree ("table_id", "position");

-- Insert sample admin user
INSERT INTO "public"."users" ("username", "password", "role", "name")
VALUES ('admin', '$2b$10$3euPcmQFCiblsZeEu5s7p.9wZZm2h6MpTuHnaN7CNpZS0ORRyziL.', 'admin', 'Administrator')
ON CONFLICT (username) DO NOTHING;

-- Insert sample club owner
INSERT INTO "public"."users" ("username", "password", "role", "name")
VALUES ('club_owner', '$2b$10$3euPcmQFCiblsZeEu5s7p.9wZZm2h6MpTuHnaN7CNpZS0ORRyziL.', 'club_owner', 'Club Owner')
ON CONFLICT (username) DO NOTHING;

-- Insert sample dealer
INSERT INTO "public"."users" ("username", "password", "role", "name")
VALUES ('dealer', '$2b$10$3euPcmQFCiblsZeEu5s7p.9wZZm2h6MpTuHnaN7CNpZS0ORRyziL.', 'dealer', 'Dealer')
ON CONFLICT (username) DO NOTHING;

-- Insert sample club
INSERT INTO "public"."clubs" ("name", "description", "owner_id")
SELECT 'Sample Club', 'A sample poker club', id
FROM "public"."users"
WHERE "username" = 'club_owner'
LIMIT 1;

-- Set up club player limits
INSERT INTO "public"."club_player_limits" ("club_id", "max_players")
SELECT id, 50
FROM "public"."clubs"
LIMIT 1;

-- Insert sample table
INSERT INTO "public"."tables" ("name", "club_id", "dealer_id", "game_type", "stakes")
SELECT 'Table 1', c.id, u.id, 'No Limit Hold''em', '$1/$2'
FROM "public"."clubs" c, "public"."users" u
WHERE u.username = 'dealer'
LIMIT 1;

-- Insert sample players
INSERT INTO "public"."players" ("name", "phone", "email", "club_id")
SELECT 'John Doe', '555-123-4567', 'john@example.com', id FROM "public"."clubs" LIMIT 1;

INSERT INTO "public"."players" ("name", "phone", "email", "club_id")
SELECT 'Jane Smith', '555-987-6543', 'jane@example.com', id FROM "public"."clubs" LIMIT 1;

INSERT INTO "public"."players" ("name", "phone", "email", "club_id")
SELECT 'Mike Johnson', '555-456-7890', 'mike@example.com', id FROM "public"."clubs" LIMIT 1;

-- Create a table session
INSERT INTO "public"."table_sessions" ("table_id", "dealer_id")
SELECT t.id, u.id
FROM "public"."tables" t, "public"."users" u
WHERE u.username = 'dealer'
LIMIT 1;

-- Set up table seats
INSERT INTO "public"."table_seats" ("table_id", "position", "status")
SELECT id, 1, 'Open' FROM "public"."tables" LIMIT 1;

INSERT INTO "public"."table_seats" ("table_id", "position", "status")
SELECT id, 2, 'Open' FROM "public"."tables" LIMIT 1;

INSERT INTO "public"."table_seats" ("table_id", "position", "status")
SELECT id, 3, 'Open' FROM "public"."tables" LIMIT 1;

INSERT INTO "public"."table_seats" ("table_id", "position", "status")
SELECT id, 4, 'Open' FROM "public"."tables" LIMIT 1;

INSERT INTO "public"."table_seats" ("table_id", "position", "status")
SELECT id, 5, 'Open' FROM "public"."tables" LIMIT 1;

INSERT INTO "public"."table_seats" ("table_id", "position", "status")
SELECT id, 6, 'Open' FROM "public"."tables" LIMIT 1;

INSERT INTO "public"."table_seats" ("table_id", "position", "status")
SELECT id, 7, 'Open' FROM "public"."tables" LIMIT 1;

INSERT INTO "public"."table_seats" ("table_id", "position", "status")
SELECT id, 8, 'Open' FROM "public"."tables" LIMIT 1;

INSERT INTO "public"."table_seats" ("table_id", "position", "status")
SELECT id, 9, 'Open' FROM "public"."tables" LIMIT 1;