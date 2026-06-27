// Word pools for each difficulty
const EASY_WORDS = [
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "her",
  "was", "one", "our", "out", "day", "get", "has", "him", "his", "how",
  "man", "new", "now", "old", "see", "two", "way", "who", "boy", "did",
  "its", "let", "put", "say", "she", "too", "use", "cat", "dog", "sun",
  "run", "big", "red", "hot", "top", "map", "cup", "sit", "hit", "win",
  "fun", "job", "key", "low", "mix", "nap", "oak", "pay", "zip", "yes",
  "air", "bed", "car", "ear", "far", "gas", "hat", "ice", "jar", "kid",
  "lip", "mud", "net", "oil", "pen", "rat", "sky", "ten", "van", "web",
];

const MEDIUM_WORDS = [
  "about", "above", "after", "again", "along", "among", "basic", "began",
  "below", "black", "blood", "board", "break", "bring", "build", "carry",
  "catch", "cause", "chair", "check", "child", "clean", "clear", "climb",
  "close", "color", "comes", "court", "cover", "cross", "death", "doing",
  "doubt", "drive", "earth", "eight", "enter", "equal", "every", "exist",
  "extra", "faith", "false", "field", "fight", "final", "first", "fixed",
  "flame", "floor", "focus", "force", "found", "front", "fully", "given",
  "glass", "going", "grace", "grand", "grant", "great", "green", "group",
  "hands", "happy", "heard", "heart", "heavy", "hence", "house", "human",
  "ideas", "image", "inner", "input", "issue", "joint", "judge", "known",
  "large", "later", "laugh", "layer", "learn", "leave", "level", "light",
  "limit", "links", "lived", "local", "logic", "lower", "lucky", "major",
  "maker", "match", "maybe", "means", "media", "model", "money", "month",
  "moral", "moved", "music", "never", "night", "north", "noted", "novel",
  "occur", "often", "order", "other", "ought", "outer", "owned", "paint",
  "paper", "party", "peace", "phase", "phone", "place", "plain", "plant",
  "point", "power", "press", "price", "pride", "prime", "print", "prior",
  "prize", "proof", "prove", "queen", "quick", "quiet", "quite", "quote",
  "raise", "range", "rapid", "reach", "ready", "realm", "refer", "reign",
  "reply", "rider", "right", "river", "round", "royal", "rugby", "ruler",
  "rural", "scale", "scene", "score", "seems", "sense", "serve", "seven",
  "shake", "shall", "shape", "share", "sharp", "shift", "shirt", "shore",
  "short", "shout", "shown", "sight", "since", "skill", "sleep", "slice",
  "slide", "small", "smart", "smile", "solar", "solve", "sound", "south",
  "space", "speak", "speed", "spend", "split", "spoke", "staff", "stage",
  "stake", "stand", "start", "state", "stays", "steel", "steep", "still",
  "stock", "stone", "stood", "store", "storm", "story", "strap", "strip",
  "stuck", "study", "stuff", "style", "sugar", "suite", "super", "surge",
  "sweet", "swing", "sword", "table", "taken", "taste", "teach", "teams",
  "tenth", "theme", "there", "thick", "thing", "think", "third", "those",
  "three", "threw", "throw", "tight", "times", "tired", "title", "today",
  "token", "total", "touch", "tough", "tours", "track", "trade", "trail",
  "train", "trait", "treat", "trend", "trial", "tried", "trust", "truth",
  "twice", "twist", "typed", "under", "union", "until", "upper", "upset",
  "urban", "usage", "usual", "valid", "value", "video", "viral", "visit",
  "vital", "voice", "voted", "voter", "waste", "watch", "water", "weigh",
  "where", "which", "while", "white", "whole", "whose", "wider", "woman",
  "women", "world", "worry", "worse", "worst", "worth", "would", "write",
  "wrong", "yield", "young", "yours", "youth",
];

const HARD_WORDS = [
  "abstract", "accurate", "acquired", "adjacent", "advanced", "affected",
  "affluent", "aggregate", "algorithm", "allocate", "ambiguity", "analysis",
  "annotate", "apparent", "approach", "argument", "assembly", "assessment",
  "asynchronous", "attribute", "authentic", "bandwidth", "benchmark",
  "blueprint", "boundary", "broadcast", "calculate", "capacity", "category",
  "challenge", "coherent", "collaborate", "component", "configure", "consensus",
  "constant", "construct", "container", "context", "contract", "contrast",
  "convention", "correlate", "database", "debugger", "dedicated", "deliberate",
  "dependency", "deployment", "detective", "dimension", "directive", "discovery",
  "distribute", "document", "efficient", "elaborate", "eliminate", "emphasis",
  "encrypted", "endpoint", "engaging", "establish", "evaluate", "exception",
  "execution", "explicit", "framework", "frequency", "function", "generate",
  "hierarchy", "implement", "implicit", "important", "indicator", "instance",
  "integrate", "interface", "interrupt", "iteration", "javascript", "knowledge",
  "language", "lifecycle", "maintainable", "manifest", "mechanism", "metadata",
  "middleware", "migration", "modular", "multiple", "navigate", "necessary",
  "network", "objective", "optimized", "organized", "parameter", "performance",
  "persistent", "platform", "practice", "principle", "procedure", "processor",
  "prototype", "provision", "qualified", "quantify", "recovery", "reference",
  "register", "relation", "relevant", "reliable", "represent", "repository",
  "requirement", "resilient", "resource", "response", "scalable", "scheduler",
  "semantic", "sequence", "serialize", "strategy", "structure", "subsystem",
  "synchronize", "technique", "technology", "template", "terminal", "threshold",
  "throughout", "transform", "translate", "transport", "traversal", "typescript",
  "universal", "validate", "variable", "viewport", "visualize", "workflow",
];

export type Difficulty = "easy" | "medium" | "hard";
export type Duration = 15 | 30 | 60 | 120;
export type TextMode = "text" | "text+numbers" | "text+numbers+symbols";

const NUMBERS = ["0","1","2","3","4","5","6","7","8","9","10","12","15","20","24","42","50","64","99","100","256","404","500","1024","2024"];

const SYMBOLS = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "+", "=", "{", "}", "[", "]", ":", ";", "'", "\"", "<", ">", ",", ".", "/", "?", "|", "~", "`", "\\"];

function injectNumbers(words: string[]): string[] {
  // Replace ~1 in every 5 words with a number
  return words.map((w, i) => (i % 5 === 2 ? NUMBERS[Math.floor(Math.random() * NUMBERS.length)] : w));
}

function injectSymbols(words: string[]): string[] {
  // Wrap ~1 in every 6 words with a symbol on each side, and sprinkle standalone symbols
  return words.map((w, i) => {
    if (i % 7 === 3) {
      const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      return sym + w + sym;
    }
    if (i % 9 === 5) {
      return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    }
    return w;
  });
}

export function generateText(difficulty: Difficulty, wordCount: number = 50, mode: TextMode = "text"): string {
  const pool = difficulty === "easy" ? EASY_WORDS : difficulty === "medium" ? MEDIUM_WORDS : HARD_WORDS;
  let words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  if (mode === "text+numbers" || mode === "text+numbers+symbols") {
    words = injectNumbers(words);
  }
  if (mode === "text+numbers+symbols") {
    words = injectSymbols(words);
  }
  return words.join(" ");
}

export function calculateWPM(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds === 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round(correctChars / 5 / minutes);
}

export function calculateAccuracy(correctChars: number, totalTyped: number): number {
  if (totalTyped === 0) return 100;
  return Math.round((correctChars / totalTyped) * 100);
}

export function calculateConsistency(wpmHistory: number[]): number {
  if (wpmHistory.length < 2) return 100;
  const avg = wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length;
  const variance = wpmHistory.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / wpmHistory.length;
  const stdDev = Math.sqrt(variance);
  const cv = avg > 0 ? (stdDev / avg) * 100 : 0;
  return Math.max(0, Math.round(100 - cv));
}
