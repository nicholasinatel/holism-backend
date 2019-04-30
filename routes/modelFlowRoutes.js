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

// let app = {} // server receiver

//queryString = http://localhost:5000/model_flow_list?skip=0&limit=10&nome=flash
class FlowRoutes extends BaseRoute {
    constructor(db) {
        super()
        this.db = db
    }
    list() {
        return {
            path: '/model_flow',
            method: 'GET',
            config: {
                tags: ['api'],
                description: 'Deve listar Flows na Collection, por ID || title || retorna todos',
                notes: 'Query com 5 Parâmetros,<br> \
                <b>skip</b> = Paginação <br> \
                <b>limit</b> = Limita objetos na resposta <br> \
                <b>search</b> = Objeto procurado <br> \
                <b>username</b> = usuario realizando a query (permission_read) <br> \
                <b> Inserir automaticamente o username do creator no permission_read no front-end </b> <br> \
                <b> Somente Serão Mostrados Fluxos que o usuário está no array de permission_read </b> <br> \
                >>><br> \
                > mode = 0 | Query para achar tudo na collection, Campo search em branco, <b>username obrigatório</b> <br> \
                > mode = 1 | Query por <b>id</b>, Campo Search: Inserir id do Flow, <b>username obrigatório</b> <br> \
                > mode = 2 | Query por <b>title</b>, Campo Search: Inserir title do Flow, <b>Title com Valor Exato!!</b>, <b>username obrigatório</b> <br> \
                > mode = 3 | Query de Flows Por <b>Project</b>, Campo Search: Inserir <b>_id do project</b>, <b>username obrigatório</b> <br> \
                > mode = 4 | Query por title, Campo Search: Inserir title do Flow, <b>Title com Valor APROXIMADO! Regex Feature</b>, <b>username obrigatório</b> <br> \
                >>>',
                validate: {
                    headers,
                    failAction: failAction,
                    query: {
                        skip: Joi.number().integer().default(0),
                        limit: Joi.number().integer().default(10),
                        search: Joi.allow(),
                        mode: Joi.number().integer().default(0).min(0).max(4),
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

                    const query = await QueryHelper.queryFlowSelecter(search, mode)

                    if (mode == 3) {
                        return this.db.joinRead(query, 'project', username, 'flow')
                    } else {
                        return this.db.readPermission(query, skip, limit, username, 'flow')
                    }

                } catch (error) {
                    console.error('Model Flow Route Server Internal Error: ', error)
                    return Boom.internal()
                }
                // return this.db.read()
            } //handler end
        } // list return end
    } //list end

    create() {
        return {
            path: '/model_flow',
            method: 'POST',
            config: {
                tags: ['api'],
                description: 'Deve criar Flows',
                notes: 'Único parâmetro necessário é o <b>Title</b>,<br>\
                os valores sugeridos estão determinados como default.<br>\
                Os valores Default podem ser substituídos, seguindo o padrão.<br>\
                >>><br>\
                --> title: Título<br>\
                --> permission_read: um número de 0 a 3 para os níveis de acesso de cada usuário.<br>\
                --> permission_write: um array que pode conter <b>personas</b> e <b>usuários</b>, ver default para exemplo.<br>\
                --> starter_form: correspode ao <b>primeiro form do flow</b>, será sempre adicionado quando o mesmo,<br>\
                for criado, utilizando um <b>update</b> após o <b>create form</b>.<br>\
                --> creator: corresponde ao usuário que está criando o flow<br>\
                --> project: corresponde ao projeto pai do flow <br>\
                >>><br>\
                Salvar <b>id retornado</b> após criação com sucesso em alguma variável pois será útil em breve.<br>',
                validate: {
                    failAction,
                    headers,
                    payload: {
                        title: Joi.string().required().min(3).max(100),
                        permission_read: Joi.array().min(1).items(Joi.string()).default(['admin', 'gui123', 'fifi24']),
                        permission_write: Joi.array().min(1).items(Joi.string()).default(['admin', 'gui123', 'fifi24']),
                        completed: Joi.bool().default(false),
                        starter_form: Joi.string().min(24).max(24).default('000000000000000000000000'),
                        creator: Joi.string().min(1).default('admin'),
                        project: Joi.string().min(24).max(24).default('222222222222222222222222')
                    }
                } // validate end
            }, // config end
            handler: async (request) => {
                try {
                    let {
                        title,
                        permission_read,
                        permission_write,
                        completed,
                        starter_form,
                        creator,
                        project
                    } = request.payload

                    const result = await this.db.create({
                        title,
                        permission_read,
                        permission_write,
                        completed,
                        starter_form,
                        creator,
                        project
                    })

                    return {
                        message: 'Flow criado com sucesso',
                        _id: result._id,
                        title: result.title
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
            path: '/model_flow/{id}/{username}',
            method: 'PATCH',
            config: {
                tags: ['api'],
                description: 'Deve atualizar um Flow por <b>_id</b>',
                notes: 'Para o update preciso que mande o objeto <b>id</b> do form em string.<br>\
                neste caso, deve ser um <b>objeto id válido</b>, <b>(i.e existente no banco)</b>, utilize um que tenha retornado pelo read no banco.<br> \
                Params: <br>\
                @id: id do flow para ser feito o Update <br>\
                @username: nome do usuário fazendo update, este usuáro precisa estar na lista de permission_write !!!<br>\
                caso o usuario nao esteja na lista correta, retornara erro de nao autorizado<br> \
                Segue exemplo com um objeto para update válido, é o mesmo no Example Value, porém em <b>formato de objeto</b>: <br> \
                >>><br>\
                var MOCK_FLOW_UPDATE = {<br>\
                &nbsp title: "flow teste_update",<br>\
                &nbsp permission_read: 0,<br>\
                &nbsp permission_write: ["admin", "gui123", "fifi24", "nicholas"],<br>\
                &nbsp completed: true,<br>\
                &nbsp starter_form: "faca77777cacacaf5f511111",<br>\
                &nbsp creator: "5c4775423ce1b91f5c344f60"<br>\
                }<br>\
                >>><br>\
                Antes do objeto ser enviado ele deve ser convertido em string: <br>\
                <b>e.g(JSON.stringify(MOCK_FLOW_UPDATE))</b><br>\
                <b>i.e</b> significa isto é (vem do latin, os gringos usam muito) <br>\
                <b>e.g</b> significa por exemplo <br>\
                ',
                validate: {
                    headers,
                    params: {
                        id: Joi.string().required().min(24).max(24),
                        username: Joi.string().required()
                    },
                    payload: {
                        title: Joi.string().required().min(3).max(100).default("flow teste_update"),
                        permission_read: Joi.array().min(1).items(Joi.string()).default(['admin', 'gui123', 'fifi24', 'nicholas']),
                        permission_write: Joi.array().min(1).items(Joi.string()).default(['admin', 'gui123', 'fifi24', 'nicholas']),
                        completed: Joi.bool().default(true),
                        starter_form: Joi.string().min(24).max(24).default('000000000000000000000000'),
                        creator: Joi.string().min(1).default('admin'),
                        project: Joi.string().min(24).max(24).default('222222222222222222222222')
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
                    const nuId = await this.db.writePermission(query, 0, 1, username, 'flow')

                    if (nuId.length == 0) {
                        return Boom.unauthorized()
                    } else {
                        const dadosString = JSON.stringify(payload)
                        const dados = JSON.parse(dadosString)
                        const result = await this.db.update(nuId[0]._id, dados)
                        if (result.nModified !== 1) return Boom.preconditionFailed('ID não encontrado ou arquivo sem modificações')
                        return {
                            message: 'Fluxo atualizado com sucesso'
                        }
                    }
                } catch (error) {
                    console.error('Error at Flow Update', error)
                    return Boom.internal()
                }
            }
        }
    } // update - end

    delete() {
        return {
            path: '/model_flow/{id}/{username}',
            method: 'DELETE',
            config: {
                tags: ['api'],
                description: 'Deve deletar um flow por <b>_id</b>',
                notes: 'Parametros: <br>\
                @id: o <b> id </b> deve ser válido, realizar um read no banco antes, passar como <b>String</b> <br>\
                @username: nome do usuário fazendo o delete, este usuáro precisa estar na lista de permission_write !!! <br> \
                caso o usuario nao esteja na lista correta, retornara erro de nao autorizado',
                validate: {
                    headers,
                    failAction,
                    params: {
                        id: Joi.string().min(24).max(24).required(),
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
                    const nuId = await this.db.writePermission(query, 0, 1, username, 'flow')
                    if (nuId.length == 0) {
                        return Boom.unauthorized()
                    } else {
                        const result = await this.db.delete(nuId[0]._id)    
                        if (result.n !== 1)
                            return Boom.preconditionFailed('ID nao encontrado no banco')    
                        return {
                            message: 'Fluxo removido com sucesso'
                        }
                    }
                } catch (error) {
                    console.error('Error at Flow Delete', error)
                    return Boom.internal()
                }
            }
        } // return delete end
    } // delete end
}

module.exports = FlowRoutes