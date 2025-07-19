import { pgTable, unique, uuid, text, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const userLogin = pgTable("user_login", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	name: text(),
	picture: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	googleId: text("google_id").default('').notNull(),
}, (table) => [
	unique("users_email_key").on(table.email),
]);
