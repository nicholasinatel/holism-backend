const BaseRoute = require('./base/baseRoute')
const Joi = require('joi')
const Boom = require('boom')

const QueryHelper = require('./../helpers/queryHelper')
// const DateHandler = require('./../helpers/dateHelper')

const failAction = (request, headers, error) => {
    throw error;
}

// Todas as rotas usarao esse header para validar se o corpo da requisicao
// ta com o objeto conforme a necessidade, entao adiciona em todas as rotas
const headers = Joi.object({
    authorization: Joi.string().required()
}).unknown()

const CREATE_DEFAULT = {
    "component": "111111111111111111111111",
    "respForm": "111111111111111111111111",
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
    }],
    "permission": ['admin', 'gui123', 'fifi24']
}

//queryString = http://localhost:5000/model_form_list?skip=0&limit=10&nome=flash
class FormRoutes extends BaseRoute {
    constructor(db) {
        super()
        this.db = db
    }
    list() {
        return {
            path: '/model_form',
            method: 'GET',
            config: {
                tags: ['api'],
                description: 'Deve listar FORMS Template',
                notes: 'Query com 5 Parametros,<br> \
                skip = Paginação <br> \
                limit = Limita objetos na resposta <br> \
                search = parametro do objeto procurado <br> \
                username = usuario realizando a query (permission_read)<br> \
                <b> Somente Serão Mostrados Forms que o usuário está no array de permission_read </b> <br> \
                >>><br> \
                #mode = 0 se for realizar query para achar tudo na collection, campo search em branco <br> \
                #mode = 1 para query por id, colocar id no campo search <br> \
                #mode = 2 para query por title, colocar title no campo search <br> \
                #mode = 3 para query por Forms de X Flow, colocar _id do Flow no campo search <br> \
                >>><br> \
                ...',
                validate: {
                    headers,
                    failAction: failAction,
                    query: {
                        skip: Joi.number().integer().default(0),
                        limit: Joi.number().integer().default(10),
                        search: Joi.allow(),
                        mode: Joi.number().integer().default(0).max(3),
                        username: Joi.string().default('admin')
                    } // query end
                } // validate end
            },
            handler: async (request, headers) => {
                try {
                    const {
                        skip,
                        limit,
                        search,
                        mode,
                        username
                    } = request.query

                    const query = await QueryHelper.queryFormSelecter(search, mode)

                    if (mode == 3) {
                        return this.db.joinRead(query, 'flow', username, 'form')
                    } else {
                        return this.db.readPermission(query, skip, limit, username, 'form')
                    }
                } catch (error) {
                    console.error('Server Internal Error: ', error)
                    return Boom.internal()
                }
            } //handler end
        } // list return end
    } //list end

    create() {
        return {
            path: '/model_form',
            method: 'POST',
            config: {
                tags: ['api'],
                description: 'Deve criar Forms',
                notes: 'Os valores sugeridos estão determinados como default.<br>\
                >>><br>\
                --> step_forward: Se EXISTIR, o FORM Posterior, <br>\
                --> step_backward: Se EXISTIR, o FORM Anterior, <br>\
                --> flow: correspode ao <b>Flow pai do Form</b> <br>\
                --> data: [{}] Array de objetos do Form-Builder<br>\
                --> data: [{}] Array de Strings de quem pode responder o form<br>\
                >>><br>\
                <b>Importante:</b> <br>\
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
                        title: Joi.string().required().min(3).max(100),
                        step_forward: Joi.array().min(1).items(Joi.string()).default(['ffffffffffffffffffffffff']),
                        step_backward: Joi.array().min(1).items(Joi.string()).default(['000000000000000000000000']),
                        flow: Joi.string().min(24).max(24).default('111111111111111111111111'),
                        data: Joi.allow().default(CREATE_DEFAULT.data),
                        permission: Joi.array().min(1).items(Joi.string()).default(['admin', 'gui123', 'fifi24']),
                        secret: Joi.boolean().default(false),
                        creator: Joi.string().min(24).max(24).default('111111111111111111111111')
                    }
                } // validate end
            }, // config end
            handler: async (request) => {
                try {
                    let {
                        title,
                        step_forward,
                        step_backward,
                        flow,
                        data,
                        permission,
                        secret,
                        creator
                    } = request.payload

                    const result = await this.db.create({
                        title,
                        step_forward,
                        step_backward,
                        flow,
                        data,
                        permission,
                        secret,
                        creator
                    })

                    return {
                        message: 'Form criado com sucesso',
                        _id: result._id
                    }


                } catch (error) {
                    console.error('Error at create', error)
                    return Boom.internal()
                }
            }
        }
    } // Create End

    update() {
        return {
            path: '/model_form/{id}/{username}',
            method: 'PATCH',
            config: {
                tags: ['api'],
                description: 'Deve atualizar um Form por <b>_id</b>',
                notes: 'Para o update preciso que mande o objeto <b>id</b> do form em string.<br>\
                neste caso, deve ser um <b>objeto id válido</b>, <b>(i.e existente no banco)</b>, utilize um que tenha retornado pelo read no banco.<br> \
                Params: <br>\
                @id: id do flow para ser feito o Update <br>\
                @username: nome do usuário fazendo update, este usuáro precisa estar na lista de permission !!!<br>\
                Segue exemplo com um objeto para update válido, é o mesmo no Example Value, porém em <b>formato de objeto</b>: <br> \
                >>><br>\
                var MOCK_FORM_UPDATE = {<br>\
                &nbsp title: "form teste_update",<br>\
                &nbsp step_forward: 0,<br>\
                &nbsp step_backward: ["admin", "gui123", "fifi24", "nicholas"],<br>\
                &nbsp completed: true,<br>\
                &nbsp flow: "faca77777cacacaf5f511111"<br>\
                &nbsp data: Um Array de Objetos Gigantesco do Form-Builder! <br>\
                &nbsp permission: Um Array de Strings de quem pode RESPONDER o form <br>\
                }<br>\
                >>><br>\
                Antes do objeto ser enviado ele deve ser convertido em string: <br>\
                <b>e.g(JSON.stringify(MOCK_FORM_UPDATE))</b><br>\
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
                ',
                validate: {
                    headers,
                    params: {
                        id: Joi.string().required(),
                        username: Joi.string().required()
                    },
                    payload: {
                        title: Joi.string().required().min(3).max(100),
                        step_forward: Joi.array().min(1).items(Joi.string()).default(['ffffffffffffffffffffffff']),
                        step_backward: Joi.array().min(1).items(Joi.string()).default(['000000000000000000000000']),
                        flow: Joi.string().min(24).max(24).default('111111111111111111111111'),
                        data: Joi.allow().default(CREATE_DEFAULT.data),
                        permission: Joi.array().min(1).items(Joi.string()).default(['admin', 'gui123', 'fifi24']),
                        secret: Joi.boolean().default(false),
                        creator: Joi.string().min(24).max(24).default('111111111111111111111111')
                    }
                } // validate end
            }, // config end
            handler: async (request) => {
                try {
                    const {
                        id,
                        username
                    } = request.params

                    const {
                        payload
                    } = request

                    const query = { // findByID
                        '_id': `${id}`
                    }
                    const nuId = await this.db.writePermission(query, 0, 1, username, 'form')
                    if(nuId.length == 0){
                        return Boom.unauthorized()
                    } else {
                        // FORMAT FOR UPDATE
                        const dadosString = JSON.stringify(payload)
                        const dados = JSON.parse(dadosString)
                        const result = await this.db.update(nuId[0]._id, dados)
                        if (result.nModified !== 1) return Boom.preconditionFailed('ID não encontrado ou arquivo sem modificações')
                        return {
                            message: 'Form atualizado com sucesso'
                        }      
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
            path: '/model_form/{id}/{username}',
            method: 'DELETE',
            config: {
                tags: ['api'],
                description: 'Deve deletar um form por <b>_id</b>',
                notes: 'Parametros: <br>\
                @id: o <b> id </b> deve ser válido, realizar um read no banco antes, passar como <b>String</b> <br>\
                @username: nome do usuário fazendo o delete, este usuáro precisa estar na lista de permission_write !!! <br> \
                caso o usuario nao esteja na lista correta, retornara erro de nao autorizado',
                validate: {
                    headers,
                    failAction,
                    params: {
                        id: Joi.string().required(),
                        username: Joi.string().required()
                    }
                } // validate end
            }, // config end
            handler: async (request) => {
                try {
                    const {
                        id,
                        username
                    } = request.params
                    const query = { // findByID
                        '_id': `${id}`
                    }
                    const nuId = await this.db.writePermission(query, 0, 1, username, 'form')
                    if(nuId.length == 0){
                        return Boom.unauthorized()
                    } else {
                        const result = await this.db.delete(id)    
                        if (result.n !== 1)
                            return Boom.preconditionFailed('ID nao encontrado no banco')                        
                        return {
                            message: 'Form removido com sucesso'
                        }                        
                    }
                } catch (error) {
                    console.error('Error at Form Delete', error)
                    return Boom.internal()
                }
            }
        } // return delete end
    } // delete end
}

module.exports = FormRoutes
