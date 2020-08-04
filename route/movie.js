const express = require("express");

const {
  getAllMovie,
  searchMovie,
  yearMovieDesc,
  yearMovieAsc,
  attendaceDesc,
  attendaceAsc,
} = require("../control/movie");

const router = express.Router();

router.route("/").get(getAllMovie);
router.route("/search").get(searchMovie);
router.route("/year/desc").get(yearMovieDesc);
router.route("/year/asc").get(yearMovieAsc);
router.route("/attendance/desc").get(attendaceDesc);
router.route("/attendance/asc").get(attendaceAsc);
module.exports = router;
