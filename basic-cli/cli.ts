const args = process.argv.slice(2);

function selfIsolate() {
  console.log("Siri, play Isolation by Joy Division");
}

function getVersion() {
  console.log("===================");
  console.log("This is mambo no. 5");
}

function getHelp() {
  console.log("Call 109-109-4128 to get some candy-depressants");
}

function crawl(animals: string[]) {
  switch (animals[0].toLowerCase()) {
    case "lizard":
      console.log("I am king lizard, watch me crawl");
      break;
    case "iguana":
      console.log("I wanna banana havana iguana");
      break;
    default:
      console.log("Crawl like a bb");
  }
}

function walk(places: string[]) {
  if (places.length === 0) {
    throw new Error("Bro, I have nowhere to walk to :|");
  }

  console.log("Start the walk:");
  places.forEach((place: string, i: number) => {
    if (i < places.length - 1) {
      console.log(`Walking rn from ${place} to ${places[i + 1]}`);
    } else {
      console.log(`Almost at ${place}`);
    }
  });
  console.log("Phew! Walk OVER");
}

function run(races: string[]) {
  if (races.length === 0) {
    throw new Error("Bro, I have no races to run :|");
  }

  console.log("Off to the races:");
  races.forEach((race: string, i: number) => {
    console.log(`Run starting at ${race}`);
    console.log(`${race} is over${i < races.length - 1 ? `, about to start ${races[i + 1]}` : ""}`);
  });
  console.log("I'm so dehydrated");
}

function parseOptions(opts: string[]): string[] {
  const parsed: string[] = [];
  opts.some((opt: string) => {
    const isCommand = opt.includes("-");
    if (!isCommand) {
      parsed.push(opt);
    }

    return isCommand;
  });

  return parsed;
}

const execute = (cmd: string, payload?: string[]) => {
  interface Flags {
    [key: string]: () => void;
  }

  interface Options {
    [key: string]: (opts: string[]) => void;
  }

  const flags: Flags = {
    help: getHelp,
    version: getVersion,
    isolation: selfIsolate
  };

  const options: Options = {
    crawl,
    walk,
    run
  };

  if (flags[cmd]) {
    flags[cmd]();
  } else if (options[cmd]) {
    options[cmd](payload);
  }
};

const start = (params: string[]): void => {
  params.forEach((param: string, i: number) => {
    switch (param) {
      case "--help":
      case "-h":
        execute("help");
        process.exit(0);
        break;
      case "--version":
      case "-v":
        execute("version");
        process.exit(0);
        break;
      case "--isolation":
      case "-i":
        execute("isolation");
        process.exit(0);
        break;
      case "--walk":
      case "-w":
        execute("walk", parseOptions(params.slice(i + 1)));
        process.exit(0);
        break;
      case "--crawl":
      case "-c":
        execute("crawl", parseOptions(params.slice(i + 1)));
        process.exit(0);
        break;
      case "--run":
      case "-r":
        execute("run", parseOptions(params.slice(i + 1)));
        process.exit(0);
        break;
      default:
        throw new Error(`Unexpected command ${param}`);
    }
  });
};

if (args.length === 0) {
  console.log("Looks like I have nothing to do ¯\_(ツ)_/¯");
} else {
  start(args);
}
