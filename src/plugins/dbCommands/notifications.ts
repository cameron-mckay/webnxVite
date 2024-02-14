import { AxiosInstance } from "axios";

export function getPublicKey(
  http: AxiosInstance
) {
  return new Promise<string>(async (res, rej)=>{
    http.get('/api/notifications/publicKey')
      .then((val)=>{
        res(val.data)
      })
      .catch((err)=>{
        rej(err)
      })
  })
}
