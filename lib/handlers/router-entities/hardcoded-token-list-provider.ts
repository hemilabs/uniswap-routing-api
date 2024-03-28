import { ChainId } from '@hemilabs/sdk-core'
import { CachingTokenListProvider, ITokenListProvider, ITokenProvider, NodeJSCache } from '@hemilabs/smart-order-router'
import { TokenList, TokenInfo } from '@uniswap/token-lists'
import NodeCache from 'node-cache'

const tokenCache = new NodeCache({ stdTTL: 360, useClones: false })

const hemi = {
  id: 743_111,
  name: 'Hemi Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Testnet Hemi Ether',
    symbol: 'thETH',
  },
}

const sepolia = {
  id: 11_155_111,
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'sepETH', decimals: 18 },
}

const tokens: TokenInfo[] = [
  {
    address: '0xec46e0efb2ea8152da0327a5eb3ff9a43956f13e',
    chainId: hemi.id,
    decimals: 18,
    extensions: {
      bridgeInfo: {
        [sepolia.id]: {
          tokenAddress: '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357',
        },
      },
    },
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
    name: 'Testnet Hemi DAI',
    symbol: 'thDAI',
  },
]

const nativeTokens = [
  {
    address: 'thETH',
    chainId: hemi.id,
    decimals: hemi.nativeCurrency.decimals,
    name: hemi.nativeCurrency.name,
    symbol: hemi.nativeCurrency.symbol,
  },
]

const tokenList: TokenList = {
  keywords: ['default', 'hemi'],
  name: 'Hemi Default',
  tags: {},
  timestamp: '2023-12-13T18:25:25.830Z',
  tokens: tokens.concat(nativeTokens),
  version: {
    major: 0,
    minor: 0,
    patch: 1,
  },
}

export class HardcodedTokenListProvider {
  public static async fromTokenList(chainId: ChainId): Promise<ITokenListProvider & ITokenProvider> {
    return new CachingTokenListProvider(chainId, tokenList, new NodeJSCache(tokenCache))
  }
}
