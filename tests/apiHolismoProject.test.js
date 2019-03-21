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
    completed: 4
}

var _ID2Del = ''

// DB Variables
const MOCK_PROJECT_1 = {
    title: 'Mindfullness',
    completed: false,
    creator: '5c59c7cdb1c7c721a45c2cf0'
}

const MOCK_PROJECT_2 = {
    title: 'Escutatoria',
    completed: false,
    creator: '5c59c7cdb1c7c721a45c2cf0'
}

const MOCK_PROJECT_3 = {
    title: 'NodeJS',
    completed: false,
    creator: '5c6c540c001dd1559c677399'
}


// Test Suite
describe('Test Suite Project Routes', function () {
    this.beforeAll(async () => {
        app = await api
    })
    // Create First 
    it('Criar /project', async () => {
        const result = await app.inject({
            method: 'POST',
            headers,
            url: '/project',
            payload: MOCK_PROJECT_2
        })

        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode

        _ID2Del = dados._id
        console.log("dados.title: ", dados.title)
        assert.deepEqual(statusCode, 200)
        assert.deepEqual(dados.title, MOCK_PROJECT_2.title)
        // console.log("dados Project Criar: ", dados)
        // console.log("statusCode Criar Project: ", statusCode)
    })
    it('Criar /project falhar se Tentar criar com mesmo nome', async () => {
        const result = await app.inject({
            method: 'POST',
            headers,
            url: '/project',
            payload: MOCK_PROJECT_1
        })

        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode

        assert.deepEqual(statusCode, 409)
        assert.deepEqual(dados.message, 'Projeto informado já existe')
    })
    // READ
    it('Listar /project', async () => {
        const result = await app.inject({
            method: 'GET',
            headers,
            url: '/project'
        })
        const dados = JSON.parse(result.payload) // String para JS object
        const statusCode = result.statusCode

        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })
    it('Listar Project por ID ', async () => {
        let id = '5c5b1ebe2032221f085ee152'
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/project?search=${id}&mode=${mode.id}`
        })
        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode

        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })
    it('Listar Project por Title ', async () => {
        let title = 'Mindfullness'
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/project?search=${title}&mode=${mode.title}`
        })
        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode

        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })
    it('Listar Project por Creator ID ', async () => {
        let creator_id = '5c532fefda439e1bfcffc05e'
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/project?search=${creator_id}&mode=${mode.creator}`
        })
        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode

        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })
    it('Listar Project por Completed True || False ', async () => {
        let completed = 'false'
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/project?search=${completed}&mode=${mode.completed}`
        })
        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode

        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })
    // UPDATE
    it('Update PATCH /project/:id', async () => {
        const _id = '5c87d3ddbfde080d30d3ad2e'
        MOCK_PROJECT_3.completed = true

        const result = await app.inject({
            method: 'PATCH',
            headers,
            url: `/project/${_id}`,
            payload: JSON.stringify(MOCK_PROJECT_3)
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.ok(statusCode === 200)
        assert.deepEqual(dados.message, "Projeto atualizado com sucesso!")
    })
    it('Update FAIL! ID Problem PATCH /project/:id', async () => {
        const _id = '5c87d3ddbfde080d30d3ad2f'
        MOCK_PROJECT_3.completed = true

        const result = await app.inject({
            method: 'PATCH',
            headers,
            url: `/project/${_id}`,
            payload: JSON.stringify(MOCK_PROJECT_3)
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.ok(statusCode === 412)
        assert.deepEqual(dados.message, "ID não encontrado ou arquivo sem modificações")
    })
    // DELETE Last
    it('Delete /project/:id', async () => {
        const result = await app.inject({
            method: 'DELETE',
            headers,
            url: `/project/${_ID2Del}`
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.ok(statusCode == 200)
        assert.deepEqual(dados.message, 'Projeto removido com sucesso')
    })
})