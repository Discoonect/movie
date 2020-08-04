const jwt = require("jsonwebtoken");
const connection = require("../mysql_connection");

const auth = async (req, res, next) => {
  let token = req.header("Authorization");

  if (!token) {
    res.status(401).json({ error: "not token" });
    return;
  }

  try {
    token = req.header("Authorization").replace("Bearer ", "");
  } catch (e) {
    res.status(401).json({ error: e, message: "Please authenticate!" });
    return;
  }
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  let user_id = decoded.id;

  let query =
    "select mu.id, mu.user_name,mu.created_at,mt.token \
    from movie_token as mt \
    join movie_user as mu \
    on mt.user_id = mu.id \
    where mt.user_id = ? and mt.token = ? ";
  let data = [user_id, token];

  try {
    [rows] = await connection.query(query, data);
    if (rows.length == 0) {
      res.status(401).json({ error: "Please authenticate!" });
    } else {
      req.user = rows[0];

      next();
    }
  } catch (e) {
    res.status(401).json({ error: "Please authenticate!" });
  }
};

module.exports = auth;
