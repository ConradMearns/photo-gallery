import * as fs from "fs";
import * as path from "path";
import crypto from "crypto";

// recursively collect image files
async function collectImageFiles(directory: string): Promise<string[]> {
  let files: string[] = [];
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

// check if a file is an image file
function isImage(file: string): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"];
  const ext = path.extname(file).toLowerCase();

  return imageExtensions.includes(ext);
}

// calculate SHA256 hash of a file
function getFileHash(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(file);

    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}



export async function indexImages(directory: string) {
    // recursively collect image files
    const files = await collectImageFiles(directory);
  
    // collect metadata and SHA256 hashes for each image file
    const imageMetadata = await Promise.all(
      files.map(async (file) => {
        const hash = await getFileHash(file);
        const fileStat = fs.statSync(file);
        const createdAt = fileStat.birthtime;
  
        return {
          path: file,
          size: fileStat.size,
          createdAt,
          hash,
        };
      })
    );
  
    // save metadata to file
    const metadataDict = JSON.parse(fs.readFileSync("image-metadata.json").toString());
    for (const { hash, ...rest } of imageMetadata) {
      metadataDict[hash] = rest;
    }
    fs.writeFileSync("image-metadata.json", JSON.stringify(metadataDict));
  }
  