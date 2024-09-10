# Compression and Decompression Utility

## Overview

This Node.js utility provides functionality to compress and decompress files using the gzip format. The tool handles large files efficiently by processing them in chunks and optimizes memory usage based on system resources.

## How It Works

1. **File Handling**: The utility reads files from a specified directory, compresses or decompresses them, and writes the output to a different directory.

2. **Chunk Size Calculation**: 
   - **Compression**: The utility determines an optimal chunk size based on the file size, available memory, and the number of CPU cores. This ensures efficient processing and prevents excessive memory usage.
   - **Decompression**: Similar to compression, it calculates an optimal chunk size to handle large compressed files efficiently.

3. **Compression Process**:
   - **Input**: A file is read from the `./files/fileForCompression` directory.
   - **Processing**: The file is processed in chunks and compressed using the gzip algorithm.
   - **Output**: The compressed file is saved in the `./files/compressedFile/` directory with a `.gz` extension.

4. **Decompression Process**:
   - **Input**: A gzip-compressed file is read from the `./files/compressedFile/` directory.
   - **Processing**: The compressed file is processed in chunks and decompressed using the gunzip algorithm.
   - **Output**: The decompressed file is saved in the `./files/decompressedFile/` directory with its original name.

5. **Memory Optimization**: 
   - The thread pool size is adjusted (`UV_THREADPOOL_SIZE`) to handle more CPU-bound tasks concurrently.
   - Chunk sizes are dynamically adjusted based on the system's available memory and the number of CPU cores to optimize performance and memory usage.

## User Interaction

When running the utility, you will be prompted to choose between compressing or decompressing a file. You will then be asked to provide the file name.

- **Compress**: Convert a large file into a compressed gzip format.
- **Decompress**: Extract the original file from a gzip-compressed format.

## Example

1. **Compressing a File**:
   - Choose `compress` when prompted.
   - Enter the file name you want to compress.

2. **Decompressing a File**:
   - Choose `decompress` when prompted.
   - Enter the name of the gzip file you want to decompress.

This tool provides an efficient way to handle large files by breaking them into manageable chunks and optimizing memory usage based on system capabilities.
