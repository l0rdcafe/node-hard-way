import fs from "fs";
import path from "path";
import readline from "readline";

interface SedOptions {
  replace: string;
  search: RegExp;
}

interface Params extends SedOptions {
  file?: string;
}

interface Index {
  [key: string]: string;
}

const sedOptions: Index = {
  g: "global"
};

function sed(options: SedOptions, line: string): void {
  const result = line.replace(options.search, options.replace);
  console.log(result);
}

function parseSyntax(syntaxString: string): SedOptions {
  const syntaxParts = syntaxString.split("/").filter((part: string) => part);
  const pattern = syntaxParts[1];
  let replace = syntaxParts[syntaxParts.length - 2];
  let regexOptions = "";

  const isInvalidSyntax = syntaxParts[0] !== "s";
  if (isInvalidSyntax) {
    throw new Error("Invalid sed syntax");
  }

  if (syntaxParts.length === 3) {
    replace = syntaxParts.pop();
  } else if (syntaxParts.length === 4) {
    const lastElement = syntaxParts[syntaxParts.length - 1];
    if (sedOptions[lastElement] === "global") {
      regexOptions += "g";
    }
  }

  return {
    search: new RegExp(pattern, regexOptions),
    replace
  };
}

function parseParameters(params: string[]): Params {
  if (params.length > 2) {
    throw new Error("Invalid number of arguments");
  }

  const { replace, search } = parseSyntax(params[0]);
  const options: Params = {
    replace,
    search
  };

  if (params.length === 2) {
    const [, filepath] = params;
    options.file = filepath;
  }

  return options;
}

const cmdArgs = process.argv.slice(2);
if (cmdArgs.length > 0) {
  const opts = parseParameters(cmdArgs);

  if (opts.file) {
    const pathname = path.join(__dirname, opts.file);
    fs.readFile(pathname, "utf8", (err, line) => {
      if (err) {
        throw err;
      }

      const trimmedLine = line.substring(0, line.length - 1);
      sed(opts, trimmedLine);
    });
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    rl.on("line", (line: string) => {
      sed(opts, line);
    });
  }
}
