
require("dotenv").config()
const Mongodb = require("./library/mongodb");



async function merge() {
      const { Find, Insert } = require("./library/methods");

      for (let count=0;count<63999;count+=1000) {
            const data = await Find("mh31", {}, count, 1000);
            const dataToInsert = [];
            console.log('datalength', dataToInsert.length)
            if (data && data.length) {
                  for (let d of data) {
                        delete d._id;
                        dataToInsert.push(d);
                  }
            }

            await Insert("mh", dataToInsert);
      }
}


Mongodb().then(() => {
      merge()
}).catch((err) => console.error('Error', err))
