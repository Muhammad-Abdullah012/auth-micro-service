import busboy = require("busboy");
import { NextFunction, Response } from "express";
import { join } from "path";
import { createWriteStream } from "fs";
import { RequestWithUser } from "@interfaces/auth.interface";

export class FilesController {
  public async fileUpload(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const busboyInstance = busboy({ headers: req.headers });
      const uploadDir = join(__dirname, "..", "..", "public", "images");
      const filePaths = [];

      busboyInstance.on(
        "file",
        (fieldname, file, { filename, encoding, mimeType }) => {
          const _fileName =
            new Date().getTime() + "_" + filename.split(" ").join("_");
          const filePathAbsolute = join(uploadDir, _fileName);
          const writeStream = createWriteStream(filePathAbsolute);
          file.pipe(writeStream);
          filePaths.push({ [fieldname]: _fileName });

          writeStream.on("close", async () => {
            console.log(`File ${filename} saved successfully.`);
          });
          writeStream.on("error", error => {
            console.error("Error occured ==> ", error);
          });
        },
      );

      busboyInstance.on("error", error => {
        console.error("error => ", error);
        res.json({ message: "Something went wrong!" });
      });
      busboyInstance.on("finish", () => {
        console.log("File upload finished.");
        res.json({ data: filePaths });
      });

      req.pipe(busboyInstance);
    } catch (err) {
      console.error("Error occured ==> ", err);
      next(err);
    }
  }
}
