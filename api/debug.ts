export default async function handler(req: any, res: any) {
  try {
    const mod = await import("../server.ts");
    res.status(200).json({
      success: true,
      hasDefault: !!mod.default,
      type: typeof mod.default,
    });
  } catch (err: any) {
    res.status(200).json({
      success: false,
      errorName: err.name,
      errorMessage: err.message,
      errorCode: err.code,
      stack: err.stack,
    });
  }
}
