export async function onRequest(context) {

  const PASSWORD = "METTI_PASSWORD"

  const auth =
    context.request.headers.get("Authorization")

  if (!auth) {

    return new Response(
      "Unauthorized",
      {
        status: 401,
        headers: {
          "WWW-Authenticate": "Basic"
        }
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

  const limited =
    await context.env.RATE_LIMITS.list({
      prefix: "limited:"
    })

  let rows = ""

  for (const key of limited.keys) {

    const item =
      await context.env.RATE_LIMITS.get(key.name)

    if (!item) continue

    const parsed = JSON.parse(item)

    rows += `
      <tr>

        <td>${parsed.ip}</td>

        <td>${parsed.count}</td>

        <td>

          <form
            method="POST"
            action="/ban"
          >

            <input
              type="hidden"
              name="ip"
              value="${parsed.ip}"
            >

            <button>
              Ban
            </button>

          </form>

        </td>

      </tr>
    `
  }

  return new Response(`

    <html>

    <head>

      <title>DESYNX ADMIN</title>

      <style>

        body{
          background:#0b0b0b;
          color:white;
          font-family:Arial;
          padding:40px;
        }

        table{
          width:100%;
          border-collapse:collapse;
        }

        td,th{
          border:1px solid #222;
          padding:12px;
        }

        button{
          background:red;
          color:white;
          border:none;
          padding:8px 14px;
          cursor:pointer;
        }

      </style>

    </head>

    <body>

      <h1>DESYNX ADMIN PANEL</h1>

      <table>

        <tr>
          <th>IP</th>
          <th>Requests</th>
          <th>Action</th>
        </tr>

        ${rows}

      </table>

    </body>

    </html>

  `, {
    headers: {
      "Content-Type": "text/html"
    }
  })
}