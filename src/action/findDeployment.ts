import { Hex, createPublicClient, http } from 'viem';
import { Chain, DEPLOYER_CONTRACT_ADDRESS } from '../constant';
import { computeAddress } from './computeAddress';
import { buildUrlForInfura } from '../utils';

export const findDeployment = async (
  bytecode: Hex,
  salt: Hex,
  chains: Chain[]
) => {
  const contractAddress = computeAddress(
    DEPLOYER_CONTRACT_ADDRESS,
    bytecode,
    salt
  );

  const checkDeploymentOnChain = async (chain: string) => {
    const viemChainObject = getChainObject(chain);
    const publicClient = createPublicClient({
      transport: http(buildUrlForInfura(viemChainObject.network)),
    });

    const deployedBytecode = await publicClient.getBytecode({
      address: contractAddress,
    });

    return deployedBytecode ? 'deployed' : 'notDeployed';
  };

  const deploymentResults = await Promise.all(
    chains.map((chain) => checkDeploymentOnChain(chain))
  );

  const deployedChains = chains.filter(
    (_, index) => deploymentResults[index] === 'deployed'
  );
  const notDeployedChains = chains.filter(
    (_, index) => deploymentResults[index] === 'notDeployed'
  );

  return { contractAddress, deployedChains, notDeployedChains };
};
