const express = require("express");
const auth = require("../middleware/auth");

const {
  createReply,
  movieComment,
  updateReply,
  deleteReply,
} = require("../control/reply");

const router = express.Router();

router
  .route("/")
  .post(auth, createReply)
  .get(movieComment)
  .put(auth, updateReply)
  .delete(auth, deleteReply);

module.exports = router;
