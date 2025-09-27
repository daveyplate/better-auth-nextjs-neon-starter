ALTER TABLE "todos" ALTER COLUMN "user_id" SET DEFAULT (auth.user_id());--> statement-breakpoint
ALTER POLICY "crud-authenticated-policy-delete" ON "todos" TO authenticated USING ((select auth.user_id() = "todos"."user_id"));--> statement-breakpoint
ALTER POLICY "crud-authenticated-policy-update" ON "todos" TO authenticated USING ((select auth.user_id() = "todos"."user_id")) WITH CHECK ((select auth.user_id() = "todos"."user_id"));--> statement-breakpoint
ALTER POLICY "crud-authenticated-policy-insert" ON "todos" TO authenticated WITH CHECK ((select auth.user_id() = "todos"."user_id"));--> statement-breakpoint
ALTER POLICY "crud-authenticated-policy-select" ON "todos" TO authenticated USING ((select auth.user_id() = "todos"."user_id"));