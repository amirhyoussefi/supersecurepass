require("dotenv").config();
import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import * as LitJsSdk from "@lit-protocol/lit-node-client-nodejs";
import {
  LitAccessControlConditionResource,
  LitAbility,
  createSiweMessageWithRecaps,
  generateAuthSig
} from "@lit-protocol/auth-helpers";
import { LitNetwork } from "@lit-protocol/constants";
import { ethers } from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import litRoutes from "./routes/lit.routes";
import { LIT_RPC } from "@lit-protocol/constants";
var https = require('https');
var fs = require('fs');
var privateKey  = fs.readFileSync('/Users/a/w/cert/private.key', 'utf8');
var certificate = fs.readFileSync('/Users/a/w/cert/cert.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};


export class Lit {
  litNodeClient: any;
  chain;
  capacityDelegationAuthSig: any;

  // See more access control conditions here: https://developer.litprotocol.com/sdk/access-control/evm/basic-examples
  accessControlConditions: any[] = [
    {
      contractAddress: "",
      standardContractType: "",
      chain: "ethereum",
      method: "eth_getBalance",
      parameters: [":userAddress", "latest"],
      returnValueTest: {
        comparator: "<=",
        value: "1000000000000" // 0.000001 ETH // "1000000000000"
      }
    }
  ];

  constructor(chain: string) {
    this.chain = chain;
  }

  async connect() {
    app.locals.litNodeClient = new LitJsSdk.LitNodeClientNodeJs({
      alertWhenUnauthorized: false,
      litNetwork: LitNetwork.DatilDev,
      debug: process.env.NODE_ENV !== "production"
    });

    this.litNodeClient = app.locals.litNodeClient;
    await this.litNodeClient.connect();

    const ethWallet = new ethers.Wallet(
      process.env.PRIVATE_KEY ?? "",
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );
    let contractClient = new LitContracts({
      signer: ethWallet,
      network: LitNetwork.DatilDev,
      debug: true
    });

    await contractClient.connect();

    // Note that if your network is `datil-dev`, you do not need a capacity credit NFT
    // or a capacity delegation auth sig. The following code section is added for
    // compatibility on the `datil-test` and `datil` networks.

    // const { capacityTokenIdStr } = await contractClient.mintCapacityCreditsNFT({
    //   // requestsPerKilosecond: 80,
    //   requestsPerDay: 50,
    //   // requestsPerSecond: 10,
    //   daysUntilUTCMidnightExpiration: 2
    // });

    // const { capacityDelegationAuthSig } = await (
    //   this.litNodeClient as LitJsSdk.LitNodeClient
    // ).createCapacityDelegationAuthSig({
    //   uses: "1",
    //   dAppOwnerWallet: ethWallet,
    //   capacityTokenId: capacityTokenIdStr,
    //   delegateeAddresses: [process.env.DELEGATEE_ADDRESS ?? ""]
    // });

    // this.capacityDelegationAuthSig = capacityDelegationAuthSig;
  }

  async getSessionSignatures() {
    // Connect to the wallet
    const ethWallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");

    // Get the latest blockhash
    const latestBlockhash = await this.litNodeClient.getLatestBlockhash();

    // Define the authNeededCallback function
    const authNeededCallback = async (params: any) => {
      if (!params.uri) {
        throw new Error("uri is required");
      }
      if (!params.expiration) {
        throw new Error("expiration is required");
      }

      if (!params.resourceAbilityRequests) {
        throw new Error("resourceAbilityRequests is required");
      }

      // Create the SIWE message
      const toSign = await createSiweMessageWithRecaps({
        uri: params.uri,
        expiration: params.expiration,
        resources: params.resourceAbilityRequests,
        walletAddress: ethWallet.address,
        nonce: latestBlockhash,
        litNodeClient: this.litNodeClient
      });

      // Generate the authSig
      const authSig = await generateAuthSig({
        signer: ethWallet,
        toSign
      });

      return authSig;
    };

    // Define the Lit resource
    const litResource = new LitAccessControlConditionResource("*");

    // Get the session signatures
    const sessionSigs = await (this.litNodeClient as LitJsSdk.LitNodeClientNodeJs).getSessionSigs({
      chain: this.chain,
      resourceAbilityRequests: [
        {
          resource: litResource,
          ability: LitAbility.AccessControlConditionDecryption
        }
      ],
      authNeededCallback,
      capacityDelegationAuthSig: this.capacityDelegationAuthSig
    });
    return sessionSigs;
  }

  async decrypt(ciphertext: any, dataToEncryptHash: any) {
    // Get the session signatures
    const sessionSigs = await this.getSessionSignatures();

    // Decrypt the message
    const decryptedString = await LitJsSdk.decryptToString(
      {
        accessControlConditions: this.accessControlConditions,
        chain: this.chain,
        ciphertext,
        dataToEncryptHash,
        sessionSigs
      },
      this.litNodeClient
    );

    // Return the decrypted string
    return decryptedString;
  }
}

const app = express();

const corsOptions = {
  "origin": "*",
  "Access-Control-Allow-Origin": "*"
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10kb" }));
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.get("/status", (req: Request, res: Response) => {
  res.status(200).json({
    data: {
      message: "Encrypt Backend is Operational"
    }
  });
});

app.use("/lit", litRoutes);

app.all("*", (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      message: `Route: ${req.originalUrl} does not exist on this server`
    }
  });
});

const PORT = process.env.PORT || 8080;

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(8080, "10.71.7.156", async () => {
  const chain = "ethereum";

  let myLit = new Lit(chain);
  await myLit.connect();

  app.locals.lit = myLit;

  console.log(`🚀Server started Successfully on Port ${PORT}.`);
});
