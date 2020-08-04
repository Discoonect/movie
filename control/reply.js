const connection = require("../mysql_connection");
const sendEmail = require("../utils/sendmail");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

//  @desc       댓글 작성
//  @url        POST    api/v1/reply
//  @body       {title,movie_comment,rating(1~5)}
exports.createReply = async (req, res, next) => {
  let user_id = req.user.id;
  let movie_comment = req.body.movie_comment;
  let rating = req.body.rating;
  let title = req.body.title;
  let query = `select * from movie where title = "${title}"`;

  try {
    [rows] = await connection.query(query);
    let movie_id = rows[0].id;

    query = `insert into reply(user_id,movie_id,movie_comment,rating) values(?,?,?,?)`;
    let data = [user_id, movie_id, movie_comment, rating];

    try {
      [result] = await connection.query(query, data);
      res.status(200).json({ success: true });
    } catch (e) {
      if (e.errno == 3819) {
        res
          .status(503)
          .json({ success: false, message: "평점은 1~5 까지 넣어주세요." });
        return;
      }
      res.status(500).json({ success: false, error: e });
    }
  } catch (e) {
    res.status(501).json({ success: false, error: e });
  }
};

//  @desc       댓글 보기
//  @url        GET    api/v1/reply
//  @body       title
exports.movieComment = async (req, res, next) => {
  let movie_id = req.query.movie_id;
  let offset = req.query.offset;
  let query = `select m.user_name,r.movie_comment,r.rating,r.created_at from reply as r join movie_user as m on m.id = r.user_id where movie_id=${movie_id} limit ${offset}, 25`;

  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//  @desc       댓글 수정
//  @url        GET    api/v1/reply
//  @body       title
exports.updateReply = async (req, res, next) => {
  let reply_id = req.body.reply_id;
  let comment = req.body.comment;
  let user_id = req.user.id;
  let rating = req.body.rating;

  let query = `select * from reply where id = ?`;
  let data = [reply_id];

  try {
    [rows] = await connection.query(query, data);
    if (rows[0].user_id != user_id) {
      res
        .status(401)
        .json({ success: false, message: "수정 권한이 없습니다." });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }

  query = `update reply set movie_comment =?, rating = ? where id = ?`;
  data = [comment, rating, reply_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//  @desc       댓글 삭제
//  @url        DELETE    api/v1/reply
//  @body       reply_id
exports.deleteReply = async (req, res, next) => {
  let reply_id = req.body.reply_id;
  let user_id = req.user.id;

  let query = `select * from reply where id = ${reply_id}`;

  try {
    [rows] = await connection.query(query);

    if (rows[0].user_id != user_id) {
      res.status(401).json({ success: false, message: "권한이 없습니다." });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }

  query = `delete from reply where id = ${reply_id}`;

  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(501).json({ success: false, error: e });
  }
};
