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
    flow: 3
}
var _ID2Del = ''

const FORM_BUILDER_DATA_1 = [{
    "sections": [{
        "name": "section_188114",
        "label": "Seção 1",
        "clientKey": "section_188114",
        "order": 0,
        "rows": [{
            "name": "section_188114_row_82107",
            "label": "test",
            "order": 0,
            "controls": [{
                "componentType": "text",
                "name": "control_text_701290",
                "fieldName": "control_text_701290",
                "label": "Nome",
                "order": 0,
                "defaultValue": "test",
                "value": "test",
                "className": "col-md-6",
                "readonly": false, // RESPONSE COMES WITH THIS IN TRUE ALWAYS
                "labelBold": true,
                "labelItalic": false,
                "labelUnderline": false,
                "required": true,
                "isMultiLine": false,
                "isInteger": false,
                "decimalPlace": 0,
                "isTodayValue": false,
                "dateFormat": "dd/mm/yy",
                "isNowTimeValue": false,
                "timeFormat": "HH:mm",
                "isMultiple": false,
                "isAjax": false,
                "dataOptions": ["test"],
                "ajaxDataUrl": "test",
                "isChecked": false
            }]
        }],
        "labelPosition": "top",
        "isDynamic": false,
        "minInstance": 1,
        "maxInstance": 0,
        "instances": ["test"]
    }],
    "layout": "tab",
    "_uniqueId": 0.8719504664016076
}]
// DB Variables
const MOCK_FORM_1 = {
    title: "From Entrada De Dados",
    step_forward: ["ffffffffffffffffffffffff"],
    step_backward: ["000000000000000000000000"],
    flow: '5c6f2fd8e10be3181cd07ac8',
    data: FORM_BUILDER_DATA_1,
    permission: ['admin', 'gui123', 'fifi24'],
    secret: false
    
}
const MOCK_FORM_2 = {
    title: "Form Professores",
    step_forward: ["ffffffffffffffffffffffff"],
    step_backward: ["000000000000000000000000"],
    flow: '5c6f2fd8e10be3181cd07ac8',
    data: FORM_BUILDER_DATA_1,
    permission: ['admin', 'gui123', 'fifi24'],
    secret: true
}
const MOCK_FORM_3 = {
    title: "Form Para Deletar",
    step_forward: ["ffffffffffffffffffffffff"],
    step_backward: ["000000000000000000000000"],
    flow: '5c6f2fd8e10be3181cd07ac8',
    data: FORM_BUILDER_DATA_1,
    permission: ['admin', 'gui123', 'fifi24'],
    secret: false
}
const MOCK_FORM_4 = {
    title: "Form Para Ser Updated",
    step_forward: ["ffffffffffffffffffffffff"],
    step_backward: ["000000000000000000000000"],
    flow: '5c6f2fd8e10be3181cd07ac8',
    data: FORM_BUILDER_DATA_1,
    permission: ['admin', 'gui123', 'fifi24'],
    secret: false
}

// Test Suite
describe('Test Suit Form Routes', function () {
    // this.timeout(Infinity)
    this.beforeAll(async () => {
        app = await api // Espera o server iniciar e me manda ele
    })
    // CREATE First 
    it('Create4 Delete /model_form', async () => {
        const result = await app.inject({
            method: 'POST',
            headers,
            url: '/model_form',
            payload: MOCK_FORM_3
        })

        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode

        _ID2Del = dados._id

        assert.deepEqual(statusCode, 200)
        assert.notEqual(_ID2Del, undefined)
    })
    it('Create FAIL!/model_form', async () => {
        const result = await app.inject({
            method: 'POST',
            headers,
            url: '/model_form',
            payload: MOCK_FORM_1
        })

        const statusCode = result.statusCode

        assert.deepEqual(statusCode, 409)
    })
    // READ
    it('Rota Listar Todos os Forms', async () => {
        const result = await app.inject({
            method: 'GET',
            headers,
            url: '/model_form'
        })

        const dados = JSON.parse(result.payload) // String para JS object
        const statusCode = result.statusCode

        // console.log("dados Flow Route: ", dados)
        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })
    it('Rota Listar Form por _ID', async () => {
        let id = '5c7540cb78071d613cc38d69'
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/model_form?skip=0&limit=10&search=${id}&mode=${mode.id}`
        })

        const dados = JSON.parse(result.payload) // String para JS object
        const statusCode = result.statusCode

        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })
    it('Listar Form por Title ', async () => {
        let title = 'professores'
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/model_form?skip=0&limit=10&search=${title}&mode=${mode.title}`
        })
        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode

        // console.log("dados Flow Route: ", dados)
        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })
    it('Listar Form por Flow_ID ', async () => {
        let flow_id = '5c6f2fd8e10be3181cd07ac8'
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/model_flow?skip=0&limit=10&search=${flow_id}&mode=${mode.flow}`
        })
        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode

        // console.log("dados Flow Route: ", dados)
        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })
    // UPDATE
    it('Update PATCH /model_form/:id', async () => {
        MOCK_FORM_4.title = "UPDATED!"
        const _id = '5c87d34a59eeca26d468d94c'
        const result = await app.inject({
            method: 'PATCH',
            headers,
            url: `/model_form/${_id}`,
            payload: JSON.stringify(MOCK_FORM_4)
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.ok(statusCode === 200)
        assert.deepEqual(dados.message, "Form atualizado com sucesso")
    })
    // DELETE Last
    it('Delete /model_form/:id', async () => {
        const result = await app.inject({
            method: 'DELETE',
            headers,
            url: `/model_form/${_ID2Del}`
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.ok(statusCode == 200)
        assert.deepEqual(dados.message, 'Form removido com sucesso')
    })
})
