// const fs = require("fs");
import fs from "fs";
import { pipeline } from 'stream/promises';
import zlib from 'zlib';
import os from "os";
import readline from 'readline';

process.env.UV_THREADPOOL_SIZE = '16';

function getChunkSize(fileSize: number, numChunks: number): number {
  return Math.ceil(fileSize / numChunks);
}

function getOptimalChunkSize(fileName: string, action: boolean): { chunkSize: number, numChunks: number } {
  let fileSize: number;

  if (action === true) {
    fileSize = fs.statSync(`./files/fileForCompression/${fileName}`).size;
  } else {
    fileSize = fs.statSync(`./files/compressedFile/${fileName}.gz`).size;
  }

  const freeMem = os.freemem();
  const numCpus = os.cpus().length;
  const maxMemoryPerChunk = Math.min(fileSize, freeMem * 0.6) / (numCpus * 2);
  const numChunks = Math.ceil(fileSize / maxMemoryPerChunk);
  const chunkSize = Math.ceil(fileSize / numChunks);

  return { chunkSize, numChunks };
}

async function compress(name: string) {
  console.time('time');
  console.log('\n* Started reading file');
  console.log(`* Free memmory before compression ${Math.floor(os.freemem() / (1024 * 1024))} MB\n`);

  const chunkSize = getOptimalChunkSize(name, true);
  console.log(chunkSize);

  const readStream = fs.createReadStream(`./files/fileForCompression/${name}`, { highWaterMark: chunkSize.chunkSize });
  const writeStream = fs.createWriteStream(`./files/compressedFile/${name}.gz`);
  console.log('--| Started compression |--\n');

  const gzipStream = zlib.createGzip();
  let chunkNum = 1;

  try {
    await pipeline(
      readStream,
      gzipStream,
      writeStream
    );
    console.log("\n--| File compressed |--\n");
    console.timeEnd('time');
    console.log('\n= memory usage info:\n');
    console.log('---------------------------');
    const used = process.memoryUsage();
    for (let key in used) {
      console.log(`|  ${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB  `);
    }
    console.log('---------------------------');
  } catch (err) {
    console.error('Error while compressing:', err);
  }

  readStream.on('data', (chunk) => {
    console.log(`| Chunk ${chunkNum} read size: ${Math.floor(chunk.length / (1024 * 1024))} MB |`);
    chunkNum++;
  });
  console.log(`File ${name} split into ${chunkSize.numChunks} chunks of ${Math.floor(chunkSize.chunkSize) / (1024 * 1024)} MB\n`);
}


async function decompress(name: string) {
  console.time('time');
  console.log('\n* Started reading file');

  console.log(`* Free memmory before decompression ${Math.floor(os.freemem() / (1024 * 1024))} MB\n`);

  const chunkSize = getOptimalChunkSize(name, false);
  console.log(chunkSize);


  const readStream = fs.createReadStream(`./files/compressedFile/${name}.gz`, { highWaterMark: chunkSize.chunkSize });
  const writeStream = fs.createWriteStream(`./files/decompressedFile/${name}`);
  console.log('--| Started decompression |--\n');

  const gzipStream = zlib.createGunzip();
  let chunkNum = 1;

  try {
    await pipeline(
      readStream,
      gzipStream,
      writeStream
    )
    console.log("\n--| File decompresed |--\n");
        console.timeEnd('time');
        console.log('\n= memory usage info:\n');
        console.log('---------------------------');
        const used = process.memoryUsage();
        for (let key in used) {
          console.log(`|  ${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
        }
        console.log('---------------------------');
  } catch (err) {
    console.error('Error while decompressing:', err);
  }

  readStream.on('data', (chunk) => {
    console.log(`| Chunk ${chunkNum} read size: ${Math.floor(chunk.length)} KB |`);
    chunkNum++;
  });
  console.log(`File ${name} split into ${chunkSize.numChunks} chunks of ${Math.floor(chunkSize.chunkSize)} KB\n`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string>{
  return new Promise(resolve => rl.question(query, resolve))
}

async function main(){
  try {
    const action = await askQuestion("What do you want to do? (compress/decompress): ");
    const fileName = await askQuestion("Enter the file name: ");
  
    if(action.toLowerCase() === "compress") {
      await compress(fileName);
    } else if(action.toLowerCase() === "decompress") {
      await decompress(fileName);
    } else {
      console.error("Invalid action. Please choose 'compress' or 'decompress'");
    } 
  } catch(err) {
    console.error("An error occurred: ", err);
  } finally {
    rl.close();
  }
}

main();
