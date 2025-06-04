import { expect, test } from "bun:test";
import { deployToChain,deployContracts } from "../src/action/deployContracts";
import { processAndValidateChains } from "../src/utils";
import {generatePrivateKey,} from "viem/accounts";
import { concat } from 'viem'
import { getSupportedChains } from "../src/constant";


const PRIVATE_KEY = generatePrivateKey(); // this is copied from viem.sh docs, so don't use this in production and no it's not even ours

test("deployContract", async () => {
    await deployToChain(
        PRIVATE_KEY,
        (await processAndValidateChains({
            testnetAll : false,
            mainnetAll : false,
            allNetworks : false,
            chainOption : "Sepolia,Base Sepolia"
        }))[0],
        concat(['0x00', generatePrivateKey()]),
        generatePrivateKey(),
        undefined,
        undefined
    );
}, 30000);

test("deployContractTestnet", async () => {
    await deployContracts(
        PRIVATE_KEY,
        concat(['0x00', generatePrivateKey()]),
        await processAndValidateChains({
            testnetAll : true,
            mainnetAll : false,
            allNetworks : false,
        }),
        generatePrivateKey(),
        undefined,
        undefined
    );
}, 30000);

test("getSupportedChains", async () => {
    const chains = await getSupportedChains();
    console.log(chains.map((chain) => chain.name + " " + chain.id));
    expect(chains).toBeDefined();
});