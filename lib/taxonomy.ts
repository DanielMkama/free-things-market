// Shared vocabulary for offers & requests.

export const OFFER_TYPES = [
  "Thing",
  "Skill",
  "Time",
  "Knowledge",
  "Connection",
  "Other",
] as const;
export type OfferType = (typeof OFFER_TYPES)[number];

export const CATEGORIES = [
  "Design",
  "Technology",
  "Education",
  "Career",
  "Food",
  "Art",
  "Photography",
  "Business",
  "Books",
  "Repair",
  "Lifestyle",
  "Other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const AVAILABILITY = [
  "Anytime",
  "This week",
  "This month",
  "Specific date",
  "Flexible",
] as const;

export const URGENCY = ["Whenever", "This week", "This month"] as const;

export const GIVE_FORWARD_TYPES = [
  "GIVE A THING",
  "GIVE YOUR TIME",
  "GIVE A SKILL",
  "HELP SOMEONE",
  "MAKE AN INTRODUCTION",
] as const;
export type GiveForwardType = (typeof GIVE_FORWARD_TYPES)[number];

export const REPORT_REASONS = [
  "Illegal or dangerous goods",
  "Hate or harassment",
  "Sexual services",
  "Fraud or scam",
  "Weapons or drugs",
  "Money is being asked for",
  "Something else unsafe",
] as const;

// Landing-page "what can you give?" showcase
export const SHOWCASE = {
  Things: [
    "Books",
    "Clothes",
    "Plants",
    "Electronics",
    "Food",
    "Tools",
    "Art",
    "Furniture",
    "School supplies",
  ],
  Skills: [
    "Design",
    "Coding",
    "Photography",
    "Writing",
    "Marketing",
    "Cooking",
    "Music",
    "Repair",
    "Teaching",
  ],
  Time: ["30 minutes", "1 hour", "2 hours", "A day"],
  Knowledge: [
    "Advice",
    "Mentorship",
    "Career guidance",
    "Business guidance",
    "Introductions",
    "Feedback",
  ],
} as const;

export const TYPE_EMOJI: Record<string, string> = {
  Thing: "📦",
  Skill: "✋",
  Time: "⏰",
  Knowledge: "💡",
  Connection: "🔗",
  Other: "✨",
};

export const CATEGORY_EMOJI: Record<string, string> = {
  Design: "🎨",
  Technology: "💻",
  Education: "📚",
  Career: "🧭",
  Food: "🍲",
  Art: "🖼️",
  Photography: "📷",
  Business: "📈",
  Books: "📖",
  Repair: "🔧",
  Lifestyle: "🌱",
  Other: "✨",
};

export function isOfferType(v: string): v is OfferType {
  return (OFFER_TYPES as readonly string[]).includes(v);
}
export function isCategory(v: string): v is Category {
  return (CATEGORIES as readonly string[]).includes(v);
}
