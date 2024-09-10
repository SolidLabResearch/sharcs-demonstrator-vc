const baseUrl = 'http://localhost';
let config = {
    gateway: { baseUrl, port: 80},
    derive: { baseUrl,  port: 3000 },
    registry: { baseUrl,  port: 4000 }
}
// Include key as name in each entry
config = Object.fromEntries(
    Object.entries(config)
        .map(([k,v])=>[k, {name:k, ...v}])
)
export default config
export const urlDerive = `${config.derive.baseUrl}:${config.derive.port}/derive`
