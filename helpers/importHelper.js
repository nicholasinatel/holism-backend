/* eslint-disable camelcase */
class ImportHelper {
  static delFlowDirty(payload, starter_form) {
    return {
      title: payload.title,
      permission_read: payload.permission_read,
      permission_write: payload.permission_write,
      completed: payload.completed,
      starter_form,
      creator: payload.creator,
      project: payload.project,
      tempoCompleto: payload.tempoCompleto
    };
  }

  static delFormDirty(payload, id) {
    return {
      title: payload.title,
      step_forward: payload.step_forward,
      step_backward: payload.step_backward,
      flow: id,
      data: payload.data,
      permission: payload.permission,
      secret: payload.secret,
      creator: payload.creator,
      status: payload.status,
      tempoEstimado: payload.tempoEstimado,
      tempoInicial: payload.tempoInicial,
      tempoUtilizado: payload.tempoUtilizado
    };
  }

  static compareArrays(permission, roles) {
    let flag = 0;
    roles.forEach(x => {
      permission.forEach(y => {
        if (x === y) flag += 1;
      });
    });

    if (flag === 0) return false;
    return true;
  }

  static newForm1(dados, id, stepBid) {
    return {
      title: dados.title,
      step_forward: dados.step_forward,
      step_backward: stepBid, // Atualiza Agora
      flow: id, //
      data: dados.data,
      permission: dados.permission,
      secret: dados.secret,
      creator: dados.creator,
      status: dados.status,
      tempoEstimado: dados.tempoEstimado,
      tempoInicial: dados.tempoInicial,
      tempoUtilizado: dados.tempoUtilizado
    };
  }
}

module.exports = ImportHelper;
