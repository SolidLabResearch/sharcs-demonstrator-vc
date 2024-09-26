import swaggerJSDoc from 'swagger-jsdoc'
import config from "./config.js";

/**
 * Parameter visible: If true, this server (and its API endpoints) will be visible in the Swagger API Docs.
 * @type {[{server: {description: string, url: string}, visible: boolean, apis: string[]},{server: {description: string, url: string}, visible: boolean},{server: {description: string, url: string}, visible: boolean, apis: string[]}]}
 */
const configRecords = [
  {
    visible: true,
    server: {
      url: `${config.gateway.baseUrl}:${config.gateway.port}`,
      description: 'Gateway service',
    },
    apis: [
      './src/services/gateway.js',
      './src/swagger/components.yaml'
    ]
  },
  {
    visible: false,
    server: {
      url: `${config.derive.baseUrl}:${config.derive.port}`,
      description: 'Deriver service',
    },
    apis: [
      './src/services/deriver.js'
    ]
  },
  {
    visible: false,
    server: {
      url: `${config.registry.baseUrl}:${config.registry.port}`,
      description: 'Registry service',
    },
    apis: [
      './src/services/registry.js'
    ]
  }
]

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SHARCS APIs',
            version: '0.0.2',
            description: 'Documentation for the SHARCS APIs',
            contact: {
                name: 'Gertjan De Mulder',
                url: 'https://data.knows.idlab.ugent.be/person/gertjandm/#me',
                email: 'gertjan.demulder@ugent.be',
            },
        },
        servers: configRecords
          .filter(sr => sr.visible)
          .map(sr => sr.server),
    },
    apis: configRecords
      .filter(sr => sr.visible)
      .flatMap(sr => sr.apis)
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
export default swaggerSpec;
