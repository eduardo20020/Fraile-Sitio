/* ==========================================================================
   PRÉSTAMOS EL FRAILE — DATOS DEL SITIO
   --------------------------------------------------------------------------
   Este es el ÚNICO archivo que necesitas editar para cambiar teléfonos,
   WhatsApp, redes sociales, horarios o sucursales.

   Reglas:
   - Escribe el texto entre comillas: "así".
   - Si un dato está vacío ("") el botón correspondiente NO se muestra
     en el sitio. Nunca se publica un número inventado.
   - Teléfonos: solo los 10 dígitos, sin espacios. Ej: "8112345678"
   - WhatsApp: 10 dígitos de México. Ej: "8112345678"
   ========================================================================== */

var CONFIG = {
  nombre: "Préstamos El Fraile",
  ciudad: "García, N.L.",

  // Teléfono general (botón "Llámanos" y respaldo para sucursales sin teléfono propio)
  telefono: "",

  // WhatsApp general (botón flotante y botones de WhatsApp)
  whatsapp: "",
  // Mensaje con el que se abre el chat de WhatsApp
  whatsappMensaje: "Hola, quisiera información sobre un empeño.",

  // Redes sociales (pega la dirección completa, ej: "https://www.facebook.com/elfraile")
  facebook: "",
  instagram: "",

  // Bazar en línea: dirección de la tienda en línea (Facebook Marketplace,
  // página de Facebook, etc.). Si se deja vacío, el botón usa el WhatsApp.
  bazarEnLinea: "",

  // Correo de contacto (opcional)
  correo: "",

  // Número de registro ante PROFECO (Registro Público de Casas de Empeño)
  registroProfeco: "",

  // Aviso de promoción opcional en la parte superior del sitio.
  // Ej: "Gran remate en Bazar El Fraile: 30% de descuento del 1 al 30 de noviembre."
  promocion: "",

  // Horario general (se usa en todas las sucursales salvo que una tenga el suyo)
  //   numeros: días que aplica (0 = domingo, 1 = lunes ... 6 = sábado)
  //   abre / cierra: en formato de 24 horas "HH:MM"
  horario: [
    { dias: "Lunes a sábado", numeros: [1, 2, 3, 4, 5, 6], abre: "08:30", cierra: "20:30" },
    { dias: "Domingo",        numeros: [0],                abre: "09:00", cierra: "18:00" }
  ]
};

/* --------------------------------------------------------------------------
   SUCURSALES
   tipo:      "empeno"        = solo empeño
              "empeno-bazar"  = empeño y bazar
              "bazar"         = solo bazar
   foto:      ruta de la foto (vacío = se muestra una imagen de marca)
   telefono:  teléfono propio de la sucursal (vacío = usa el general)
   mapa:      (opcional) enlace exacto de Google Maps. Si está vacío se busca
              por la dirección automáticamente.
   autos:     true si la sucursal empeña automóviles
   horario:   (opcional) igual que CONFIG.horario, solo si es distinto

   El bazar en línea NO va aquí: se configura arriba en CONFIG.bazarEnLinea.
   -------------------------------------------------------------------------- */

var SUCURSALES = [
  /* ----- Sucursales de empeño (11) ----- */
  {
    nombre: "Lerdo",
    tipo: "empeno-bazar",
    calle: "Lerdo de Tejada #105",
    colonia: "Col. San Martín",
    foto: "img/sucursales/lerdo.jpg",
    telefono: "",
    mapa: "",
    autos: true
  },
  {
    nombre: "Sobrevilla",
    tipo: "empeno",
    calle: "Fray Servando Teresa de Mier #107",
    colonia: "Col. Fomerrey Sobrevilla",
    foto: "img/sucursales/sobrevilla.jpg",
    telefono: "",
    mapa: "",
    autos: true
  },
  {
    nombre: "San José",
    tipo: "empeno-bazar",
    calle: "Antiguo Camino a la Estación #135",
    colonia: "Villa de los Nogales",
    foto: "img/sucursales/san-jose.jpg",
    telefono: "",
    mapa: ""
  },
  {
    nombre: "Sierra Real",
    tipo: "empeno",
    calle: "Sierra de los Andes #115",
    colonia: "Col. Sierra Real",
    foto: "img/sucursales/sierra-real.jpg",
    telefono: "",
    mapa: ""
  },
  {
    nombre: "Priv. Las Villas",
    tipo: "empeno",
    calle: "Av. Las Villas #121",
    colonia: "Col. Priv. Las Villas",
    foto: "img/sucursales/las-villas.jpg",
    telefono: "",
    mapa: ""
  },
  {
    nombre: "Hacienda del Sol",
    tipo: "empeno",
    calle: "Hacienda San Pablo #100",
    colonia: "Col. Hacienda del Sol",
    foto: "img/sucursales/hacienda-del-sol.jpg",
    telefono: "",
    mapa: ""
  },
  {
    nombre: "Héroes",
    tipo: "empeno-bazar",
    calle: "Prolongación Leones #191",
    colonia: "Col. Héroes de Capellanía",
    foto: "img/sucursales/heroes.jpg",
    telefono: "",
    mapa: ""
  },
  {
    nombre: "Bugambilias",
    tipo: "empeno",
    calle: "Camino a los Monteros #304",
    colonia: "Col. Las Bugambilias",
    foto: "",
    telefono: "",
    mapa: ""
  },
  {
    nombre: "La Cruz",
    tipo: "empeno-bazar",
    calle: "Prol. Juárez #303",
    colonia: "Col. La Cruz",
    foto: "img/sucursales/la-cruz.jpg",
    telefono: "",
    mapa: ""
  },
  {
    nombre: "Trueno",
    tipo: "empeno",
    calle: "Trueno #401, Lte. 29, Mz. 98 O",
    colonia: "Col. Ampliación Nogales",
    foto: "img/sucursales/trueno.jpg",
    telefono: "",
    mapa: ""
  },
  {
    nombre: "San Blas",
    tipo: "empeno-bazar",
    calle: "Av. del Hospital #219",
    colonia: "Col. Valle de San Blas",
    foto: "img/sucursales/san-blas.jpg",
    telefono: "",
    mapa: ""
  },

  /* ----- Solo bazar ----- */
  {
    nombre: "Lázaro Cárdenas",
    tipo: "bazar",
    calle: "Lázaro Cárdenas #118",
    colonia: "Col. El Fraile 1er Sector",
    foto: "",
    telefono: "",
    mapa: ""
  },
  {
    nombre: "Polvorín",
    tipo: "bazar",
    calle: "Polvorín #449",
    colonia: "Col. Ampliación Nogales",
    foto: "",
    telefono: "",
    mapa: ""
  }
];
