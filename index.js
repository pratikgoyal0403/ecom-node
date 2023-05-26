const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const IO = require("socket.io");
const EventEmitter = require("events");
const cloudinary = require("cloudinary").v2;

const AppRoute = require("./Routes/AppRoute");
const AuthRoute = require("./Routes/AuthRoute");
const AdminRoute = require("./Routes/AdminRoute");
const app = express();
const eventEmitter = new EventEmitter();
// const URI = 'mongodb+srv://pratik:pratikgoyal@cluster0-mlvox.mongodb.net/MERN-SHOP'

app.set("eventEmitter", eventEmitter);

cloudinary.config({
  cloud_name: "dviel1ssr",
  api_key: "456421157484577",
  api_secret: "o_21SmyIKn7pZS8FZuQwW-k515I",
});

// const diskStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // cb(null, "./images");
//   },
//   filename: (req, file, cb) => {

//     // cb(null, Date.now().toString() + path.extname(file.originalname));
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype === "image/png" ||
//     file.mimetype === "image/jpg" ||
//     file.mimetype === "image/jpeg"
//   ) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

app.use("/images", express.static(path.join(__dirname, "images")));
app.use(cors());
app.use(express.json());
// app.use(multer({ storage: diskStorage, fileFilter }).array("images", 5));
app.use(AppRoute);
app.use(AuthRoute);
app.use(AdminRoute);

const server = app.listen(3030, () => {
  mongoose.connect(
    "mongodb+srv://pratik:pratikgoyal@cluster0.mlvox.mongodb.net/proshop",
    { useUnifiedTopology: true, useNewUrlParser: true },
    (err) => {
      if (err) {
        console.log(err);
      }
      console.log("server is running at port 3030");
    }
  );
});

const io = IO(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("joinRoom", (orderId) => {
    socket.join(orderId);
  });
  socket.on("admin-join", (identifier) => {
    socket.join(identifier);
  });
  socket.on("statusChanged", (status) => {
    socket.emit("registerStatusChange", status);
  });
});

eventEmitter.on("statusChanged", ({ orderId, orderStatus }) => {
  io.to(orderId).emit("statusChanged", orderStatus);
});
