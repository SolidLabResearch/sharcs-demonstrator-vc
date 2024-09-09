import swaggerJSDoc from 'swagger-jsdoc'
import config from "./config.js";
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SHARCS APIs',
            version: '0.0.1',
            description: 'Documentation for the SHARCS APIs',
            contact: {
                name: 'Gertjan De Mulder',
                url: 'https://data.knows.idlab.ugent.be/person/gertjandm/#me',
                email: 'gertjan.demulder@ugent.be',
            },
        },
        servers: [
            {
                url: `${config.gateway.baseUrl}:${config.gateway.port}`,
                description: 'Gateway service',
            },
            {
                url: `${config.derive.baseUrl}:${config.derive.port}`,
                description: 'Deriver service',
            },
            {
                url: `${config.registry.baseUrl}:${config.registry.port}`,
                description: 'Registry service',
            },
        ],
    },
    apis: [
        './src/services/gateway.js',

        // Note: comment this path out to hide backend services in the API docs
        './src/services/*.js',

    ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
export default swaggerSpec;
