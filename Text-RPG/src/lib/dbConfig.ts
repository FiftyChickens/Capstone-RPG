import mongoose from "mongoose";

export async function DBconnect() {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log("MongoDB is already connected");
      return;
    }

    await mongoose.connect(`${process.env.DB_URI}${process.env.DB_NAME}`);

    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    });
  } catch (error: unknown) {
    console.error("Something went wrong connecting to MongoDB:", error);
  }
}
