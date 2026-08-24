import { bigint, boolean, integer, pgTable, text } from "drizzle-orm/pg-core"

export const people = pgTable("people", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
})

export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  text: text("text").notNull(),
  answer: text("answer").notNull(),
  position: integer("position").notNull(),
})

export const responses = pgTable("responses", {
  id: text("id").primaryKey(),
  personId: text("person_id").notNull(),
  questionId: text("question_id").notNull(),
  correct: boolean("correct").notNull(),
  askedAt: bigint("asked_at", { mode: "number" }).notNull(),
})
