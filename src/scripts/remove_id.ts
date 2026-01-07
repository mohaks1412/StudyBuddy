// scripts/remove_id.ts
import dbConnect from "@/lib/dbConnect";
import MindMap from "@/models/MindMap.model";

async function run() {
  await dbConnect();

  const res = await MindMap.updateMany(
    {},
    { $unset: { "links.$[].._id": "" } } // remove _id from all elements in links[]
  );

  console.log("Modified:", res.modifiedCount);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
