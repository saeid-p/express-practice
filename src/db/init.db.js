import mongoose from "mongoose";

const connectionString = "mongodb://127.0.0.1/test-db";

export default () => mongoose.connect(connectionString);
