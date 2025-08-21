export interface Order {
  order_index: number;
  order_id: string;
  owner_account_index: number;
  initial_base_amount: string;
  remaining_base_amount: string;
  price: string;
  order_expiry: number;
}

export interface LighterSpreadsResponse {
  code: number;
  total_asks: number;
  asks: Order[];
  total_bids: number;
  bids: Order[];
}