# Inmobiliaria Lucy

Sitio inmobiliario completo con catálogo público, páginas de detalle, búsqueda y panel administrativo. El proyecto funciona inmediatamente en modo demostración y queda listo para conectarse con Supabase.

## Funciones incluidas

- Inicio adaptable a computadora, tableta y celular.
- Catálogo con búsqueda y filtro por venta o renta.
- Detalle de cada propiedad y contacto por WhatsApp o correo.
- Inicio de sesión administrativo con Supabase Auth.
- Creación, edición y eliminación de propiedades.
- Publicar u ocultar propiedades y marcar propiedades destacadas.
- Carga múltiple de fotografías a Supabase Storage.
- PostgreSQL con políticas de seguridad RLS.

## Ejecutar localmente

Necesitas Node.js 20 o superior.

```bash
npm install
cp .env.example .env
npm run dev
```

Sin variables válidas de Supabase, el sitio usa propiedades de demostración. La ruta del panel es `/admin` y en ese modo acepta cualquier correo y contraseña.

## Conectar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Abre **SQL Editor**, copia `supabase/schema.sql` y ejecútalo.
3. En **Authentication > Users**, crea el usuario que administrará el sitio.
4. En **Project Settings > API**, copia la URL y la clave pública `anon`.
5. Crea un archivo `.env` con:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publica
VITE_WHATSAPP_NUMBER=50255555555
VITE_CONTACT_EMAIL=ventas@inmobiliarialucy.com
```

No publiques la contraseña del administrador ni una clave `service_role`. El archivo `.env` está excluido de Git.

## Publicar desde GitHub

### Vercel

1. Importa el repositorio desde Vercel.
2. Selecciona Vite; el comando de compilación es `npm run build` y la salida es `dist`.
3. Agrega las cuatro variables del archivo `.env` en la configuración del proyecto.
4. Publica.

### Netlify

Usa `npm run build` como comando y `dist` como directorio de publicación. Agrega también las variables de entorno.

## Personalización

Los textos, datos de contacto y propiedades iniciales se encuentran en `src/App.tsx` y `src/data.ts`. Los colores y estilos están en `src/styles.css`.
