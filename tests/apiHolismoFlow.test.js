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
    id: 1,
    title: 2,
    creator: 3,
    project: 4
}

var _ID2Del = ''

// DB Variables
const MOCK_FLOW_1 = {
    title: 'Flow de Marketing',
    permission_read: 3,
    permission_write: ['nicholas', 'gui123', 'fifi24'],
    completed: false,
    starter_form: '111177777cececef5f511111',
    creator: '5c59c7cdb1c7c721a45c2cf0',
    project: '5c6eafd0b4a36e6354dc5e85'
}
const MOCK_FLOW_2 = {
    title: 'Flow de Curso online',
    permission_read: 2,
    permission_write: ['nicholas', 'gui123', 'fifi24'],
    completed: false,
    starter_form: '111177777cececef5f511111',
    creator: '5c59c7cdb1c7c721a45c2cf0',
    project: '5c6ec155e6081f5e88c0b256'
}
const MOCK_FLOW_3 = {
    title: 'Flow Updated',
    permission_read: 1,
    permission_write: ['admin', 'gui123', 'fifi24', 'nicholas'],
    completed: true,
    starter_form: 'faca77777cacacaf5f511111',
    creator: '5c59c7cdb1c7c721a45c2cf0',
    project: '5c6ec155e6081f5e88c0b256'
}
const MOCK_FLOW_4 = {
    title: 'Flow To Delete Test',
    permission_read: 1,
    permission_write: ['admin', 'gui123', 'fifi24', 'nicholas'],
    completed: true,
    starter_form: 'faca77777cacacaf5f511111',
    creator: '5c59c7cdb1c7c721a45c2cf0',
    project: '5c6ec155e6081f5e88c0b256'
}

// Test Suite
describe('Test Suite Flow Routes', function () {
    this.beforeAll(async () => {
        app = await api
    })
    // Create First 
    it('Criar /model_flow', async () => {
        const result = await app.inject({
            method: 'POST',
            headers,
            url: '/model_flow',
            payload: MOCK_FLOW_4
        })

        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode

        _ID2Del = dados._id

        assert.deepEqual(statusCode, 200)
        assert.notStrictEqual(_ID2Del, undefined)
        assert.deepEqual(dados.title, MOCK_FLOW_4.title)
    })
    it.skip('Create /model_flow Fail', async () => {
        const result = await app.inject({
            method: 'POST',
            headers,
            url: '/model_flow',
            payload: MOCK_FLOW_2
        })

        const statusCode = result.statusCode

        const dados = JSON.parse(result.payload)

        assert.deepEqual(statusCode, 409)
        assert.deepEqual(dados.message, 'Fluxo informado já existe')
    })
    // READ
    it('Listar /model_flow', async () => {
        const result = await app.inject({
            method: 'GET',
            headers,
            url: '/model_flow'
        })
        const dados = JSON.parse(result.payload) // String para JS object
        const statusCode = result.statusCode

        // console.log("dados Flow Route: ", dados)
        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })
    it('Listar Flow por ID ', async () => {
        let id = '5c5b1fc2818c0c4588a0f283'
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/model_flow?skip=0&limit=10&search=${id}&mode=${mode.id}`
        })
        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode

        // console.log("dados Flow Route: ", dados)
        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })
    it('Listar Flow por Title ', async () => {
        let title = 'flow padrao'
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/model_flow?skip=0&limit=10&search=${title}&mode=${mode.title}`
        })
        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode

        // console.log("dados Flow Route: ", dados)
        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })
    it('Listar Flow por Creator ', async () => {
        let creator_id = '5c59c7b1b1c7c721a45c2cef'
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/model_flow?skip=0&limit=10&search=${creator_id}&mode=${mode.creator}`
        })
        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode

        // console.log("dados Flow Route: ", dados)
        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })
    it('Listar Flow por Project ', async () => {
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/model_flow?skip=0&limit=10&search=${MOCK_FLOW_1.project}&mode=${mode.project}`
        })
        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode

        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })
    // UPDATE
    it('Update PATCH /model_flow/:id', async () => {
        const _id = '5c87d1e14f2bf7493c9b3f1b'

        const result = await app.inject({
            method: 'PATCH',
            headers,
            url: `/model_flow/${_id}`,
            payload: JSON.stringify(MOCK_FLOW_3)
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        // console.log("statusCode in response at test: ", statusCode)
        // console.log("dados from response: ", dados)

        assert.ok(statusCode === 200)
        assert.deepEqual(dados.message, "Fluxo atualizado com sucesso")
    })
    it('Update FAIL! PATCH /model_flow/:id', async () => {
        const _id = '5c6f32cda12b273bd4e54ad1'

        const result = await app.inject({
            method: 'PATCH',
            headers,
            url: `/model_flow/${_id}`,
            payload: JSON.stringify(MOCK_FLOW_3)
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.ok(statusCode === 412)
        assert.deepEqual(dados.message, "ID não encontrado ou arquivo sem modificações")
    })
    // DELETE Last
    it('Delete /model_flow/:id', async () => {
        const result = await app.inject({
            method: 'DELETE',
            headers,
            url: `/model_flow/${_ID2Del}`
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.ok(statusCode == 200)
        assert.deepEqual(dados.message, 'Fluxo removido com sucesso')
    })
})