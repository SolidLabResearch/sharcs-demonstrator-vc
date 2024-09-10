const baseUrl = 'http://localhost';
let config = {
    gateway: { baseUrl, port: 8080}
}
// Include key as name in each entry
config = Object.fromEntries(
    Object.entries(config)
        .map(([k,v])=>[k, {name:k, ...v}])
)
export default config
export const urlDerive = `${config.derive.baseUrl}:${config.derive.port}/derive`
