import { TokenDto_Output } from "../api"

export const getLighterMarkets = async () => {
  const response = await fetch('https://mainnet.zklighter.elliot.ai/api/v1/orderBookDetails')
  const data = await response.json()
  return data.order_book_details as TokenDto_Output[]
}