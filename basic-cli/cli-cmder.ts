import { program } from "commander";

program.version("1.0.0");

function collect(value: string, prev: string[]) {
  return prev.concat([value]);
}

program
  .option("-t, --trick", "tricks")
  .option("-i, --isolation", "isolation")
  .option("-H, --helpme", "helpme")
  .option("-w, --walk", "walk places", collect, [])
  .option("-r, --run", "run races", collect, [])
  .option("-c, --crawl <kind>", "crawl bases");

program.parse(process.argv);

if (program.isolation) {
  console.log("Siri, play Isolation by Joy Division");
}

if (program.trick) {
  console.log("===================");
  console.log("This is mambo no. 5");
}

if (program.helpme) {
  console.log("Call 109-109-4128 to get some candy-depressants");
}

if (program.crawl) {
  switch (program.crawl.toLowerCase()) {
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

if (program.walk && program.walk.length > 0) {
  const places = program.args;
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

if (program.run && program.run.length > 0) {
  const races = program.args;
  console.log("Off to the races:");
  races.forEach((race: string, i: number) => {
    console.log(`Run starting at ${race}`);
    console.log(`${race} is over${i < races.length - 1 ? `, about to start ${races[i + 1]}` : ""}`);
  });
  console.log("I'm so dehydrated");
}
