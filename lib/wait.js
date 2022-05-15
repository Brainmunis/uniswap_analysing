import util from 'util';

function wait(func, context, ...args) {
    if (func && typeof (func.then) === 'function') {
            return func.apply(context, args).then((data) => {
            return [null, data];
        })
        .catch((err) => [err]);
    }

    if (typeof (func) === 'function') {
        let f = func;
        f = util.promisify(f);
            return func.apply(context, args).then((data) => {
            return [null, data];
        })
        .catch((err) => [err]);
    }
    throw Error('only function and promise is allowed to apply on wait');
}

export default wait ;