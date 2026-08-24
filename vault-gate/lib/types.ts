export const TOTAL_QUESTIONS = 20

export type Question = {
  id: string
  text: string
  /** The correct/expected answer, shown to the asker for reference. */
  answer: string
}

export type Person = {
  id: string
  name: string
  createdAt: number
}

/** One recorded response: person X was asked question Y and got it right/wrong. */
export type Response = {
  id: string
  personId: string
  questionId: string
  correct: boolean
  askedAt: number
}

export type AppData = {
  people: Person[]
  questions: Question[]
  responses: Response[]
}
