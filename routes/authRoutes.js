const BaseRoute = require('./base/baseRoute')
const Joi = require('joi')
const Boom = require('boom')
//npm install jsonwebtoken
const Jwt = require('jsonwebtoken')

const Reg = require('./../helpers/register')
const PasswordHelper = require('./../helpers/passwordHelper')
const QueryHelper = require('./../helpers/queryHelper')

const failAction = (request, headers, error) => {
    throw error;
}

const headers = Joi.object({
    authorization: Joi.string().required()
}).unknown()

class AuthRoutes extends BaseRoute {
    constructor(secret, db) {
        super()
        this.secret = secret
        this.db = db // Connection
    }

    list() {
        return {
            path: '/login',
            method: 'GET',
            config: {
                tags: ['api'],
                description: 'Deve listar Usuários',
                notes: 'Query com 4 Parametros,<br> \
                >>><br> \
                #mode = 0 se for realizar query para achar tudo na collection, campo search em branco <br> \
                #mode = 1 para query por <b>username</b>, colocar no campo search <br> \
                #mode = 2 para query por <b>role</b>, colocar role no campo search <br> \
                #mode = 3 para query por <b>_id</b>, colocar _ID no campo search <br> \
                >>> <br>\
                Em Caso de Erro Retorna: \
                User List Route Server Internal Error: "codigo_do_erro" <br> \
                ',
                validate: {
                    headers,
                    failAction: failAction,
                    query: {
                        skip: Joi.number().integer().default(0),
                        limit: Joi.number().integer().default(10),
                        search: Joi.optional(),
                        mode: Joi.number().integer().default(0).min(0).max(3)
                    } // query end
                } // validate end
            },
            handler: async (request, headers) => {
                try {
                    const {
                        skip,
                        limit,
                        search,
                        mode
                    } = request.query

                    const query = await QueryHelper.queryUserSelecter(search, mode)
                    // const keyName = Object.keys(query)
                    // console.log("keyName: ", keyName)
                    // console.log("query: ", query)
                    // https://stackoverflow.com/questions/4260308/getting-the-objects-property-name
                    if(mode != 3){
                        return this.db.fieldRead(query, skip, limit, 'username')
                    } else {
                        return this.db.read(query, skip, limit)
                    }
            
                } catch (error) {
                    console.error('User List Route Server Internal Error: ', error)
                    return Boom.internal()
                }
                // return this.db.read()
            } //handler end
        } // list return end
    } //list end

    login() {
        return {
            path: '/login',
            method: 'POST',
            config: {
                auth: false, //Somente essa rota nao passa pela autenticacao para poder obter o token
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
            handler: async (request) => {
                const {
                    username,
                    password
                } = request.payload

                // Validacao se o usuario existe no Banco
                const [usuario] = await this.db.read({
                    username: username.toLowerCase() // Boa pratica sempre colocar minusculo o username
                })

                // Se nao existir
                if (!usuario) {
                    return Boom.unauthorized('O usuario informado nao existe')
                }
                // Compara A Senha enviada com a do banco de dados
                const match = await PasswordHelper.comparePassword(password, usuario.password)

                if (!match) {
                    return Boom.unauthorized('O usuario ou senha invalidos!')
                }

                // Registro JWT
                const token = Jwt.sign({
                    username: username.toLowerCase(),
                    id: usuario.id
                }, this.secret)

                return {
                    token
                }
            } //  handler end
        } // return end
    } // login end
    register() {
        return {
            path: '/register',
            method: 'POST',
            config: {
                auth: false, //rota nao passa pela autenticacao para poder obter o token
                tags: ['api'],
                description: 'Registrar Usuario',
                notes: 'Retorna StatusCode 200 se criação feita<br>\
                ------------------------------------------------------------------------------------------------------------------------<br>\
                Body: <br>\
                > <b>username</b>: <br>\
                > <b>password</b>: <br>\
                > <b>role</b>: <br>\
                ------------------------------------------------------------------------------------------------------------------------<br>\
                Roles possíveis: <br>\
                <b>admin</b> <br>\
                <b>professor</b> <br>\
                <b>desenvolvedor</b> <br>\
                <b>marketing</b> <br>\
                <b>colaborador</b> <br>\
                <b>estudante</b> <br>\
                ',
                validate: {
                    failAction,
                    payload: {
                        username: Joi.string().required(),
                        password: Joi.string().required(),
                        role: Joi.array().default(['admin', 'professor', 'desenvolvedor']).required()
                    } // payload end
                } // validate end
            }, // config end
            handler: async (request) => {
                const {
                    username,
                    password,
                    role
                } = request.payload

                // Validacao se o usuario existe no Banco
                const [usuario] = await this.db.read({
                    username: username.toLowerCase() // Boa pratica sempre colocar minusculo o username
                })

                // Se existir
                if (usuario) {
                    return Boom.conflict('Usuário informado já existe')
                } else {
                    const Register = new Reg(username, password, role)
                    const User = await Register.register()
                    await this.db.create(User)
                    return 200
                }
            } // handler end
        } // return end
    } // register end
} // AuthRoutes END

// Quem for usar AuthRoutes precisa saber de todos os metodos
// Precisa passar no construtor a chave privada para geracao do token
module.exports = AuthRoutes