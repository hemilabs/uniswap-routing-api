import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { default as bunyan, default as Logger } from 'bunyan'

import { QuoteHandlerInjector } from '../lib/handlers/quote/injector'
import { QuoteHandler } from '../lib/handlers/quote/quote'
import { HemiQuoteQueryParamsJoi, HemiQuoteBodyParams } from '../lib/handlers/quote/schema/quote-schema'

const log: Logger = bunyan.createLogger({
  name: 'Root',
  serializers: bunyan.stdSerializers,
  level: bunyan.INFO,
})

const quoteInjectorPromise = new QuoteHandlerInjector('quoteInjector').build()
const quoteHandler = new QuoteHandler('quote', quoteInjectorPromise)

const validationErrorResponse = {
  statusCode: 422,
  body: JSON.stringify({
    detail: 'Invalid JSON body',
    errorCode: 'VALIDATION_ERROR',
  }),
}

export const post = async function (event: APIGatewayProxyEvent, context: Context) {
  // The UI seems to be using an API that does not exactly matches this implementation
  // so here we are going to convert the event.body into a query string
  // running a custom validation for hemi
  const { body, ...rest } = event
  if (!body || typeof body !== 'string') {
    return validationErrorResponse
  }
  let parsedBody
  try {
    parsedBody = JSON.parse(body)
  } catch {
    return validationErrorResponse
  }

  const validationResult = HemiQuoteQueryParamsJoi.validate(parsedBody, {
    allowUnknown: true,
    stripUnknown: true,
  })
  if (validationResult.error) {
    return validationErrorResponse
  }

  try {
    const validBody = validationResult.value as HemiQuoteBodyParams
    const expectedQueryStringParameters: APIGatewayProxyEvent['queryStringParameters'] = {
      amount: validBody.amount,
      intent: validBody.intent,
      // force V3 for Hemi only - using custom stringArray implementation
      protocols: '[v3]',
      slippageTolerance: validBody.slippageTolerance ?? '0.5', // 0.5% default
      type: validBody.type === 'EXACT_INPUT' ? 'exactIn' : 'exactOut',
      tokenInAddress: validBody.tokenIn,
      tokenInChainId: validBody.tokenInChainId.toString(),
      tokenOutAddress: validBody.tokenOut,
      tokenOutChainId: validBody.tokenOutChainId.toString(),
    }
    const newEvent: APIGatewayProxyEvent = {
      ...rest,
      body: null,
      queryStringParameters: expectedQueryStringParameters,
    }
    const response = await quoteHandler.handler(newEvent, context)
    //throw new Error('fooobar')
    // Uniswap interface expects a slightly different response structure, due to unified-routing-api usage.
    // Let's mutate it to match the expected response.
    const quote = JSON.parse(response.body)
    response.body = JSON.stringify({
      allQuotes: [{ quote, routing: 'CLASSIC' }],
      quote,
      routing: 'CLASSIC',
    })
    return response
  } catch (error) {
    log.fatal({ error }, 'Internal Server Error')
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    }
  }
}
