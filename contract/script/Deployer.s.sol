// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import {Script} from "forge-std/Script.sol";
import {Deployer} from "../src/Deployer.sol";

contract DeployerScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        Deployer deployerContract = new Deployer();

        vm.stopBroadcast();
    }
}