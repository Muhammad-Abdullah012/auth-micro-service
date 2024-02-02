const fs = require("fs");

export const streamData = async (sourceFilePath: string, destinationFilePath: string): Promise<void> =>
  new Promise((resolve, reject) => {
    // Create a readable stream from the source file
    const readableStream = fs.createReadStream(sourceFilePath);

    // Create a writable stream to the destination file
    const writableStream = fs.createWriteStream(destinationFilePath);

    // Pipe the data from the readable stream to the writable stream
    readableStream.pipe(writableStream);

    // Handle events (optional)
    readableStream.on("error", err => {
      console.error("Error reading from the source file:", err);
      reject(err);
    });

    writableStream.on("error", err => {
      console.error("Error writing to the destination file:", err);
      reject(err);
    });

    writableStream.on("finish", () => {
      console.log("Data streamed successfully.");
      resolve();
    });
  });
