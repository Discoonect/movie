const express = require("express");
const auth = require("../middleware/auth");

const {
  createUser,
  loginUser,
  allLogout,
  deleteUser,
  favoriteMovie,
  searchFavorite,
  userPhotoUpload,
} = require("../control/movie");

const router = express.Router();

router.route("/").post(createUser);
router.route("/login").post(loginUser);
router.route("/logout").post(auth, allLogout);
router.route("/deleteUser").post(auth, deleteUser);
router.route("/favoriteMovie").post(auth, favoriteMovie);
router.route("/searchfavorite").post(auth, searchFavorite);
router.route("/me/photo").post(auth, userPhotoUpload);

module.exports = router;
