require("dotenv").config();
const API_URL = process.env.API_URL;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(API_URL);

const contract = require("../artifacts/contracts/HelloWorld.sol/HelloWorld.json");
const contractAddress = "0x7CbA41746E6792dA11D70735b7226A9880E35daD";
const helloWorldContract = new web3.eth.Contract(contract.abi, contractAddress);

async function updateMessage(newMessage) {
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest"); // get latest nonce
  const gasEstimate = await helloWorldContract.methods
    .update(newMessage)
    .estimateGas(); // estimate gas

  // Create the transaction
  const tx = {
    from: PUBLIC_KEY,
    to: contractAddress,
    nonce: nonce,
    gas: gasEstimate,
    maxFeePerGas: 1000000108,
    data: helloWorldContract.methods.update(newMessage).encodeABI(),
  };

  try {
    // Sign the transaction
    const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
    // Send the transaction
    web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
      function (err, hash) {
        if (!err) {
          console.log(
            "The hash of your transaction is: ",
            hash,
            "\n Check Alchemy's Mempool to view the status of your transaction!"
          );
        } else {
          console.log(
            "Something went wrong when submitting your transaction:",
            err
          );
        }
      }
    );
  } catch (error) {
    console.log("Sign failed:", error);
  }
}

async function main() {
  const message = await helloWorldContract.methods.message().call();
  console.log("The message is: " + message);
  await updateMessage("Hello Dade!");
}

main();
