const express = require("express");
const auth = require("../middleware/auth");

const {
  reserveMovie,
  checkMovie,
  cancleReserve,
} = require("../control/reservation");

const router = express.Router();

router
  .route("/")
  .put(auth, reserveMovie)
  .get(checkMovie)
  .delete(auth, cancleReserve);

module.exports = router;
