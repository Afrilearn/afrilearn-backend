const getLessons = {
    tags: ["lessons"],
            description: "List of all the lessons",
            responses: {
                200: {
                    description: "Ok",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                example: {
                                    "status": "success",
                                    "data": { 
                                            // name: String, //Primary 1, Jss3
                                            // imageUrl: String,
                                            // // categoryId: int,
                                            // createdAt: Date,
                                            // updatedAt: Date,
                                          
                                    }
                                }
                            }
                        }
                    }
                }
            }
}


const classesRouteDoc = {
    "/lessons":{
        get: getLessons,
    }

};

module.exports = classesRouteDoc;




