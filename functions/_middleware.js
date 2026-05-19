export async function onRequest(context) {

  const ip =
    context.request.headers.get("CF-Connecting-IP") ||
    "unknown"

  /*
    CHECK BANNED IP
  */

  const banned =
    await context.env.BANNED_IPS.get(ip)

  if (banned) {

    return new Response(
      "Banned",
      {
        status: 403
      }
    )
  }

  /*
    RATE LIMIT
  */

  const key = `rate:${ip}`

  let data =
    await context.env.RATE_LIMITS.get(key)

  data = data
    ? JSON.parse(data)
    : {
        count: 0,
        ts: Date.now()
      }

  const WINDOW = 10000
  const MAX = 30

  if (Date.now() - data.ts > WINDOW) {

    data = {
      count: 0,
      ts: Date.now()
    }
  }

  data.count++

  await context.env.RATE_LIMITS.put(
    key,
    JSON.stringify(data),
    {
      expirationTtl: 60
    }
  )

  /*
    SAVE LIMITED IPS
  */

  if (data.count > MAX) {

    await context.env.RATE_LIMITS.put(
      `limited:${ip}`,
      JSON.stringify({
        ip,
        count: data.count,
        time: Date.now()
      }),
      {
        expirationTtl: 86400
      }
    )

    return new Response(
      "Too many requests",
      {
        status: 429
      }
    )
  }

  return context.next()
}