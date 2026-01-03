export async function onRequest({ request, env }) {
  try {
    const url = new URL(request.url);

    // API Routes
    if (url.pathname.startsWith('/api')) {
      // placeholder for future API route handling
    }

    return new Response('Not found', { status: 404 });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
