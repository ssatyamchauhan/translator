const db = require("./local_mongodb");

const Find_local = async (tableName, condition = {}, skip = 0, limit = 10, sort = null) => {
    try {
        sort = !sort ? { updatedAt: -1 } : sort;
        return await (await db()).collection(tableName).find(condition).sort(sort).skip(skip).limit(limit).toArray();
    } catch (error) {
        console.error("Error fetching data")
    }
}

const Insert_local = async (tableName, data) => {
    try {
        return await (await db()).collection(tableName).insertMany(data);
    } catch (error) {
        console.error("Error inserting data", error)
    }
}

const UpdateOne_local = async (tableName, conditon, data) => {
    try {
        return await (await db()).collection(tableName).updateOne(conditon, { $set: data });
    } catch (error) {
        console.error("Error fetching data")
    }
}

const Delete_local = async (tableName, condition) => {
    try {
        return await (await db()).collection(tableName).updateOne(condition, { $set: { status: 0, deletedAt: new Date().getTime() } });
    } catch (error) {
        console.error("Error fetching data")
    }
}

const FindOne_local = async (tableName, condition = {}) => {
    try {
        return await (await db()).collection(tableName).findOne(condition);
    } catch (error) {
        console.error("Error fetching data")
    }
}

const TotalCount_local = async (tableName, condition = {}) => {
    try {
        return await (await db()).collection(tableName).countDocuments(condition);
    } catch (error) {
        console.error("Mai ban rha hu hero Error fetching data")
    }
}

const Aggregation_local = async (tableName, condition = [{}]) => {
    try {
        return await (await db()).collection(tableName).aggregate(condition).toArray(); 
    } catch (error) {
        console.error("Error fetching data", error);
    }
}

const PermanentDelete_local = async (tableName, condition) => {
    try {
        return await (await db()).collection(tableName).deleteOne(condition);
    } catch (error) {
        console.error("Error fetching data")
    }
}

module.exports = {
    Find_local,
    Insert_local,
    UpdateOne_local,
    Delete_local,
    FindOne_local,
    TotalCount_local,
    Aggregation_local,
    PermanentDelete_local
}