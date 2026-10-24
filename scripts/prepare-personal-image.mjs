/** Convert one owner-selected local source. Files remain outside public Git history. */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const [input,id]=process.argv.slice(2);
if(!input||!id||!/^[a-z0-9-]+$/.test(id))throw Error('Usage: node scripts/prepare-personal-image.mjs /absolute/source.jpg image-slug');
const ignore=await fs.readFile('.gitignore','utf8');if(!ignore.includes('public/images/personal-use/'))throw Error('Ignore personal-use images before preparing one.');
const folder=path.resolve('public/images/personal-use');await fs.mkdir(folder,{recursive:true});
const metadata=await sharp(input).metadata();for(const width of [640,1280,1920])await sharp(input).rotate().resize({width,withoutEnlargement:true}).webp({quality:88}).toFile(path.join(folder,`${id}-${width}.webp`));
console.log(`Prepared ${id}: original ${metadata.width} × ${metadata.height}. Add the real source, license status and alt text to credits/data before using it.`);
