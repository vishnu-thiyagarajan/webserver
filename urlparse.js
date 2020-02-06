const urlParse = function (reqObj, routes) {
  const urlPathArray = reqObj.reqPath.split('/').slice(1)
  for (const [key, fn] of routes) {
    const params = {}
    let flag = 0
    const routePathArray = key.split('/').slice(1)
    if (urlPathArray.length === routePathArray.length) {
      for (const index in urlPathArray) {
        if (routePathArray[index] !== urlPathArray[index]) {
          if (!routePathArray[index].startsWith(':')) { flag = 1; break }
          params[routePathArray[index].slice(1)] = urlPathArray[index]
        }
      }
      if (!flag) return { fn: fn, params: params }
    }
  }
}

module.exports = urlParse
