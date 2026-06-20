/**
 * Google AdSense configuration — paste your IDs from https://adsense.google.com
 *
 * 1. Copy your publisher ID (ca-pub-XXXXXXXXXXXXXXXX)
 * 2. Create a display ad unit for each slot size in AdSense
 * 3. Paste each ad unit ID below
 */
window.CYV_ADS = {
  enabled: true,
  provider: "adsense",
  adsense: {
    client: "",

    slots: {
      topDesktop: "",
      topMobile: "",
      mainDesktop: "",
      mainMobile: "",
      bottomDesktop: "",
      bottomMobile: "",
      sideDesktop: "",
      stickyMobile: "",
    },
  },
};
