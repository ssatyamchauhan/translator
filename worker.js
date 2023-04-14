const { Worker } = require('worker_threads');

const BATCH_SIZE = 1000;
const TOTAL_SIZE = 94532; // replace with your total data size
const NUM_WORKERS = 4; // adjust to the number of threads you want to spawn

(async () => {
  const promises = [];

  for (let i = 0; i < TOTAL_SIZE; i += BATCH_SIZE) {
    const skip = i;
    const limit = Math.min(i + BATCH_SIZE, TOTAL_SIZE);

    const promise = new Promise((resolve, reject) => {
      const worker = new Worker('./thread.js');
      worker.on('message', ({ success, result, error }) => {
        if (success) {
          resolve(result);
        } else {
          reject(new Error(error));
        }
      });
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
      worker.postMessage({ skip, limit });
    });

    promises.push(promise);

    // limit the number of promises being executed at once
    if (promises.length >= NUM_WORKERS) {
      await Promise.race(promises);
    }
  }

  await Promise.all(promises);
})();
