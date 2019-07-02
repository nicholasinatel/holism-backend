/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
const Joi = require('joi');
const Boom = require('boom');
const BaseRoute = require('./base/baseRoute');
const Help = require('../helpers/importHelper');

const failAction = (request, headers, error) => {
  throw error;
};

// Todas as rotas usarao esse header para validar se o corpo da requisicao
// ta com o objeto conforme a necessidade, entao adiciona em todas as rotas
const headers = Joi.object({
  authorization: Joi.string().required()
}).unknown();

class ImportRoutes extends BaseRoute {
  constructor(dbFlow, dbForm) {
    super();
    this.dbFlow = dbFlow;
    this.dbForm = dbForm;
  }

  import() {
    return {
      path: '/import/{id}/{username}/{roles}',
      method: 'POST',
      config: {
        tags: ['api'],
        description: 'IMPORT Flow & Forms',
        notes:
          '<b>Único parâmetro necessário é o _id do Flow para importar</b><br>' +
          'Recebe um _id de Flow e Copia o Flow e Forms Filhos em novos objetos no banco de dados<br>' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          '<b>step_forward e step_backward precisa estar correto</b> <br>' +
          'ULTIMO STEP_FORWARD PRECISA SER ffffffffffffffffffffffff <br>' +
          'PRIMEIRO STEP_BACKWARD PRECISA SER 000000000000000000000000 <br>' +
          'SE ESTIVER ERRADO TEREMOS UM LOOP INFINITO NO SERVER!<br>' +
          '------------------------------------------------------------------------------------------------------------------------<br>' +
          'Body <br>' +
          '> <b>title</b>: <br>' +
          '> <b>permission_read</b>: <br>' +
          '> <b>permission_write</b>: <br>' +
          '> <b>starter_form</b>: <br>' +
          '> <b>creator</b>: <br>' +
          '> <b>project</b>: <br>' +
          '------------------------------------------------------------------------------------------------------------------------<br>',
        validate: {
          failAction,
          headers,
          params: {
            id: Joi.string().required(),
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
          // Read Flow Id
          const { id, username, roles } = request.params;

          roles.push(username);

          // const help = new Help();
          /**
           *  * Check if Starter Form Is Correct and then make import
           *  ! Get Flow Object
           */
          const [dadosFlow] = await this.dbFlow.read({ _id: `${id}` }, 0, 1);

          if (
            dadosFlow.starter_form.toString() !== 'ffffffffffffffffffffffff'
          ) {
            let count = 0;
            let stepIdCheck = dadosFlow.starter_form;
            let [checkForm] = await this.dbForm.read({
              _id: `${stepIdCheck}`
            });
            do {
              [checkForm] = await this.dbForm.read({
                _id: `${stepIdCheck}`
              });
              stepIdCheck = checkForm.step_forward;
              count += 1;
              if (count > 99) {
                // eslint-disable-next-line no-undef
                throw error;
              }
            } while (stepIdCheck.toString() !== 'ffffffffffffffffffffffff');
          }

          /**
           * ! Delete _id, __v, createdAt, updatedAt
           * ! Create New Flow
           */
          const importFlow = Help.delFlowDirty(
            request.payload,
            dadosFlow.starter_form
          );

          const newFlow = await this.dbFlow.create(importFlow);

          // Get Starter_Form ID from Imported Flow
          if (
            importFlow.starter_form.toString() !== 'ffffffffffffffffffffffff'
          ) {
            // Get 1st Form Object
            const [dadosStarterForm] = await this.dbForm.read({
              _id: `${importFlow.starter_form}`
            });

            /**
             * * Check Roles Vs Permission in starter form
             */
            const ok = Help.compareArrays(dadosStarterForm.permission, roles);

            if (ok) {
              /**
               * ! Delete _id, __v, createdAt, updatedAt
               * ! Create New Starter_Form
               * ! Update New Flow
               */
              const starterForm = Help.delFormDirty(
                dadosStarterForm,
                newFlow._id
              );
              const newForm = await this.dbForm.create(starterForm);
              newFlow.starter_form = newForm._id;
              await this.dbFlow.update(newFlow._id, newFlow);

              /**
               * * Get Initial
               * ! step_forward
               * ! ID from Starter_Form
               * ! step_backward
               */
              let nuFid = newForm._id;
              let stepFid = newForm.step_forward;
              let stepBid = newForm._id;

              do {
                /**
                 * * Loop To Import All Remaining Forms
                 */
                if (stepFid[0] !== 'ffffffffffffffffffffffff') {
                  /**
                   * * Get Form Object
                   * ! Delete _id, __v, createdAt, updatedAt
                   * ! Watchout for Step_Backward
                   * * Create newForm2
                   * ? Update Recursive Variables
                   * * Get Previous Form Object
                   * ! Update Previous Form
                   * TODO: Old Update
                   */
                  let [dadosNewForm] = await this.dbForm.read({
                    _id: `${stepFid}`
                  });

                  let okLoop = Help.compareArrays(
                    dadosNewForm.permission,
                    roles
                  );
                  /**
                   * * LOOP FOR PERMISSIONS
                   * TODO: If not permitted Jump to next form
                   */
                  while (
                    okLoop === false &&
                    dadosNewForm.step_forward !== 'ffffffffffffffffffffffff'
                  ) {
                    [dadosNewForm] = await this.dbForm.read({
                      _id: `${dadosNewForm.step_forward}`
                    });

                    stepFid = dadosNewForm.step_forward;

                    okLoop = Help.compareArrays(dadosNewForm.permission, roles);
                  }

                  if (
                    okLoop === false &&
                    dadosNewForm.step_forward === 'ffffffffffffffffffffffff'
                  ) {
                    await this.dbForm.update(stepBid, {
                      step_forward: 'ffffffffffffffffffffffff'
                    });
                    stepFid = dadosNewForm.step_forward;
                  }

                  if (okLoop) {
                    const newForm1 = Help.newForm1(
                      dadosNewForm,
                      newFlow._id,
                      stepBid
                    );
                    const newForm2 = await this.dbForm.create(newForm1);
                    stepFid = newForm2.step_forward;
                    stepBid = newForm2._id;

                    const [dadosOldForm] = await this.dbForm.read({
                      _id: `${nuFid}`
                    });

                    nuFid = dadosOldForm._id;

                    await this.dbForm.update(nuFid, {
                      step_forward: newForm2._id
                    });

                    /**
                     * * Set nuFid to the newest form
                     */
                    nuFid = newForm2._id;
                    okLoop = false;
                  }
                }
              } while (
                stepFid.toString() !== 'ffffffffffffffffffffffff' ||
                stepFid === undefined
              );
            } else {
              /**
               * TODO: Go to next form and verify because the 1st is wrong
               */

              let [newDadosStarterForm] = await this.dbForm.read({
                _id: `${dadosStarterForm.step_forward}`
              });

              /**
               * * Check Roles Vs Permission in starter form
               * ? https://stackoverflow.com/questions/12433604/how-can-i-find-matching-values-in-two-arrays
               */
              let ok2 = Help.compareArrays(
                newDadosStarterForm.permission,
                roles
              );

              while (
                ok2 === false &&
                newDadosStarterForm.step_forward !== 'ffffffffffffffffffffffff'
              ) {
                [newDadosStarterForm] = await this.dbForm.read({
                  _id: newDadosStarterForm.step_forward
                });
                ok2 = Help.compareArrays(newDadosStarterForm.permission, roles);
              }

              if (ok2) {
                /**
                 * * Loop To Import All Remaining Forms
                 */
                /**
                 * ! Delete _id, __v, createdAt, updatedAt
                 * ! Create New Starter_Form
                 * ! Update New Flow
                 */
                const starterForm = Help.delFormDirty(
                  newDadosStarterForm,
                  newFlow._id
                );
                const newForm = await this.dbForm.create(starterForm);
                await this.dbForm.update(newForm._id, {
                  step_backward: '000000000000000000000000'
                });
                newFlow.starter_form = newForm._id;
                await this.dbFlow.update(newFlow._id, newFlow);

                /**
                 * * Get Initial
                 * ! step_forward
                 * ! ID from Starter_Form
                 * ! step_backward
                 */
                let nuFid = newForm._id;
                let stepFid = newForm.step_forward;
                let stepBid = newForm._id;

                do {
                  /**
                   * * Loop To Import All Remaining Forms
                   */
                  if (stepFid[0] !== 'ffffffffffffffffffffffff') {
                    /**
                     * * Get Form Object
                     * ! Delete _id, __v, createdAt, updatedAt
                     * ! Watchout for Step_Backward
                     * * Create newForm2
                     * ? Update Recursive Variables
                     * * Get Previous Form Object
                     * ! Update Previous Form
                     * TODO: Old Update
                     */
                    let [dadosNewForm] = await this.dbForm.read({
                      _id: `${stepFid}`
                    });

                    let okLoop = Help.compareArrays(
                      dadosNewForm.permission,
                      roles
                    );
                    /**
                     * * LOOP FOR PERMISSIONS
                     * TODO: If not permitted Jump to next form
                     */
                    while (
                      okLoop === false &&
                      // eslint-disable-next-line eqeqeq
                      dadosNewForm.step_forward[0] != 'ffffffffffffffffffffffff'
                    ) {
                      [dadosNewForm] = await this.dbForm.read({
                        _id: `${dadosNewForm.step_forward}`
                      });

                      stepFid = dadosNewForm.step_forward;

                      okLoop = Help.compareArrays(
                        dadosNewForm.permission,
                        roles
                      );
                    }

                    if (
                      okLoop === false &&
                      // eslint-disable-next-line eqeqeq
                      dadosNewForm.step_forward == 'ffffffffffffffffffffffff'
                    ) {
                      await this.dbForm.update(stepBid, {
                        step_forward: 'ffffffffffffffffffffffff'
                      });
                      stepFid = dadosNewForm.step_forward;
                    }

                    if (okLoop) {
                      const newForm1 = Help.newForm1(
                        dadosNewForm,
                        newFlow._id,
                        stepBid
                      );
                      const newForm2 = await this.dbForm.create(newForm1);
                      stepFid = newForm2.step_forward;
                      stepBid = newForm2._id;

                      const [dadosOldForm] = await this.dbForm.read({
                        _id: `${nuFid}`
                      });

                      nuFid = dadosOldForm._id;

                      await this.dbForm.update(nuFid, {
                        step_forward: newForm2._id
                      });

                      /**
                       * * Set nuFid to the newest form
                       */
                      nuFid = newForm2._id;
                      okLoop = false;
                    }
                  }
                } while (
                  stepFid.toString() !== 'ffffffffffffffffffffffff' ||
                  stepFid === undefined
                );
              }
            }
          }
          return {
            message: 'Import feito com sucesso',
            _id: newFlow._id
          };
        } catch (error) {
          console.error('Error at Import', error);
          return Boom.internal();
        }
      }
    };
  } // IMPORT END
}

module.exports = ImportRoutes;
