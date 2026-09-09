import app from "../server.ts";

export default function handler(req: any, res: any) {
  try {
    res.status(200).json({ status: "ok", appType: typeof app });
  } catch (err: any) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}
