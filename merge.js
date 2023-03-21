
require("dotenv").config()
const Mongodb = require("./library/mongodb");
const Mongodb_Local = require("./local_library/local_mongodb");



async function merge() {
      const { Insert } = require("./library/methods");
      const { Find_local } = require("./local_library/methods");
      for (let count = 0; count < 70200; count += 1000) {
            console.log('skipping', count);
            const data = await Find_local("testdata", {}, count, 1000);
            const dataToInsert = [];
            console.log('datalength', data.length, dataToInsert.length)
            if (data && data.length) {
                  for (let d of data) {
                        delete d._id;
                        dataToInsert.push(d);
                  }
            }
            console.log('inserting', count, dataToInsert.length)
            if (dataToInsert.length) {
                  await Insert("mh", dataToInsert);
            }
      }
}


Mongodb_Local().then(() => {
      console.log('connected local');
      Mongodb().then(() => {
            console.log('connected')
            merge();
      }).catch((error) => { console.error('Error Connecting Mongodb', error) })
}).catch((error) => console.log(error));
