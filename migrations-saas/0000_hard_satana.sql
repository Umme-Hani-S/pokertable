CREATE TYPE "public"."seat_status" AS ENUM('Open', 'Playing', 'Break', 'Blocked', 'Closed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'club_owner', 'dealer');--> statement-breakpoint
CREATE TABLE "club_player_limits" (
	"id" serial PRIMARY KEY NOT NULL,
	"club_id" integer NOT NULL,
	"max_players" integer DEFAULT 50 NOT NULL,
	"current_players" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer,
	CONSTRAINT "club_player_limits_club_id_unique" UNIQUE("club_id")
);
--> statement-breakpoint
CREATE TABLE "clubs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"owner_id" integer NOT NULL,
	"address" text,
	"phone_number" varchar(20),
	"license_limit" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"club_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"table_id" integer,
	"priority" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'waiting' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"assigned_at" timestamp,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "player_time_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"seat_id" integer NOT NULL,
	"session_id" integer,
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp,
	"duration" integer DEFAULT 0 NOT NULL,
	"date" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"club_id" integer NOT NULL,
	"email" varchar(100),
	"phone_number" varchar(20),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"total_play_time" integer DEFAULT 0 NOT NULL,
	"last_played" timestamp
);
--> statement-breakpoint
CREATE TABLE "table_seats" (
	"id" serial PRIMARY KEY NOT NULL,
	"table_id" integer NOT NULL,
	"position" integer NOT NULL,
	"status" "seat_status" DEFAULT 'Open' NOT NULL,
	"player_id" integer,
	"session_id" integer,
	"time_started" timestamp,
	"time_elapsed" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "table_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"table_id" integer NOT NULL,
	"dealer_id" integer,
	"name" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp,
	"total_time" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tables" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"club_id" integer NOT NULL,
	"dealer_id" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"max_seats" integer DEFAULT 9 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" text NOT NULL,
	"email" varchar(100) NOT NULL,
	"role" "user_role" DEFAULT 'dealer' NOT NULL,
	"full_name" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_login" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"club_owner_id" integer,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "club_player_limits" ADD CONSTRAINT "club_player_limits_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_player_limits" ADD CONSTRAINT "club_player_limits_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_queue" ADD CONSTRAINT "player_queue_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_queue" ADD CONSTRAINT "player_queue_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_queue" ADD CONSTRAINT "player_queue_table_id_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_time_records" ADD CONSTRAINT "player_time_records_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_time_records" ADD CONSTRAINT "player_time_records_seat_id_table_seats_id_fk" FOREIGN KEY ("seat_id") REFERENCES "public"."table_seats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_time_records" ADD CONSTRAINT "player_time_records_session_id_table_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."table_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "table_seats" ADD CONSTRAINT "table_seats_table_id_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "table_seats" ADD CONSTRAINT "table_seats_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "table_seats" ADD CONSTRAINT "table_seats_session_id_table_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."table_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "table_sessions" ADD CONSTRAINT "table_sessions_table_id_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "table_sessions" ADD CONSTRAINT "table_sessions_dealer_id_users_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tables" ADD CONSTRAINT "tables_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tables" ADD CONSTRAINT "tables_dealer_id_users_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "table_position_idx" ON "table_seats" USING btree ("table_id","position");