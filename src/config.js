const testingSetups = {
    LOCAL: "LOCAL",
    DOCKER: "DOCKER"
}
const testingSetup = testingSetups.LOCAL
const baseUrl = 'http://localhost';
let config = undefined;
switch (testingSetup) {
    case "LOCAL":
        config = {
            derive: { baseUrl,  port: 3000 },
            registry: { baseUrl,  port: 4000 }
        }
        break
    case "DOCKER":
        config = {
            derive: { baseUrl: 'http://deriver',  port: 3000 },
            registry: { baseUrl: 'http://registry',  port: 4000 }
        }
        break;
    default:
        throw new Error(`Unknown testing setup: ${testingSetup}`);
}

export default config
export const urlDerive = `${config.derive.baseUrl}:${config.derive.port}/derive`
