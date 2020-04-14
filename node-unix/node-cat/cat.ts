import * as fs from "fs";
import * as path from "path";

const paths = process.argv.slice(2);

paths.forEach((pathname: string) => {
  const relativePath = path.join(__dirname, pathname);
  fs.readFile(relativePath, "utf8", (err, data) => {
    if (err) {
      throw err;
    }

    const trimmed = data.substring(0, data.length - 1);
    console.log(trimmed);
  });
});
