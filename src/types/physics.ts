export interface PhysicsQuestion {
  id: number;
  subfield: string;
  context: string;
  question: string;
  solution: string[];
  final_answer: string[];
  is_multiple_answer: boolean;
  unit: string;
  answer_type: string;
  error: string;
  question_images: string[];
  context_images: string[];
  solution_images: string[][];
}

export interface TrainerState {
  currentQuestionIndex: number;
  questions: PhysicsQuestion[];
  filteredQuestions: PhysicsQuestion[];
  selectedSubfield: string;
  showSolution: boolean;
  userAnswer: string;
  isAnswered: boolean;
  isCorrect: boolean;
  score: number;
  totalAnswered: number;
}