const Mongoose = require('mongoose')
const options = {
  timestamps: true
}

const modelFlowSchema = new Mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: false
  },
  permission_read: { // users & personas QUEM PODE Ver Que Existe
    type: Array 
  },
  permission_write: { // users & personas QUEM PODE EDITAR
    type: Array 
  },
  completed: {
    type: Boolean
  },
  starter_form: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'modelForm'
  },
  creator: {
    type: String,
    ref: 'authentication',
    required: true
  }, 
  project: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'project'
  }
  // Pensar em como fazer versionamento
}, options)

module.exports = Mongoose.model('modelFlow', modelFlowSchema)
/*
PROFESSOR
EDITOR
ROTEIRISTA
CURADOR (GP) (INTERNA)
CORPO JURIDICO (INTERNA)
ALUNO BETA
AGENCIA DE MARKETING
PRODUTORA
LOCACAO
REVISOR
REDATOR
PESQUISADOR
ANIMADOR
EDITORES DAGORA
ALUNO
TUTORES (ALUNO??)
INFLUENCIADORES
*/