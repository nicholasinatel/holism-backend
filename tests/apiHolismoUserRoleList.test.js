const assert = require('assert')
const api = require('./../src/api')

// Authentication Variables
const TOKEN = process.env.TOKEN_CONFIG
const headers = {
    Authorization: TOKEN
}
// Server Variables
let app = {} // server receiver

// Query Variables
const mode = {
    title: 1,
    role: 2
}

// DB Variables
const MOCK_USER_1 = {
    username: 'Glitch_Mob',
    password: '123456',
    role: ['dev', 'marketing']
}

// Test Suite
describe('Test Suite Roles And Users Routes', function () {
    this.beforeAll(async () => {
        app = await api
    })
    // READ
    it('Listar /login', async () => {
        const result = await app.inject({
            method: 'GET',
            headers,
            url: '/login'
        })
        const dados = JSON.parse(result.payload) // String para JS object
        const statusCode = result.statusCode

        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })
    it('Pesquisar Users por username ', async () => {
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/login?search=${MOCK_USER_1.username}&mode=${mode.title}`
        })
        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode

        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })
    it('Listar USERS por ROLE ', async () => {
        let role = 'dev'
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/login?search=${role}&mode=${mode.role}`
        })
        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode

        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })
})