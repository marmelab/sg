
export default (type, handle) => (...args) => ({
    type,
    handle,
    args,
});
