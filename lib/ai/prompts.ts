export type ContentFormat = "blog" | "ad" | "email" | "script" | "social";

export function buildPrompt(format: ContentFormat, prompt: string, brandVoice: string | null, brandProfile?: { name?: string | null; tone?: string | null; style_guidelines?: string | null } | null, learnedTips?: string | null) {
  const base = `You are an expert marketing copywriter. Write ${format} content.
Tone: professional, clear, on-brand.
`;
  const profile = brandProfile ? `\nBrand profile: ${brandProfile.name ?? "(unnamed)"}\nTone: ${brandProfile.tone ?? "-"}\nStyle: ${brandProfile.style_guidelines ?? "-"}\n` : "";
  const voice = brandVoice ? `\nBrand voice guidelines:\n${brandVoice}\n` : "";
  const tips = learnedTips ? `\nIncorporate these user-approved improvement tips:\n${learnedTips}\n` : "";
  const task = `\nTask:\n${prompt}\n`;
  const rules = formatRules(format);
  return `${base}${profile}${voice}${tips}${task}${rules}`;
}

function formatRules(format: ContentFormat) {
  switch (format) {
    case "blog":
      return "\nRules: Include headline, intro, 3-5 sections, and a conclusion.";
    case "ad":
      return "\nRules: Hook, value proposition, CTA, under 80 words.";
    case "email":
      return "\nRules: Subject line, preview text, body, CTA.";
    case "script":
      return "\nRules: Short script with scene directions and dialogue.";
    case "social":
      return "\nRules: 1-2 short paragraphs, include hashtags sparingly.";
  }
}


