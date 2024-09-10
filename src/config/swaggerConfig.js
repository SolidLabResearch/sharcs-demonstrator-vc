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
                description: 'VC API service',
            }
        ],
    },
    apis: [
        './server.js'
    ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
export default swaggerSpec;
