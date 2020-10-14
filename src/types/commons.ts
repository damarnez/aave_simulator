export interface User {
  address: string;
  blockNumber: number;
  jobName: string;
  tx?: string;
  symbol?: string;
  disabled?: boolean;
  extra?: string[];
}

export interface ConfigConnector {
  blockNumber: number;
  unlockAccounts: string[];
  name: string;
}
