// Warning
/**
 * I could not figure out how to compile this to mjs, server.mjs has changes - this is deprecated
 */

import express from "express";
import path from "path";
import * as fs from "fs";

import sharp from "sharp";
import { Warning } from "postcss";

const app = express();
const port = process.env.PORT || 3000;

interface ImageMetadata {
  [key: string]: {
    path: string;
    size: number;
    createdAt: string;
    // exif?: { [key: string]: any };
    hash: string;
  };
}


let imageMetadata: ImageMetadata;

// Load image metadata from file
try {
  const metadataFile = fs.readFileSync("image-metadata.json");
  imageMetadata = JSON.parse(metadataFile.toString());
} catch (err) {
  console.error("Error loading image metadata", err);
  process.exit(1);
}


// Route to display links to each image
app.get('/digest', (req, res) => {
  let html = '<html><body><ul>';

  for (const [hash, metadata] of Object.entries(imageMetadata)) {
    const imagePath = path.basename(metadata.path);
    const imageLink = `<a href="/image/${hash}">${imagePath}</a>`;
    html += `<li>${imageLink} (${hash})</li>`;
  }

  html += '</ul></body></html>';
  res.send(html);
});




app.get("/image/:hash", async (req, res) => {
  const { hash } = req.params;
  const { width, height } = req.query;

  const imageInfo = imageMetadata[hash] 

  if (!imageInfo) {
    return res.status(404).send("File not found");
  }

  let image = fs.readFileSync(imageInfo.path);

  let parsedWidth: number | null = null;
  if (width) {
    parsedWidth = parseInt(width as string);
    if (isNaN(parsedWidth)) {
      return res.status(400).send("Width must be an integer");
    }
  }

  let parsedHeight: number | null = null;
  if (height) {
    parsedHeight = parseInt(height as string);
    if (isNaN(parsedHeight)) {
      return res.status(400).send("Height must be an integer");
    }
  }

  if (parsedWidth !== null || parsedHeight !== null) {
    let transform = sharp(image);
    transform = transform.resize(parsedWidth, parsedHeight);
    image = await transform
    .jpeg({ quality: 80, progressive: true, chromaSubsampling: '4:4:4' }) // compress the image as JPEG with quality 80%
    .toBuffer();
  }

  res.writeHead(200, { "Content-Type": "image/jpeg" });
  res.end(image);
});

export function startServer() {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
