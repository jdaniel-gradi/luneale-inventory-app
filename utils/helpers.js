const logStack = (stack, acc = "") => {
    const routes = [];
    for (const el of stack) {
        if (el.route && el.route.path) {
            const fullPath =
                "/" + (acc == "" ? "" : acc.match(/\w{2,}-?\w+/g).join("/")) + el.route.path;
            const methods = el.route.methods;

            routes.push({ fullPath, methods });
        } else if (el.handle.stack) {
            routes.push(...logStack(el.handle.stack, acc + el.regexp.toString()));
        }
    }

    return routes;
};

module.exports = { logStack };
