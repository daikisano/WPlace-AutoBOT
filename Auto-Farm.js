(async () => {
  const CONFIG = {
    START_X: 1730, // change to your base X
    START_Y: 980,  // change to your base Y
    WIDTH: 10,     // area width
    HEIGHT: 10     // area height
  };

  let AUTH_TOKEN = null;

  // Hook fetch to grab token automatically
  const origFetch = window.fetch;
  window.fetch = async (...args) => {
    if (args[1] && args[1].body) {
      try {
        const parsed = JSON.parse(args[1].body);
        if (parsed.t && !AUTH_TOKEN) {
          AUTH_TOKEN = parsed.t;
          console.log("🎯 Captured token:", AUTH_TOKEN);
        }
      } catch {}
    }
    return origFetch(...args);
  };

  async function fetchAPI(url, options = {}) {
    if (!AUTH_TOKEN) {
      console.warn("⚠️ No token yet, waiting...");
      return null;
    }

    options.headers = {
      ...(options.headers || {}),
      "accept": "*/*",
      "content-type": "text/plain;charset=UTF-8",
      "authorization": AUTH_TOKEN
    };

    try {
      const res = await origFetch(url, options);
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    } catch (err) {
      console.error("❌ Fetch failed:", err);
      return null;
    }
  }

  async function paintPixel(x, y) {
    const absX = CONFIG.START_X + x;
    const absY = CONFIG.START_Y + y;
    const randomColor = Math.floor(Math.random() * 31) + 1;

    return await fetchAPI(`https://backend.wplace.live/s0/pixel/${absX}/${absY}`, {
      method: "POST",
      body: JSON.stringify({
        coords: [absX, absY],
        colors: [randomColor]
      })
    });
  }

  async function startBot() {
    console.log("🤖 Bot started. Waiting for token...");

    while (!AUTH_TOKEN) {
      await new Promise(r => setTimeout(r, 1000));
    }

    console.log("✅ Token ready, painting begins!");

    while (true) {
      const x = Math.floor(Math.random() * CONFIG.WIDTH);
      const y = Math.floor(Math.random() * CONFIG.HEIGHT);

      const result = await paintPixel(x, y);
      console.log("🎨 Paint result:", result);

      // Cooldown: wplace usually enforces a delay between paints
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  startBot();
})();
