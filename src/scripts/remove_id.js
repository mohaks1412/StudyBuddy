
const mongoose = require("mongoose");


const MindMap = require("../models/MindMap.model").default || require("../models/MindMap.model")
const dbConnect = require("../lib/dbConnect").default || require("../lib/dbConnect");

async function run() {
  try {
    await dbConnect();

    const res = await MindMap.updateMany(
      {},
      { $unset: { "links.$[elem]._id": "" } },
      { arrayFilters: [{ "elem._id": { $exists: true } }] }
    );

    console.log("Matched:", res.matchedCount, "Modified:", res.modifiedCount);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
