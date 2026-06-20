import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { injectRouteMetadata } from "./prerender";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // Return 404 for crawl-control files that are not present rather than
  // silently falling through to the SPA shell (which would confuse crawlers).
  const crawlFiles = ["/robots.txt", "/sitemap.xml", "/llms.txt"];
  app.use((req, res, next) => {
    if (crawlFiles.includes(req.path)) {
      return res.status(404).type("text/plain").send("Not found");
    }
    next();
  });

  // fall through to index.html with route-specific metadata injected
  app.use("/{*path}", async (req, res, next) => {
    try {
      const indexPath = path.resolve(distPath, "index.html");
      const template = await fs.promises.readFile(indexPath, "utf-8");
      const pathname = req.originalUrl.split("?")[0];
      const page = await injectRouteMetadata(template, pathname);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      next(e);
    }
  });
}
