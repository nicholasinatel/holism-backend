const Mongoose = require('mongoose')
const options = {
    timestamps: true
}
const modelFormSchema = new Mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    step_forward: [{
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'modelForm',
        required: true
    }],
    step_backward: [{
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'modelForm',
        required: true
    }],
    flow: { // Father Flow
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'modelFlow',
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
                    dataOptions: [Mongoose.Schema.Types.Mixed], // Check Later if it is a Real String
                    ajaxDataUrl: String,
                    isChecked: Boolean
                }]
            }],
            labelPosition: String,
            isDynamic: Boolean,
            minInstance: Number,
            maxInstance: Number,
            instances: [String] // Check Later if it is a Real a String
        }],
        layout: String,
        _uniqueId: Number // From Form Builder
    }],
    permission: { // users & personas QUEM PODE RESPONDER!
        type: Array,
        required: true
    },
    secret: { // Info Sensivel - Soh quem tem Admin OU Preencheu o Form
        type: Boolean,
        required: true
    },
    creator: {
        type: String,
        ref: 'authentication',
        required: true
    },
    completed: {
        type: Boolean,
        required: true
    }
}, options)

module.exports = Mongoose.model('modelForm', modelFormSchema)
