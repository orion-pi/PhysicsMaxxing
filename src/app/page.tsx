import { readFile } from 'fs/promises';
import path from 'path';
import { PhysicsQuestion } from "@/types/physics";
import markdownToHtml from '@/utils/markdownToHtml'
import QuestionImage from "@/components/QuestionImage";
import Markdown from "@/components/Markdown";
import CollapsibleBox from '@/components/CollapsibleBox';
import QuestionTrainer from '@/components/QuestionTrainer';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; subjects?: string; scramble?: string; seed?: string }> }) {
  const dataPath = path.join(process.cwd(), 'public', 'data', 'physics_en_COMP.json');
  let questions: PhysicsQuestion[] = [];
  try {
    const file = await readFile(dataPath, 'utf-8');
    questions = JSON.parse(file) as PhysicsQuestion[];
  } catch (err) {
    // If the file can't be read, return a simple error UI from the server
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-400">Error loading questions: {String(err)}</div>
      </div>
    );
  }

  const sp = await searchParams;

  // If user hasn't provided trainer params, start at the subject selection page
  if (!sp?.q && !sp?.subjects) {
    // redirect to /start to make the subject selector the app entry
    redirect('/start');
  }

  // Filter by selected subjects, if provided
  const selectedSubjects = (sp?.subjects ?? "")
    .split(',')
    .map((s: string) => decodeURIComponent(s))
    .filter(Boolean);
  let filtered = selectedSubjects.length
    ? questions.filter((qq) => selectedSubjects.includes(qq.subfield))
    : questions;

  // Deterministic scramble if requested
  const scramble = sp?.scramble === '1' || sp?.scramble === 'true';
  const seedNum = Number(sp?.seed ?? 0);
  if (scramble && Number.isFinite(seedNum)) {
    // Mulberry32 seed PRNG
    const mulberry32 = (a: number) => () => {
      let t = (a += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const rand = mulberry32(seedNum | 0);
    filtered = [...filtered].sort(() => rand() - 0.5);
  }

  const total = filtered.length;
  if (total === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-black">
          <div className="text-xl font-semibold">No questions found for the selected subjects.</div>
          <Link href="/start" className="mt-3 inline-block text-blue-600 hover:underline">Go back to subject selection</Link>
        </div>
      </div>
    );
  }
  const idx = Math.max(0, Math.min(Math.max(total - 1, 0), Number(sp?.q ?? 0) || 0));
  const q = filtered[idx];

  // Preserve current query (excluding q) for client navigation
  const preserveParams = new URLSearchParams();
  if (selectedSubjects.length) preserveParams.set('subjects', selectedSubjects.map(encodeURIComponent).join(','));
  if (scramble) preserveParams.set('scramble', '1');
  if (Number.isFinite(seedNum) && seedNum) preserveParams.set('seed', String(seedNum));
  const preserveQuery = preserveParams.toString();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content */}
      
      <div className="flex-grow pb-32">
                <div className="max-w-4xl mx-auto pb-4">

  <CollapsibleBox title="Context" defaultOpen={false}>
                  <Markdown content={q.context} />
                  <QuestionImage imageNames={q.context_images} alt="Sample Diagram" className="mt-6" />

      </CollapsibleBox>
      </div>
        <div className="max-w-4xl mx-auto border border-gray-200 rounded-xl p-8 bg-white shadow-lg text-black">
          
          <Markdown content={q.question} />
        </div>
        <QuestionImage imageNames={q.question_images} alt="Sample Diagram" className="mt-6" />
        {/** Pre-render solution and final answers to HTML (server) for this question and pass to client */}
        {/** Solution is an array of markdown sections; render each */}
        {/** Some final answers may include inline LaTeX; we pass through the markdown renderer too */}
        {await (async () => {
          const solutionHtmlParts = await Promise.all(
            (q.solution || []).map((s) => markdownToHtml(s))
          );
          const finalAnswerHtmlParts = await Promise.all(
            (q.final_answer || []).map((s) => markdownToHtml(String(s)))
          );
          return (
            <QuestionTrainer
              key={q.id ?? idx}
              question={q}
              solutionHtmlParts={solutionHtmlParts}
              finalAnswerHtmlParts={finalAnswerHtmlParts}
              currentIndex={idx}
              totalCount={total}
              preserveQuery={preserveQuery}
            />
          );
        })()}

      </div>

      {/** The submit button now lives inside QuestionTrainer above */}
    </div>
  );
}