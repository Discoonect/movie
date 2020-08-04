const connection = require("../mysql_connection");
const sendEmail = require("../utils/sendmail");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

//  @desc       예약
//  @url        PUT    api/v1/reserve
//  @body       {movie_id,seat_number,reserve_time}
exports.reserveMovie = async (req, res, next) => {
  let user_id = req.user.id;
  let movie_id = req.body.movie_id;
  let seat_number = req.body.seat_number;
  let time = req.body.time;

  let query = `insert into movie_reserve(user_id,movie_id,seat_number,reserve_time) values(${user_id},${movie_id},${seat_number},"${time}")`;

  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, message: "예약 되었습니다." });
  } catch (e) {
    if (e.errno == 1062) {
      res
        .status(401)
        .json({ success: false, message: "이미 예약된 좌석입니다." });
    }
    res.status(500).json({ success: false, error: e });
  }
};

//  @desc       좌석 조회 (영화)
//  @url        GET    api/v1/reserve?q=title
//  @params     movie_id
exports.checkMovie = async (req, res, next) => {
  let movie_id = req.query.movie_id;
  let query = `select movie_id,seat_number,reserve_time from movie_reserve where movie_id = ${movie_id}`;

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, rows: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//  @desc       예약 취소
//  @url        DELETE    api/v1/reserve
//  @body       {movie_id,seat_number,reserve_time}
exports.cancleReserve = async (req, res, next) => {
  let ticket_id = req.body.id;
  let user_id = req.user.id;
  let currentTime = Date.now();
  let compareTime = currentTime + 1000 * 60 * 30;

  let query = `select * from movie_reserve where id =?`;
  let data = [ticket_id];

  try {
    [rows] = await connection.query(query, data);
    let start_time = rows[0].reserve_time;
    let mili_start_time = new Date(start_time).getTime();
    if (mili_start_time < compareTime) {
      res.status(400).json({ message: "30전에는 취소 불가능" });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
