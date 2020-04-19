import fs from "fs";
import path from "path";
import readline from "readline";

interface Params {
  fieldRange: number[];
  characterRange: number[];
  delimiter: string;
  file: string;
}

interface Flag {
  [key: string]: string;
}

const flags: Flag = {
  "-d": "delimiter",
  "-f": "field",
  "-c": "character"
};

function cut(options: Params, line: string): void {
  console.log({ options });
  let charStartIndex = 0;
  let charEndIndex = line.length - 1;
  let result = "";

  const hasCharRange = options.characterRange && options.characterRange.length > 0;
  const hasFieldRange = options.fieldRange && options.fieldRange.length > 0;

  if (hasCharRange && hasFieldRange) {
    throw new Error("Either provide field or character range arguments to cut");
  }

  if (hasCharRange) {
    const [startPos, endPos] = options.characterRange;
    charStartIndex = startPos - 1;

    if (endPos) {
      charEndIndex = endPos - 1;
    }

    result = line.slice(charStartIndex, charEndIndex);
  }

  if (hasFieldRange) {
    const [startColumn, endColumn] = options.fieldRange;
    const splitResult = line.split(options.delimiter);

    const fieldStartIndex = startColumn - 1;
    let fieldEndIndex = startColumn;
    if (endColumn) {
      fieldEndIndex = endColumn;
    }
    result = splitResult.slice(fieldStartIndex, fieldEndIndex).join(options.delimiter);
  }

  if (result === "") {
    throw new Error("Cut failed");
  }

  console.log(result);
}

function parseRange(rangeString: string): number[] {
  let range: number[] = [];
  const parsed = rangeString.split(/[,-]/);
  const isValidRange = parsed.length > 0 && parsed.length < 3 && parsed.every((elm: string) => /^\d+$/.test(elm));
  if (!isValidRange) {
    throw new Error("Invalid range");
  }
  range = parsed.map((limit: string) => limit === "" ? -1 : Number(limit));
  return range;
}

function parseParameters(params: string[]): Params {
  let fieldRange: number[] = [];
  let characterRange: number[] = [];
  let file = "";
  let delimiter = ",";

  params.forEach((param: string, i: number) => {
    const flag = param.slice(0, 2);
    if (flag.startsWith("-") && !flags[flag]) {
      throw new Error("Bad flag");
    }

    if (flags[flag] === "delimiter") {
      delimiter = param.slice(2);

      if (delimiter.length === 0) {
        delimiter = params[i + 1];
      }
    } else if (flags[flag]) {
      let rangeString = param.slice(2);
      if (rangeString.length === 0) {
        rangeString = params[i + 1];
      }

      if (flags[flag] === "field") {
        fieldRange = parseRange(rangeString);
      } else if (flags[flag] === "character") {
        characterRange = parseRange(rangeString);
      }
    }
  });

  if (!params[params.length - 1].startsWith("-")) {
    file = params.pop();
  }

  return {
    delimiter,
    characterRange,
    fieldRange,
    file
  };
}

const cmdArgs = process.argv.slice(2);
if (cmdArgs.length > 1) {
  const opts = parseParameters(cmdArgs);

  if (opts.file !== "") {
    const pathname = path.join(__dirname, opts.file);
    fs.readFile(pathname, "utf8", (err, line) => {
      if (err) {
        throw err;
      }

      const trimmedLine = line.substring(0, line.length - 1);
      cut(opts, trimmedLine);
    });
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    rl.on("line", (line: string) => {
      cut(opts, line);
    });
  }
}
