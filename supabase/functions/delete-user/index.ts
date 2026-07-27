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

      const callerId = String(context.userClaims?.id || context.jwtClaims?.sub || '')

      if (!callerId) {
        return Response.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
      }

      const { data: caller } = await context.supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', callerId)
        .single()

      if (caller?.role !== 'admin') {
        return Response.json(
          { error: 'Solo un administrador puede eliminar usuarios.' },
          { status: 403 },
        )
      }

      const body = await request.json()
      const userId = String(body.userId || '')

      if (!userId) {
        return Response.json({ error: 'Selecciona un usuario válido.' }, { status: 400 })
      }

      if (userId === callerId) {
        return Response.json(
          { error: 'No puedes eliminar la cuenta con la que estás conectado.' },
          { status: 400 },
        )
      }

      const { data: target } = await context.supabaseAdmin
        .from('profiles')
        .select('email,role')
        .eq('id', userId)
        .single()

      if (!target) {
        return Response.json({ error: 'El usuario ya no existe.' }, { status: 404 })
      }

      if (target.role === 'admin') {
        const { count } = await context.supabaseAdmin
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'admin')

        if ((count || 0) <= 1) {
          return Response.json(
            { error: 'No se puede eliminar al último administrador.' },
            { status: 400 },
          )
        }
      }

      const { error: deleteError } = await context.supabaseAdmin.auth.admin.deleteUser(userId)

      if (deleteError) throw deleteError

      return Response.json({
        message: `Se eliminó el acceso de ${target.email}.`,
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
