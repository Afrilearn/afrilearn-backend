const authRouteDoc = require("../routes/auth.doc");

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
            description: "Auth routes"
        },
        {
            name: "lessons",
            description: "Lessons routes"
        },
    ],

    paths: { ...authRouteDoc  }
};


module.exports = swaggerDocumentation;
