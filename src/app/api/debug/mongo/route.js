import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ir-app-opalquality");
    const admin = db.admin();
    const status = await admin.ping();

    return Response.json({ success: true, status });
  } catch (err) {
    return Response.json({ success: false, error: err.message, name: err.name, stack: err.stack });
  }
}
