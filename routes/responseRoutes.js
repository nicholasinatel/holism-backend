const BaseRoute = require('./base/baseRoute')
const Joi = require('joi')
const Boom = require('boom')

const failAction = (request, headers, error) => {
    throw error;
}

const CREATE_DEFAULT = {
    "model_form":"111111111111111111111111",
    "user": "111111111111111111111111",
    "data": [{
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
                    "readonly": true, // RESPONSE COMES WITH THIS IN TRUE ALWAYS
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
}

// Todas as rotas usarao esse header para validar se o corpo da requisicao
// ta com o objeto conforme a necessidade, entao adiciona em todas as rotas
const headers = Joi.object({
    authorization: Joi.string().required()
}).unknown()

class ResponseRoutes extends BaseRoute {
    constructor(db) {
        super()
        this.db = db
    }
    list() {
        return {
            path: '/response',
            method: 'GET',
            config: {
                tags: ['api'],
                description: 'Deve listar Response de um Determinado Model Form',
                notes: 'Fornecer somente o _id do <b>model_form</b> em que o response existe.<br> \
                >>><br> \
                Retorna: Components filhos do form.<br> \
                Form em questão. <br> \
                >>><br> \
                ...',
                validate: {
                    headers,
                    failAction: failAction,
                    query: {
                        search: Joi.string().min(24).max(24).default('111111111111111111111111')
                    } // query end
                } // validate end
            },
            handler: async (request, headers) => {
                try {
                    const {
                        search
                    } = request.query

                    const query = {
                        model_form: search
                    }

                    return this.db.read(query)

                } catch (error) {
                    console.error('Server Internal Error: ', error)
                    return Boom.internal()
                }
            } //handler end
        } // list return end
    } //list end

    create() {
        return {
            path: '/response',
            method: 'POST',
            config: {
                tags: ['api'],
                description: 'Deve criar Responses vinculadas ao Form',
                notes: 'Os valores sugeridos estão determinados como default.<br>\
                Enviar dado direto do data vindo do Form Builder.<br>\
                <b>Importante-1:</b> <br>\
                >>><br>\
                Passar atributo: <b>readonly</b> = <b>true</b><br>\
                Todos os responses nao podem ser mais editados, essa vai ser a principal maneira de identifica-los.<br>\
                >>>Ler abaixo!!!<br>\
                <b>Importante-2:</b> <br>\
                Em data.sections.rows.controls.<b>componentType</b><br>\
                O equivalente no objeto do Form-Builder é <b>type</b><br>\
                No entanto, a palavra type é reservada e não posso salvá-la no objeto.<br>\
                Então modificar o objeto antes de enviar, exemplo: <br>\
                OBJETO_CORRETO.data.sections.rows.controls.<b>componentType</b> = OBJETO_ORIGINAL.data.sections.rows.controls.<b>componentType</b><br> \
                Realizar o processo inverso quando receber os objetos.<br>\
                Salvar <b>id retornado</b> após criação com sucesso em alguma variável pois será útil em breve. <br>',
                validate: {
                    failAction,
                    headers,
                    payload: {
                        model_form: Joi.string().min(24).max(24).default(CREATE_DEFAULT.model_form),
                        user: Joi.string().min(24).max(24).default(CREATE_DEFAULT.user),
                        data: Joi.allow().default(CREATE_DEFAULT.data)
                    }
                } // validate end
            }, // config end
            handler: async (request) => {
                try {
                    let {
                        model_form,
                        user,
                        data
                    } = request.payload

                    // title = title.toLowerCase()
                    // const [titulo] = await this.db.read({
                    //     title: title // Boa pratica sempre colocar minusculo o username
                    // })

                    // if (titulo) {
                    //     return Boom.conflict('Form informado já existe')
                    // } else {
                    const result = await this.db.create({
                        model_form,
                        user,
                        data
                    })

                    return {
                        message: 'Response criado com sucesso',
                        _id: result._id
                    }
                    // }

                } catch (error) {
                    console.error('Error at create', error)
                    return Boom.internal()
                }
            }
        }
    } // Create End

    update() {
        return {
            path: '/response/{id}',
            method: 'PATCH',
            config: {
                tags: ['api'],
                description: 'Deve atualizar uma <b>Response</b> por <b>_id</b>',
                notes: 'Necessário objeto <b>id válido</b>.<br>\
                Exemplo Válido No Default <br> \
                <b>Importante-1:</b> <br>\
                >>><br>\
                Passar atributo: <b>readonly</b> = <b>true</b><br>\
                Todos os responses nao podem ser mais editados, essa vai ser a principal maneira de identifica-los.<br>\
                >>>Ler abaixo!!!<br>\
                >>><br>\
                <b>Importante-2:</b> <br>\
                Em data.sections.rows.controls.<b>componentType</b><br>\
                O equivalente no objeto do Form-Builder é <b>type</b><br>\
                No entanto, a palavra type é reservada e não posso salvá-la no objeto.<br>\
                Então modificar o objeto antes de enviar, exemplo: <br>\
                OBJETO_CORRETO.data.sections.rows.controls.<b>componentType</b> = OBJETO_ORIGINAL.data.sections.rows.controls.<b>componentType</b><br> \
                Realizar o processo inverso quando receber os objetos.<br>\
                ',
                validate: {
                    headers,
                    params: {
                        id: Joi.string().required()
                    },
                    payload: {
                        model_form: Joi.string().min(24).max(24).default(CREATE_DEFAULT.model_form),
                        user: Joi.string().min(24).max(24).default(CREATE_DEFAULT.user),
                        data: Joi.allow().default(CREATE_DEFAULT.data)
                    }
                } // validate end
            }, // config end
            handler: async (request) => {
                try {
                    const {
                        id
                    } = request.params

                    const {
                        payload
                    } = request

                    // FORMAT FOR UPDATE
                    const dadosString = JSON.stringify(payload)
                    const dados = JSON.parse(dadosString)

                    const result = await this.db.update(id, dados)

                    if (result.nModified !== 1) return Boom.preconditionFailed('ID não encontrado ou arquivo sem modificações')

                    return {
                        message: 'Response atualizado com sucesso'
                    }

                } catch (error) {
                    console.error('Error at Form Update', error)
                    return Boom.internal()
                }
            }
        }
    }

    delete() {
        return {
            path: '/response/{id}',
            method: 'DELETE',
            config: {
                tags: ['api'],
                description: 'Deve deletar um Component por <b>_id</b>',
                notes: 'o <b> id </b> deve ser válido, realizar um read no banco antes, passar como <b>String</b>',
                validate: {
                    headers,
                    failAction,
                    params: {
                        id: Joi.string().min(24).max(24).required().default('111111111111111111111111')
                    }
                } // validate end
            }, // config end
            handler: async (request) => {
                try {
                    const {
                        id
                    } = request.params
                    const result = await this.db.delete(id)

                    if (result.n !== 1)
                        return Boom.preconditionFailed('ID nao encontrado no banco')

                    return {
                        message: 'Response removido com sucesso'
                    }

                } catch (error) {
                    console.error('Error at Delete', error)
                    return Boom.internal()
                }
            }
        } // return delete end
    } // delete end

}

module.exports = ResponseRoutes
