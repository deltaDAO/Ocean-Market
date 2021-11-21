// chain configs in ocean.js ConfigHelperConfig format
// see: https://github.com/oceanprotocol/ocean.js/blob/e07a7cb6ecea12b39ed96f994b4abe37806799a1/src/utils/ConfigHelper.ts#L8
// networkId is required, since its used to look for overwrites
// all other fields are first loaded from ocean.js and are optional
const chains = [
  {
    name: 'Ropsten',
    networkId: 3,
    isDefault: true,
    providerUri: 'https://provider.ropsten.delta-dao.com'
  },
  {
    name: 'Rinkeby',
    networkId: 4,
    isDefault: true,
    providerUri: 'https://provider.rinkeby.delta-dao.com'
  },
  {
    name: 'Gaia-X',
    networkId: 2021000,
    isDefault: false,
    providerUri: 'https://provider.gaiax.delta-dao.com/',
    nodeUri: 'https://rpc.gaiaxtestnet.oceanprotocol.com/',
    explorerUri: 'https://blockscout.gaiaxtestnet.oceanprotocol.com/'
  }
]

const getDefaultChainIds = () => {
  return chains.filter((chain) => chain.isDefault).map((c) => c.networkId)
}

const getSupportedChainIds = () => {
  return chains.map((c) => c.networkId)
}

module.exports = {
  chains,
  getDefaultChainIds,
  getSupportedChainIds
}
