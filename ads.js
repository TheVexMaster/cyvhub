const SLOT_SIZES = {
  "top-desktop": {
    width: 728,
    height: 90,
    label: "728 × 90 Leaderboard",
    responsive: true,
    adFormat: "horizontal",
  },
  "top-mobile": {
    width: 320,
    height: 50,
    label: "320 × 50 Mobile Banner",
    responsive: true,
    adFormat: "horizontal",
  },
  "main-desktop": {
    width: 336,
    height: 280,
    label: "336 × 280 Large Rectangle",
    responsive: false,
  },
  "main-mobile": {
    width: 320,
    height: 100,
    label: "320 × 100 Large Mobile Banner",
    responsive: true,
    adFormat: "horizontal",
  },
  "bottom-desktop": {
    width: 728,
    height: 90,
    label: "728 × 90 Leaderboard",
    responsive: true,
    adFormat: "horizontal",
  },
  "bottom-mobile": {
    width: 300,
    height: 250,
    label: "300 × 250 Medium Rectangle",
    responsive: false,
  },
  "side-desktop": {
    width: 160,
    height: 600,
    label: "160 × 600 Wide Skyscraper",
    responsive: false,
  },
  "sticky-mobile": {
    width: 320,
    height: 50,
    label: "320 × 50 Sticky Banner",
    responsive: true,
    adFormat: "horizontal",
  },
};

function slotIdToConfigKey(slotId) {
  return slotId.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function isAdSenseConfigured() {
  const { client, slots } = window.CYV_ADS.adsense;
  return Boolean(client && Object.values(slots).some(Boolean));
}

function createPlaceholder(slotId, size, message) {
  const placeholder = document.createElement("div");
  placeholder.className = "ad-slot__placeholder";
  placeholder.innerHTML = `
    <span class="ad-slot__placeholder-label">AdSense</span>
    <strong>${size.label}</strong>
    <span class="ad-slot__placeholder-id">${slotId}</span>
    ${message ? `<p class="ad-slot__placeholder-note">${message}</p>` : ""}
  `;
  return placeholder;
}

function mountAdSenseSlot(container, slotKey, size) {
  const { client, slots } = window.CYV_ADS.adsense;
  const adUnitId = slots[slotKey];

  if (!client || !adUnitId) {
    return false;
  }

  const ins = document.createElement("ins");
  ins.className = "adsbygoogle";
  ins.setAttribute("data-ad-client", client);
  ins.setAttribute("data-ad-slot", adUnitId);

  if (size.responsive) {
    ins.style.display = "block";
    ins.setAttribute("data-ad-format", size.adFormat || "auto");
    ins.setAttribute("data-full-width-responsive", "true");
  } else {
    ins.style.display = "inline-block";
    ins.style.width = `${size.width}px`;
    ins.style.height = `${size.height}px`;
    ins.style.maxWidth = "100%";
  }

  container.appendChild(ins);
  return true;
}

function initAdSlot(slotElement) {
  const slotId = slotElement.dataset.slot;
  const content = slotElement.querySelector(".ad-slot__content");
  const size = SLOT_SIZES[slotId];

  if (!content || !size) {
    return;
  }

  content.innerHTML = "";
  content.style.minWidth = `${Math.min(size.width, content.parentElement?.clientWidth || size.width)}px`;
  content.style.minHeight = `${size.height}px`;

  const slotKey = slotIdToConfigKey(slotId);
  const useAdSense =
    window.CYV_ADS.enabled &&
    window.CYV_ADS.provider === "adsense" &&
    mountAdSenseSlot(content, slotKey, size);

  if (!useAdSense) {
    const message =
      window.CYV_ADS.provider === "adsense" && !isAdSenseConfigured()
        ? "Add your publisher ID and ad unit IDs in ads-config.js"
        : "Ad unit not configured for this slot";
    content.appendChild(createPlaceholder(slotId, size, message));
  }
}

function initAdSlots() {
  document.querySelectorAll(".ad-slot[data-slot]").forEach(initAdSlot);

  if (window.CYV_ADS.provider === "adsense" && window.adsbygoogle) {
    document.querySelectorAll(".ad-slot__content ins.adsbygoogle").forEach(() => {
      window.adsbygoogle.push({});
    });
  }
}

function loadAdSenseScript() {
  const { client } = window.CYV_ADS.adsense;

  if (!client) {
    return Promise.resolve();
  }

  if (document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    script.crossOrigin = "anonymous";
    script.onload = resolve;
    script.onerror = resolve;
    document.head.appendChild(script);
  });
}

async function bootAds() {
  if (!window.CYV_ADS?.enabled) {
    return;
  }

  if (window.CYV_ADS.provider === "adsense") {
    await loadAdSenseScript();
  }

  initAdSlots();
}

bootAds();
