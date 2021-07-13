import Web3 from "web3";
import fs from "fs";
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

async function checkAdresses(fileIndex) {
  for (let i = 1; i < fileIndex - 1; i++) {
    let data = read(i);
    for (let j = 0; j < data.length; j++) {
      printProgress(i, fileIndex, j, data.length);
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
}

const indexes = process.argv.slice(2)
const fileIndex = indexes[0]
await checkAdresses(fileIndex);
