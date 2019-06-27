/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
const Joi = require('joi');
const Boom = require('boom');
// npm install jsonwebtoken
const Jwt = require('jsonwebtoken');
const BaseRoute = require('./base/baseRoute');

const Reg = require('./../helpers/register');
const PasswordHelper = require('./../helpers/passwordHelper');
const QueryHelper = require('./../helpers/queryHelper');

const failAction = (request, headers, error) => {
  throw error;
};

const headers = Joi.object({
  authorization: Joi.string().required()
}).unknown();

class AuthRoutes extends BaseRoute {
  constructor(secret, db) {
    super();
    this.secret = secret;
    this.db = db; // Connection
  }

  list() {
    return {
      path: '/login',
      method: 'GET',
      config: {
        tags: ['api'],
        description: 'Deve listar Usuários',
        notes:
          'Query com 4 Parametros,<br> ' +
          '>>><br> ' +
          '#mode = 0 se for realizar query para achar tudo na collection, campo search em branco <br> ' +
          '#mode = 1 para query por <b>username</b>, colocar no campo search <br> ' +
          '#mode = 2 para query por <b>role</b>, colocar role no campo search <br> ' +
          '#mode = 3 para query por <b>_id</b>, colocar _ID no campo search <br> ' +
          '>>> <br>' +
          'Em Caso de Erro Retorna: ' +
          'User List Route Server Internal Error: "codigo_do_erro" <br> ',
        validate: {
          headers,
          failAction,
          query: {
            skip: Joi.number()
              .integer()
              .default(0),
            limit: Joi.number()
              .integer()
              .default(10),
            search: Joi.optional(),
            mode: Joi.number()
              .integer()
              .default(0)
              .min(0)
              .max(3)
          } // query end111
        } // validate end
      },
      handler: async request => {
        try {
          const { skip, limit, search, mode } = request.query;

          const query = await QueryHelper.queryUserSelecter(search, mode);
          // const keyName = Object.keys(query)
          // console.log("keyName: ", keyName)
          // console.log("query: ", query)
          // https://stackoverflow.com/questions/4260308/getting-the-objects-property-name
          if (mode !== 3) {
            return this.db.fieldRead(query, skip, limit, 'username + role');
          }
          return this.db.read(query, skip, limit);
        } catch (error) {
          console.error('User List Route Server Internal Error: ', error);
          return Boom.internal();
        }
        // return this.db.read()
      } // handler end
    }; // list return end
  } // list end

  login() {
    return {
      path: '/login',
      method: 'POST',
      config: {
        auth: false, // Somente essa rota nao passa pela autenticacao para poder obter o token
        tags: ['api'],
        description: 'Fazer login',
        notes: 'Retorna token de autenticação',
        validate: {
          failAction,
          payload: {
            username: Joi.string().required(),
            password: Joi.string().required()
          } // payload end
        } // validate end
      }, // config end
      handler: async request => {
        const { username, password } = request.payload;

        // Validacao se o usuario existe no Banco
        const [usuario] = await this.db.read({
          username: username.toLowerCase() // Boa pratica sempre colocar minusculo o username
        });

        // Se nao existir
        if (!usuario) {
          return Boom.unauthorized('O usuario informado nao existe');
        }
        // Compara A Senha enviada com a do banco de dados
        const match = await PasswordHelper.comparePassword(
          password,
          usuario.password
        );

        if (!match) {
          return Boom.unauthorized('O usuario ou senha invalidos!');
        }

        // Registro JWT
        const token = Jwt.sign(
          {
            username: username.toLowerCase(),
            id: usuario.id
          },
          this.secret
        );

        return {
          token
        };
      } //  handler end
    }; // return end
  } // login end

  register() {
    return {
      path: '/register',
      method: 'POST',
      config: {
        auth: false, // rota nao passa pela autenticacao para poder obter o token
        tags: ['api'],
        description: 'Registrar Usuario',
        notes:
          'Retorna StatusCode 200 se criação feita<br>' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          'Body: <br>' +
          '> <b>username</b>: <br>' +
          '> <b>password</b>: <br>' +
          '> <b>role</b>: <br>' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          'Roles possíveis: <br>' +
          '<b>admin</b> <br>' +
          '<b>desenvolvedor</b> <br>' +
          '<b>gerente</b> <br>' +
          '<b>professor</b> <br>' +
          '<b>marketing</b> <br>' +
          '<b>colaborador</b> <br>' +
          '<b>estudante</b> <br>' +
          '<b>terceiro</b> <br>',
        validate: {
          failAction,
          payload: {
            username: Joi.string().required(),
            password: Joi.string().required(),
            role: Joi.array()
              .default(['admin', 'professor', 'desenvolvedor'])
              .required()
          } // payload end
        } // validate end
      }, // config end
      handler: async request => {
        const { username, password, role } = request.payload;

        // Validacao se o usuario existe no Banco
        const [usuario] = await this.db.read({
          username: username.toLowerCase() // Boa pratica sempre colocar minusculo o username
        });

        // Se existir
        if (usuario) {
          return Boom.conflict('Usuário informado já existe');
        }
        const Register = new Reg(username, password, role);
        const User = await Register.register();
        await this.db.create(User);
        return 200;
      } // handler end
    }; // return end
  } // register end

  updateUser() {
    return {
      path: '/register/{id}/{username}/{roles}',
      method: 'PATCH',
      config: {
        tags: ['api'],
        description: 'Update de usuario',
        notes:
          'Update de usuario <br>' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          'Parametros: <br>' +
          '> <b>id</b>: id do usuario que será modificado <br>' +
          '> <b>username</b>: usuario que deseja realizar a modificação<br>' +
          '> <b>roles</b>: Array de Roles do Usuario que deseja realizar a modificação <br>' +
          'O formato padrão está errado no parâmetro roles, um exemplo correto seria <br>' +
          '["dev"] <br>' +
          '<b>Lembrando que para efetuar esta operação, somente será aceito o usuário admin, ou usuários com role de admin</b> <br>' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          'Body: <br>' +
          '> <b>username</b>: <br>' +
          '> <b>password</b>: <br>' +
          '> <b>role</b>: Array de Roles do Usuario<br>' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          'Roles possíveis: <br>' +
          '<b>admin</b> <br>' +
          '<b>desenvolvedor</b> <br>' +
          '<b>gerente</b> <br>' +
          '<b>professor</b> <br>' +
          '<b>marketing</b> <br>' +
          '<b>colaborador</b> <br>' +
          '<b>estudante</b> <br>' +
          '<b>terceiro</b> <br>',
        validate: {
          headers,
          params: {
            id: Joi.string()
              .min(24)
              .max(24)
              .required(),
            username: Joi.string().required(),
            roles: Joi.array()
              .min(1)
              .items(Joi.string())
              .default(['dev'])
          },
          payload: {
            username: Joi.string()
              .required()
              .min(1)
              .max(25),
            password: Joi.string().required(),
            role: Joi.array()
              .min(1)
              .items(Joi.string())
              .default(['dev'])
          }
        }
      }, // Config End
      handler: async request => {
        try {
          const { id, username, roles } = request.params;

          const { payload } = request;

          let flag = false;

          roles.forEach(role => {
            if (role === 'admin' || username === 'admin') flag = true;
          });

          if (flag) {
            const query = {
              // findByID
              _id: `${id}`
            };

            const nuId = await this.db.fieldRead(query, 0, 1, 'username');
            if (nuId.length === 0) {
              return Boom.unauthorized();
            }
            // FORMAT FOR UPDATE
            const dadosString = JSON.stringify(payload);
            const dados = JSON.parse(dadosString);
            const result = await this.db.update(nuId[0]._id, dados);
            if (result.nModified !== 1)
              return Boom.preconditionFailed(
                'ID não encontrado ou arquivo sem modificações'
              );
            return {
              message: 'Usuario atualizado com sucesso'
            };
          }
          return Boom.unauthorized();
        } catch (error) {
          console.error('Error at User Update', error);
          return Boom.internal();
        }
      }
    };
  } // Update User End

  deleteUser() {
    return {
      path: '/register/{id}/{username}/{roles}',
      method: 'DELETE',
      config: {
        tags: ['api'],
        description: 'Deletar users',
        notes:
          'Parâmetros: <br>' +
          '@<b>id</b>: o <b> id </b> deve ser válido, realizar um read no banco antes, passar como <b>String</b> <br>' +
          '@<b>username</b>: nome do usuário fazendo o delete<br>' +
          '@<b>roles</b>: role do usuário fazendo o delete<br>',
        validate: {
          headers,
          failAction,
          params: {
            id: Joi.string()
              .min(24)
              .max(24)
              .required(),
            username: Joi.string().required(),
            roles: Joi.array()
              .min(1)
              .items(Joi.string())
              .default(['dev'])
          }
        } // Validate End
      },
      handler: async request => {
        try {
          const { id, username, roles } = request.params;

          let flag = false;

          console.log('roles: ', roles);

          roles.forEach(role => {
            if (role === 'admin' || username === 'admin') flag = true;
          });
          if (flag) {
            const query = {
              // findByID
              _id: `${id}`
            };

            const nuId = await this.db.fieldRead(query, 0, 1, 'username');
            if (nuId.length === 0) {
              return Boom.notFound();
            }
            await this.db.delete(nuId);
            return {
              message: 'Usuario deletado com sucesso'
            };
          }
          return Boom.unauthorized();
        } catch (error) {
          console.error('Error at User Delete', error);
          return Boom.internal();
        }
      }
    };
  }
} // AuthRoutes END

// Quem for usar AuthRoutes precisa saber de todos os metodos
// Precisa passar no construtor a chave privada para geracao do token
module.exports = AuthRoutes;
