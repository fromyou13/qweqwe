const ALLOWED_IMAGE_HOSTS = new Set(["raw.githubusercontent.com", "img.pokemondb.net"]);

module.exports = async function handler(request, response) {
  const incomingUrl = new URL(request.url, `https://${request.headers.host}`);
  const imageUrl = incomingUrl.searchParams.get("url");

  if (!imageUrl) {
    response.status(400).json({ error: "Missing image url" });
    return;
  }

  let targetUrl;
  try {
    targetUrl = new URL(imageUrl);
  } catch {
    response.status(400).json({ error: "Invalid image url" });
    return;
  }

  if (targetUrl.protocol !== "https:" || !ALLOWED_IMAGE_HOSTS.has(targetUrl.hostname)) {
    response.status(400).json({ error: "Image host is not allowed" });
    return;
  }

  try {
    const imageResponse = await fetch(targetUrl);
    const contentType = imageResponse.headers.get("content-type") || "image/png";
    const body = await imageResponse.arrayBuffer();

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Cache-Control", "s-maxage=604800, stale-while-revalidate=2592000");
    response.setHeader("Content-Type", contentType);
    response.status(imageResponse.status).send(Buffer.from(body));
  } catch (error) {
    response.status(502).json({
      error: "Pokemon image proxy failed",
      message: error.message
    });
  }
};
