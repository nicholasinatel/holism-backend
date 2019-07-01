/* eslint-disable camelcase */
/* eslint-disable no-console */
const Joi = require('joi');
const Boom = require('boom');
const BaseRoute = require('./base/baseRoute');

const QueryHelper = require('./../helpers/queryHelper');

const failAction = (request, headers, error) => {
  throw error;
};

// Todas as rotas usarao esse header para validar se o corpo da requisicao
// ta com o objeto conforme a necessidade, entao adiciona em todas as rotas
const headers = Joi.object({
  authorization: Joi.string().required()
}).unknown();

// let app = {} // server receiver

// queryString = http://localhost:5000/model_flow_list?skip=0&limit=10&nome=flash
class FlowRoutes extends BaseRoute {
  constructor(db, dbForm, dbResp) {
    super();
    this.db = db;
    this.dbForm = dbForm;
    this.dbResp = dbResp;
  }

  list() {
    return {
      path: '/model_flow',
      method: 'GET',
      config: {
        tags: ['api'],
        description: 'Deve listar Flows',
        notes:
          'Query com 5 Parâmetros,<br> ' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          '<b>skip</b> = Paginação <br> ' +
          '<b>limit</b> = Limita objetos na resposta <br> ' +
          '<b>search</b> = Objeto procurado <br> ' +
          '<b>username</b> = usuario realizando a query (permission_read) <br> ' +
          '<b> Inserir automaticamente o username do creator no permission_read no front-end </b> <br> ' +
          '<b> Somente Serão Mostrados Fluxos que o usuário está no array de permission_read do Fluxo </b> <br> ' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          '<b>username obrigatório em todas as GET REQUESTS</b><br>' +
          '> mode = 0 | Query para achar tudo na collection, Campo search em branco<br> ' +
          '> mode = 1 | Query por <b>id</b>, Campo Search: Inserir id do Flow<br> ' +
          '> mode = 2 | Query por <b>title</b>, Campo Search: Inserir title do Flow, <b>Title com Valor Exato!!</b><br> ' +
          '> mode = 3 | Query de Flows Por <b>Project</b>, Campo Search: Inserir <b>_id do project</b><br> ' +
          '> mode = 4 | Query por title, Campo Search: Inserir title do Flow, <b>Title com Valor APROXIMADO! Regex Feature</b><br> ' +
          '------------------------------------------------------------------------------------------------------------------------<br>',
        validate: {
          headers,
          failAction,
          query: {
            skip: Joi.number()
              .integer()
              .default(0),
            limit: Joi.number()
              .integer()
              .default(10),
            search: Joi.allow(),
            mode: Joi.number()
              .integer()
              .default(0)
              .min(0)
              .max(4),
            username: Joi.string().default('admin'),
            roles: Joi.array()
              .min(1)
              .items(Joi.string())
              .default(['dev'])
          } // query end
        } // validate end
      },
      handler: async request => {
        try {
          const { skip, limit, search, mode, username, roles } = request.query;

          roles.push(username);

          const query = await QueryHelper.queryFlowSelecter(search, mode);

          if (mode === 3) {
            return this.db.joinRead(query, 'project', username, 'flow');
          }
          return this.db.readPermission(query, skip, limit, roles, 'flow');
        } catch (error) {
          console.error('Model Flow Route Server Internal Error: ', error);
          return Boom.internal();
        }
        // return this.db.read()
      } // handler end
    }; // list return end
  } // list end

  create() {
    return {
      path: '/model_flow',
      method: 'POST',
      config: {
        tags: ['api'],
        description: 'Deve criar Flows',
        notes:
          'Valores sugeridos estão determinados como default.<br>' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          '> <b>title</b>: Título<br>' +
          '> <b>permission_read</b>: um array que pode conter <b>personas</b> e <b>usuários</b>, ver default para exemplo.<br>' +
          '> <b>permission_write</b>: um array que pode conter <b>personas</b> e <b>usuários</b>, ver default para exemplo.<br>' +
          '> <b>starter_form</b>: correspode ao <b>primeiro form do flow</b>, será adicionado quando o mesmo for criado no criar de rotas para o form<br>' +
          '> <b>creator</b>: corresponde ao usuário que está criando o flow<br>' +
          '> <b>project</b>: corresponde ao projeto pai do flow <br>' +
          '> <b>tempoCompleto</b>: corresponde ao tempo quando completed = true <br>' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          'Salvar <b>id retornado</b> após criação com sucesso em alguma variável pois será útil em breve.<br>',
        validate: {
          failAction,
          headers,
          payload: {
            title: Joi.string()
              .required()
              .min(3)
              .max(100),
            permission_read: Joi.array()
              .min(1)
              .items(Joi.string())
              .default(['admin', 'gui123', 'fifi24']),
            permission_write: Joi.array()
              .min(1)
              .items(Joi.string())
              .default(['admin', 'gui123', 'fifi24']),
            completed: Joi.bool().default(false),
            starter_form: Joi.string()
              .min(24)
              .max(24)
              .default('000000000000000000000000'),
            creator: Joi.string()
              .min(1)
              .default('admin'),
            project: Joi.string()
              .min(24)
              .max(24)
              .default('222222222222222222222222'),
            tempoCompleto: Joi.date().default('2002-12-08 22:00:00.000')
          }
        } // validate end
      }, // config end
      handler: async request => {
        try {
          const {
            title,
            permission_read,
            permission_write,
            completed,
            starter_form,
            creator,
            project,
            tempoCompleto
          } = request.payload;

          const result = await this.db.create({
            title,
            permission_read,
            permission_write,
            completed,
            starter_form,
            creator,
            project,
            tempoCompleto
          });

          return {
            message: 'Flow criado com sucesso',
            _id: result._id,
            title: result.title
          };
        } catch (error) {
          console.error('Error at create', error);
          return Boom.internal();
        }
      }
    };
  } // Create End

  update() {
    return {
      path: '/model_flow/{id}/{username}/{roles}',
      method: 'PATCH',
      config: {
        tags: ['api'],
        description: 'Deve atualizar um Flow por <b>_id</b>',
        notes:
          'Para o update preciso que mande o objeto <b>id</b> do form em string.<br>' +
          'neste caso, deve ser um <b>objeto id válido</b>, <b>(i.e existente no banco)</b>, utilize um que tenha retornado pelo read no banco.<br> ' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          'Params: <br>' +
          '@<b>id</b>: id do flow para ser feito o Update <br>' +
          '@<b>username</b>: nome do usuário fazendo update, este usuáro precisa estar na lista de permission_write !<br>' +
          'caso o usuario nao esteja na lista correta, retornara erro de não autorizado<br> ' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          '> <b>title</b>: Título<br>' +
          '> <b>permission_read</b>: um array que pode conter <b>personas</b> e <b>usuários</b>, ver default para exemplo.<br>' +
          '> <b>permission_write</b>: um array que pode conter <b>personas</b> e <b>usuários</b>, ver default para exemplo.<br>' +
          '> <b>starter_form</b>: correspode ao <b>primeiro form do flow</b>, será adicionado quando o mesmo for criado no criar de rotas para o form<br>' +
          '> <b>creator</b>: corresponde ao usuário que está criando o flow<br>' +
          '> <b>project</b>: corresponde ao projeto pai do flow <br>' +
          '> <b>tempoCompleto</b>: corresponde ao tempo quando completed = true <br>' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          'Antes do objeto ser enviado ele deve ser convertido em string: <br>' +
          '<b>e.g(JSON.stringify(MOCK_FLOW_UPDATE))</b><br>' +
          '<b>i.e</b> significa isto é (vem do latin, os gringos usam muito) <br>' +
          '<b>e.g</b> significa por exemplo <br>',
        validate: {
          headers,
          params: {
            id: Joi.string()
              .required()
              .min(24)
              .max(24),
            username: Joi.string().required(),
            roles: Joi.array()
              .min(1)
              .items(Joi.string())
              .default(['dev'])
          },
          payload: {
            title: Joi.string()
              .required()
              .min(3)
              .max(100)
              .default('flow teste_update'),
            permission_read: Joi.array()
              .min(1)
              .items(Joi.string())
              .default(['admin', 'gui123', 'fifi24', 'nicholas']),
            permission_write: Joi.array()
              .min(1)
              .items(Joi.string())
              .default(['admin', 'gui123', 'fifi24', 'nicholas']),
            completed: Joi.bool().default(true),
            starter_form: Joi.string()
              .min(24)
              .max(24)
              .default('000000000000000000000000'),
            creator: Joi.string()
              .min(1)
              .default('admin'),
            project: Joi.string()
              .min(24)
              .max(24)
              .default('222222222222222222222222'),
            tempoCompleto: Joi.date().default('2002-12-08')
          }
        } // validate end
      }, // config end
      handler: async request => {
        try {
          const { id, username, roles } = request.params;

          const { payload } = request;

          if (payload.completed) {
            payload.tempoCompleto = Date.now();
          }

          roles.push(username);

          const query = {
            // findByID
            _id: `${id}`
          };
          const nuId = await this.db.writePermission(
            query,
            0,
            1,
            roles,
            'flow'
          );

          if (nuId.length === 0) {
            return Boom.unauthorized();
          }
          const dadosString = JSON.stringify(payload);
          const dados = JSON.parse(dadosString);
          const result = await this.db.update(nuId[0]._id, dados);
          if (result.nModified !== 1)
            return Boom.preconditionFailed(
              'ID não encontrado ou arquivo sem modificações'
            );
          return {
            message: 'Fluxo atualizado com sucesso'
          };
        } catch (error) {
          console.error('Error at Flow Update', error);
          return Boom.internal();
        }
      }
    };
  } // update - end

  delete() {
    return {
      path: '/model_flow/{id}/{username}/{roles}',
      method: 'DELETE',
      config: {
        tags: ['api'],
        description: 'Deve deletar um flow por <b>_id</b>',
        notes:
          'Parametros: <br>' +
          '@id: o <b> id </b> deve ser válido, realizar um read no banco antes, passar como <b>String</b> <br>' +
          '@username: nome do usuário fazendo o delete, este usuáro precisa estar na lista de permission_write!<br> ' +
          'caso o usuario nao esteja na lista correta(permission_write), retornará erro de não autorizado<br>' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          'Deleta o Fluxo e TODOS os FORMS filhos.',
        validate: {
          headers,
          failAction,
          params: {
            id: Joi.string()
              .min(24)
              .max(24)
              .required(),
            username: Joi.string().required(),
            roles: Joi.array()
              .min(1)
              .items(Joi.string())
              .default(['dev'])
          }
        } // validate end
      }, // config end
      handler: async request => {
        try {
          const { id, username, roles } = request.params;

          const query = {
            // findByID
            _id: `${id}`
          };

          roles.push(username);

          const nuId = await this.db.writePermission(
            query,
            0,
            1,
            roles,
            'flow'
          );

          if (nuId.length === 0) {
            return Boom.unauthorized();
          }
          /**
           * * Form
           * ! Delete Variables
           */
          const queryForm = {
            flow: `${id}`
          };

          const forms = await this.dbForm.joinRead(
            queryForm,
            'flow',
            roles,
            'form'
          );

          const formArrayIDs = [];

          /**
           * TODO Delete Forms
           * ! Save forms _ids
           */
          if (forms.length > 0) {
            for (const i in forms) {
              formArrayIDs.push(forms[i]._id);
              await this.dbForm.delete(forms[i]._id);
            }
          }

          /**
           * * Response
           * ? Iterate throw formArrayIDs looking Responses and Pushing to array
           * ! Delete Variables
           */
          const respArrayIDs = [];

          if (formArrayIDs.length > 0) {
            for (const i in formArrayIDs) {
              const respQueryResult = await this.dbResp.read({
                model_form: formArrayIDs[i]
              });
              if (respQueryResult.length > 0)
                for (const j in respQueryResult) {
                  respArrayIDs.push(respQueryResult[j]._id);
                }
            }
          }
          /**
           * TODO Delete Responses from previous array
           */
          if (respArrayIDs.length > 0) {
            for (const i in respArrayIDs) {
              await this.dbResp.delete(respArrayIDs[i]);
            }
          }

          /**
           * TODO Delete Flows
           */
          const result = await this.db.delete(nuId[0]._id);
          if (result.n !== 1)
            return Boom.preconditionFailed('ID nao encontrado no banco');
          return {
            message: 'Fluxo removido com sucesso'
          };
        } catch (error) {
          console.error('Error at Flow Delete', error);
          return Boom.internal();
        }
      }
    }; // return delete end
  } // delete end
}

module.exports = FlowRoutes;
