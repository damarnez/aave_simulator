import { ethers } from "ethers";
import ganache from "ganache-cli";
import { ConfigConnector } from "../types/generics";

const URL_NODE = process.env.ALCHEMY_NODE;

class Connector {
  private config: ConfigConnector;
  constructor(config: ConfigConnector) {
    this.config = config;
  }
  public addUnlockAccounts(unlock: string[]) {
    this.config.unlockAccounts = [...this.config.unlockAccounts, ...unlock];
  }
  public connect(): ethers.providers.Web3Provider {
    const web3Prov = ganache.provider({
      fork: URL_NODE,
      fork_block_number: this.config.blockNumber,
      unlocked_accounts: this.config.unlockAccounts,
      db_path: `./db/${this.config.name}-${Date.now()}`,
      forkCacheSize: -1,
      locked: false,
      default_balance_ether: 10000000000000,
    });
    const provider = new ethers.providers.Web3Provider(web3Prov);

    return provider;
  }
}

export default Connector;
