const assert = require('assert')
const api = require('./../src/api')

// Authentication Variables
const TOKEN = process.env.TOKEN_CONFIG
const headers = {
    Authorization: TOKEN
}

// Server Variables
let app = {} // server receiver

// DB VARIABLES
const RESPONSE_1 = [{
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
const MOCK_RESPONSE_1 = {
    model_form: "111111111111111111111111",
    user: "111111111111111111111111",
    data: RESPONSE_1
}
const MOCK_RESPONSE_2 = {
    "model_form": "111111111111111111111122",
    "user": "111111111111111111111122",
    "data": RESPONSE_1
}
const MOCK_RESPONSE_3 = {
    "model_form": "111111111111111111111333",
    "user": "111111111111111111111333",
    "data": RESPONSE_1
}
const MOCK_RESPONSE_4 = {
    "model_form": "111111111111111111114444",
    "user": "111111111111111111114444",
    "data": RESPONSE_1
}


var _ID2Del = ''

// Test Suite
describe('Test Suite Response Routes', function () {
    this.beforeAll(async () => {
        app = await api // Espera o server iniciar e me manda ele
    })
    // CREATE First 
    it('Create 4 Delete /response', async () => {
        const result = await app.inject({
            method: 'POST',
            headers,
            url: '/response',
            payload: MOCK_RESPONSE_4
        })

        const dados = JSON.parse(result.payload)
        const statusCode = result.statusCode

        _ID2Del = dados._id

        assert.deepEqual(statusCode, 200)
        assert.notEqual(_ID2Del, undefined)
    })
    // READ
    it('LIST Response For model_form', async () => {
        const result = await app.inject({
            method: 'GET',
            headers,
            url: `/response?search=${MOCK_RESPONSE_1.model_form}`
        })

        const dados = JSON.parse(result.payload) // String para JS object
        const statusCode = result.statusCode

        // console.log("dados Flow Route: ", dados)
        assert.deepEqual(statusCode, 200)
        assert.ok(Array.isArray(dados))
    })
    // UPDATE
    it('Update PATCH /response/:id', async () => {
        MOCK_RESPONSE_3.data[0].sections[0].rows[0].name = "UPDATED 142857"
        MOCK_RESPONSE_3.data[0].sections[0].rows[0].controls[0].value = "VALUE UPDATED!YEAH"

        const _id = '5c754a1271b83c25dc482fd2'
        const result = await app.inject({
            method: 'PATCH',
            headers,
            url: `/response/${_id}`,
            payload: JSON.stringify(MOCK_RESPONSE_3)
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        // console.log("statusCode in response at test: ", statusCode)
        // console.log("dados from response: ", dados)

        assert.ok(statusCode === 200)
        assert.deepEqual(dados.message, "Response atualizado com sucesso")
    })
    // DELETE Last
    it('Delete /response/:id', async () => {
        const result = await app.inject({
            method: 'DELETE',
            headers,
            url: `/response/${_ID2Del}`
        })

        const statusCode = result.statusCode
        const dados = JSON.parse(result.payload)

        assert.ok(statusCode == 200)
        assert.deepEqual(dados.message, 'Response removido com sucesso')
    })
})
