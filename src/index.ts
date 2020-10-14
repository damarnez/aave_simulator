import workerFarm from "worker-farm";

import simulations from "./simulations.json";

import job01 from "./jobs/job01";
import job02 from "./jobs/job02";

const JobList = {
  [job01.name]: job01,
  [job02.name]: job02,
};

(async () => {
  const workers = workerFarm(require.resolve("./child"));
  try {
    simulations.forEach(async (simulation) => {
      workers(simulation.jobName, async (err, id) => {
        if (err) throw err; // Worker error
        if (!simulation.disabled) {
          console.log(id);
          try {
            const Worker = JobList[simulation.jobName];
            const newJob = new Worker(simulation);
            await newJob.exec();
          } catch (error) {
            // Ignore and continue with other workers
            console.error(`Error (${simulation.jobName})`, error);
          }
        }
      });
    });
  } catch (err) {
    console.error(err);
  } finally {
    // shutdown worker pool
    workerFarm.end(workers);
  }
})();
