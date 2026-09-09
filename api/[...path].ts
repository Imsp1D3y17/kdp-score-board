export default function handler(req: any, res: any) {
  res.status(200).json({
    url: req.url,
    originalUrl: req.originalUrl,
    path: req.query.path,
  });
}
