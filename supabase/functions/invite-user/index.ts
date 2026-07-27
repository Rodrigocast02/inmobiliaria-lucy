import { withSupabase } from 'jsr:@supabase/server@^1'

const productionOrigin = 'https://inmobiliaria-lucy.vercel.app'
const allowedOrigins = new Set([productionOrigin, 'http://localhost:5173'])

export default {
  fetch: withSupabase({ auth: 'user' }, async (request, context) => {
    if (request.method !== 'POST') {
      return Response.json({ error: 'Método no permitido.' }, { status: 405 })
    }

    try {
      const origin = request.headers.get('origin')

      if (origin && !allowedOrigins.has(origin)) {
        return Response.json({ error: 'Origen no permitido.' }, { status: 403 })
      }

      const userId = String(context.userClaims?.id || context.jwtClaims?.sub || '')

      if (!userId) {
        return Response.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
      }

      const { data: caller } = await context.supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (caller?.role !== 'admin') {
        return Response.json(
          { error: 'Solo un administrador puede invitar usuarios.' },
          { status: 403 },
        )
      }

      const body = await request.json()
      const email = String(body.email || '').trim().toLowerCase()
      const role = body.role === 'admin' ? 'admin' : body.role === 'editor' ? 'editor' : null

      if (!email || !email.includes('@') || !role) {
        return Response.json(
          { error: 'Ingresa un correo y un rol válidos.' },
          { status: 400 },
        )
      }

      const redirectOrigin = origin && allowedOrigins.has(origin) ? origin : productionOrigin
      const { data, error: inviteError } = await context.supabaseAdmin.auth.admin
        .inviteUserByEmail(email, {
          redirectTo: `${redirectOrigin}/admin/crear-contrasena`,
        })

      if (inviteError || !data.user) {
        const alreadyRegistered = inviteError?.message.toLowerCase().includes('already')

        return Response.json(
          {
            error: alreadyRegistered
              ? 'Ese correo ya está registrado.'
              : inviteError?.message || 'No se pudo enviar la invitación.',
          },
          { status: alreadyRegistered ? 409 : 400 },
        )
      }

      const { error: profileError } = await context.supabaseAdmin.from('profiles').upsert({
        id: data.user.id,
        email,
        role,
      })

      if (profileError) {
        await context.supabaseAdmin.auth.admin.deleteUser(data.user.id)
        throw profileError
      }

      return Response.json({
        message: `Invitación enviada a ${email}.`,
        user: { id: data.user.id, email, role },
      })
    } catch (error) {
      return Response.json(
        {
          error: error instanceof Error ? error.message : 'Error inesperado.',
        },
        { status: 500 },
      )
    }
  }),
}
