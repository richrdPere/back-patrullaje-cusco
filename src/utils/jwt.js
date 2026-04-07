const jwt = require("jsonwebtoken");


const generarToken = (id) => {
  return new Promise((resolve, reject) => {
    const payload = { id };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN }, (err, token) => {
      if (err) {
        reject("No se pudo generar el token");
      } else {
        // Token
        resolve(token);
      }
    });
  });


};

module.exports = {
  generarToken,
};