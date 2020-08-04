const connection = require("../mysql_connection");

const sendEmail = require("../utils/sendmail");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const path = require("path");

// @desc     영화데이터 불러오기
// @url      GET/api/v1/movie??offset=
// @request
// @response
exports.getAllMovie = async (req, res, next) => {
  let offset = req.query.offset;
  let query = `select * from movie limit ${offset},25`;
  try {
    [rows] = await connection.query(query);
    let count = rows.length;
    res.status(200).json({ success: true, movie: rows, count: count });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc     영화명 검색
// @url      GET/api/v1/movie/search?q=title&?offset=
// @request  title
// @response
exports.searchMovie = async (req, res, next) => {
  let offset = req.query.offset;
  let title = req.query.q;
  let query = `select m.title,m.genre,m.attendance,m.year,count(r.movie_comment) as "댓글 수",round(avg(r.rating),1) as "평균점" \
               from movie as m \
               left join reply as r
               on r.movie_id = m.id
               where title = "${title}" \
               group by m.id \
               order by m.id
               limit ${offset},25`;

  try {
    [rows] = await connection.query(query);
    let count = rows.length;
    res.status(200).json({ success: true, movie: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc     연도 내림차순
// @url      GET/api/v1/movie/year/desc?offset=
// @request
// @response
exports.yearMovieDesc = async (req, res, next) => {
  let offset = req.query.offset;
  let query = `select * from movie order by year desc limit ${offset},25`;

  try {
    [rows] = await connection.query(query);
    let count = rows.length;
    res.status(200).json({ success: true, movie: rows, count: count });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc     연도 올림차순
// @url      GET/api/v1/movie/year/asc?offset=
// @request
// @response
exports.yearMovieAsc = async (req, res, next) => {
  let offset = req.query.offset;
  let query = `select * from movie order by year asc limit ${offset},25`;

  try {
    [rows] = await connection.query(query);
    let count = rows.length;
    res.status(200).json({ success: true, movie: rows, count: count });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc     관객수 내림차순
// @url      GET/api/v1/movie/attendance/desc?offset=
// @request
// @response
exports.attendaceDesc = async (req, res, next) => {
  let offset = req.query.offset;
  let query = `select * from movie order by attendance desc limit ${offset},25`;

  try {
    [rows] = await connection.query(query);
    let count = rows.length;
    res.status(200).json({ success: true, movie: rows, count: count });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc     관객수 올림차순
// @url      GET/api/v1/movie/attendance/asc?offset=
// @request
// @response
exports.attendaceAsc = async (req, res, next) => {
  let offset = req.query.offset;
  let query = `select * from movie order by attendance asc limit ${offset},25`;

  try {
    [rows] = await connection.query(query);
    let count = rows.length;
    res.status(200).json({ success: true, movie: rows, count: count });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};


// @desc  회원가입
// @route POST/api/v1/movie/
// @parameters   name, password
exports.createUser = async (req, res, next) => {
  let name = req.body.name;
  let password = req.body.password;

  const hashedPassword = await bcrypt.hash(password, 8);

  let query = `insert into movie_user(user_name,user_password) values ?`;
  let data = [name, hashedPassword];
  let user_id;

  try {
    [rows] = await connection.query(query, [[data]]);
    user_id = rows.insertId;
  } catch (e) {
    if (e.errno == 1062) {
      res
        .status(400)
        .json({ success: false, errno: e.errno, message: e.message });
      return;
    } else {
      res.status(500).json({ success: false, error: e });
      return;
    }
  }

  let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);

  query = `insert into movie_token (token, user_id) values(?,?)`;
  data = [token, user_id];

  try {
    [result] = await connection.query(query, data);
    const message = "환영합니다";
    try {
      await sendEmail({
        email: "kksks1215@naver.com",
        subject: "회원가입ㅊㅋ",
        message: message,
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e });
      return;
    }
    console.log(result);
    res.status(200).json({ success: true, message: "성공" });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
};

// @desc  로그인
// @route POST/api/v1/user/login
// @parameters   name, password
exports.loginUser = async (req, res, next) => {
  let name = req.body.name;
  let password = req.body.password;

  let query = `select * from movie_user where user_name = ?`;
  let data = [name];

  try {
    [rows] = await connection.query(query, data);
    let storedPassword = rows[0].user_password;

    let match = await bcrypt.compare(password, storedPassword);

    if (!match) {
      res
        .status(400)
        .json({ success: false, result: match, message: "비밀번호 틀림" });
      return;
    }

    let token = jwt.sign({ id: rows[0].id }, process.env.ACCESS_TOKEN_SECRET);
    query = `insert into movie_token(user_id,token) values(?,?)`;
    data = [rows[0].id, token];

    try {
      [result] = await connection.query(query, data);
      res.status(200).json({ success: true, result: match, token: token });
    } catch (e) {
      res
        .status(502)
        .json({ success: false, error: e, message: "토큰저장실패" });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc     로그아웃   api : db에서 해당유저의 현재 토큰값을 삭제
// @url      POST /api/v1/user/allLogout
// @request
// @response
exports.allLogout = async (req, res, next) => {
  let user_id = req.user.id;
  let query = `delete from movie_token where user_id = ${user_id}`;

  console.log(user_id);
  try {
    [result] = await connection.query(query);
    console.log(result);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc     탈퇴
// @url      POST /api/v1/user/deleteMember
// @request
// @response

exports.deleteUser = async (req, res, next) => {
  let user_id = req.user.id;
  let query = `delete from movie_user where id = ${user_id}`;
  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();

    [result] = await conn.query(query);

    query = `delete from movie_token where user_id = ${user_id}`;
    [result] = await conn.query(query);

    await conn.commit();
    res.status(200).json({ success: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ success: false, error: e });
  } finally {
    conn.release();
  }
};

// @desc     즐겨찾기
// @url      POST / api/v1/user/favoriteMovie
// @request  title
exports.favoriteMovie = async (req, res, next) => {
  let title = req.body.title;
  let user_id = req.user.id;

  let query = `select * from movie where title = "${title}"`;

  try {
    [rows] = await connection.query(query);
    let movie_id = rows[0].id;

    query = `insert into favorite_movie(user_id,movie_id) values(?,?)`;
    data = [user_id, movie_id];

    try {
      [result] = await connection.query(query, data);
      res.status(200).json({ success: true });
    } catch (e) {
      if (e.errno == 1062) {
        res.status(401).json({
          success: false,
          error: e.message,
          message: "이미 저장 되어있습니다.",
        });
        return;
      }
      res.status(500).json({ success: false, error: e });
    }
  } catch (e) {
    res.status(501).json({ success: false, error: e });
  }
};

// @desc     즐겨찾기 목록
exports.searchFavorite = async (req, res, next) => {
  let offset = Number(req.query.offset);
  let limit = Number(req.query.limit);
  let user_id = req.user.id;

  let query =
    "select m.id, m.title, m.genre, m.attendance, m.year \
  from favorite_movie as f \
  join movie as m \
  on f.movie_id = m.id \
  where f.user_id = ? \
  limit ? , ? ;";

  let data = [user_id, offset, limit];

  try {
    [rows] = await connection.query(query, data);
    let cnt = rows.length;
    res.status(200).json({ success: true, items: rows, cnt: cnt });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

//  @desc    유저의 프로필 사진 설정하는  api
//  @route   POST /api/v1/users/me/photo
//  @request photo
exports.userPhotoUpload = async (req, res, next) => {
  let user_id = req.user.id;

  if (!user_id || !req.files) {
    res.status(400).json();
    return;
  }

  const photo = req.files.photo;

  if (photo.mimetype.startsWith("image") == false) {
    res.status(401).json();
    return;
  }

  if (photo.size > process.env.MAX_FILE_SIZE) {
    res.status(403).json({ message: "파일이 너무 커" });
    return;
  }

  photo.name = `photo_${user_id}${path.parse(photo.name).ext}`;
  let fileUploadPath = `${process.env.FILE_UPLOAD_PATH}/${photo.name}`;

  photo.mv(fileUploadPath, async (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
  let query = `update movie_user set photo_url =? where id=?`;
  let data = [photo.name, user_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
