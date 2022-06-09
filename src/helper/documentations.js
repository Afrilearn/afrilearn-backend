
const swaggerDocumentation = {
    openapi: "3.0.0",
    info : {
        title: "AfriLearn API",
        version: "1.0.0",
        description: "Detail AfriLearn API",
    },

    servers: [
        {
            url: "http://localhost:5000/api/v1",
            description: "Development Enviroment"
        },
        {
		url: "https://afrilearn-backend-01.herokuapp.com/api/v1",
            description: "Production Enviroment"
        },
    ],

    tags: [
        {
            name: "auth",
            description: "Lessons routes"
        },
    ],

    paths: {
        "/auth/roles": {
            get: {
                tags: ["auth"],
                description: "List of all the lessons' videos",
                responses: {
                    200: {
                        description: "Ok",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    example: {
                                        count: 0,
                                        lesson: [],
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};


module.exports = swaggerDocumentation;
