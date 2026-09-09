export default function handler(req: any, res: any) {
  res.status(200).json({
    status: "ok",
    node: process.version,
    env_vercel: process.env.VERCEL,
  });
}
