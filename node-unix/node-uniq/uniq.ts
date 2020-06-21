import readLine from "readline";

function uniq(list: string[]): string[] {
  const values: { [key: string]: boolean } = {};
  list.forEach((value: string) => {
    if (values[value]) {
      return;
    }

    values[value] = true;
  });

  return Object.keys(values);
}

const cmdArgs = process.argv.slice(2);
if (cmdArgs.length === 0) {
  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on("line", (line: string) => {
    const list = line.split(/\s+/).filter((elm: string) => elm !== "");
    const deduped = uniq(list);
    console.log(deduped);
    process.exit(0);
  });
}
