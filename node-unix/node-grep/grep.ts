import { grepFile, grepStdin, parseOptions } from "./index";

const args = process.argv.slice(2);

if (args.length === 0) {
  throw new Error("No pattern provided to match");
}

if (args.length === 1) {
  const pattern = new RegExp(args[0]);
  grepStdin(pattern);
}

if (args.length > 1) {
  const options = parseOptions(args);
  grepFile(options);
}
