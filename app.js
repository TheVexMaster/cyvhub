const startFlowButton = document.getElementById("start-flow");
const adProgress = document.getElementById("ad-progress");
const adStatus = document.getElementById("ad-status");
const adTime = document.getElementById("ad-time");
const completeAdButton = document.getElementById("complete-ad");
const accessCodeElement = document.getElementById("access-code");
const previewCodeElement = document.getElementById("preview-code");
const generateButton = document.getElementById("generate-code");
const copyButton = document.getElementById("copy-code");
const heroStatus = document.getElementById("hero-status");
const keyPanel = document.getElementById("key-panel");

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const adDuration = 60;

let timerId = null;
let timeLeft = adDuration;
let unlocked = false;
let flowStarted = false;
let isPaused = false;

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

function setCode(value) {
  accessCodeElement.textContent = value;
}

function setPreview(message) {
  previewCodeElement.textContent = message;
}

function setLockedState(isLocked) {
  keyPanel.classList.toggle("locked", isLocked);
  copyButton.disabled = isLocked;
  generateButton.disabled = isLocked;
  heroStatus.textContent = isLocked ? "Locked" : "Ready";
}

function updateTimerUI(statusText) {
  const progress = ((adDuration - timeLeft) / adDuration) * 100;
  adProgress.style.width = `${Math.max(0, Math.min(100, progress))}%`;
  adStatus.textContent = statusText;
  adTime.textContent = `${Math.max(0, timeLeft)}s`;
}

function stopTimer() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function pauseAdTimer(reason) {
  if (!timerId || unlocked || timeLeft <= 0) {
    return;
  }

  isPaused = true;
  stopTimer();
  adStatus.textContent = reason;
  heroStatus.textContent = "Paused";
}

function resumeAdTimer() {
  if (!flowStarted || unlocked || timeLeft <= 0 || timerId || !isPaused) {
    return;
  }

  isPaused = false;
  adStatus.textContent = "Watching ad...";
  heroStatus.textContent = "Watching ad";

  timerId = window.setInterval(() => {
    timeLeft -= 1;
    updateTimerUI(timeLeft > 0 ? "Watching ad..." : "Ad finished");

    if (timeLeft <= 0) {
      stopTimer();
      completeAdButton.disabled = false;
      completeAdButton.textContent = "Unlock key";
      heroStatus.textContent = "Ready";
    }
  }, 1000);
}

function resetAdFlow() {
  stopTimer();

  unlocked = false;
  flowStarted = false;
  isPaused = false;
  timeLeft = adDuration;
  updateTimerUI("Ready to start");
  completeAdButton.disabled = true;
  completeAdButton.textContent = "Finish watching";
  setLockedState(true);
  setCode("CYV-LOCK-0000");
  setPreview("Complete the ad to reveal your code.");
}

function unlockCode() {
  unlocked = true;
  stopTimer();
  isPaused = false;

  const code = generateKey();
  setCode(code);
  setPreview("Copy it now or generate a fresh key.");
  setLockedState(false);
  adStatus.textContent = "Ad complete";
  adTime.textContent = "Unlocked";
  adProgress.style.width = "100%";
  completeAdButton.textContent = "Ad completed";
  completeAdButton.disabled = true;
}

function startAdTimer() {
  if (timerId || unlocked || timeLeft <= 0) {
    return;
  }

  flowStarted = true;
  isPaused = false;
  adStatus.textContent = "Watching ad...";
  completeAdButton.disabled = true;
  heroStatus.textContent = "Watching ad";

  timerId = window.setInterval(() => {
    timeLeft -= 1;
    updateTimerUI(timeLeft > 0 ? "Watching ad..." : "Ad finished");

    if (timeLeft <= 0) {
      stopTimer();
      completeAdButton.disabled = false;
      completeAdButton.textContent = "Unlock key";
    }
  }, 1000);
}

startFlowButton.addEventListener("click", () => {
  document.getElementById("ad-gate").scrollIntoView({ behavior: "smooth", block: "start" });
  startAdTimer();
});

window.addEventListener("blur", () => {
  pauseAdTimer("Paused while page is not active");
});

window.addEventListener("focus", () => {
  resumeAdTimer();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pauseAdTimer("Paused while page is hidden");
    return;
  }

  resumeAdTimer();
});

completeAdButton.addEventListener("click", () => {
  if (!timerId && timeLeft <= 0) {
    unlockCode();
  }
});

copyButton.addEventListener("click", async () => {
  if (!unlocked) {
    return;
  }

  const value = accessCodeElement.textContent.trim();

  try {
    await navigator.clipboard.writeText(value);
    copyButton.textContent = "Copied";
  } catch {
    copyButton.textContent = "Copy failed";
  }

  window.setTimeout(() => {
    copyButton.textContent = "Copy Key";
  }, 1200);
});

generateButton.addEventListener("click", () => {
  if (!unlocked) {
    return;
  }

  setCode(generateKey());
  generateButton.textContent = "Key Ready";

  window.setTimeout(() => {
    generateButton.textContent = "Generate New Key";
  }, 1200);
});

resetAdFlow();
