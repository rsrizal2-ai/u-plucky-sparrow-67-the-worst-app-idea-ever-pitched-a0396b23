// The Worst App Idea Ever Pitched — entry generator.
//
// Scores candidate one-sentence pitches on exactly the judge's brief:
// how specific, how funny, and how perfectly pointless each idea is,
// then writes the winning single sentence (<= 240 chars) to /output/entry.txt.
//
// Gate mirrored from the competition: /output/entry.txt must be UTF-8 text,
// 1..240 characters, not only whitespace, a single sentence.

import { mkdirSync, writeFileSync } from "node:fs";

type Candidate = { text: string };

const CANDIDATES: Candidate[] = [
  {
    text: "Meet Blinkr, the $10-a-month app that counts every blink you make, syncs your blinks to the cloud, and sends a weekly leaderboard ranking your blinking against your friends, because your eyelids deserve analytics.",
  },
  {
    text: "Introducing NapAlert, an AI-powered $12-a-month app that detects the exact second you fall asleep and instantly wakes you with a notification to confirm you fell asleep, so you never miss a moment of being unconscious.",
  },
  {
    text: "Meet SnoreScore, a $9-a-month app that records you snoring all night, grades each snore from A to F, and posts your nightly snore report to a leaderboard your friends never asked to see.",
  },
  {
    text: "Dustly is a $5-a-month app that photographs the dust on your bookshelf every morning, charts it on a dashboard, and alerts you the moment a new speck lands, so you never miss a single particle.",
  },
  {
    text: "Meet QueuePal, an app that hires a stranger to stand in line for you at the DMV, then livestreams them standing in line so you can watch someone else wait instead of you.",
  },
  {
    text: "Introducing SockMatch, a $8-a-month AI app that photographs your clean laundry, pairs your socks for you, and then charges extra to tell you which sock it lost in the process.",
  },
];

// --- Scoring: the judge's three axes, nothing else. ---

// Specificity: concrete numbers, prices, named mechanisms, exact triggers.
function specificity(t: string): number {
  let s = 0;
  if (/\$\d+/.test(t)) s += 2; // a real price
  if (/\b(a month|per month|weekly|every morning|exact second)\b/i.test(t)) s += 2; // concrete cadence
  if (/\b(detects|counts|photographs|syncs|alerts|livestreams|charts|ranking|leaderboard|dashboard|notification)\b/i.test(t)) s += Math.min(3, (t.match(/\b(detects|counts|photographs|syncs|alerts|livestreams|charts|ranking|leaderboard|dashboard|notification)\b/gi) || []).length);
  if (/\b(DMV|bookshelf|laundry|eyelids|friends)\b/.test(t)) s += 1; // a concrete setting
  return s;
}

// Funniness: self-defeating logic, absurd justification, deadpan punchline.
function funniness(t: string): number {
  let s = 0;
  if (/because|so you never miss/i.test(t)) s += 2; // earnest justification of nonsense
  if (/wakes you.*confirm you (fell asleep|were asleep)/i.test(t)) s += 3; // self-defeating core
  if (/grades each snore|snore report/i.test(t)) s += 2; // grading something nobody can control
  if (/leaderboard your friends never asked to see/i.test(t)) s += 1;
  if (/lost in the process|deserve analytics|watch someone else wait/i.test(t)) s += 2;
  if (/leaderboard ranking your blinking|single particle/i.test(t)) s += 2;
  return s;
}

// Pointlessness: the function helps nobody, solves nothing, or undoes itself.
function pointlessness(t: string): number {
  let s = 0;
  if (/wakes you.*(asleep|unconscious)/i.test(t)) s += 4; // destroys the very state it monitors
  if (/records you snoring all night, grades each snore/i.test(t)) s += 3; // measures the unfixable, grades the unconscious
  if (/counts every blink|photographs the dust|ranking your blinking/i.test(t)) s += 3; // nobody needs this measured
  if (/charges extra to tell you which sock it lost/i.test(t)) s += 3; // pays to be told of its own failure
  if (/watch someone else wait instead of you/i.test(t)) s += 1; // outsourcing boredom, still bored
  return s;
}

function isOneSentence(t: string): boolean {
  // Exactly one terminal period, at the end; no other sentence breaks.
  const trimmed = t.trim();
  const terminals = (trimmed.match(/[.!?]/g) || []).length;
  return terminals === 1 && trimmed.endsWith(".");
}

function score(c: Candidate) {
  const t = c.text;
  const valid = t.length >= 1 && t.length <= 240 && t.trim().length > 0 && isOneSentence(t);
  // Pointlessness is the deciding axis in the brief ("perfectly pointless"),
  // so it counts double; specificity and funniness count once each.
  const total = specificity(t) + funniness(t) + 2 * pointlessness(t);
  return { text: t, chars: t.length, valid, specificity: specificity(t), funniness: funniness(t), pointlessness: pointlessness(t), total };
}

const ranked = CANDIDATES.map(score)
  .filter((r) => r.valid)
  .sort((a, b) => b.total - a.total);

if (ranked.length === 0) {
  throw new Error("no valid candidate (1 sentence, 1..240 chars)");
}

for (const r of ranked) {
  console.log(
    `${r.total} pts (specific ${r.specificity} / funny ${r.funniness} / pointless ${r.pointlessness}) [${r.chars} chars] ${r.text}`,
  );
}

const winner = ranked[0];
mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", winner.text + "\n", "utf8");
console.log(`\nWINNER [${winner.chars} chars]: ${winner.text}`);
