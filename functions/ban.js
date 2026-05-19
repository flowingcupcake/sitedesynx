export async function onRequestPost(context) {

  const PASSWORD = "METTI_PASSWORD"

  const auth =
    context.request.headers.get("Authorization")

  if (!auth) {

    return new Response(
      "Unauthorized",
      {
        status: 401
      }
    )
  }

  const token =
    auth.replace("Basic ", "")

  const decoded = atob(token)

  const [user, pass] =
    decoded.split(":")

  if (pass !== PASSWORD) {

    return new Response(
      "Unauthorized",
      {
        status: 401
      }
    )
  }

  const form =
    await context.request.formData()

  const ip =
    form.get("ip")

  await context.env.BANNED_IPS.put(
    ip,
    "1"
  )

  return Response.redirect(
    `${new URL(context.request.url).origin}/admin`,
    302
  )
}