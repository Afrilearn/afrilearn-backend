const getRoles = {
    tags: ["auth"],
            description: "List of all the roles",
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
                                        "roles": [],
                                        "courses": [],
                                        "students": 0,
                                        "teachers": 0,
                                        "numberOfClassNote": 0,
                                        "numberOfQuizQuestions": 0,
                                        "courseCategories": [],
                                        "allUsers": 0
                                    }
                                }
                            }
                        }
                    }
                }
            }
}

const createUser = {
    tags: ["auth"],
            description: "Create new user",
}

const authRouteDoc = {
    "/auth/roles": {
        get: getRoles,
        post: createUser,
    },
};

module.exports = authRouteDoc;
