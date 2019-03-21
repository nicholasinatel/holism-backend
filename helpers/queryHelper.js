const {
    promisify
} = require('util')

const queryFlowAsync = promisify(QueryFlow)
const queryFormAsync = promisify(QueryForm)
const queryResponseAsync = promisify(QueryResponse)
const queryProjectAsync = promisify(QueryProject)
const queryUserAsync = promisify(QueryUser)

function QueryFlow(search, mode, callback) {
    let query

    query = (mode == 1) ? { // findByID
            '_id': `${search}`
        } :
        (mode == 2) ? { // findByTitle
            'title': {
                $regex: `.*${search}*`,
                $options: 'i'
            }
        } :
        (mode == 3) ? { // findByCreator
            'creator': `${search}`
        } :
        (mode == 4) ? { // findByProject
            'project': `${search}`
        } : {} // find-All

    return callback(null, query)
}

function QueryForm(search, mode, callback) {
    let query

    query = (mode == 1) ? { // findByID
            '_id': `${search}`
        } :
        (mode == 2) ? { // findByTitle
            title: {
                $regex: `.*${search}*`,
                $options: 'i'
            }
        } :
        (mode == 3) ? { // findByFlow
            'flow': `${search}`
        } : {} // find-All

    return callback(null, query)
}

function QueryResponse(search, mode, callback) {
    let query

    if (mode == 1) {
        query = {
            '_id': `${search}`
        }
    } else if (mode == 2) {
        query = [
            {'flow': `${search}`},
            {join: 'flow'}
        ]
    } else if (mode == 3) {
        query = [
            {'form': `${search}`},
            {join: 'form'}
        ]
    } else if (mode == 4) {
        query = [
            {'user': `${search}`},
            {join: 'user'}
        ]
    } else {
        query = {}
    }
    return callback(null, query)
}

function QueryProject(search, mode, callback) {
    let query

    query = (mode == 1) ? { // findByID
            '_id': `${search}`
        } :
        (mode == 2) ? { // findByTitle
            title: {
                $regex: `.*${search}*`,
                $options: 'i'
            }
        } :
        (mode == 3) ? { // findByCreator
            'creator': `${search}`
        } :
        (mode == 4) ? { // findByCompleted
            'completed': `${search}`
        } : {} // findAll

    return callback(null, query)
}

function QueryUser(search, mode, callback) {
    let query

    query = (mode == 1) ? { // findByUsername
            'username': {
                $regex: `.*${search.toLowerCase()}*`
            }
        } :
        (mode == 2) ? { // findByRole
            'role': {
                $regex: `.*${search.toLowerCase()}*`
            }
        } :
        (mode == 3) ? { // findByRole
            '_id': `${search}`
        } : {} // findAll

    return callback(null, query)
}

class QueryHelper {
    // FLOW 
    static queryFlowSelecter(search, mode) {
        return queryFlowAsync(search, mode)
    }
    // FORM
    static queryFormSelecter(search, mode) {
        return queryFormAsync(search, mode)
    }
    // RESPONSE
    static queryResponseSelecter(search, mode) {
        return queryResponseAsync(search, mode)
    }
    // PROJECT
    static queryProjectSelecter(search, mode) {
        return queryProjectAsync(search, mode)
    }
    // USER
    static queryUserSelecter(search, mode) {
        return queryUserAsync(search, mode)
    }

}

module.exports = QueryHelper