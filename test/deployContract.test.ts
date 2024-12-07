import { expect, test } from "bun:test";
import { deployToChain,deployContracts } from "../src/action/deployContracts";
import { processAndValidateChains } from "../src/utils";
import {generatePrivateKey,} from "viem/accounts";
import { concat } from 'viem'


const PRIVATE_KEY = generatePrivateKey(); // this is copied from viem.sh docs, so don't use this in production and no it's not even ours

test("deployContract", async () => {
    await deployToChain(
        PRIVATE_KEY,
        processAndValidateChains("sepolia", {
            testnetAll : false,
            mainnetAll : false,
            allNetworks : false
        })[0],
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
        processAndValidateChains(undefined, {
            testnetAll : true,
            mainnetAll : false,
            allNetworks : false
        }),
        generatePrivateKey(),
        undefined,
        undefined
    );
}, 30000);