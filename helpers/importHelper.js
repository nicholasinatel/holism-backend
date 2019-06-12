class ImportHelper {
    delFlowDirty(payload, starter_form) {
        return {
            title: payload.title,
            permission_read: payload.permission_read,
            permission_write: payload.permission_write,
            completed: payload.completed,
            starter_form: starter_form,
            creator: payload.creator,
            project: payload.project,
            tempoCompleto: payload.tempoCompleto
        }
    }

    delFormDirty(payload, id){
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
        }
    }

    compareArrays(starter_form, roles) {
        let flag = 0;
        roles.forEach(x => {
            starter_form.forEach(y => {
                if(x == y)
                    flag++
            });
        });

        if (flag > 0 )
            return true;
        else if (flag == 0)
            return false;
    }
}

module.exports = ImportHelper;