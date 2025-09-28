import { type InferSelectModel, sql } from "drizzle-orm"
import { authenticatedRole, authUid, crudPolicy } from "drizzle-orm/neon"
import { bigint, boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import * as authSchema from "@/../auth-schema"

// Enable RLS on all auth tables and re-export them
export const users = authSchema.users.enableRLS()
export const sessions = authSchema.sessions.enableRLS()
export const accounts = authSchema.accounts.enableRLS()
export const verifications = authSchema.verifications.enableRLS()
export const jwkss = authSchema.jwkss.enableRLS()

export const todos = pgTable(
    "todos",
    {
        id: bigint({ mode: "number" })
            .primaryKey()
            .generatedByDefaultAsIdentity(),
        user_id: text("user_id").notNull().default(sql`(auth.user_id())`),
        task: text("task").notNull(),
        is_complete: boolean("is_complete").notNull().default(false),
        insertedAt: timestamp("inserted_at", { withTimezone: true })
            .defaultNow()
            .notNull()
    },
    (table) => [
        crudPolicy({
            role: authenticatedRole,
            read: true,
            modify: authUid(table.user_id)
        })
    ]
)

export type Todo = InferSelectModel<typeof todos>
