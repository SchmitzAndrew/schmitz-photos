const fs = require('fs');
const path = require('path');
const decompress = require('decompress');
const sharp = require('sharp');
const heicConvert = require('heic-convert');
const fsp = require('fs').promises;

const photosDir = path.join(__dirname, '../public/photos');

// Helper to recursively delete a folder
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
}

async function unzipAll() {
  const files = fs.readdirSync(photosDir);
  for (const file of files) {
    if (file.endsWith('.zip')) {
      const zipPath = path.join(photosDir, file);
      const outDir = path.join(photosDir, path.basename(file, '.zip'));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
      console.log(`Unzipping ${file}...`);
      await decompress(zipPath, outDir);
    }
  }
}

function removeMovFilesAndFolders() {
  const files = fs.readdirSync(photosDir);
  for (const file of files) {
    const filePath = path.join(photosDir, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      // Remove folders containing only photos (assume all extracted folders)
      deleteFolderRecursive(filePath);
      console.log(`Deleted folder: ${file}`);
    } else if (file.toLowerCase().endsWith('.mov')) {
      fs.unlinkSync(filePath);
      console.log(`Deleted .mov file: ${file}`);
    }
  }
}

// Recursively collect all image files in a directory
function getAllImageFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getAllImageFiles(filePath));
    } else if (/\.(jpe?g|png|heic)$/i.test(file)) {
      results.push(filePath);
    }
  }
  return results;
}

async function convertHeicToJpg(heicPath, jpgPath) {
  const inputBuffer = await fsp.readFile(heicPath);
  const outputBuffer = await heicConvert({
    buffer: inputBuffer,
    format: 'JPEG',
    quality: 1 // best quality
  });
  await fsp.writeFile(jpgPath, outputBuffer);
}

async function convertImagesToWebp() {
  const imageFiles = getAllImageFiles(photosDir);
  for (const filePath of imageFiles) {
    let inputPath = filePath;
    let tempJpgPath = null;
    if (/\.heic$/i.test(filePath)) {
      tempJpgPath = filePath.replace(/\.heic$/i, '.jpg');
      try {
        await convertHeicToJpg(filePath, tempJpgPath);
        fs.unlinkSync(filePath); // Remove original .heic
        inputPath = tempJpgPath;
        console.log(`Converted HEIC to JPG: ${filePath} -> ${tempJpgPath}`);
      } catch (e) {
        console.error(`Failed to convert HEIC: ${filePath}`, e);
        continue;
      }
    }
    const outPath = inputPath.replace(/\.[^/.]+$/, '.webp');
    try {
      // Resize to max 1600px on the longest side, set webp quality to 95
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      let width = metadata.width;
      let height = metadata.height;
      let resizeOptions = {};
      if (width && height) {
        if (width > height && width > 1600) {
          resizeOptions.width = 1600;
        } else if (height >= width && height > 1600) {
          resizeOptions.height = 1600;
        }
      }
      await image
        .resize(resizeOptions)
        .toFormat('webp', { quality: 95 })
        .toFile(outPath);
      fs.unlinkSync(inputPath);
      console.log(`Converted, resized, and removed: ${inputPath}`);
    } catch (e) {
      console.error(`Failed to convert ${inputPath}:`, e);
    }
    if (tempJpgPath && fs.existsSync(tempJpgPath)) {
      fs.unlinkSync(tempJpgPath);
    }
  }
}

// Move all .webp files to the root of photosDir, renaming if needed to avoid overwrites
function moveWebpsToRoot() {
  const allFiles = getAllFilesRecursive(photosDir);
  for (const filePath of allFiles) {
    if (/\.webp$/i.test(filePath) && path.dirname(filePath) !== photosDir) {
      let baseName = path.basename(filePath);
      let destPath = path.join(photosDir, baseName);
      let count = 1;
      // Avoid overwriting files
      while (fs.existsSync(destPath)) {
        const parsed = path.parse(baseName);
        destPath = path.join(photosDir, `${parsed.name}_${count}${parsed.ext}`);
        count++;
      }
      fs.renameSync(filePath, destPath);
      console.log(`Moved ${filePath} -> ${destPath}`);
    }
  }
}

// Recursively get all files in a directory
function getAllFilesRecursive(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getAllFilesRecursive(filePath));
    } else {
      results.push(filePath);
    }
  }
  return results;
}

// Delete all .zip files in photosDir
function removeAllZips() {
  const files = fs.readdirSync(photosDir);
  for (const file of files) {
    if (file.endsWith('.zip')) {
      const zipPath = path.join(photosDir, file);
      fs.unlinkSync(zipPath);
      console.log(`Deleted zip: ${file}`);
    }
  }
}

// Remove all subfolders in photosDir
function removeAllSubfolders() {
  const files = fs.readdirSync(photosDir);
  for (const file of files) {
    const filePath = path.join(photosDir, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      deleteFolderRecursive(filePath);
      console.log(`Deleted folder: ${file}`);
    }
  }
}

(async () => {
  await unzipAll();
  await convertImagesToWebp();
  moveWebpsToRoot();
  removeAllZips();
  removeAllSubfolders();
  removeMovFilesAndFolders(); // Clean up any .mov files in root
  console.log('Photo cleanup complete.');
})(); 