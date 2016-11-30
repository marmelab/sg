
export default (type, handle, handleCtx) => (...args) => ({
    type,
    args,
    handle: handle.bind(handleCtx, ...args),
});
