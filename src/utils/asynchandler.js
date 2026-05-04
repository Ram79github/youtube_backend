// This is a utility function that wraps asynchronous route handlers to catch errors and send a standardized error response by async handler function. It takes an asynchronous function (fn) as an argument and returns a new function that executes the original function and handles any errors that may occur during its execution.
//  If an error is caught, it sends a JSON response with the error message and an appropriate HTTP status code.
 const asyncHandler= (requesthandler)=> async (req,res,next) => {
    try {
        await requesthandler(req,res,next);
    } catch (error) {
        res.status(error.code || 500).json({
            success : false,
            message: error.message
        })
    }
    
 }

export {asyncHandler};

 //promise based function that takes an asynchronous function (fn) as an argument and returns a new function that executes the original function and handles any errors that may occur during its execution. If an error is caught, it sends a JSON response with the error message and an appropriate HTTP status code.
//const asyncHandler = (requesthandler) => (req, res, next) => {
 //      Promise.resolve(requesthandler(req, res, next)).catch((error) => next(error));
  //};  }
