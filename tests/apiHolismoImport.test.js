const assert = require('assert')
const api = require('./../src/api')

// Authentication Variables
const TOKEN = process.env.TOKEN_CONFIG
const headers = {
    Authorization: TOKEN
}
// Server Variables
let app = {} // server receiver



// Test Suite
describe.only('Test Suite IMPORT Mechanism', function () {
    this.beforeAll(async () => {
        app = await api
    })
    // READ no FLOW TARGET
    it('Listar FLOW para IMPORT /model_flow', async () => {
        const result = await app.inject({
            method: 'GET',
            headers,
            url: '/model_flow'
        })
        // console.log("result.payload: ", result.payload)
        // Pegar o Flow Desejado Para Import
        // Query All - Entao seleciona no array 
        const [dados] = JSON.parse(result.payload) // String para JS object
        // Armazena em  uma Var - no caso aqui global pro teste
        global.importFlow = dados
        // Delete as properties desnecessarias
        delete importFlow._id
        delete importFlow.__v
        delete importFlow.createdAt
        delete importFlow.updatedAt
        
        const statusCode = result.statusCode
        assert.deepEqual(statusCode, 200)
    })
    // Duplicate no Flow, mesmo que seja com o mesmo title
    it.skip('Duplicate IMPORT /model_flow', async () => {
        const result = await app.inject({
            method: 'POST',
            headers,
            url: '/model_flow',
            payload: importFlow
        })

        const statusCode = result.statusCode

        assert.deepEqual(statusCode, 200)
    })
    // READ NO STARTER FORM
    it('Listar STARTER_FORM para DUPLICATE /model_form', async () => {
        let id = importFlow.starter_form
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/model_form?skip=0&limit=10&search=${id}&mode=1`
        })
        // console.log("result.payload: ", result.payload)
        // Pegar o FORM Desejado Para Duplicate
        // Query Unica
        const [dados] = JSON.parse(result.payload) // String para JS object
        // Armazena em  uma Var - no caso aqui global pro teste
        global.starterForm = dados
        // Delete as properties desnecessarias
        delete starterForm._id
        delete starterForm.__v
        delete starterForm.createdAt
        delete starterForm.updatedAt
        
        console.log("starterForm: ", starterForm)
        const statusCode = result.statusCode
        assert.deepEqual(statusCode, 200)
    })
    // Duplicate no STARTER_FORM mesmo que seja com o mesmo title
    it.skip('Duplicate IMPORT /model_flow', async () => {
        const result = await app.inject({
            method: 'POST',
            headers,
            url: '/model_flow',
            payload: importFlow
        })

        const statusCode = result.statusCode

        assert.deepEqual(statusCode, 200)
    })
    // UPDATE
    it.skip('Update PATCH /model_flow/:id', async () => {
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
})