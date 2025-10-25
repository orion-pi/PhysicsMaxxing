"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PhysicsQuestion } from "@/types/physics";
import MathInput from "@/components/MathInput";
import CollapsibleBox from "@/components/CollapsibleBox";
import QuestionImage from "@/components/QuestionImage";

interface Props {
  question: PhysicsQuestion;
  solutionHtmlParts: string[]; // pre-rendered HTML (server) for solution steps
  finalAnswerHtmlParts: string[]; // pre-rendered HTML (server) for final answers
  currentIndex: number;
  totalCount: number;
  preserveQuery?: string; // query string to preserve (subjects, scramble, seed)
}

function normalizeLatex(s: string): string {
  return s
    .trim()
    .replace(/^\$+|\$+$/g, "") // strip surrounding $
    .replace(/\\left\s*|\\right\s*/g, "") // remove \left/\right
    .replace(/\s+/g, "") // remove all whitespace
    .toLowerCase();
}

function extractNumber(s: string): number | null {
  // Strip LaTeX wrappers and find a number (supports scientific notation)
  const plain = s.replace(/^\$+|\$+$/g, "").replace(/\\[a-zA-Z]+/g, "");
  const match = plain.match(/[+-]?\d*\.?\d+(?:[eE][+-]?\d+)?/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : null;
}

export default function QuestionTrainer({
  question,
  solutionHtmlParts,
  finalAnswerHtmlParts,
  currentIndex,
  totalCount,
  preserveQuery,
}: Props) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = useMemo(() => {
    if (!submitted) return false;
    const userNorm = normalizeLatex(answer);
    if (!userNorm) return false;

    const finals = question.final_answer || [];

    // Numerical tolerance if possible
    const tol = typeof question.error === "string" ? Number(question.error) : null;
    const userNum = extractNumber(answer);

    // Try numeric compare first when answer_type suggests numeric and parsing works
    if (question.answer_type?.toLowerCase() === "numerical" && userNum !== null) {
      for (const f of finals) {
        const fNum = extractNumber(String(f));
        if (fNum !== null) {
          const diff = Math.abs(userNum - fNum);
          if (tol !== null && Number.isFinite(tol) ? diff <= tol : diff === 0) {
            return true;
          }
        }
      }
    }

    // Fallback: strict normalized string equality against any final answer
    const candidates = finals.map((v) => normalizeLatex(String(v)));
    return candidates.some((c) => c === userNorm);
  }, [answer, submitted, question.final_answer, question.answer_type, question.error]);

  const onSubmit = () => {
    setSubmitted(true);
  };

  const onNext = () => {
    if (!submitted) return;
    const next = currentIndex + 1;
    if (next < totalCount) {
      const suffix = preserveQuery ? `&${preserveQuery}` : "";
      router.push(`/?q=${next}${suffix}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <MathInput
        className="mt-6"
        placeholder="Enter your answer here..."
        onChange={(latex) => setAnswer(latex)}
      />

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!answer}
        >
          Submit Answer
        </button>
        {submitted && (
          <span
            className={
              "text-sm font-medium px-2.5 py-1 rounded " +
              (isCorrect
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300")
            }
          >
            {isCorrect ? "Correct ✅" : "Incorrect ❌"}
          </span>
        )}
      </div>

      {submitted && (
        <div className="mt-6 space-y-4">
          {/* Your Answer and Correct Answer(s) */}
          <CollapsibleBox title="Answer & Solution" defaultOpen>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Your answer</div>
                <div className="mt-1 inline-block rounded border border-gray-200 bg-white px-3 py-2 text-black">
                  {/* Show raw LaTeX string for now */}
                  {answer || "(no answer)"}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Correct answer(s)</div>
                <div className="mt-1 space-y-1">
                  {finalAnswerHtmlParts.map((html, i) => (
                    <div
                      key={i}
                      className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-black"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  ))}
                </div>
              </div>

              {/* Solution Steps (markdown HTML) */}
              {solutionHtmlParts.length > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Solution</div>
                  <div className="prose prose-slate max-w-none [&_.katex-display]:my-4">
                    {solutionHtmlParts.map((html, idx) => (
                      <div key={idx} dangerouslySetInnerHTML={{ __html: html }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Optional solution images */}
              {question.solution_images && question.solution_images.length > 0 && (
                <div className="pt-2">
                  <QuestionImage
                    imageNames={question.solution_images.flat()}
                    alt="Solution diagram"
                    className="mt-4"
                  />
                </div>
              )}
            </div>
          </CollapsibleBox>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onNext}
              disabled={!submitted || currentIndex + 1 >= totalCount}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Next Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
