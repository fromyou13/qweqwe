module.exports = async function handler(request, response) {
  const incomingUrl = new URL(request.url, `https://${request.headers.host}`);
  const targetPath = incomingUrl.pathname.replace(/^\/api\/poke/, "");
  const targetUrl = `https://pokeapi.co${targetPath}${incomingUrl.search}`;

  try {
    const apiResponse = await fetch(targetUrl, {
      headers: {
        accept: "application/json"
      }
    });

    const contentType = apiResponse.headers.get("content-type") || "application/json";
    const body = await apiResponse.arrayBuffer();

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    response.setHeader("Content-Type", contentType);
    response.status(apiResponse.status).send(Buffer.from(body));
  } catch (error) {
    response.status(502).json({
      error: "PokeAPI proxy failed",
      message: error.message
    });
  }
};
