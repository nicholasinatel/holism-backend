const BaseRoute = require('./base/baseRoute')
const Joi = require('joi')
const Boom = require('boom')

const QueryHelper = require('./../helpers/queryHelper')

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
                    "dataOptions": [{
                        "id": 4321,
                        "text": 1
                    }],
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
    "secret": false,
    "permission": ['admin', 'gui123', 'fifi24'],
    "completed": false
}

//queryString = http://localhost:5000/model_form_list?skip=0&limit=10&nome=flash
class FormRoutes extends BaseRoute {
    constructor(db, dbResp) {
        super()
        this.db = db
        this.dbResp = dbResp
    }
    list() {
        return {
            path: '/model_form',
            method: 'GET',
            config: {
                tags: ['api'],
                description: 'Deve listar FORMS Template',
                notes: 'Query com 5 Parametros,<br> \
                ------------------------------------------------------------------------------------------------------------------------<br>\
                > <b>skip</b>: Paginação <br> \
                > <b>limit</b>: Limita objetos na resposta <br> \
                > <b>search</b>: Objeto procurado <b>(Varia de acordo com o mode, ver abaixo)</b><br> \
                > <b>username</b>: usuario realizando a query (permission_read) <br> \
                <b> Inserir automaticamente o username do creator no permission_read no front-end </b> <br> \
                <b> Somente Serão Mostrados Forms que o usuário está no array de permission_read </b> <br> \
                ------------------------------------------------------------------------------------------------------------------------<br>\
                <b>username obrigatório em todas as GET REQUESTS</b><br>\
                > mode = 0 | Query para achar tudo na collection, Campo search em branco<br> \
                > mode = 1 | Query por <b>id</b>, Campo Search: Inserir id do Form<br> \
                > mode = 2 | Query por <b>title</b>, Campo Search: Inserir title do Form, <b>Title com Valor APROXIMADO Regex!</b><br> \
                > mode = 3 | Query de <b>FormS</b> Por <b>Flow</b>, Campo Search: Inserir <b>_id do Flow</b><br> \
                > mode = 4 | Query de Single <b>Form Especifico</b> Do <b>Flow Especifico</b> Ver abaixo Formato Correto!! <br> \
                .............. <b>Formato no Campo Search = "_id do form"<b>/</b>"_id do flow"</b> <br> \
                ------------------------------------------------------------------------------------------------------------------------<br>',
                validate: {
                    headers,
                    failAction: failAction,
                    query: {
                        skip: Joi.number().integer().default(0),
                        limit: Joi.number().integer().default(10),
                        search: Joi.allow(),
                        mode: Joi.number().integer().default(0).max(4),
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
                        console.log('query: ', query)
                        return this.db.joinRead(query, 'flow', username, 'form')
                    } else if (mode == 4) {
                        return this.db.joinRead(query, 'flow', username, 'form-4')
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

    // Create Last Form
    // params: id do ultimo form
    // payload: normal

    // Create Middle Form
    // params: id do step_forward
    //       : id do step_backward 
    create() {
        return {
            path: '/model_form/{mode}',
            method: 'POST',
            config: {
                tags: ['api'],
                description: 'Deve criar Forms',
                notes: 'Os valores sugeridos estão determinados como default no body->Modelo->Example Value.<br>\
                ------------------------------------------------------------------------------------------------------------------------<br>\
                @ <b>mode</b> <br>\
                3 modos para criação de forms, modo passado sempre na url como inteiro <br>\
                <b>O update</b> de Flow Father e step_forward e step_backward <b>é feito automaticamente</b><br> \
                @ mode: <b>0</b>| Criar o <b>primeiro form</b> da lista<br>\
                @ mode: <b>1</b>| Criar o <b>ultimo form</b> da lista<br>\
                @ mode: <b>2</b>| Criar um <b>form no meio</b> da lista <br>\
                ------------------------------------------------------------------------------------------------------------------------<br>\
                >>> <b>step_backward</b>: id do form anterior, utilizado nos modes 1 e 2, id em string válido<br>\
                >>> <b>step_forward</b>: id do form posterior, utilizado somente no mode 2, id em string válido<br>\
                Quando algum step_forward ID ou step_backward ID for irrelevante na operação como no mode: 0, \
                passar o valor determinado no default example <br>\
                > <b>title</b>: Título <br>\
                > <b>flow</b>: correspode ao <b>Flow pai do Form</b> <br>\
                > <b>data</b>: [{}] Array de objetos do Form-Builder<br>\
                > <b>secret</b>: <b>true</b> Or <b>false</b> <br>\
                > <b>creator</b>: <b>username</b> do criador <br>\
                > <b>permission</b>: Array de strings com usernameS e roleS de <b>quem pode responder o form</b> <br>\
                > <b>completed</b>: <b>true</b> Or <b>false</b> <br>\
                ------------------------------------------------------------------------------------------------------------------------<br>\
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
                    params: {
                        mode: Joi.number().integer().default(0).min(0).max(2)
                    },
                    payload: {
                        title: Joi.string().required().min(3).max(100),
                        step_forward: Joi.string().min(24).max(24).default('ffffffffffffffffffffffff'),
                        step_backward: Joi.string().min(24).max(24).default('000000000000000000000000'),
                        flow: Joi.string().min(24).max(24).default('111111111111111111111111'),
                        data: Joi.allow().default(CREATE_DEFAULT.data),
                        permission: Joi.array().min(1).items(Joi.string()).default(['admin', 'gui123', 'fifi24']),
                        secret: Joi.boolean().default(false),
                        creator: Joi.string().min(1).default('admin'),
                        completed: Joi.boolean().default(false)
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
                        creator,
                        completed
                    } = request.payload
                    
                    const {mode} = request.params 

                    if (mode == 0) {
                        const result = await this.db.create({
                            title,
                            step_forward,
                            step_backward,
                            flow,
                            data,
                            permission,
                            secret,
                            creator,
                            completed
                        })

                        return {
                            message: 'Form criado com sucesso',
                            _id: result._id
                        }
                    } else if (mode == 1) {
                        const result = await this.db.create({
                            title,
                            step_forward,
                            step_backward,
                            flow,
                            data,
                            permission,
                            secret,
                            creator,
                            completed
                        })

                        const update_result = await this.db.update(step_backward, {step_forward: result._id})

                        return {
                            message: 'Form criado com sucesso',
                            _id: result._id
                        }

                    } else if (mode == 2) {
                        const result = await this.db.create({
                            title,
                            step_forward,
                            step_backward,
                            flow,
                            data,
                            permission,
                            secret,
                            creator,
                            completed
                        })
                        const update_result1 = await this.db.update(step_backward, {step_forward: result._id})
                        const update_result2 = await this.db.update(step_forward, {step_backward: result._id})
                        
                        return {
                            message: 'Form criado com sucesso',
                            _id: result._id
                        }
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
                ------------------------------------------------------------------------------------------------------------------------<br>\
                Params: <br>\
                @<b>id</b>: id do flow para ser feito o Update <br>\
                @<b>username</b>: nome do usuário fazendo update, este usuáro precisa estar na lista de permission !!!<br>\
                ------------------------------------------------------------------------------------------------------------------------<br>\
                Os valores sugeridos estão determinados como default no body->Modelo->Example Value.<br>\
                Antes do objeto ser enviado ele deve ser convertido em string: <br>\
                <b>e.g(JSON.stringify(MOCK_FORM_UPDATE))</b><br>\
                ------------------------------------------------------------------------------------------------------------------------<br>\
                >>> <b>step_backward</b>: id do form anterior, utilizado nos modes 1 e 2, id em string válido<br>\
                >>> <b>step_forward</b>: id do form posterior, utilizado somente no mode 2, id em string válido<br>\
                Quando algum step_forward ID ou step_backward ID for irrelevante na operação como no mode: 0, \
                passar o valor determinado no default example <br>\
                > <b>title</b>: Título <br>\
                > <b>flow</b>: correspode ao <b>Flow pai do Form</b> <br>\
                > <b>data</b>: [{}] Array de objetos do Form-Builder<br>\
                > <b>secret</b>: <b>true</b> Or <b>false</b> <br>\
                > <b>creator</b>: <b>username</b> do criador <br>\
                > <b>permission</b>: Array de strings com usernameS e roleS de <b>quem pode responder o form</b> <br>\
                > <b>completed</b>: <b>true</b> Or <b>false</b> <br>\
                ------------------------------------------------------------------------------------------------------------------------<br>\
                <b>Importante:</b> <br>\
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
                        creator: Joi.string().min(1).default('admin'),
                        completed: Joi.boolean().default(false)
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
                    if (nuId.length == 0) {
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
                @<b>id</b>: o <b> id </b> deve ser válido, realizar um read no banco antes, passar como <b>String</b> <br>\
                @<b>username</b>: nome do usuário fazendo o delete, este usuáro precisa estar na lista de <b>permission_write no Flow Pai</b> <br> \
                caso o usuario não esteja na lista correta, retornará erro de não autorizado',
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
                    if (nuId.length == 0) {
                        return Boom.unauthorized()
                    } else {
                        const queryResp = {
                            model_form: `${id}`
                        }
                        const responses = await this.dbResp.read(queryResp)

                        if(responses.length > 0){
                            for(let i in responses) {
                                await this.dbResp.delete(responses[i]._id)
                            };
                        }
                        
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
