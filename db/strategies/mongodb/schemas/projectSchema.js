const Mongoose = require('mongoose');

const options = {
  timestamps: true
};
const projectSchema = new Mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean
    },
    creator: {
      type: String,
      ref: 'authentication'
    }
  },
  options
);

module.exports = Mongoose.model('project', projectSchema);
