// Cloudflare Worker – NSE India CORS Proxy
// FREE: 100,000 requests/day

export default {
    async fetch(request) {
      // Handle CORS preflight
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
          },
        });
      }
  
      const url = new URL(request.url);
      const endpoint = url.searchParams.get("endpoint");
  
      if (!endpoint) {
        return corsJson({ error: "Missing 'endpoint' param. Usage: ?endpoint=/api/equity-stockIndices?index=NIFTY%2050" }, 400);
      }
  
      const nseUrl = `https://www.nseindia.com${endpoint}`;
  
      try {
        // Step 1: Get cookies from NSE homepage
        const homeRes = await fetch("https://www.nseindia.com/", {
          headers: getHeaders(),
          redirect: "follow",
        });
  
        // Extract all cookies
        const setCookies = homeRes.headers.getAll
          ? homeRes.headers.getAll("set-cookie")
          : [homeRes.headers.get("set-cookie")].filter(Boolean);
  
        const cookies = setCookies
          .map((c) => c.split(";")[0])
          .join("; ");
  
        // Step 2: Fetch actual API data with cookies
        const apiRes = await fetch(nseUrl, {
          headers: {
            ...getHeaders(),
            Cookie: cookies,
            Referer: "https://www.nseindia.com/",
          },
        });
  
        if (!apiRes.ok) {
          return corsJson({ error: `NSE returned ${apiRes.status}` }, apiRes.status);
        }
  
        const data = await apiRes.text();
        return new Response(data, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=8",
          },
        });
      } catch (err) {
        return corsJson({ error: err.message }, 500);
      }
    },
  };
  
  function getHeaders() {
    return {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
    };
  }
  
  function corsJson(body, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }