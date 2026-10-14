import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export interface QuestionRecord {
  id: string;
  productSlug: string;
  userName: string;
  question: string;
  answer: string | null;
  createdAt: string;
}

const DEFAULT_QUESTIONS: QuestionRecord[] = [
  {
    id: "q-1",
    productSlug: "hp-elitebook-840-g8",
    userName: "Tanvir Ahmed",
    question: "Does this HP EliteBook 840 G8 come with the official charger and replacement warranty?",
    answer: "Yes! All our premium laptops come with an original OEM charger and a 15-day official shop replacement guarantee plus 2 years free service warranty.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "q-2",
    productSlug: "dell-latitude-7420",
    userName: "Sabbir Hossain",
    question: "Can I upgrade the RAM to 32GB on this Latitude 7420?",
    answer: "The Dell Latitude 7420 uses soldered LPDDR4x high-speed memory, so the RAM capacity is fixed at 16GB. However, the M.2 NVMe SSD is fully user-upgradable up to 2TB.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "q-3",
    productSlug: "lenovo-thinkpad-t14-gen-2",
    userName: "Mehedi Hasan",
    question: "Is cash on delivery available with product checking in Chittagong?",
    answer: null, // Unanswered for admin demo
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "q-4",
    productSlug: "microsoft-surface-laptop-4",
    userName: "Nusrat Jahan",
    question: "What is the battery health percentage for this Surface Laptop 4?",
    answer: null, // Unanswered for admin demo
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

const questionsFilePath = path.join(process.cwd(), "app", "data", "questions.json");
let inMemoryQuestions: QuestionRecord[] | null = null;

export async function readQuestions(): Promise<QuestionRecord[]> {
  if (inMemoryQuestions) return inMemoryQuestions;

  // 1. Try file
  try {
    const raw = await fs.readFile(questionsFilePath, "utf-8");
    const parsed = JSON.parse(raw) as QuestionRecord[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      inMemoryQuestions = parsed;
      return parsed;
    }
  } catch {
    // File not created yet
  }

  // 2. Try DB ProductOverride
  try {
    const record = await prisma.productOverride.findUnique({
      where: { sku: "system:questions" },
    });
    if (record && record.data && Array.isArray(record.data)) {
      inMemoryQuestions = record.data as unknown as QuestionRecord[];
      return inMemoryQuestions;
    }
  } catch {
    // db fallback ignore
  }

  // 3. Fallback to default seeded
  inMemoryQuestions = [...DEFAULT_QUESTIONS];
  await writeQuestions(inMemoryQuestions).catch(() => {});
  return inMemoryQuestions;
}

export async function writeQuestions(items: QuestionRecord[]): Promise<void> {
  inMemoryQuestions = items;

  try {
    await fs.mkdir(path.dirname(questionsFilePath), { recursive: true });
    await fs.writeFile(questionsFilePath, JSON.stringify(items, null, 2), "utf-8");
  } catch {
    // Serverless filesystem read-only safe
  }

  try {
    await prisma.productOverride.upsert({
      where: { sku: "system:questions" },
      create: {
        id: "system:questions",
        sku: "system:questions",
        data: items as any,
      },
      update: {
        data: items as any,
      },
    });
  } catch {
    // db fallback ignore
  }
}

export async function getQuestions(): Promise<QuestionRecord[]> {
  const items = await readQuestions();
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addQuestion(q: {
  productSlug: string;
  userName: string;
  question: string;
}): Promise<QuestionRecord> {
  const all = await readQuestions();
  const newQ: QuestionRecord = {
    id: `q-${Date.now()}`,
    productSlug: q.productSlug || "general",
    userName: q.userName || "Customer",
    question: q.question,
    answer: null,
    createdAt: new Date().toISOString(),
  };

  all.unshift(newQ);
  await writeQuestions(all);
  return newQ;
}

export async function answerQuestion(id: string, answer: string): Promise<QuestionRecord | null> {
  const all = await readQuestions();
  const target = all.find((q) => q.id === id);
  if (!target) return null;

  target.answer = answer;
  await writeQuestions(all);
  return target;
}

export async function deleteQuestion(id: string): Promise<boolean> {
  const all = await readQuestions();
  const initialLen = all.length;
  const filtered = all.filter((q) => q.id !== id);
  if (filtered.length !== initialLen) {
    await writeQuestions(filtered);
    return true;
  }
  return false;
}
