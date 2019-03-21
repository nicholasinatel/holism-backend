const assert = require('assert')
const api = require('./../src/api')
// MongoDB + Context
const MongoDb = require('./../db/strategies/mongodb/mongodb')
const UserSchema = require('./../db/strategies/mongodb/schemas/userSchema')
const Context = require('./../db/strategies/base/contextStrategy')

let app = {} // Instancia do server

// DB Variables
const MOCK_USER_1 = {
    username: 'Glitch_Mob',
    password: '123456',
    role: ['dev', 'marketing']
}

const MOCK_USER_2 = {
    username: 'admin',
    password: '123456' //,
    // role: ['dev', 'admin']
}

describe('Auth Test Suite MongoDb Strategy', function () {
    this.timeout(Infinity)
    this.beforeAll(async function () {
        app = await api // Apos subir server passa informacao pro app
        const connection = MongoDb.connect()
        contextAuth = new Context(new MongoDb(connection, UserSchema))
    })
    it('MongoDB Connection verification', async function () {
        const result = await contextAuth.isConnected()
        const expected = 'Conectado'
        assert.deepEqual(result, expected)
    })
    it('Obter Token do Usuario Cadastrado', async function () {
        const result = await app.inject({
            method: 'POST',
            url: '/login',
            payload: MOCK_USER_2
        })
        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.deepEqual(statusCode, 200)
        assert.ok(dados.token.length > 10) // compara hashstring maior que 10 digitos
    })
    it('Create /register Fail', async () => {
        const result = await app.inject({
            method: 'POST',
            url: '/register',
            payload: MOCK_USER_1
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.deepEqual(statusCode, 409)
        assert.deepEqual(dados.message, 'Usuário informado já existe')
    })
})