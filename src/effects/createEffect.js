
export default (type, handle, handleCtx) => (callable, ...args) => ({
    type,
    callable,
    args,
    handle: handle.bind(handleCtx, { callable, args }),
});
