"use client";

export const CATEGORIES = ["reef", "deep", "shore", "arctic", "open"] as const;
export type Category = typeof CATEGORIES[number];
export type TrainingData = Record<string, number>;

export function getConfidence(training: TrainingData, cat: string): number {
  const count = training[cat] || 0;
  return count === 0 ? 25 : count === 1 ? 55 : 90;
}

export const TRAIN_ITEMS = [
  { emoji: "🐠", img: "clownfish.svg", label: "Clownfish", answer: "reef" as const, category: "reef", voiceCorrect: "t_reef_clownfish_y.mp3", voiceWrong: "t_reef_clownfish_n.mp3" },
  { emoji: "🦑", img: "squid.svg", label: "Giant Squid", answer: "deep" as const, category: "deep", voiceCorrect: "t_deep_squid_y.mp3", voiceWrong: "t_deep_squid_n.mp3" },
  { emoji: "🦀", img: "crab.svg", label: "Hermit Crab", answer: "shore" as const, category: "shore", voiceCorrect: "t_shore_crab_y.mp3", voiceWrong: "t_shore_crab_n.mp3" },
  { emoji: "🦭", img: "seal.svg", label: "Harp Seal", answer: "arctic" as const, category: "arctic", voiceCorrect: "t_arctic_seal_y.mp3", voiceWrong: "t_arctic_seal_n.mp3" },
  { emoji: "🐬", img: "dolphin.svg", label: "Dolphin", answer: "open" as const, category: "open", voiceCorrect: "t_open_dolphin_y.mp3", voiceWrong: "t_open_dolphin_n.mp3" },
  { emoji: "🐢", img: "turtle.svg", label: "Sea Turtle", answer: "reef" as const, category: "reef", voiceCorrect: "t_reef_turtle_y.mp3", voiceWrong: "t_reef_turtle_n.mp3" },
  { emoji: "🐡", img: "anglerfish.svg", label: "Anglerfish", answer: "deep" as const, category: "deep", voiceCorrect: "t_deep_angler_y.mp3", voiceWrong: "t_deep_angler_n.mp3" },
  { emoji: "⭐", img: "starfish.svg", label: "Starfish", answer: "shore" as const, category: "shore", voiceCorrect: "t_shore_starfish_y.mp3", voiceWrong: "t_shore_starfish_n.mp3" },
  { emoji: "🐋", img: "whale.svg", label: "Beluga Whale", answer: "arctic" as const, category: "arctic", voiceCorrect: "t_arctic_whale_y.mp3", voiceWrong: "t_arctic_whale_n.mp3" },
  { emoji: "🦈", img: "shark.svg", label: "Great White Shark", answer: "open" as const, category: "open", voiceCorrect: "t_open_shark_y.mp3", voiceWrong: "t_open_shark_n.mp3" },
];

export const CAT_LABELS: Record<string, { emoji: string; img: string; label: string }> = {
  reef: { emoji: "🪸", img: "coral.svg", label: "Coral Reef" },
  deep: { emoji: "🌊", img: "wave.svg", label: "Deep Sea" },
  shore: { emoji: "🏖️", img: "beach.svg", label: "Shoreline" },
  arctic: { emoji: "🧊", img: "ice.svg", label: "Arctic Waters" },
  open: { emoji: "🌅", img: "sunset.svg", label: "Open Ocean" },
};

export const AI_FEATURES: Record<string, string[]> = {
  reef: ["Water temp", "Coral scan", "Depth check"],
  deep: ["Pressure sensor", "Light level", "Depth gauge"],
  shore: ["Tide level", "Sand scan", "Wave height"],
  arctic: ["Temp sensor", "Ice scan", "Salinity"],
  open: ["Current speed", "Depth sonar", "GPS position"],
};

const CONFUSIONS: Record<string, string> = {
  reef: "Coral scanner confused — misread the habitat!",
  deep: "Pressure sensor glitched — wrong depth reading!",
  shore: "Tide data unclear — bad classification!",
  arctic: "Temperature sensor lagged — missed the cold!",
  open: "GPS drifted — wrong location!",
};

export type TestRound = {
  emoji: string; img?: string; label: string; correct: string; category: string;
  aiChoice: string; confidence: number; features: string[]; reason?: string;
};

export function generateTestRounds(training: TrainingData): TestRound[] {
  const scenarios = [
    { emoji: "🐠", img: "clownfish.svg", label: "Colorful fish spotted!", correct: "reef", category: "reef" },
    { emoji: "🦑", img: "squid.svg", label: "Something glowing below!", correct: "deep", category: "deep" },
    { emoji: "🦀", img: "crab.svg", label: "Creature in a tide pool!", correct: "shore", category: "shore" },
    { emoji: "🧊", img: "ice.svg", label: "Icy waters ahead!", correct: "arctic", category: "arctic" },
    { emoji: "🐬", img: "dolphin.svg", label: "Fins in open water!", correct: "open", category: "open" },
    { emoji: "🐢", img: "turtle.svg", label: "Shell near the coral!", correct: "reef", category: "reef" },
    { emoji: "🐋", img: "whale.svg", label: "Big shape in cold water!", correct: "arctic", category: "arctic" },
    { emoji: "🦈", img: "shark.svg", label: "Fast swimmer detected!", correct: "open", category: "open" },
  ].sort(() => Math.random() - 0.5);

  return scenarios.map((s) => {
    const conf = getConfidence(training, s.category);
    const correct = Math.random() < conf / 100;
    const cats = Object.keys(CAT_LABELS);
    const aiChoice = correct ? s.correct : cats.filter((c) => c !== s.correct)[Math.floor(Math.random() * (cats.length - 1))];
    return { ...s, aiChoice, confidence: conf, features: AI_FEATURES[s.category] || [], reason: correct ? undefined : CONFUSIONS[s.category] };
  });
}

export const RESCUE_EVENTS = [
  { emoji: "🛢️", img: "oil.svg", label: "Oil spill ahead!", correct: "rescue", delay: 2000 },
  { emoji: "🌊", img: "wave.svg", label: "Clear waters", correct: "sail", delay: 800 },
  { emoji: "🪤", img: "trap.svg", label: "Fishing net trap!", correct: "rescue", delay: 1800 },
  { emoji: "🌊", img: "wave.svg", label: "All clear", correct: "sail", delay: 600 },
  { emoji: "🗑️", img: "trash.svg", label: "Plastic waste!", correct: "rescue", delay: 2200 },
  { emoji: "🌊", img: "wave.svg", label: "Safe passage", correct: "sail", delay: 500 },
  { emoji: "🏭", img: "factory.svg", label: "Chemical runoff!", correct: "rescue", delay: 1600 },
  { emoji: "🌊", img: "wave.svg", label: "Smooth sailing", correct: "sail", delay: 700 },
];
