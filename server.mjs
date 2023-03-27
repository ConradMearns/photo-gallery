import express from "express";
import path from "path";
import * as fs from "fs";
import cors from "cors";
import sharp from "sharp";
// import { handler as ssrHandler } from "./dist/server/entry.mjs";

const app = express();
const port = process.env.PORT || 3001;
app.use(
  cors({
    origin: "*",
  })
);
const CACHE_DIR = path.join(".", "cache");
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

let imageMetadata;

// Load image metadata from file
try {
  const metadataFile = fs.readFileSync("image-metadata.json");
  imageMetadata = JSON.parse(metadataFile.toString());
} catch (err) {
  console.error("Error loading image metadata", err);
  process.exit(1);
}

// Route to display links to each image
app.get("/digest", (req, res) => {
  let html = "<html><body><ul>";

  for (const [hash, metadata] of Object.entries(imageMetadata)) {
    const imagePath = path.basename(metadata.path);
    const imageLink = `<a href="/image/${hash}">${imagePath}</a>`;
    html += `<li>${imageLink} (${hash})</li>`;
  }

  html += "</ul></body></html>";
  res.send(html);
});

app.get("/images", (req, res) => {
  const images = Object.entries(imageMetadata).map(([hash, metadata]) => {
    const imagePath = path.basename(metadata.path);
    const imageUrl = `/image/${hash}`;
    return { imageUrl, imagePath };
  });
  res.json(images);
});

app.get("/image/:hash", async (req, res) => {
  try {
    const { hash } = req.params;
    const { width, height, quality, cache = true } = req.query;

    const imageInfo = imageMetadata[hash];

    if (!imageInfo) {
      return res.status(404).send("File not found");
    }

    const cacheKey = `${hash}_${width || ""}_${height || ""}_${quality || ""}`;

    const cachedImage = path.join(CACHE_DIR, cacheKey);
    if (cache == true && fs.existsSync(cachedImage)) {
      const image = fs.readFileSync(cachedImage);
      res.writeHead(200, { "Content-Type": "image/webp" });
      res.end(image);
      return;
    }

    let image = fs.readFileSync(imageInfo.path);

    let parsedQuality = 50;
    if (quality) {
      parsedQuality = parseInt(quality);
      if (isNaN(parsedQuality)) {
        return res.status(400).send("quality must be an integer");
      }
    }

    let parsedWidth = null;
    if (width) {
      parsedWidth = parseInt(width);
      if (isNaN(parsedWidth)) {
        return res.status(400).send("Width must be an integer");
      }
    }

    let parsedHeight = null;
    if (height) {
      parsedHeight = parseInt(height);
      if (isNaN(parsedHeight)) {
        return res.status(400).send("Height must be an integer");
      }
    }

    if (parsedWidth !== null || parsedHeight !== null) {
      let transform = sharp(image);

      // Rotate the image based on its orientation
      const metadata = await transform.metadata();
      if (
        metadata.orientation &&
        metadata.orientation >= 5 &&
        metadata.orientation <= 8
      ) {
        transform = transform.rotate();
      }

      image = await transform
        // .withMetadata()
        .resize(parsedWidth, parsedHeight)
        // .jpeg({
        //   quality: parsedQuality,
        //   progressive: true,
        //   chromaSubsampling: "4:4:4",
        // })
        .webp({
          quality: parsedQuality,
          alphaQuality: parsedQuality,
          reducionEffort: 6,
        })
        .toBuffer();

      if (cache) {
        fs.writeFileSync(cachedImage, image);
      }
    }

    res.writeHead(200, { "Content-Type": "image/webp" });
    res.end(image);
  } catch (error) {
    console.log(error);
  }
});

export function startServer() {
  console.log("Starting Astro");
}
// app.use(express.static("dist/client/"));
// app.use(ssrHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
