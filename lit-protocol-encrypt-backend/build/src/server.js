"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lit = void 0;
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const LitJsSdk = __importStar(require("@lit-protocol/lit-node-client-nodejs"));
const auth_helpers_1 = require("@lit-protocol/auth-helpers");
const constants_1 = require("@lit-protocol/constants");
const ethers_1 = require("ethers");
const contracts_sdk_1 = require("@lit-protocol/contracts-sdk");
const lit_routes_1 = __importDefault(require("./routes/lit.routes"));
const constants_2 = require("@lit-protocol/constants");
var https = require('https');
var fs = require('fs');
var privateKey = fs.readFileSync('/Users/a/w/cert/private.key', 'utf8');
var certificate = fs.readFileSync('/Users/a/w/cert/cert.crt', 'utf8');
var credentials = { key: privateKey, cert: certificate };
class Lit {
    constructor(chain) {
        // See more access control conditions here: https://developer.litprotocol.com/sdk/access-control/evm/basic-examples
        this.accessControlConditions = [
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
        this.chain = chain;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            app.locals.litNodeClient = new LitJsSdk.LitNodeClientNodeJs({
                alertWhenUnauthorized: false,
                litNetwork: constants_1.LitNetwork.DatilDev,
                debug: process.env.NODE_ENV !== "production"
            });
            this.litNodeClient = app.locals.litNodeClient;
            yield this.litNodeClient.connect();
            const ethWallet = new ethers_1.ethers.Wallet((_a = process.env.PRIVATE_KEY) !== null && _a !== void 0 ? _a : "", new ethers_1.ethers.providers.JsonRpcProvider(constants_2.LIT_RPC.CHRONICLE_YELLOWSTONE));
            let contractClient = new contracts_sdk_1.LitContracts({
                signer: ethWallet,
                network: constants_1.LitNetwork.DatilDev,
                debug: true
            });
            yield contractClient.connect();
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
        });
    }
    getSessionSignatures() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Connect to the wallet
            const ethWallet = new ethers_1.ethers.Wallet((_a = process.env.PRIVATE_KEY) !== null && _a !== void 0 ? _a : "");
            // Get the latest blockhash
            const latestBlockhash = yield this.litNodeClient.getLatestBlockhash();
            // Define the authNeededCallback function
            const authNeededCallback = (params) => __awaiter(this, void 0, void 0, function* () {
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
                const toSign = yield (0, auth_helpers_1.createSiweMessageWithRecaps)({
                    uri: params.uri,
                    expiration: params.expiration,
                    resources: params.resourceAbilityRequests,
                    walletAddress: ethWallet.address,
                    nonce: latestBlockhash,
                    litNodeClient: this.litNodeClient
                });
                // Generate the authSig
                const authSig = yield (0, auth_helpers_1.generateAuthSig)({
                    signer: ethWallet,
                    toSign
                });
                return authSig;
            });
            // Define the Lit resource
            const litResource = new auth_helpers_1.LitAccessControlConditionResource("*");
            // Get the session signatures
            const sessionSigs = yield this.litNodeClient.getSessionSigs({
                chain: this.chain,
                resourceAbilityRequests: [
                    {
                        resource: litResource,
                        ability: auth_helpers_1.LitAbility.AccessControlConditionDecryption
                    }
                ],
                authNeededCallback,
                capacityDelegationAuthSig: this.capacityDelegationAuthSig
            });
            return sessionSigs;
        });
    }
    decrypt(ciphertext, dataToEncryptHash) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the session signatures
            const sessionSigs = yield this.getSessionSignatures();
            // Decrypt the message
            const decryptedString = yield LitJsSdk.decryptToString({
                accessControlConditions: this.accessControlConditions,
                chain: this.chain,
                ciphertext,
                dataToEncryptHash,
                sessionSigs
            }, this.litNodeClient);
            // Return the decrypted string
            return decryptedString;
        });
    }
}
exports.Lit = Lit;
const app = (0, express_1.default)();
const corsOptions = {
    "origin": "*",
    "Access-Control-Allow-Origin": "*"
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: "10kb" }));
if (process.env.NODE_ENV === "development")
    app.use((0, morgan_1.default)("dev"));
app.get("/status", (req, res) => {
    res.status(200).json({
        data: {
            message: "Encrypt Backend is Operational"
        }
    });
});
app.use("/lit", lit_routes_1.default);
app.all("*", (req, res) => {
    res.status(404).json({
        error: {
            message: `Route: ${req.originalUrl} does not exist on this server`
        }
    });
});
const PORT = process.env.PORT || 8080;
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(8080, "10.71.7.156", () => __awaiter(void 0, void 0, void 0, function* () {
    const chain = "ethereum";
    let myLit = new Lit(chain);
    yield myLit.connect();
    app.locals.lit = myLit;
    console.log(`🚀Server started Successfully on Port ${PORT}.`);
}));
