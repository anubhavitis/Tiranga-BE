require("dotenv").config();
const web3 = require("web3");
const express = require("express");
const Tx = require("ethereumjs-tx").Transaction;
const CONTRACT_ABI = require("./storage-abi.json");
// const Common = require('@ethereumjs/common').default
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

//addresses
const adminAddress = "0xe2fF75F5D264a68D1E561A27b4Cdb886f5C8ac50";
const entityAddress = "0xe196C91ABFb4DFba4c57704C530Be52C3c3ddD9B";
const userAddress = "0xB63Cf430fe1Ca8d80dff1F714B71fD688e8F5F6d";

const contractAddress = process.env.CONTRACT_ADDRESS;

const adminPrivateKey = Buffer.from(
  "78481e093cfec33328a6d9399ba63147527b7b5c8d71071f96647781fb464e9d",
  "hex"
);

const certificateTypes = [
  "TATA_CLiQ_Customer-loyalty_A1",
  "TATA_CLiQ_Customer-loyalty_A2",
  "TATA_CLiQ_Customer-loyalty_A3",
  "TATA_CLiQ_Customer-loyalty_A4",
  "TATA_CLiQ_Customer-loyalty_Ace",
];

const common = Common.custom(CustomChain.PolygonMumbai);

var contract = new web3js.eth.Contract(CONTRACT_ABI, contractAddress);
async function getTransactionCount(address) {
  const result = await web3js.eth.getTransactionCount(address);
  return result;
}

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

const sleep = () =>
  new Promise((res) => {
    setTimeout(res, 10000);
  });

const main = async () => {
  for (const certificateType in certificateTypes) {
    const count = await getTransactionCount(adminAddress);
    console.log(count);
    // var amount = web3js.utils.toHex(1e16);
    //creating raw tranaction
    var rawTransaction = {
      from: adminAddress,
      gasPrice: web3js.utils.toHex(20 * 1e9),
      gasLimit: web3js.utils.toHex(210000),
      to: contractAddress,
      value: "0x0",
      data: contract.methods
        .assignCertificateToEntity(
          entityAddress,
          certificateTypes[certificateType],
          100
        )
        .encodeABI(),
      nonce: web3js.utils.toHex(count),
    };
    console.log(rawTransaction);
    //creating tranaction via ethereumjs-tx
    var transaction = new Tx(rawTransaction, { common: common });
    //signing transaction with private key
    transaction.sign(adminPrivateKey);
    //sending transacton via web3js module
    // web3js.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'))
    // .on('transactionHash', console.log);

    const hash = await sendTransaction(transaction);
    console.log(hash);
    await sleep();
    // return;
  }
};
main();
