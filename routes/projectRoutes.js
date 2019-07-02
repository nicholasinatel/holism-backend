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

// queryString = http://localhost:5000/model_flow_list?skip=0&limit=10&nome=flash
class ProjectRoutes extends BaseRoute {
  constructor(db, dbFlow, dbForm, dbResp) {
    super();
    this.db = db;
    this.dbFlow = dbFlow;
    this.dbForm = dbForm;
    this.dbResp = dbResp;
  }

  list() {
    return {
      path: '/project',
      method: 'GET',
      config: {
        tags: ['api'],
        description: 'Deve listar Projects do Usuario',
        notes:
          'Query com 5 Parâmetros,<br> ' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          '> <b>skip</b>: Paginação <br> ' +
          '> <b>limit</b>: Limita objetos na resposta <br> ' +
          '> <b>search</b>: Objeto procurado <b>(Varia de acordo com o mode, ver abaixo)</b><br> ' +
          '> <b>username</b>: usuario realizando a query (creator) <br> ' +
          '<b> Somente Serão Mostrados Projects que o usuário criou </b> <br> ' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          '> mode = 0 | Query para achar tudo na collection, Campo search em branco, <b>username obrigatório</b> <br> ' +
          '> mode = 1 | Query por <b>id</b>, Campo Search: Inserir id do Project, <b>username obrigatório</b> <br> ' +
          '> mode = 2 | Query por <b>title</b>, Campo Search: Inserir title do Project, <b>Title com Valor EXATO</b>, <b>username obrigatório</b> <br> ' +
          '> mode = 3 | Query por Project COMPLETED = true or false <br> ' +
          '> mode = 4 | Query por <b>title</b>, Campo Search: Inserir title do Project, <b>Title com Valor APROXIMADO Regex!</b>, <b>username obrigatório</b> <br> ' +
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
            username: Joi.string().default('admin')
          } // query end
        } // validate end
      },
      handler: async request => {
        try {
          const { skip, limit, search, mode, username } = request.query;

          const query = await QueryHelper.queryProjectSelecter(search, mode);

          return this.db.readPermission(
            query,
            skip,
            limit,
            username,
            'project'
          );
        } catch (error) {
          console.error('ProjectRoute Server Internal Error: ', error);
          return Boom.internal();
        }
        // return this.db.read()
      } // handler end
    }; // list return end
  } // list end

  create() {
    return {
      path: '/project',
      method: 'POST',
      config: {
        tags: ['api'],
        description: 'Deve criar Projetos',
        notes:
          'Os valores sugeridos estão determinados como default no body->Modelo->Example Value.<br>' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          '> <b>title</b>: Título único.<br>' +
          '> <b>completed</b>: false ou true <br>' +
          '> <b>creator</b>: corresponde ao usuário _ID que está criando o project.<br>' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          'Salvar <b>id retornado</b> após criação com sucesso em alguma variável pois será usado na query de Flow.<br>',
        validate: {
          failAction,
          headers,
          payload: {
            title: Joi.string()
              .required()
              .min(3)
              .max(100),
            completed: Joi.bool().default(false),
            creator: Joi.string()
              .required()
              .min(1)
              .max(100)
              .default('admin')
          }
        } // validate end
      }, // config end
      handler: async request => {
        try {
          const { title, completed, creator } = request.payload;

          // title = title.toLowerCase()
          const [titulo] = await this.db.read({
            title // Boa pratica sempre colocar minusculo
          });

          if (titulo) {
            return Boom.conflict('Projeto informado já existe');
          }
          const result = await this.db.create({
            title,
            completed,
            creator
          });

          return {
            message: 'Projeto criado com sucesso',
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
      path: '/project/{id}/{creator}',
      method: 'PATCH',
      config: {
        tags: ['api'],
        description: 'Deve atualizar um Project por <b>_id</b>',
        notes:
          'Para o update preciso que mande o objeto <b>_id</b> do <b>project</b> em string.<br>' +
          'neste caso, deve ser um <b>objeto id válido</b>, <b>(i.e existente no banco)</b>, utilize um que tenha retornado pelo read no banco.<br> ' +
          'Segue exemplo com um objeto para update válido, é o mesmo no Example Value, porém em <b>formato de objeto!!!</b>: <br> ' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          'var MOCK_PROJECT_UPDATE = {<br>' +
          '&nbsp title: "flow teste_update",<br>' +
          '&nbsp completed: true,<br>' +
          '&nbsp flow: "faca77777cacacaf5f511111",<br>' +
          '&nbsp creator: "admin"<br>' +
          '}<br>' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          'Antes do objeto ser enviado ele deve ser convertido em string: <br>' +
          '<b>e.g(JSON.stringify(MOCK_PROJECT_UPDATE))</b><br>' +
          '<b>i.e</b> significa isto é (vem do latin, os gringos usam muito) <br>' +
          '<b>e.g</b> significa por exemplo <br>',
        validate: {
          headers,
          params: {
            id: Joi.string().required(),
            creator: Joi.string()
              .required()
              .min(1)
              .max(100)
              .default('admin')
          },
          payload: {
            title: Joi.string()
              .required()
              .min(3)
              .max(100)
              .default('flow teste_update'),
            completed: Joi.bool().default(true)
          }
        } // validate end
      }, // config end
      handler: async request => {
        try {
          const { id, creator } = request.params;

          const { payload } = request;

          const query = {
            _id: `${id}`
          };
          const nuId = await this.db.writePermission(
            query,
            0,
            1,
            creator,
            'project'
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
            message: 'Projeto atualizado com sucesso!'
          };
        } catch (error) {
          console.error('Error at Project Update', error);
          return Boom.internal();
        }
      }
    };
  } // update - end

  delete() {
    return {
      path: '/project/{id}/{creator}',
      method: 'DELETE',
      config: {
        tags: ['api'],
        description: 'Deve deletar um project por <b>_id</b>',
        notes:
          'Deleta Project, Todos os Fluxos, Forms e Responses do Project Deletado: <br>' +
          'Parâmetros:<br>' +
          '@<b>id</b>: o <b>id</b> deve ser válido, realizar um read no banco antes, passar como <b>String</b> <br>' +
          '@<b>creator</b>: nome do usuário fazendo o delete, este usuáro precisa ser o criador do project !!! <br> ' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          'Caso o usuário não seja o <b>creator</b>, retorna erro de não autorizado<br>',
        validate: {
          headers,
          failAction,
          params: {
            id: Joi.string()
              .min(24)
              .max(24)
              .required(),
            creator: Joi.string()
              .required()
              .min(3)
              .max(100)
              .default('admin')
          }
        } // validate end
      }, // config end
      handler: async request => {
        try {
          const { id, creator } = request.params;

          const query = {
            _id: `${id}`
          };

          const nuId = await this.db.writePermission(
            query,
            0,
            1,
            creator,
            'project'
          );

          if (nuId.length === 0) {
            return Boom.unauthorized();
          }
          /**
           * * GET FLOWS
           * TODO: Push First Array And Delete
           */
          const queryFlow = {
            project: `${nuId[0]._id}`
          };
          const flows = await this.dbFlow.joinRead(
            queryFlow,
            'project',
            creator,
            'flow'
          );
          const flowArrayIDs = [];

          if (flows.length > 0) {
            for (const i in flows) {
              flowArrayIDs.push(flows[i]._id);
              await this.dbFlow.delete(flows[i]._id);
            }
          }
          /**
           * * GET Forms && Responses
           * TODO Delete Forms && Responses
           */
          if (flowArrayIDs.length > 0) {
            for (const i in flowArrayIDs) {
              const forms = await this.dbForm.read({
                flow: flowArrayIDs[i]
              });
              if (forms.length > 0) {
                for (const j in forms) {
                  let responses = await this.dbResp.read({
                    model_form: forms[j]._id
                  });
                  if (responses.length > 0) {
                    for (const z in responses) {
                      await this.dbResp.delete(responses[z]._id);
                    }
                  }
                  await this.dbForm.delete(forms[j]._id);
                }
              }
            }
          }

          /**
           * TODO Delete THE Project
           */
          const result = await this.db.delete(nuId[0]._id);
          if (result.n !== 1)
            return Boom.preconditionFailed('_ID não encontrado no banco');

          return {
            message: 'Projeto removido com sucesso'
          };
        } catch (error) {
          console.error('Error at Project Delete', error);
          return Boom.internal();
        }
      }
    }; // return delete end
  } // delete end
}

module.exports = ProjectRoutes;
