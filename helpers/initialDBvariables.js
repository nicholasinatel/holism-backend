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
        username: 'admin',
        password: '123456'
    },
    MOCK_PROJECT: {
        title: 'Mindfullness_Mocha_NAO_DELETAR_NEM_MODIFICAR',
        completed: false,
        creator: 'admin'
    },
    MOCK_FLOW: {
        title: 'Flow de Marketing_Mocha_NAO_DELETAR_NEM_MODIFICAR',
        permission_read: ['nicholas', 'gui123', 'admin'],
        permission_write: ['nicholas', 'gui123', 'admin'],
        completed: false,
        starter_form: '000000000000000000000000',
        creator: '111111111111111111111111',
        project: '111111111111111111111111'
    },
    MOCK_FORM_1: {
        title: "From Entrada De Dados_Mocha_NAO_DELETAR_NEM_MODIFICAR",
        step_forward: ["ffffffffffffffffffffffff"],
        step_backward: ["000000000000000000000000"],
        flow: '111111111111111111111111',
        data: FORM_BUILDER_DATA,
        permission: ['admin', 'gui123', 'admin'],
        secret: false,
        creator: '111111111111111111111111'
    },
    MOCK_FORM_2: {
        title: "Form Professores_Mocha_NAO_DELETAR_NEM_MODIFICAR",
        step_forward: ["ffffffffffffffffffffffff"],
        step_backward: ["000000000000000000000000"],
        flow: '111111111111111111111111',
        data: FORM_BUILDER_DATA,
        permission: ['admin', 'gui123', 'admin'],
        secret: true,
        creator: '111111111111111111111111'
    },
    MOCK_RESPONSE_1: {
        model_form: "111111111111111111111111",
        user: "111111111111111111111111",
        data: RESPONSE_1
    }
}

module.exports = MOCK

