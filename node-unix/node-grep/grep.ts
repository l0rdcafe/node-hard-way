import chalk from "chalk";
import fs from "fs";
import readline from "readline";

export interface Options {
  file: string;
  regex: RegExp;
}

interface Flag {
  [key: string]: string;
}

export const flags: Flag = {
  i: "caseSensitive",
  g: "globalMatch",
  m: "multiline"
};

export const printResults = (results: string[]) => {
  const [startOfLine, match, endOfLine] = results;
  console.log(chalk.white(startOfLine) + chalk.green(match) + chalk.white(endOfLine));
};

export const parseOptions = (options: string[]): Options => {
  const file = options[0];
  let pattern = options[1];
  let caseSensitive = false;
  let globalMatch = false;
  let multiline = false;

  if (options.length === 3) {
    const arg = options[1];
    if (!arg.startsWith("-")) {
      throw new Error("Bad flag");
    }

    const trimmedArg = arg.substring(1);
    if (trimmedArg.length > 3) {
      throw new Error("Too many flags");
    }

    const flagMatches = trimmedArg.match(/(g|i|m)/g);
    if (!flagMatches || flagMatches.length !== trimmedArg.length) {
      throw new Error("Bad flag");
    }

    flagMatches.forEach((match: string) => {
      if (flags[match] === "caseSensitive") {
        caseSensitive = true;
      }

      if (flags[match] === "globalMatch") {
        globalMatch = true;
      }

      if (flags[match] === "multiline") {
        multiline = true;
      }
    });
    pattern = options.pop();
  }

  let opts = "";
  if (caseSensitive) {
    opts += "i";
  }

  if (globalMatch) {
    opts += "g";
  }

  if (multiline) {
    opts += "m";
  }
  const regex = new RegExp(pattern, opts);
  return {
    file,
    regex
  };
};

export const grepLine = (line: string, pattern: RegExp): string[] => {
  const firstMatchIdx = line.search(pattern);
  let result: string[] = [];
  if (firstMatchIdx > -1) {
    const [match] = line.match(pattern);
    const matchLength = match.length;
    const startOfLine = line.slice(0, firstMatchIdx);
    const endOfLine = line.slice(firstMatchIdx + matchLength);
    result = [startOfLine, match, endOfLine];
  }

  return result;
};

export const grepFile = (options: Options): void => {
  fs.readFile(options.file, "utf8", (err, data) => {
    if (err) {
      throw err;
    }

    const results = grepLine(data, options.regex);
    if (results.length > 0) {
      printResults(results);
    }
  });
};

export const grepStdin = (pattern: RegExp) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on("line", (line: string) => {
    const results = grepLine(line, pattern);
    if (results.length > 0) {
      printResults(results);
    }
  });
};
