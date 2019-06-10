const Mongoose = require('mongoose')
const options = {
  timestamps: true
}
const responseSchema = new Mongoose.Schema({
  model_form: { // Correspondent Component
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'modelForm',
    required: true
  },
  user: { // Response Form Target
    type: String,
    ref: 'authentication',
    required: true
  },
  data: [{
    sections: [{
      name: String,
      label: String,
      clientKey: String,
      order: Number,
      rows: [{
        name: String,
        label: String,
        order: Number,
        controls: [{
          componentType: String, // Mudança
          name: String,
          fieldName: String,
          label: String,
          order: Number,
          defaultValue: String,
          value: String,
          className: String,
          readonly: Boolean,
          labelBold: Boolean,
          labelItalic: Boolean,
          labelUnderline: Boolean,
          required: Boolean,
          isMultiLine: Boolean,
          isInteger: Boolean,
          decimalPlace: Number,
          isTodayValue: Boolean,
          dateFormat: String,
          isNowTimeValue: Boolean,
          timeFormat: String,
          isMultiple: Boolean,
          isAjax: Boolean,
          dataOptions: [Mongoose.Schema.Types.Mixed], //OK
          ajaxDataUrl: String,
          isChecked: Boolean
        }]
      }],
      labelPosition: String,
      isDynamic: Boolean,
      minInstance: Number,
      maxInstance: Number,
      instances: [Mongoose.Schema.Types.Mixed] //OK
    }],
    layout: String,
    _uniqueId: Number // From Form Builder
  }]
}, options)

module.exports = Mongoose.model('response', responseSchema)
