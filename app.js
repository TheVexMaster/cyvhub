const accessCodeElement = document.getElementById("access-code");
const generateButton = document.getElementById("generate-code");
const copyButton = document.getElementById("copy-code");
const keyStatus = document.getElementById("key-status");

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const waitDurationMs = 10 * 1000;
const cooldownDurationMs = 10 * 60 * 1000;
const cooldownStorageKey = "cyv-key-next-generation-at";

let activeKey = "";
let waitTimerId = null;
let cooldownTimerId = null;
let nextGenerationAtFallback = 0;

function generateKey() {
  const segments = Array.from({ length: 3 }, () => {
    let segment = "";

    for (let index = 0; index < 4; index += 1) {
      segment += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    return segment;
  });

  return `CYV-${segments.join("-")}`;
}

function setStatus(message) {
  if (keyStatus) {
    keyStatus.textContent = message;
  }
}

function setKey(value) {
  activeKey = value;

  if (accessCodeElement) {
    accessCodeElement.textContent = value;
  }

  if (copyButton) {
    copyButton.disabled = !value;
  }
}

function readNextGenerationAt() {
  try {
    return Number(window.localStorage.getItem(cooldownStorageKey)) || nextGenerationAtFallback;
  } catch {
    return nextGenerationAtFallback;
  }
}

function writeNextGenerationAt(timestamp) {
  nextGenerationAtFallback = timestamp;

  try {
    window.localStorage.setItem(cooldownStorageKey, String(timestamp));
  } catch {
    // The in-memory fallback still enforces the cooldown for this page session.
  }
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function clearWaitTimer() {
  if (waitTimerId) {
    window.clearInterval(waitTimerId);
    waitTimerId = null;
  }
}

function clearCooldownTimer() {
  if (cooldownTimerId) {
    window.clearInterval(cooldownTimerId);
    cooldownTimerId = null;
  }
}

function updateCooldownState() {
  const remainingMs = readNextGenerationAt() - Date.now();

  if (remainingMs <= 0) {
    clearCooldownTimer();
    generateButton.disabled = false;
    generateButton.textContent = "Generate Key";

    if (activeKey) {
      setStatus("You can generate a new key now.");
    } else {
      setStatus("Generate a key when you are ready to start.");
    }

    return;
  }

  generateButton.disabled = true;
  generateButton.textContent = `Wait ${formatDuration(remainingMs)}`;
  setStatus(`Next key available in ${formatDuration(remainingMs)}.`);
}

function startCooldown() {
  writeNextGenerationAt(Date.now() + cooldownDurationMs);
  updateCooldownState();

  clearCooldownTimer();
  cooldownTimerId = window.setInterval(updateCooldownState, 1000);
}

function startGenerationWait() {
  clearWaitTimer();
  clearCooldownTimer();

  const readyAt = Date.now() + waitDurationMs;

  generateButton.disabled = true;
  generateButton.textContent = "Generating 10s";
  copyButton.disabled = true;
  setStatus("Generating key in 10s.");

  waitTimerId = window.setInterval(() => {
    const remainingMs = readyAt - Date.now();

    if (remainingMs > 0) {
      const remainingText = formatDuration(remainingMs);
      generateButton.textContent = `Generating ${remainingText}`;
      setStatus(`Generating key in ${remainingText}.`);
      return;
    }

    clearWaitTimer();
    setKey(generateKey());
    startCooldown();
  }, 250);
}

if (generateButton && copyButton && accessCodeElement) {
  generateButton.addEventListener("click", () => {
    if (readNextGenerationAt() > Date.now()) {
      updateCooldownState();
      return;
    }

    startGenerationWait();
  });

  copyButton.addEventListener("click", async () => {
    if (!activeKey) {
      return;
    }

    try {
      await navigator.clipboard.writeText(activeKey);
      copyButton.textContent = "Copied";
      setStatus("Key copied to your clipboard.");
    } catch {
      copyButton.textContent = "Copy Failed";
      setStatus("Copy failed. Select the key text and copy it manually.");
    }

    window.setTimeout(() => {
      copyButton.textContent = "Copy Key";
    }, 1400);
  });

  updateCooldownState();

  if (readNextGenerationAt() > Date.now()) {
    cooldownTimerId = window.setInterval(updateCooldownState, 1000);
  }
}
