const httpStatus = require('http-status');

class APIResponse
{
    constructor(message, status = httpStatus.OK, results = Object.assign({}) , isPublic = false) {
        this.code = status;
        this.message = message;
        this.isPublic = isPublic;
        this.results = results;   
    }

    jsonReturn(){
        return {
            code: this.status,
            message: this.isPublic ? this.message : httpStatus[this.status],
            results: this.results
        }
    }
}


module.exports = APIResponse;