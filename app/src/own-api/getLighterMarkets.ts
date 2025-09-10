import { TokenDto_Output } from '../api'

export const getLighterMarkets = async () => {
  const response = await fetch('https://mainnet.zklighter.elliot.ai/api/v1/orderBookDetails')
  const data = await response.json()
  return data.order_book_details.map((item: TokenDto_Output & { last_trade_price: string }) => ({ ...item, price: item.last_trade_price })) as TokenDto_Output[]
}
