import { ChainId } from '@hemilabs/sdk-core'
import { CachingTokenListProvider, ITokenListProvider, ITokenProvider, NodeJSCache } from '@hemilabs/smart-order-router'
import { TokenList } from '@uniswap/token-lists'
import NodeCache from 'node-cache'
import hemiTokenList from '@hemilabs/token-list'

const tokenCache = new NodeCache({ stdTTL: 360, useClones: false })

const hemi = {
  id: 743_111,
  name: 'Hemi Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Testnet Hemi Ether',
    symbol: 'ETH',
  },
}

const nativeTokens = [
  {
    address: 'ETH',
    chainId: hemi.id,
    decimals: hemi.nativeCurrency.decimals,
    name: hemi.nativeCurrency.name,
    symbol: hemi.nativeCurrency.symbol,
  },
]

const tokenList: TokenList = {
  ...hemiTokenList,
  tokens: [
    ...hemiTokenList.tokens,
    ...nativeTokens
  ]
}

export class HemiTokenListProvider {
  public static async fromTokenList(chainId: ChainId): Promise<ITokenListProvider & ITokenProvider> {
    return new CachingTokenListProvider(chainId, tokenList, new NodeJSCache(tokenCache))
  }
}
