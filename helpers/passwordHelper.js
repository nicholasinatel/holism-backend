const Bcrypt = require('bcryptjs');

const { promisify } = require('util'); //import promisify from util

// Convert para promises pois Bcrypt eh feito em callbacks
const hashAsync = promisify(Bcrypt.hash);
const compareAsync = promisify(Bcrypt.compare);

const SALT = parseInt(process.env.SALT, 10); // Nivel de complexidade do algoritmo de hash

class PasswordHelper {
  // Criar Hash da Senha
  static hashPassword(pass) {
    return hashAsync(pass, SALT);
  }

  // Comparar Senha E Codigo Gerado - retornar true or false
  static comparePassword(pass, hash) {
    return compareAsync(pass, hash);
  }
}

module.exports = PasswordHelper;
