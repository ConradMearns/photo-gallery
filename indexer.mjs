import * as fs from "fs";
import * as path from "path";
import crypto from "crypto";
import sharp from "sharp";

// recursively collect image files
async function collectImageFiles(directory) {
  let files = [];
  const items = fs.readdirSync(directory);

  for (const item of items) {
    const itemPath = path.join(directory, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      // recursively collect image files in subdirectories
      files = [...files, ...(await collectImageFiles(itemPath))];
    } else if (isImage(itemPath)) {
      // add image file to list of files
      files.push(itemPath);
    }
  }

  return files;
}

function rgbToHex({ r, g, b }) {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

async function getDominantColor(file) {
  const metadata = await sharp(file).metadata();
  try {
    const { dominant } = await sharp(file)
      .resize(Math.ceil(metadata.width / 10), Math.ceil(metadata.height / 10))
      .stats({ channels: ['red', 'green', 'blue'] });
      return rgbToHex(dominant);
  } catch (err) {
    console.log(err)
  }

  return "#000000"

}

// check if a file is an image file
function isImage(file) {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const ext = path.extname(file).toLowerCase();

  return imageExtensions.includes(ext);
}

// calculate SHA256 hash of a file
function getFileHash(file) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(file);

    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

async function getImageSize(file) {
  const metadata = await sharp(file).metadata();
  return { width: metadata.width, height: metadata.height };
}

export async function indexImages(directory) {
    // recursively collect image files
    const files = await collectImageFiles(directory);
  
    // collect metadata and SHA256 hashes for each image file
    const imageMetadata = await Promise.all(
      files.map(async (file) => {
        const hash = await getFileHash(file);
        const fileStat = fs.statSync(file);
        const createdAt = fileStat.birthtime;
        const size = await getImageSize(file);
        const dominantColor = await getDominantColor(file);
        console.log(dominantColor)
  
        return {
          hash,
          path: file,
          size: fileStat.size,
          createdAt,
          width: size.width,
          height: size.height,
          color: dominantColor,
        };
      })
    );
  
    // save metadata to file
    let metadataDict = {};
    try {
      metadataDict = JSON.parse(fs.readFileSync("image-metadata.json").toString());
    } catch (err) {
      // ignore error if file does not exist
    }
    for (const { hash, ...rest } of imageMetadata) {
      metadataDict[hash] = rest;
    }
    fs.writeFileSync("image-metadata.json", JSON.stringify(metadataDict));
  }
  