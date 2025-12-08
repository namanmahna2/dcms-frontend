const split = (str, separator) => {
    console.log("incomng str", typeof str)
    if (typeof str === "string" || str instanceof String) {
        const __s = str.split(separator)
        return __s
    } else {
        return []
    }
}


export default {
    split
}