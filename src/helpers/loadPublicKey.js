export const LoadPublicKey = async () => {
    const res = await fetch("/public.pem")
    const key = await res.text()
    return key
}