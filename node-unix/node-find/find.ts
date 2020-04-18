import { exec } from "child_process";
import fs from "fs";
import glob from "glob";
import path from "path";
import { grepFile, Options, parseOptions } from "../node-grep/grep";

interface Filters {
  [key: string]: string;
}

type PrintFile = (file: string) => void;
type ExecFile = (file: string, cmd: string) => number;
type GrepFile = (options: Options) => void;

interface Actions {
  [key: string]: PrintFile | ExecFile | GrepFile;
  "-print": PrintFile;
  "-exec": ExecFile;
  "-grep": GrepFile;
}

interface QueryOptions {
  isDirectory: boolean;
  rootPath: string;
  pattern: string;
  execCommand: string;
  cmdArgs: string[];
}

function printFile(file: string): void {
  const pathname = path.join(__dirname, file);
  fs.readFile(pathname, "utf8", (err, data) => {
    if (err) {
      throw err;
    }

    const trimmed = data.substring(0, data.length - 1);
    console.log(trimmed);
  });
}

function execFile(file: string, cmd: string): number {
  const pathname = path.join(__dirname, file);
  exec(`${cmd} ${pathname}`, (err, stdout, stderr) => {
    if (err) {
      throw err;
    }

    if (stderr) {
      throw stderr;
    }

    console.log(stdout);
  });
  return 0;
}

const actions: Actions = {
  "-print": printFile,
  "-exec": execFile,
  "-grep": grepFile
};

const filters: Filters = {
  "-type": "type",
  "-name": "name",
  "-path": "path"
};

const args: string[] = process.argv.slice(2);

function find(pattern: string, pwd: string): string[] {
  const baseDir = pwd.endsWith("/") ? pwd : `${pwd}/`;

  const results = glob.sync(`${baseDir}**/${pattern}`);
  if (results.length === 0) {
    throw new Error(`No matches found for pattern: '${pattern}'`);
  }

  console.log(`cwd: ${pwd}`);
  console.log(`Finding files matching pattern: '${pattern}'`);
  results.forEach((file: string) => {
    console.log(path.join(__dirname, file));
  });

  return results;
}

function isValidGrepArg(arg: string): boolean {
  let result = false;
  const trimmedArg = arg.substring(1);
  result = trimmedArg.length > 3;

  const flagMatches = trimmedArg.match(/(g|i|m)/g);
  result = !flagMatches || flagMatches.length !== trimmedArg.length;
  return result;
}

function parseParameters(params: string[]): QueryOptions {
  let rootPath = ".";
  let isDirectory = false;
  let pattern = "";
  let execCommand = "";
  let cmdArgs: string[] = [];

  params.forEach((param: string, i: number) => {
    if (i === 0) {
      rootPath = params[i];
      return;
    }

    if (i > 0) {
      const arg = params[i];
      if (!filters[arg] && !actions[arg] && arg.startsWith("-") && isValidGrepArg(arg)) {
        throw new Error(`${arg} is not a valid filter or action`);
      }

      const filter = arg;
      if (filters[filter]) {
        if (filters[filter] === "type") {
          isDirectory = params[i + 1].toLowerCase() === "d";
        } else if (filters[filter] === "name") {
          pattern = params[i + 1];
        } else if (filters[filter] === "path") {
          rootPath = params[i + 1];
        }
      }

      const action = arg;
      if (actions[action]) {
        if (action === "-print") {
          execCommand = "print";
        } else if (action === "-exec") {
          execCommand = params[i + 1];
        } else if (action === "-grep") {
          execCommand = "grep";
          cmdArgs = params.slice(i + 1);
        }
      }
    }
  });

  if (execCommand === "grep" && (cmdArgs.length > 2 || cmdArgs.length === 0)) {
    throw new Error("Bad grep action arguments");
  }

  return {
    rootPath,
    isDirectory,
    pattern,
    execCommand,
    cmdArgs
  };
}

function main(params: string[]): void {
  if (params.length === 0) {
    find("*", ".");
    process.exit(0);
  }

  if (params.length === 1) {
    find(params[0], ".");
    process.exit(0);
  }

  if (params.length > 2) {
    const options = parseParameters(params);
    const results = find(options.pattern, options.rootPath);
    if (options.execCommand === "print") {
      results.forEach(printFile);
    } else if (options.execCommand === "grep") {
      results.forEach((file: string) => {
        const pathname = path.join(__dirname, file);
        // helper parses options positionally so their order in the array matters
        const { regex } = parseOptions([undefined, ...options.cmdArgs]);
        grepFile({ file: pathname, regex });
      });
    } else if (options.execCommand) {
      results.forEach((file: string) => {
        execFile(file, options.execCommand);
      });
    }
  }
}

main(args);
