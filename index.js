require("dotenv").config();
const web3 = require("web3");
const express = require("express");
const Tx = require("ethereumjs-tx").Transaction;
const CONTRACT_ABI = require("./storage-abi.json");
const {
  default: Common,
  Chain,
  Hardfork,
  CustomChain,
} = require("@ethereumjs/common");
const app = express();

//Infura HttpProvider Endpoint
web3js = new web3(
  new web3.providers.HttpProvider("https://matic-mumbai.chainstacklabs.com")
);

const common = Common.custom(CustomChain.PolygonMumbai);

//addresses
const contractAddress = process.env.CONTRACT_ADDRESS;
console.log(process.env.CONTRACT_ADDRESS);
const adminAddress = "0xe2fF75F5D264a68D1E561A27b4Cdb886f5C8ac50";
const entityAddress = "0xe196C91ABFb4DFba4c57704C530Be52C3c3ddD9B";
const userAddress = "0xB63Cf430fe1Ca8d80dff1F714B71fD688e8F5F6d";

const entityPrivateAddress = Buffer.from(
  "0b10951f2d68cc6e05b84bda81e0ad4ed18fae4c9547d55f3b34dc8f127a9177",
  "hex"
);

const certificateTypes = [
  "TATA_CLiQ_Customer-loyalty_A1",
  "TATA_CLiQ_Customer-loyalty_A2",
  "TATA_CLiQ_Customer-loyalty_A3",
  "TATA_CLiQ_Customer-loyalty_A4",
  "TATA_CLiQ_Customer-loyalty_Ace",
];
const rarities = ["3", "15", "30", "40", "60"];
const expirations = [
  "28th September, 2022",
  "14th January, 2022",
  "1st December, 2022",
  "3rd November, 2022",
  "12th February, 2022",
];
var contract = new web3js.eth.Contract(CONTRACT_ABI, contractAddress);
async function getTransactionCount(address) {
    const result = await web3js.eth.getTransactionCount(address);
    return result;
  }

var cors = require("cors");

app.use(cors());

app.get("/get-user-data", async (req, res) => {
  const result = [];
  for (const index in certificateTypes) {
    const certificateType = certificateTypes[index];
    const rarity = rarities[index];
    const expiration = expirations[index];
    const response = await contract.methods
      .userCertificates(userAddress, certificateType)
      .call();
    result.push({ certificateType, expiration, rarity, count: response });
  }
  return res.status(200).send({ message: "User Data", data: result });
});

app.get("/get-entity-data", async (req, res) => {
  const result = [];
  for (const index in certificateTypes) {
    const certificateType = certificateTypes[index];
    const rarity = rarities[index];
    const expiration = expirations[index];
    const response = await contract.methods
      .entityCertificates(entityAddress, certificateType)
      .call();
    result.push({ certificateType, expiration, rarity, count: response });
  }
  return res.status(200).send({ message: "Entity Data", data: result });
});

const sendTransaction = (transaction) =>
  new Promise((res, rej) => {
    // console.log(transaction.toString());
    web3js.eth
      .sendSignedTransaction("0x" + transaction.serialize().toString("hex"))
      .on("transactionHash", (hash) => {
        res(hash);
        // res.status(200).json({ message: "Transaction successful", transactionId: hash })
      });
  });

app.get("/transfer-certificate", async (req, res) => {
  const { certificateType } = req.query;
  if (!certificateTypes.includes(certificateType)) {
    return res.status(400).json({ message: "Invalid certificate type" });
  }
  const count = await getTransactionCount(entityAddress);
  console.log(count);
  // var amount = web3js.utils.toHex(1e16);
  //creating raw tranaction
  var rawTransaction = {
    from: entityAddress,
    to: contractAddress,
    value: "0x0",
    gasPrice: web3js.utils.toHex(20 * 1e9),
    gasLimit: web3js.utils.toHex(210000),
    data: contract.methods
      .transferCertificateToUser(userAddress, certificateType, 1)
      .encodeABI(),
    nonce: web3js.utils.toHex(count),
  };
  console.log(rawTransaction);
  //creating tranaction via ethereumjs-tx
  var transaction = new Tx(rawTransaction, { common: common });
  //signing transaction with private key
  transaction.sign(entityPrivateAddress);
  //sending transacton via web3js module

  const hash = await sendTransaction(transaction)
  res
    .status(200)
    .json({ message: "Transaction successful", transactionId: hash });
});

app.listen(3000, () => console.log("Example app listening on port 3000!"));
