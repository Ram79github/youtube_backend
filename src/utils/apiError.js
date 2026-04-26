class ApiError extends Error {
    constructor(statuscode,
        message="Something went wrong",
        errors =[],
        stack = ""
    ){
        super(message);
        this.statuscode = statuscode;
        this.errors = errors;
        this.stack = stack;
        this.success= false;
        this.data =null;
     //extra stack trace for debugging purpose not that much imp//
        if(stack){
            this.stack = stack; 
        }
        else{
            Error.captureStackTrace(this, this.constructor);
        }

    }
}
export {ApiError};