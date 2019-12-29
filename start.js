const app = require("./app");
const mongoose = require("mongoose");

let appPort = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(console.log("Attempting to connect to MongoDB"));

mongoose.connection
  .on("connected", () => {
    console.log("MongoDB connected");
  })
  .on("error", err => {
    console.log(`Error occured with message ${err.message}`);
  });

const server = app.listen(appPort, () => {
  console.log(`Express is running on port ${server.address().port}`);
});
