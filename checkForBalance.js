import Web3 from "web3";
import fs from "fs";
import shell from "shelljs";
const providerRPC = "http://localhost:8545/";
const web3 = new Web3(providerRPC);

function read(fileIndex) {
  return JSON.parse(
    "[".concat(
      fs
        .readFileSync("./data/addresses/" + fileIndex + ".txt", "utf8")
        .concat("]")
    )
  );
}

function printProgress(i, files, j, total) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(
    "Working on file " +
      i +
      "/" +
      files +
      ", Progress: " +
      ((j / total) * 100).toFixed(2) +
      "%"
  );
}

async function checkAdresses(start, fileIndex) {
  shell.echo("Starting to fetch from " + start + " to " + fileIndex);
  for (let i = start; i <= fileIndex; i++) {
    let data = read(i);
    if (data.length > 0) {
      shell.echo("Data fetched " + i);
    } else {
      shell.echo("Error with " + i);
    }
    for (let j = 0; j < data.length; j++) {
      // printProgress(i, fileIndex, j, data.length);
      const address = data[j].address;
      const balance = await web3.eth.getBalance(address);
      if (balance > 0)
        fs.appendFileSync(
          "./data/result.txt",
          JSON.stringify(data[j]),
          null,
          2
        );
    }
  }
  shell.echo("Finished " + start + " to " + fileIndex);
}

try {
  const indexes = process.argv.slice(2);
  const start = indexes[0];
  const fileIndex = indexes[1];
  if (!start || !fileIndex) throw "Invalid input!";
  await checkAdresses(start, fileIndex);
} catch (e) {
  shell.echo(e.toString());
}
