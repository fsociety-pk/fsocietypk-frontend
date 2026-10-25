import { ChallengeCategory } from "../types";
export const CHALLENGE_CATEGORIES: ChallengeCategory[] = [
  "web",
  "crypto",
  "pwn",
  "rev",
  "forensics",
  "osint",
  "misc",
  "stego",
  "network",
  "mobile",
];
export const CATEGORY_LABELS: Record<string, string> = {
  web: "Web security",
  crypto: "Cryptography",
  pwn: "Binary exploitation",
  rev: "Reverse engineering",
  forensics: "Forensics",
  osint: "OSINT",
  misc: "Miscellaneous",
  stego: "Steganography",
  network: "Network security",
  mobile: "Mobile security",
};
