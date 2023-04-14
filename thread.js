require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const { htmlToJson } = require('./helper');
const { convertMarathiToEnglish } = require('./helper');
const { parentPort } = require('worker_threads');


const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DBNAME;
const marathiCollection = process.env.MONGODB_MARATHI_COLLECTION;
const englishCollection = process.env.MONGODB_ENGLISH_COLLECTION;

let client = new MongoClient(uri, { useNewUrlParser: true });
let mongoConnectionUrl = '';
async function mongoConnection () {
      if(mongoConnectionUrl) {
            console.log('using old connection')
            return mongoConnectionUrl
      } else {
            console.log('creating new connection')
            mongoConnectionUrl = await client.connect();
            console.log('Mongodb Connection Established Successfully!')
            return mongoConnectionUrl;
      }
}
const skip = 0;
const limit = 1000;
async function processBatchOfData(skip, limit) {
      client = await mongoConnection();

      const marathiDb = client.db(dbName);
      const englishDb = client.db(dbName);

      const marathiDbData = await marathiDb.collection(marathiCollection).find().skip(skip).limit(limit).toArray();
      if (marathiDbData && marathiDbData.length == 0) {
            return false;
      }
      let marathiData = []
      for (let doc of marathiDbData) {
            if (doc && doc.pdf_data) {
                  const data = await htmlToJson(doc.pdf_data);
                  //                  console.log(data)
                  doc.pdf_info = data;
                  delete doc.pdf_data;
                  marathiData.push(doc)

            } else { marathiData.push(doc) }
      }
      console.log('marathiData', marathiData[0])
      const englishData = await Promise.all(marathiData.map(async (data) => {
            if (typeof data === 'string') {
                  return await convertMarathiToEnglish(data);
            } else if (Array.isArray(data)) {
                  return await Promise.all(data.map(async (element) => {
                        if (typeof element === 'string') {
                              return await convertMarathiToEnglish(element);
                        } else if (typeof element === 'object') {
                              return await convertNestedObjectToEnglish(element);
                        } else {
                              return element;
                        }
                  }));
            } else if (typeof data === 'object') {
                  return await convertNestedObjectToEnglish(data);
            } else {
                  return data;
            }
      }));

      await englishDb.collection(englishCollection).insertMany(englishData);

      await client.close();
}

async function convertNestedObjectToEnglish(obj) {
      const keys = Object.keys(obj);
      const values = Object.values(obj);
      const englishValues = await Promise.all(values.map(async (value) => {
            if (typeof value === 'string') {
                  return await convertMarathiToEnglish(value);
            } else if (Array.isArray(value)) {
                  return await Promise.all(value.map(async (element) => {
                        if (typeof element === 'string') {
                              return await convertMarathiToEnglish(element);
                        } else if (typeof element === 'object') {
                              return await convertNestedObjectToEnglish(element);
                        } else {
                              return element;
                        }
                  }));
            } else if (typeof value === 'object') {
                  return await convertNestedObjectToEnglish(value);
            } else {
                  return value;
            }
      }));
      return Object.fromEntries(keys.map((key, index) => [key, englishValues[index]]));
}



parentPort.on('message', async ({ skip, limit }) => {
      try {
            const result = await processBatchOfData(skip, limit);
            parentPort.postMessage({ success: true, result });
      } catch (err) {
            parentPort.postMessage({ success: false, error: err.message });
      }
});


// let interval = ""

// interval = setInterval(async () => {
//       const response = await processBatchOfData(0, limit);
//       if (response == false) {
//             clearInterval(interval);
//       } else {
//             skip += limit
//       }
// }, 20000);
