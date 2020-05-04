import fs from "fs";
import path from "path";
import readline from "readline";

interface SortOptions {
  order: string;
  numerical: boolean;
  caseInsensitive: boolean;
  file?: string;
}

interface Index {
  [key: string]: string;
}

const sortOptions: Index = {
  "-r": "reverse",
  "-f": "ignorecase",
  "-n": "numerical"
};

function descendingNumericalComparator(a: string, b: string): number {
  let result = 0;
  if (Number(a) < Number(b)) {
    result = 1;
  } else if (Number(a) > Number(b)) {
    result = -1;
  }

  return result;
}

function ascendingNumericalComparator(a: string, b: string): number {
  let result = 0;
  if (Number(a) < Number(b)) {
    result = -1;
  } else if (Number(a) > Number(b)) {
    result = 1;
  }

  return result;
}

function descendingStringComparator(a: string, b: string): number {
  let result = 0;
  if (a < b) {
    result = 1;
  } else if (a > b) {
    result = -1;
  }

  return result;
}

function ascendingCaseInsensitiveComparator(a: string, b: string): number {
  let result = 0;
  if (a.toLowerCase() < b.toLowerCase()) {
    result = -1;
  } else if (a.toLowerCase() > b.toLowerCase()) {
    result = 1;
  }

  return result;
}

function descendingCaseInsensitiveComparator(a: string, b: string): number {
  let result = 0;
  if (a.toLowerCase() < b.toLowerCase()) {
    result = 1;
  } else if (a.toLowerCase() > b.toLowerCase()) {
    result = -1;
  }

  return result;
}

function sortNumerically(direction: string, lines: string[]): string[] {
  if (direction === "DESC") {
    lines.sort(descendingNumericalComparator);
  } else {
    lines.sort(ascendingNumericalComparator);
  }

  return lines;
}

function sortByCharCode(direction: string, lines: string[], caseInsensitive?: boolean): string[] {
  if (direction === "DESC") {
    if (caseInsensitive) {
      lines.sort(descendingCaseInsensitiveComparator);
    } else {
      lines.sort(descendingStringComparator);
    }
  } else if (direction !== "DESC") {
    if (caseInsensitive) {
      lines.sort(ascendingCaseInsensitiveComparator);
    } else {
      lines.sort();
    }
  }

  return lines;
}

function sort(order: string, lines: string[], numerical?: boolean, caseInsensitive?: boolean): void {
  let result = lines;
  if (numerical) {
    result = sortNumerically(order, lines);
  } else if (!numerical) {
    result = sortByCharCode(order, lines, caseInsensitive);
  }

  result.forEach((line: string) => {
    console.log(line);
  });
}

function parseParameters(params: string[]): SortOptions {
  let order = "ASC";
  let file = "";
  let numerical = false;
  let caseInsensitive = false;

  const flags = params.filter((param: string) => param.startsWith("-"));
  if (params.length - flags.length > 1) {
    throw new Error("Invalid argument found");
  }

  [file] = params.filter((param: string) => !param.startsWith("-"));

  const hasValidFlags = flags.every((flag: string) => sortOptions[flag]);
  if (!hasValidFlags) {
    throw new Error("Invalid flag used");
  }

  flags.forEach((flag: string) => {
    const option = sortOptions[flag];
    if (option === "reverse") {
      order = "DESC";
    } else if (option === "numerical") {
      numerical = true;
    } else if (option === "ignorecase") {
      caseInsensitive = true;
    }

    if (caseInsensitive && numerical) {
      throw new Error("You cannot sort numerically and ignore case during the same operation");
    }
  });

  return {
    file,
    order,
    numerical,
    caseInsensitive
  };
}

const cmdArgs = process.argv.slice(2);
const opts = parseParameters(cmdArgs);

if (cmdArgs.length === 0) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  const lines: string[] = [];

  rl.on("line", (line: string) => {
    lines.push(line);
  });

  rl.on("close", () => {
    sort(opts.order, lines, opts.numerical, opts.caseInsensitive);
  });
} else if (cmdArgs.length > 0) {
  if (opts.file) {
    const pathname = path.join(__dirname, opts.file);
    fs.readFile(pathname, "utf8", (err, data) => {
      if (err) {
        throw err;
      }

      const lines = data.toString().split("\n").filter((line: string) => line);
      sort(opts.order, lines, opts.numerical, opts.caseInsensitive);
    });
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });
    const lines: string[] = [];

    rl.on("line", (line: string) => {
      lines.push(line);
    });

    rl.on("close", () => {
      sort(opts.order, lines, opts.numerical, opts.caseInsensitive);
    });
  }
}
