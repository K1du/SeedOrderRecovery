import bip39 from "bip39";
import { hdkey } from "ethereumjs-wallet";
import fs from "fs";
// import Web3 from "web3";
// const providerRPC = "http://localhost:8545/";
// const web3 = new Web3(providerRPC);
const path = "m/44'/60'/0'/0/0";
const FILE_SIZE = 10 ** 5;
const UPDATE_COUNTER = 100000;
var current = [];
var fileIndex = 0;
var totalAmount = 0;
var state;

function swap(i, j, A) {
  const temp = A[i];
  A[i] = A[j];
  A[j] = temp;
  return A;
}

function generate(A, c = [], i = 1, counter = 1) {
  const n = A.length;
  if (c.length == 0) {
    for (let i = 0; i < n; i++) {
      c[i] = 0;
    }
  }
  getSeedOrder(A);
  while (i < n) {
    if (c[i] < i) {
      if (i % 2 == 0) {
        swap(0, i, A);
      } else {
        swap(c[i], i, A);
      }
      getSeedOrder(A);
      counter++;
      printProgress(counter);
      saveFile(A, c, i, counter);
      c[i]++;
      i = 1;
    } else {
      c[i] = 0;
      i++;
    }
  }
}

function getSeedOrder(seedPhrase) {
  const phrase = seedPhrase.join(" ");
  if (bip39.validateMnemonic(phrase)) {
    const hdWallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(phrase));
    const wallet = hdWallet.derivePath(path).getWallet();
    const address = `0x${wallet.getAddress().toString("hex")}`;
    current.push({ phrase, address });
  }
}

function printProgress(progress) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(
    "Search progress: " +
      ((progress / 479001600) * 100).toFixed(3) +
      " %, Found: " +
      totalAmount +
      ", Saved files: " +
      fileIndex
  );
}

function saveFile(A, c, i, counter) {
  if (counter % UPDATE_COUNTER == 0) {
    if (
      totalAmount >= FILE_SIZE * fileIndex ||
      !fs.existsSync("./data/addresses/" + fileIndex + ".txt")
    ) {
      fileIndex += 1;
    }
    totalAmount += current.length;
    let data = ""
    if(totalAmount >= FILE_SIZE * fileIndex){
      data = JSON.stringify(current, null, 1).replace("[", "").replace("]", "")
    } else {
      data = JSON.stringify(current, null, 1).replace("[", "").replace("]", ",")
    }
    fs.appendFileSync(
      "./data/addresses/" + fileIndex + ".txt",
      data
    );
    state = { A, c, i, counter, totalAmount, fileIndex };
    fs.writeFileSync("./data/state.json", JSON.stringify(state, null, 2), cb);
    current = [];
  }
}

const indexes = process.argv.slice(2);
try {
  state = JSON.parse(fs.readFileSync("./data/state.json", "utf8"));
  console.log("Loading state!");
  totalAmount = state.totalAmount;
  fileIndex = state.fileIndex;
  generate(state.A, state.c, state.i, state.counter);
} catch (e) {
  console.log("No state found!");
  if (indexes.length == 12) {
    generate(indexes);
  }
}

function cb(err) {
  if (err) {
    console.log(err);
  }
}
