export class FlashcardDTO {
  uuid: string;
  front: string[]; // Assuming front of flashcard is an array of strings
  back: string[]; // Assuming back of flashcard is an array of strings
  easeFactor: number; // Review data if necessary
  repetitions: number;
  nextReviewDate: Date;
}
