var FORM_BUILDER_DATA = [{
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

var RESPONSE_1 = [{
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

var MOCK = {
    // DB Variables
    MOCK_USER: {
        username: 'nicholas',
        password: '123'
    },
    MOCK_PROJECT: {
        title: 'Node.js and ECMAScript 6 para iniciantes',
        completed: false,
        creator: 'nicholas'
    },
    MOCK_FLOW: {
        title: 'Flow de Ementa',
        permission_read: ['nicholas', 'gui123', 'admin'],
        permission_write: ['nicholas', 'gui123', 'admin'],
        completed: false,
        starter_form: '000000000000000000000000',
        creator: 'nicholas',
        project: '111111111111111111111111'
    },
    MOCK_FORM_1: {
        title: "Form Modulo 1",
        step_forward: ["ffffffffffffffffffffffff"],
        step_backward: ["000000000000000000000000"],
        flow: '111111111111111111111111',
        data: FORM_BUILDER_DATA,
        permission: ['admin', 'gui123', 'nicholas'],
        secret: false,
        creator: 'nicholas',
        completed: false,
        mode: 0
    },
    MOCK_FORM_2: {
        title: "Form Modulo 2",
        step_forward: ["ffffffffffffffffffffffff"],
        step_backward: ["000000000000000000000000"],
        flow: '111111111111111111111111',
        data: FORM_BUILDER_DATA,
        permission: ['admin', 'gui123', 'nicholas'],
        secret: true,
        creator: 'nicholas',
        completed: false,
        mode: 0 
    },
    MOCK_RESPONSE_1: {
        model_form: "111111111111111111111111",
        user: "nicholas",
        data: RESPONSE_1
    }
}

module.exports = MOCK

