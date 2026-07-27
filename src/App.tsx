import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight, Bath, BedDouble, Building2, Car, Check, ChevronLeft, ChevronRight, Facebook, Home,
  Instagram, KeyRound, LogOut, Mail, MapPin, Menu, MessageCircle, Pencil,
  Maximize2, Plus, Ruler, Search, ShieldCheck, Star, Trash2, Upload, UserPlus, Users, X,
} from 'lucide-react'
import { demoProperties } from './data'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import type { Property } from './types'

const whatsapp = '50230781591'
const whatsappDisplay = '+502 3078-1591'
const contactEmail = 'lucyalarcon.habitia@outlook.com'
const facebookUrl = 'https://www.facebook.com/share/1BaqDSiotR/'
const instagramUrl = 'https://www.instagram.com/habitia.gt?igsh=cjF4b2plYm9lOHY4'

const authLinkParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
const authLinkType = authLinkParams.get('type')
const cameFromPasswordLink = ['invite', 'recovery', 'signup', 'magiclink'].includes(authLinkType || '')
  || authLinkParams.get('error_code') === 'otp_expired'

type UserRole = 'admin' | 'editor'
type AdminSection = 'properties' | 'users'
type Profile = {
  id: string
  email: string
  role: UserRole
  created_at: string
}

function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, search])

  return null
}

function money(property: Property) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency', currency: property.currency, maximumFractionDigits: 0,
  }).format(property.price)
}

function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return <>
    <header className="header">
      <Link className="brand" to="/" onClick={() => setOpen(false)}>
        <img className="brand-logo" src="/habitia-logo.png" alt="Logo de HABITIA Bienes Raíces" />
        <span><strong>HABITIA</strong><small>Bienes Raíces</small></span>
      </Link>
      <button className="menu-button" aria-label="Abrir menú" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      <nav className={open ? 'nav open' : 'nav'}>
        <Link to="/" onClick={() => setOpen(false)}>Inicio</Link>
        <Link to="/propiedades" onClick={() => setOpen(false)}>Propiedades</Link>
        <a href="#nosotros" onClick={() => setOpen(false)}>Nosotros</a>
        <a href="#contacto" onClick={() => setOpen(false)}>Contacto</a>
        <a className="button button-small" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp</a>
      </nav>
    </header>
    <main>{children}</main>
    <Footer />
  </>
}

function Footer() {
  return <footer id="contacto" className="footer">
    <div className="footer-grid">
      <div><div className="brand brand-light"><img className="brand-logo" src="/habitia-logo.png" alt="Logo de HABITIA Bienes Raíces" /><span><strong>HABITIA</strong><small>Bienes Raíces</small></span></div><p>Te acompañamos a encontrar un lugar que se sienta como tuyo.</p></div>
      <div><h4>Explora</h4><Link to="/propiedades">Propiedades</Link><a href="#nosotros">Nosotros</a><Link to="/admin">Administración</Link></div>
      <div><h4>Contacto</h4><a href={`mailto:${contactEmail}`}><Mail size={16} /> {contactEmail}</a><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> {whatsappDisplay}</a><span><MapPin size={16} /> Ciudad de Guatemala</span></div>
      <div><h4>Síguenos</h4><a href={facebookUrl} target="_blank" rel="noreferrer"><Facebook size={17} /> Facebook</a><a href={instagramUrl} target="_blank" rel="noreferrer"><Instagram size={17} /> Instagram</a></div>
    </div>
    <div className="footer-bottom">© {new Date().getFullYear()} HABITIA Bienes Raíces. Todos los derechos reservados.</div>
  </footer>
}

function PropertyCard({ property }: { property: Property }) {
  return <article className="property-card">
    <Link className="property-image" to={`/propiedad/${property.id}`}>
      <img src={property.images[0]} alt={property.title} />
      <span className="operation">{property.operation}</span>
      {property.featured && <span className="featured"><Star size={13} fill="currentColor" /> Destacada</span>}
    </Link>
    <div className="property-body">
      <p className="location"><MapPin size={15} /> {property.zone}, {property.city}</p>
      <h3><Link to={`/propiedad/${property.id}`}>{property.title}</Link></h3>
      <p className="price">{money(property)} {property.operation === 'Renta' && <small>/ mes</small>}</p>
      <div className="features"><span><BedDouble size={17} /> {property.bedrooms}</span><span><Bath size={17} /> {property.bathrooms}</span><span><Ruler size={17} /> {property.area_m2} m²</span></div>
    </div>
  </article>
}

function HomePage({ properties }: { properties: Property[] }) {
  const navigate = useNavigate()
  const [operation, setOperation] = useState('Todas')
  const [city, setCity] = useState('')
  const featured = properties.filter(p => p.published && p.featured).slice(0, 3)
  const submit = (e: React.FormEvent) => { e.preventDefault(); navigate(`/propiedades?operacion=${operation}&ciudad=${encodeURIComponent(city)}`) }
  return <Layout>
    <section className="hero">
      <div className="hero-overlay" />
      <div className="hero-content">
        <span className="eyebrow light">Bienes raíces en Guatemala</span>
        <h1>El lugar donde comienza tu próxima historia.</h1>
        <p>Propiedades seleccionadas y asesoría cercana para comprar, vender o alquilar con confianza.</p>
        <form className="hero-search" onSubmit={submit}>
          <label><span>Quiero</span><select value={operation} onChange={e => setOperation(e.target.value)}><option>Todas</option><option>Venta</option><option>Renta</option></select></label>
          <label><span>Ubicación</span><input value={city} onChange={e => setCity(e.target.value)} placeholder="Ciudad o zona" /></label>
          <button className="button" type="submit"><Search size={18} /> Buscar</button>
        </form>
      </div>
    </section>

    <section className="section">
      <div className="section-heading"><div><span className="eyebrow">Selección especial</span><h2>Propiedades destacadas</h2></div><Link className="text-link" to="/propiedades">Ver todas <ArrowRight size={17} /></Link></div>
      <div className="property-grid">{featured.map(p => <PropertyCard key={p.id} property={p} />)}</div>
    </section>

    <section id="nosotros" className="story section-wide">
      <div className="story-image"><img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=85" alt="Asesora inmobiliaria" /><div className="experience"><strong>Más de 5</strong><span>años de experiencia</span></div></div>
      <div className="story-copy"><span className="eyebrow">Acerca de nosotros</span><h2>Más que propiedades, acompañamos decisiones importantes.</h2><p>Escuchamos lo que necesitas, seleccionamos oportunidades y te guiamos con claridad durante cada etapa del proceso.</p><ul><li><Check /> Atención personal</li><li><Check /> Propiedades verificadas</li><li><Check /> Negociación transparente</li></ul><Link className="button button-dark" to="/propiedades">Conocer propiedades <ChevronRight size={18} /></Link></div>
    </section>

    <section className="benefits section">
      <div className="center-heading"><span className="eyebrow">Una mejor experiencia</span><h2>Tu tranquilidad es parte del trato</h2></div>
      <div className="benefit-grid"><div><span><Home /></span><h3>Selección cuidada</h3><p>Opciones relevantes para tu presupuesto y estilo de vida.</p></div><div><span><ShieldCheck /></span><h3>Proceso seguro</h3><p>Acompañamiento documental y comunicación transparente.</p></div><div><span><KeyRound /></span><h3>De principio a fin</h3><p>Estamos contigo hasta el momento de entregar las llaves.</p></div></div>
    </section>

    <section className="cta"><div><span className="eyebrow light">Hablemos</span><h2>¿Buscas una propiedad especial?</h2><p>Cuéntanos qué necesitas. Podemos ayudarte a encontrarla.</p></div><a className="button button-light" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle size={19} /> Escribir por WhatsApp</a></section>
  </Layout>
}

function ListingsPage({ properties }: { properties: Property[] }) {
  const params = new URLSearchParams(location.search)
  const [operation, setOperation] = useState(params.get('operacion') || 'Todas')
  const [query, setQuery] = useState(params.get('ciudad') || '')
  const filtered = properties.filter(p => p.published && (operation === 'Todas' || p.operation === operation) && `${p.title} ${p.city} ${p.zone} ${p.type}`.toLowerCase().includes(query.toLowerCase()))
  return <Layout><section className="page-hero"><span className="eyebrow light">Encuentra tu espacio</span><h1>Propiedades</h1><p>Explora nuestra selección disponible para venta y alquiler.</p></section><section className="section"><div className="filters"><label><Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por ciudad, zona o tipo" /></label><select value={operation} onChange={e => setOperation(e.target.value)}><option>Todas</option><option>Venta</option><option>Renta</option></select></div><p className="result-count">{filtered.length} propiedades encontradas</p><div className="property-grid">{filtered.map(p => <PropertyCard key={p.id} property={p} />)}</div>{!filtered.length && <div className="empty"><Building2 /><h3>No encontramos resultados</h3><p>Prueba con otros filtros.</p></div>}</section></Layout>
}

function PropertyGallery({ property }: { property: Property }) {
  const [active, setActive] = useState(0)
  const images = property.images.length ? property.images : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=85']
  const show = (index: number) => setActive((index + images.length) % images.length)
  const openFullscreen = () => {
    const gallery = document.querySelector('.detail-gallery')
    if (gallery instanceof HTMLElement) gallery.requestFullscreen?.()
  }

  return <div className="detail-gallery">
    <div className="gallery-stage">
      <img src={images[active]} alt={`${property.title}, fotografía ${active + 1} de ${images.length}`} />
      <span className={`gallery-status ${property.status.toLowerCase()}`}>{property.status}</span>
      <span className="gallery-count">{active + 1} / {images.length}</span>
      <button className="gallery-fullscreen" type="button" aria-label="Ver galería en pantalla completa" onClick={openFullscreen}><Maximize2 /></button>
      {images.length > 1 && <>
        <button className="gallery-arrow gallery-previous" type="button" aria-label="Fotografía anterior" onClick={() => show(active - 1)}><ChevronLeft /></button>
        <button className="gallery-arrow gallery-next" type="button" aria-label="Fotografía siguiente" onClick={() => show(active + 1)}><ChevronRight /></button>
      </>}
    </div>
    {images.length > 1 && <div className="gallery-thumbnails" aria-label="Miniaturas de la propiedad">
      {images.map((image, index) => <button className={index === active ? 'active' : ''} type="button" key={`${image}-${index}`} aria-label={`Ver fotografía ${index + 1}`} aria-current={index === active ? 'true' : undefined} onClick={() => show(index)}><img src={image} alt="" /></button>)}
    </div>}
  </div>
}

function DetailPage({ properties }: { properties: Property[] }) {
  const { id } = useParams()
  const property = properties.find(p => p.id === id)
  if (!property) return <Navigate to="/propiedades" />
  const message = encodeURIComponent(`Hola, me interesa la propiedad: ${property.title}`)
  return <Layout><section className="detail section"><div className="breadcrumbs"><Link to="/">Inicio</Link><ChevronRight size={14} /><Link to="/propiedades">Propiedades</Link><ChevronRight size={14} /><span>{property.title}</span></div><PropertyGallery property={property} /><div className="detail-layout"><article><span className="operation inline">{property.operation}</span><h1>{property.title}</h1><p className="location"><MapPin size={17} /> {property.address}</p><p className="detail-price">{money(property)} {property.operation === 'Renta' && <small>/ mes</small>}</p><div className="detail-features"><div><BedDouble /><strong>{property.bedrooms}</strong><span>Habitaciones</span></div><div><Bath /><strong>{property.bathrooms}</strong><span>Baños</span></div><div><Car /><strong>{property.parking}</strong><span>Parqueos</span></div><div><Ruler /><strong>{property.area_m2}</strong><span>m²</span></div></div><h2>Descripción</h2><p className="description">{property.description}</p></article><aside className="contact-card"><h3>¿Te interesa esta propiedad?</h3><p>Agenda una visita o solicita más información.</p><a className="button" href={`https://wa.me/${whatsapp}?text=${message}`} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Consultar por WhatsApp</a><a className="button button-outline" href={`mailto:${contactEmail}?subject=${encodeURIComponent(property.title)}`}><Mail size={18} /> Enviar correo</a><small>Referencia: {property.id}</small></aside></div></section></Layout>
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!supabase) { onLogin(); navigate('/admin'); return }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Correo o contraseña incorrectos.'); else { onLogin(); navigate('/admin') }
  }
  return <div className="login-page"><Link className="brand" to="/"><img className="brand-logo" src="/habitia-logo.png" alt="Logo de HABITIA Bienes Raíces" /><span><strong>HABITIA</strong><small>Bienes Raíces</small></span></Link><form className="login-card" onSubmit={submit}><span className="login-icon"><KeyRound /></span><h1>Administración</h1><p>Ingresa para gestionar las propiedades y fotografías.</p>{!isSupabaseConfigured && <div className="demo-notice">Modo demostración: usa cualquier correo y contraseña.</div>}<label>Correo electrónico<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@correo.com" /></label><label>Contraseña<input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" /></label>{error && <p className="form-error">{error}</p>}<button className="button" type="submit">Ingresar <ArrowRight size={18} /></button><Link to="/">Volver al sitio</Link></form></div>
}

function PasswordSetupPage() {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirmation) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (!supabase) {
      setError('Supabase todavía no está conectado.')
      return
    }

    setSaving(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSaving(false)

    if (updateError) {
      setError('El enlace no es válido o ya venció. Solicita una nueva invitación.')
      return
    }

    setSaved(true)
    window.setTimeout(() => navigate('/admin'), 900)
  }

  return <div className="login-page"><Link className="brand" to="/"><img className="brand-logo" src="/habitia-logo.png" alt="Logo de HABITIA Bienes Raíces" /><span><strong>HABITIA</strong><small>Bienes Raíces</small></span></Link><form className="login-card" onSubmit={submit}><span className="login-icon"><KeyRound /></span><h1>Crear contraseña</h1><p>Completa tu registro para ingresar al panel de HABITIA.</p><label>Nueva contraseña<input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" /></label><label>Confirmar contraseña<input required minLength={8} type="password" value={confirmation} onChange={e => setConfirmation(e.target.value)} placeholder="Repite tu contraseña" /></label>{error && <p className="form-error">{error}</p>}{saved && <p className="form-success">Contraseña creada. Abriendo el panel…</p>}<button className="button" disabled={saving || saved} type="submit">{saving ? 'Guardando…' : 'Crear contraseña'}</button></form></div>
}

const emptyProperty: Property = { id: '', title: '', description: '', price: 0, currency: 'USD', operation: 'Venta', type: 'Casa', city: 'Ciudad de Guatemala', zone: '', address: '', bedrooms: 1, bathrooms: 1, parking: 1, area_m2: 0, status: 'Disponible', featured: false, published: true, images: [] }

function PropertyForm({ initial, onSave, onCancel }: { initial?: Property; onSave: (p: Property, files: File[]) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState<Property>(initial || emptyProperty)
  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const update = (key: keyof Property, value: unknown) => setForm(prev => ({ ...prev, [key]: value }))
  const removeImage = (image: string) => setForm(prev => ({ ...prev, images: prev.images.filter(item => item !== image) }))
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); await onSave({ ...form, id: form.id || crypto.randomUUID() }, files); setSaving(false) }
  return <form className="admin-form" onSubmit={submit}><div className="form-head"><div><h2>{initial ? 'Editar propiedad' : 'Nueva propiedad'}</h2><p>Completa la información que aparecerá en el catálogo.</p></div><button type="button" className="icon-button" onClick={onCancel}><X /></button></div><div className="form-grid"><label className="span-2">Título<input required value={form.title} onChange={e => update('title', e.target.value)} /></label><label>Operación<select value={form.operation} onChange={e => update('operation', e.target.value)}><option>Venta</option><option>Renta</option></select></label><label>Tipo<select value={form.type} onChange={e => update('type', e.target.value)}><option>Casa</option><option>Apartamento</option><option>Terreno</option><option>Oficina</option><option>Local</option></select></label><label>Precio<input required min="0" type="number" value={form.price} onChange={e => update('price', Number(e.target.value))} /></label><label>Moneda<select value={form.currency} onChange={e => update('currency', e.target.value)}><option>USD</option><option>GTQ</option></select></label><label>Ciudad<input required value={form.city} onChange={e => update('city', e.target.value)} /></label><label>Zona o departamento<input required value={form.zone} onChange={e => update('zone', e.target.value)} /></label><label className="span-2">Dirección pública<input required value={form.address} onChange={e => update('address', e.target.value)} /></label><label>Habitaciones<input min="0" type="number" value={form.bedrooms} onChange={e => update('bedrooms', Number(e.target.value))} /></label><label>Baños<input min="0" type="number" value={form.bathrooms} onChange={e => update('bathrooms', Number(e.target.value))} /></label><label>Parqueos<input min="0" type="number" value={form.parking} onChange={e => update('parking', Number(e.target.value))} /></label><label>Área en m²<input min="0" type="number" value={form.area_m2} onChange={e => update('area_m2', Number(e.target.value))} /></label><label className="span-2">Descripción<textarea required rows={5} value={form.description} onChange={e => update('description', e.target.value)} /></label>{initial && <div className="span-2 current-images"><div><strong>Fotografías publicadas</strong><small>{form.images.length ? 'Puedes eliminar las que ya no quieras mostrar.' : 'Esta publicación no tiene fotografías.'}</small></div>{form.images.length > 0 && <div className="current-images-grid">{form.images.map((image, index) => <figure key={image}><img src={image} alt={`Fotografía publicada ${index + 1}`} /><button type="button" aria-label={`Eliminar fotografía ${index + 1}`} title="Eliminar fotografía" onClick={() => removeImage(image)}><Trash2 /></button>{index === 0 && <span>Portada</span>}</figure>)}</div>}</div>}<label className="span-2 upload"><Upload /><span><strong>Agregar fotografías</strong><small>JPG, PNG o WebP. Puedes seleccionar varias.</small></span><input type="file" accept="image/*" multiple onChange={e => setFiles(Array.from(e.target.files || []))} /></label>{files.length > 0 && <div className="span-2 selected-files"><span>{files.length} fotografías nuevas seleccionadas</span><button type="button" onClick={() => setFiles([])}>Quitar selección</button></div>}<label className="check-label"><input type="checkbox" checked={form.featured} onChange={e => update('featured', e.target.checked)} /> Propiedad destacada</label><label className="check-label"><input type="checkbox" checked={form.published} onChange={e => update('published', e.target.checked)} /> Publicada en el sitio</label></div><div className="form-actions"><button className="button button-outline" type="button" onClick={onCancel}>Cancelar</button><button className="button" disabled={saving} type="submit">{saving ? 'Guardando…' : 'Guardar propiedad'}</button></div></form>
}

function UsersPanel() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentUserId, setCurrentUserId] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('editor')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadProfiles = async () => {
    if (!supabase) {
      setProfiles([])
      setLoading(false)
      return
    }
    const { data, error: profilesError } = await supabase
      .from('profiles')
      .select('id,email,role,created_at')
      .order('created_at', { ascending: true })
    if (!profilesError && data) setProfiles(data as Profile[])
    setLoading(false)
  }

  useEffect(() => {
    loadProfiles()
    supabase?.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || ''))
  }, [])

  const invite = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!supabase) {
      setError('Conecta Supabase para enviar invitaciones.')
      return
    }

    setSending(true)
    const { data, error: inviteError } = await supabase.functions.invoke('invite-user', {
      body: { email: email.trim(), role },
    })
    setSending(false)

    if (inviteError || data?.error) {
      let detail = data?.error || inviteError?.message || 'No se pudo enviar la invitación.'
      if (inviteError && 'context' in inviteError && inviteError.context instanceof Response) {
        const body = await inviteError.context.json().catch(() => null)
        if (body?.error) detail = body.error
      }
      setError(detail)
      return
    }

    setMessage(data?.message || `Invitación enviada a ${email.trim()}.`)
    setEmail('')
    setRole('editor')
    await loadProfiles()
  }

  const deleteUser = async (profile: Profile) => {
    setMessage('')
    setError('')

    if (!supabase || profile.id === currentUserId) return
    if (!window.confirm(`¿Eliminar el acceso de ${profile.email}? Esta acción no se puede deshacer.`)) return

    setDeletingId(profile.id)
    const { data, error: deleteError } = await supabase.functions.invoke('delete-user', {
      body: { userId: profile.id },
    })
    setDeletingId('')

    if (deleteError || data?.error) {
      let detail = data?.error || deleteError?.message || 'No se pudo eliminar el usuario.'
      if (deleteError && 'context' in deleteError && deleteError.context instanceof Response) {
        const body = await deleteError.context.json().catch(() => null)
        if (body?.error) detail = body.error
      }
      setError(detail)
      return
    }

    setProfiles(current => current.filter(item => item.id !== profile.id))
    setMessage(`Se eliminó el acceso de ${profile.email}.`)
  }

  return <><div className="admin-heading"><div><span className="eyebrow">Control de acceso</span><h1>Usuarios</h1><p>Invita administradores o editores al panel.</p></div></div><div className="users-layout"><form className="invite-card" onSubmit={invite}><span className="invite-icon"><UserPlus /></span><h2>Invitar usuario</h2><p>Recibirá un correo para crear su propia contraseña.</p><label>Correo electrónico<input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="usuario@correo.com" /></label><label>Rol<select value={role} onChange={event => setRole(event.target.value as UserRole)}><option value="editor">Editor</option><option value="admin">Administrador</option></select></label><div className="role-help"><strong>{role === 'admin' ? 'Administrador' : 'Editor'}</strong><span>{role === 'admin' ? 'Puede administrar propiedades e invitar usuarios.' : 'Puede administrar propiedades, pero no invitar usuarios.'}</span></div>{error && <p className="form-error">{error}</p>}{message && <p className="form-success">{message}</p>}<button className="button" disabled={sending} type="submit">{sending ? 'Enviando…' : 'Enviar invitación'}</button></form><section className="users-card"><div><h2>Usuarios registrados</h2><p>Personas que tienen acceso al panel.</p></div>{loading ? <p>Cargando usuarios…</p> : <div className="users-list">{profiles.map(profile => <article key={profile.id}><span className="user-avatar">{profile.email.slice(0, 1).toUpperCase()}</span><div><strong>{profile.email}</strong><small>{profile.id === currentUserId ? 'Tu cuenta · ' : ''}Registrado el {new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium' }).format(new Date(profile.created_at))}</small></div><span className={`role-badge ${profile.role}`}>{profile.role === 'admin' ? 'Administrador' : 'Editor'}</span>{profile.id !== currentUserId && <button className="delete-user-button" type="button" aria-label={`Eliminar usuario ${profile.email}`} title="Eliminar usuario" disabled={deletingId === profile.id} onClick={() => deleteUser(profile)}>{deletingId === profile.id ? '…' : <Trash2 />}</button>}</article>)}{!profiles.length && <p>Todavía no hay usuarios registrados.</p>}</div>}</section></div></>
}

function AdminPage({ properties, setProperties, role, onLogout }: { properties: Property[]; setProperties: React.Dispatch<React.SetStateAction<Property[]>>; role: UserRole; onLogout: () => void }) {
  const [editing, setEditing] = useState<Property | null | 'new'>(null)
  const [section, setSection] = useState<AdminSection>('properties')
  const save = async (property: Property, files: File[]) => {
    let images = property.images
    const client = supabase
    const originalImages = editing !== 'new' && editing ? editing.images : []
    const deletedImages = originalImages.filter(image => !property.images.includes(image))
    if (client && files.length) {
      const uploaded = await Promise.all(files.map(async file => {
        const path = `${property.id}/${crypto.randomUUID()}-${file.name.replace(/\s/g, '-')}`
        const { error } = await client.storage.from('property-images').upload(path, file)
        if (error) throw error
        return client.storage.from('property-images').getPublicUrl(path).data.publicUrl
      }))
      images = [...images, ...uploaded]
    } else if (files.length) images = [...images, ...files.map(file => URL.createObjectURL(file))]
    const final = { ...property, images: images.length ? images : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=85'] }
    if (client) {
      const { error } = await client.from('properties').upsert(final)
      if (error) throw error
      const storageMarker = '/storage/v1/object/public/property-images/'
      const storagePaths = deletedImages.flatMap(image => {
        const markerIndex = image.indexOf(storageMarker)
        return markerIndex === -1 ? [] : [decodeURIComponent(image.slice(markerIndex + storageMarker.length))]
      })
      if (storagePaths.length) await client.storage.from('property-images').remove(storagePaths)
    }
    setProperties(prev => prev.some(p => p.id === final.id) ? prev.map(p => p.id === final.id ? final : p) : [final, ...prev]); setEditing(null)
  }
  const remove = async (id: string) => { if (!confirm('¿Eliminar esta propiedad?')) return; if (supabase) await supabase.from('properties').delete().eq('id', id); setProperties(prev => prev.filter(p => p.id !== id)) }
  if (editing) return <div className="admin-shell"><AdminSidebar role={role} section={section} onSectionChange={setSection} onLogout={onLogout} /><main className="admin-main"><PropertyForm initial={editing === 'new' ? undefined : editing} onSave={save} onCancel={() => setEditing(null)} /></main></div>
  if (section === 'users' && role === 'admin') return <div className="admin-shell"><AdminSidebar role={role} section={section} onSectionChange={setSection} onLogout={onLogout} /><main className="admin-main"><UsersPanel /></main></div>
  return <div className="admin-shell"><AdminSidebar role={role} section={section} onSectionChange={setSection} onLogout={onLogout} /><main className="admin-main"><div className="admin-heading"><div><span className="eyebrow">Panel de control</span><h1>Propiedades</h1><p>Administra el contenido visible en el sitio.</p></div><button className="button" onClick={() => setEditing('new')}><Plus size={18} /> Nueva propiedad</button></div>{!isSupabaseConfigured && <div className="admin-demo"><strong>Estás viendo el modo demostración.</strong> Conecta Supabase para guardar cambios permanentemente.</div>}<div className="stats"><div><strong>{properties.length}</strong><span>Total</span></div><div><strong>{properties.filter(p => p.published).length}</strong><span>Publicadas</span></div><div><strong>{properties.filter(p => p.operation === 'Venta').length}</strong><span>En venta</span></div><div><strong>{properties.filter(p => p.operation === 'Renta').length}</strong><span>En renta</span></div></div><div className="admin-table"><div className="table-head"><span>Propiedad</span><span>Operación</span><span>Precio</span><span>Estado</span><span>Acciones</span></div>{properties.map(p => <div className="table-row" key={p.id}><div className="table-property"><img src={p.images[0]} alt="" /><span><strong>{p.title}</strong><small>{p.zone}, {p.city}</small></span></div><span>{p.operation}</span><strong>{money(p)}</strong><span className={p.published ? 'status published' : 'status'}>{p.published ? 'Publicada' : 'Oculta'}</span><div className="table-actions"><button aria-label="Editar" onClick={() => setEditing(p)}><Pencil size={17} /></button><button aria-label="Eliminar" onClick={() => remove(p.id)}><Trash2 size={17} /></button></div></div>)}</div></main></div>
}

function AdminSidebar({ role, section, onSectionChange, onLogout }: { role: UserRole; section: AdminSection; onSectionChange: (section: AdminSection) => void; onLogout: () => void }) { return <aside className="admin-sidebar"><Link className="brand brand-light" to="/"><img className="brand-logo" src="/habitia-logo.png" alt="Logo de HABITIA Bienes Raíces" /><span><strong>HABITIA</strong><small>Administración</small></span></Link><div className="admin-role">{role === 'admin' ? 'Administrador' : 'Editor'}</div><nav><button className={section === 'properties' ? 'active' : ''} onClick={() => onSectionChange('properties')}><Building2 /> Propiedades</button>{role === 'admin' && <button className={section === 'users' ? 'active' : ''} onClick={() => onSectionChange('users')}><Users /> Usuarios</button>}<Link to="/"><Home /> Ver sitio</Link></nav><button onClick={onLogout}><LogOut /> Cerrar sesión</button></aside> }

function App() {
  const navigate = useNavigate()
  const [properties, setProperties] = useState<Property[]>(demoProperties)
  const [authenticated, setAuthenticated] = useState(false)
  const [role, setRole] = useState<UserRole | null>(isSupabaseConfigured ? null : 'admin')
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured)

  const loadRole = async (userId: string) => {
    if (!supabase) {
      setRole('admin')
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
    setRole(data?.role === 'admin' || data?.role === 'editor' ? data.role : null)
  }

  useEffect(() => {
    if (!supabase) {
      setAuthenticated(false)
      setAuthReady(true)
      return
    }
    supabase.auth.getSession().then(async ({ data }) => {
      setAuthenticated(Boolean(data.session))
      if (data.session) {
        await loadRole(data.session.user.id)
        if (cameFromPasswordLink) navigate('/admin/crear-contrasena', { replace: true })
      }
      setAuthReady(true)
    })
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthenticated(Boolean(session))
      if (!session) {
        setRole(null)
        setAuthReady(true)
        return
      }
      if (cameFromPasswordLink || event === 'PASSWORD_RECOVERY') {
        navigate('/admin/crear-contrasena', { replace: true })
      }
      window.setTimeout(async () => {
        await loadRole(session.user.id)
        setAuthReady(true)
      }, 0)
    })
    supabase.from('properties').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (!data?.length) return
      const savedProperties = data as Property[]
      const savedIds = new Set(savedProperties.map(property => property.id))
      setProperties([...savedProperties, ...demoProperties.filter(property => !savedIds.has(property.id))])
    })
    return () => authListener.subscription.unsubscribe()
  }, [])
  const publicProperties = useMemo(() => properties.filter(p => p.status !== 'Vendida' && p.status !== 'Alquilada'), [properties])
  const logout = async () => { if (supabase) await supabase.auth.signOut(); setAuthenticated(false) }
  const adminElement = !authReady
    ? <div className="admin-loading">Cargando panel…</div>
    : authenticated && role
      ? <AdminPage properties={properties} setProperties={setProperties} role={role} onLogout={logout} />
      : authenticated
        ? <div className="login-page"><div className="login-card"><span className="login-icon"><ShieldCheck /></span><h1>Acceso no autorizado</h1><p>Tu cuenta no tiene un rol asignado. Solicita acceso a un administrador.</p><button className="button" onClick={logout}>Cerrar sesión</button></div></div>
        : <Navigate to="/admin/login" />
  return <><ScrollToTop /><Routes><Route path="/" element={<HomePage properties={publicProperties} />} /><Route path="/propiedades" element={<ListingsPage properties={publicProperties} />} /><Route path="/propiedad/:id" element={<DetailPage properties={properties} />} /><Route path="/admin/login" element={<LoginPage onLogin={() => setAuthenticated(true)} />} /><Route path="/admin/crear-contrasena" element={<PasswordSetupPage />} /><Route path="/admin" element={adminElement} /><Route path="*" element={<Navigate to="/" />} /></Routes></>
}

export default App
