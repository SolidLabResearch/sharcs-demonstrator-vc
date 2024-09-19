const baseUrl = 'http://localhost';
let config = {
    gateway: { baseUrl, port: 80, logging: {enabled: true, body: false} },
    derive: { baseUrl,  port: 3000, logging: {enabled: true, body: false} },
    registry: { baseUrl,  port: 4000, logging: {enabled: true, body: false} },
}
// Include key as name in each entry
config = Object.fromEntries(
    Object.entries(config)
        .map(([k,v])=>[k, {name:k, ...v}])
)
export default config
export const urlDerive = `${config.derive.baseUrl}:${config.derive.port}/derive`
