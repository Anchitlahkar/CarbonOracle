export default async function handler(req: import("express").Request, res: import("express").Response) {
  try {
    // Import from the compiled backend dist folder
    const { app } = await import('../backend/dist/index.js');
    if (!app) {
      throw new Error('App not found in backend/dist/index.js');
    }
    return app(req, res);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return res.status(500).json({
      error: 'Vercel handler failed',
      message: error.message,
      stack: error.stack
    });
  }
}
