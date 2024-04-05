import { Simulator, SwapRoute, SwapOptions } from '@uniswap/smart-order-router'

export class EmptySimulator extends Simulator {

  
  protected async simulateTransaction(
    // @ts-ignore
    fromAddress: string,
    // @ts-ignore
    swapOptions: SwapOptions,
    swapRoute: SwapRoute
  ): Promise<SwapRoute> {
    return swapRoute
  }
  protected async userHasSufficientBalance(): Promise<boolean> {
    return true
  }
  protected async checkTokenApproved(): Promise<boolean> {
    return true
  }
}
