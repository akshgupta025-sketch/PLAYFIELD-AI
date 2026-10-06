import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2";

const photoInput = document.getElementById("photo-input");
const previewImage = document.getElementById("preview-image");
const previewPlaceholder = document.getElementById("preview-placeholder");
const previewBox = document.getElementById("preview-box");
const analyzeButton = document.getElementById("analyze-button");
const resultBox = document.getElementById("result-box");

let selectedFile = null;
let previewUrl = null;
let classifier = null;

const LABELS = [
  "a cricket ground",
  "a football soccer field",
  "a badminton court",
  "a volleyball court",
  "a basketball court",
  "an open grassy field",
  "a street with buildings and no sports space",
];

const SPORTS = {
  "a cricket ground": {
    name: "Cricket",
    emoji: "🏏",
    why: "The photo looks like a large open cricket-style ground.",
    challenge: "Play cricket for 30 minutes.",
  },
  "a football soccer field": {
    name: "Football",
    emoji: "⚽",
    why: "The photo looks like a football field.",
    challenge: "Invite 2 friends for a football match.",
  },
  "a badminton court": {
    name: "Badminton",
    emoji: "🏸",
    why: "The photo looks like a badminton court.",
    challenge: "Play one badminton game.",
  },
  "a volleyball court": {
    name: "Volleyball",
    emoji: "🏐",
    why: "The photo looks like a volleyball court.",
    challenge: "Play one volleyball game.",
  },
  "a basketball court": {
    name: "Basketball",
    emoji: "🏀",
    why: "The photo looks like a basketball court.",
    challenge: "Take 20 shots or play for 20 minutes.",
  },
  "an open grassy field": {
    name: "Open field games",
    emoji: "🌿",
    why: "This looks like open grass. Cricket or football can both work.",
    challenge: "Pick cricket or football and play for 20 minutes.",
  },
  "a street with buildings and no sports space": {
    name: "Not a playable field",
    emoji: "🚫",
    why: "This looks like buildings or a street, not a sports space.",
    challenge: "Find a nearby park or ground, then try again.",
  },
};

photoInput.addEventListener("change", function () {
  const file = photoInput.files[0];
  if (!file) {
    return;
  }

  selectedFile = file;

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }

  previewUrl = URL.createObjectURL(file);
  previewImage.src = previewUrl;
  previewImage.hidden = false;
  previewPlaceholder.hidden = true;
  previewBox.classList.remove("empty");

  analyzeButton.disabled = false;
  resultBox.textContent = "Photo ready. Click Analyze field.";
});

analyzeButton.addEventListener("click", async function () {
  if (!selectedFile) {
    resultBox.textContent = "Please upload a photo first.";
    return;
  }

  analyzeButton.disabled = true;

  try {
    resultBox.textContent =
      "Loading open AI model in your browser. First time can take 1–2 minutes...";

    if (!classifier) {
      classifier = await pipeline(
        "zero-shot-image-classification",
        "Xenova/clip-vit-base-patch32",
        { dtype: "q8" }
      );
    }

    resultBox.textContent = "Looking at your photo...";

    const imageForAi = await fileToJpegDataUrl(selectedFile);
    const scores = await classifier(imageForAi, LABELS);
    const best = scores[0];
    const sport = SPORTS[best.label];
    const percent = Math.round(best.score * 100);

    let otherLines = "";
    for (let i = 0; i < Math.min(3, scores.length); i += 1) {
      const item = scores[i];
      otherLines +=
        "<li>" +
        item.label +
        ": " +
        Math.round(item.score * 100) +
        "%</li>";
    }

    resultBox.innerHTML =
      "<p class='sport-line'>" +
      sport.emoji +
      " <strong>" +
      sport.name +
      "</strong></p>" +
      "<p class='match-line'>" +
      percent +
      "% match</p>" +
      "<p>" +
      sport.why +
      "</p>" +
      "<p><strong>Challenge:</strong> " +
      sport.challenge +
      "</p>" +
      "<p class='tiny'>Top scores:</p>" +
      "<ul class='score-list'>" +
      otherLines +
      "</ul>";
  } catch (error) {
    console.error(error);
    resultBox.textContent =
      "AI failed. Check your internet for the first model download, then try again. " +
      error.message;
  }

  analyzeButton.disabled = false;
});

async function fileToJpegDataUrl(file) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const maxSize = 512;
  const scale = Math.min(maxSize / bitmap.width, maxSize / bitmap.height, 1);
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.9);
}
