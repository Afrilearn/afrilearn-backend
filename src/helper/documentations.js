const swaggerDocumentation = {
    openapi: "3.0.0",
    info : {
        title: "AfriLearn API",
        version: "1.0.0",
        description: "Detail AfriLearn API",
    },

    servers: [
        {
            url: "http://localhost:5000",
            description: "Development Enviroment"
        },
        {
            url: "http://localhost:5000/api/v1",
            description: "Production Enviroment"
        },
    ],

    paths: {
        "/lessons": {
            get: {}
        }
    }
};


module.exports = swaggerDocumentation;