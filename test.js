require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const { convertMarathiToEnglish } = require('./marathiToEnglish');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DBNAME;
const marathiCollection = process.env.MONGODB_MARATHI_COLLECTION;
const englishCollection = process.env.MONGODB_ENGLISH_COLLECTION;

const client = new MongoClient(uri, { useNewUrlParser: true });

async function processBatchOfData(skip, limit) {
  await client.connect();
  console.log('Mongodb Connection Established Successfully!')

  const marathiDb = client.db(dbName);
  const englishDb = client.db(dbName);

  const marathiData = await marathiDb.collection(marathiCollection).find().skip(skip).limit(limit).toArray();

  const englishData = await Promise.all(marathiData.map(async (data) => {
    if (typeof data === 'string') {
      const english = await convertMarathiToEnglish(data);
      await marathiDb.collection(marathiCollection).updateOne({ _id: data._id }, { $set: { english: english } });
      return english;
    } else if (Array.isArray(data)) {
      return await Promise.all(data.map(async (element) => {
        if (typeof element === 'string') {
          const english = await convertMarathiToEnglish(element);
          await marathiDb.collection(marathiCollection).updateOne({ _id: data._id }, { $set: { english: english } });
          return english;
        } else if (typeof element === 'object') {
          return await convertNestedObjectToEnglish(element, marathiDb);
        } else {
          return element;
        }
      }));
    } else if (typeof data === 'object') {
      return await convertNestedObjectToEnglish(data, marathiDb);
    } else {
      return data;
    }
  }));

  await englishDb.collection(englishCollection).insertMany(englishData);

  await client.close();
}

async function convertNestedObjectToEnglish(obj, marathiDb) {
  const keys = Object.keys(obj);
  const values = Object.values(obj);
  const englishValues = await Promise.all(values.map(async (value) => {
    if (typeof value === 'string') {
      const english = await convertMarathiToEnglish(value);
      await marathiDb.collection(marathiCollection).updateOne({ _id: obj._id }, { $set: { english: english } });
      return english;
    } else if (Array.isArray(value)) {
      return await Promise.all(value.map(async (element) => {
        if (typeof element === 'string') {
          const english = await convertMarathiToEnglish(element);
          await marathiDb.collection(marathiCollection).updateOne({ _id: obj._id }, { $set: { english: english } });
          return english;
        } else if (typeof element === 'object') {
          return await convertNestedObjectToEnglish(element, marathiDb);
        } else {
          return element;
        }
      }));
    } else if (typeof value === 'object') {
      return await convertNestedObjectToEnglish(value, marathiDb);
    } else {
      return value;
    }
  }));
  const englishObj = Object.fromEntries(keys.map((key, index) => [key, englishValues[index]]));
  await marathiDb.collection(marathiCollection).updateOne({ _id: obj._id }, { $set: { english: englishObj } });
  return englishObj;
}