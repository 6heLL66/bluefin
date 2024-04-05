import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { Account, Batch, Proxy } from "../types";

if (
  !import.meta.env.VITE_SUPABASE_PROJECT_URL ||
  !import.meta.env.VITE_SUPABASE_ANON_KEY
) {
  throw new Error("Add .env variables");
}

export class SUPABASE_DB {
  client: SupabaseClient;

  constructor() {
    this.client = createClient(
      import.meta.env.VITE_SUPABASE_PROJECT_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  public addAccount = (account: Account) => {
    return this.client.from("accounts").insert(account);
  };

  public removeAccounts = (accountIds: string[]) => {
    return this.client.from("accounts").delete().eq("id", accountIds);
  };

  public addProxy = (proxy: Proxy) => {
    return this.client.from("proxies").insert(proxy);
  };

  public removeProxies = (proxyIds: string[]) => {
    return this.client.from("proxies").delete().eq("id", proxyIds);
  };

  public getAccounts = async (): Promise<Account[]> => {
    const { data } = await this.client
      .from("accounts")
      .select<string, Account>();
    return data ?? [];
  };

  public getProxies = async (): Promise<Proxy[]> => {
    const { data } = await this.client.from("proxies").select<string, Proxy>();
    return data ?? [];
  };

  public connectProxyToAccounts = async (
    accountIds: string[],
    proxyId: string
  ) => {
    return this.client
      .from("accounts")
      .update({ proxy_id: proxyId })
      .eq("id", accountIds);
  };

  public getBatches = async (): Promise<Batch[]> => {
    const { data } = await this.client.from("batches").select<string, Batch>();
    return data ?? [];
  };

  public createBatch = async (account_1_id: string, account_2_id: string) => {
    return this.client.from("batches").insert({ account_1_id, account_2_id });
  };

  public deleteBatch = async (batchId: string) => {
    return this.client.from("batches").delete().eq("id", batchId);
  };
}