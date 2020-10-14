import { ethers } from "ethers";
import { User, ConfigConnector } from "../types/generics";
import Connector from "./connector";

abstract class Job {
  private user: User;
  private connection: Connector;
  private hrstart: [number, number];
  constructor(user: User) {
    this.user = user;
    const config: ConfigConnector = {
      unlockAccounts: [user.address],
      blockNumber: user.blockNumber,
      name: user.jobName,
    };
    this.connection = new Connector(config);
  }

  protected getUser(): User {
    return this.user;
  }

  protected connect(): ethers.providers.Web3Provider {
    return this.connection.connect();
  }

  protected startLog() {
    this.hrstart = process.hrtime();
    console.info(`- Start ${this.user.jobName} user : ${this.user.address}`);
  }

  protected endLog() {
    const hrend = process.hrtime(this.hrstart);
    console.info(
      `- End ${this.user.jobName} user : ${this.user.address} Execution time (hr): %ds %dms`,
      hrend[0],
      hrend[1] / 1000000
    );
  }
  public addUnlockAccounts(unlock: string[]) {
    this.connection.addUnlockAccounts(unlock);
  }
  abstract async exec(): Promise<void>;
}

export default Job;
