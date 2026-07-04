/**
 * Step-by-step guides for obtaining each provider's API key. Content reflects
 * the 2026 provider dashboards (researched), kept in one place so the wizard can
 * render an accurate, guided walkthrough with a direct "open keys page" link.
 */
export type KeyGuide = {
  id: string;
  label: string;
  /** Visible prefix a valid key usually starts with, shown as a hint. */
  keyPrefix?: string;
  /** Direct link to the provider's API-keys page. */
  url: string;
  urlLabel: string;
  steps: string[];
  note?: string;
};

export const AI_PROVIDER_GUIDES: Record<string, KeyGuide> = {
  OPENAI: {
    id: "OPENAI",
    label: "OpenAI",
    keyPrefix: "sk-",
    url: "https://platform.openai.com/api-keys",
    urlLabel: "Abrir OpenAI · API keys",
    steps: [
      "Entrá a platform.openai.com e iniciá sesión (o creá tu cuenta).",
      "Andá a Settings → Billing y agregá un método de pago con crédito (mínimo ~US$5). Sin crédito, la key da error.",
      "Abrí Settings → API keys y tocá «Create new secret key». Nombrala y dejá permisos «All».",
      "Copiá la key (empieza con sk-, se muestra una sola vez) y pegala acá abajo.",
    ],
    note: "La key se muestra una única vez. Si la perdés, generá una nueva.",
  },
  ANTHROPIC: {
    id: "ANTHROPIC",
    label: "Anthropic (Claude)",
    keyPrefix: "sk-ant-",
    url: "https://console.anthropic.com/settings/keys",
    urlLabel: "Abrir Anthropic Console · API keys",
    steps: [
      "Entrá a console.anthropic.com y creá tu cuenta (es separada de claude.ai, aunque uses el mismo email).",
      "Andá a Settings → Billing y cargá créditos (mínimo ~US$5). Es el motivo #1 de errores en keys nuevas.",
      "Abrí API Keys en la barra lateral → «Create Key», nombrala.",
      "Copiá la key (empieza con sk-ant-, se muestra una vez) y pegala acá abajo.",
    ],
  },
  GEMINI: {
    id: "GEMINI",
    label: "Google Gemini",
    keyPrefix: "AIza",
    url: "https://aistudio.google.com/apikey",
    urlLabel: "Abrir Google AI Studio · API keys",
    steps: [
      "Entrá a aistudio.google.com/apikey e iniciá sesión con tu cuenta de Google.",
      "Tocá «Create API key» y elegí «Create API key in new project» (lo más simple).",
      "Copiá la key (empieza con AIza). Tiene un tier gratis para empezar.",
    ],
    note: "Gemini ofrece un tier gratuito; no requiere tarjeta para empezar.",
  },
  OPENROUTER: {
    id: "OPENROUTER",
    label: "OpenRouter",
    keyPrefix: "sk-or-",
    url: "https://openrouter.ai/keys",
    urlLabel: "Abrir OpenRouter · Keys",
    steps: [
      "Entrá a openrouter.ai e iniciá sesión (Google, GitHub o email).",
      "Abrí tu perfil → «Keys» (o andá directo a openrouter.ai/keys).",
      "Tocá «Create Key», nombrala (podés dejar el límite de crédito en blanco).",
      "Copiá la key (empieza con sk-or-, se muestra una vez) y pegala acá abajo.",
    ],
    note: "Tiene modelos gratis que funcionan con saldo en US$0.",
  },
  MINIMAX: {
    id: "MINIMAX",
    label: "MiniMax",
    url: "https://platform.minimax.io/user-center/basic-information/interface-key",
    urlLabel: "Abrir MiniMax · API keys",
    steps: [
      "Entrá a platform.minimax.io e iniciá sesión (o creá tu cuenta).",
      "Andá a User Center → API Keys y tocá «Create new secret key».",
      "Copiá la key (se muestra una sola vez) y pegala acá abajo.",
    ],
    note: "MiniMax usa una API compatible con OpenAI. Si tenés cuenta en minimaxi.com (China), usá ese portal equivalente.",
  },
  GROQ: {
    id: "GROQ",
    label: "Groq",
    keyPrefix: "gsk_",
    url: "https://console.groq.com/keys",
    urlLabel: "Abrir Groq Console · API keys",
    steps: [
      "Entrá a console.groq.com e iniciá sesión (Google, GitHub o email).",
      "Andá a API Keys y tocá «Create API Key», nombrala.",
      "Copiá la key (empieza con gsk_, se muestra una vez) y pegala acá abajo.",
    ],
    note: "Groq tiene un tier gratuito generoso con modelos open-source muy rápidos.",
  },
  MISTRAL: {
    id: "MISTRAL",
    label: "Mistral",
    url: "https://console.mistral.ai/api-keys",
    urlLabel: "Abrir Mistral · La Plateforme · API keys",
    steps: [
      "Entrá a console.mistral.ai y creá tu cuenta.",
      "Activá un plan (hay tier gratis «Experiment») en Billing.",
      "Andá a API Keys → «Create new key», nombrala.",
      "Copiá la key (se muestra una vez) y pegala acá abajo.",
    ],
  },
  DEEPSEEK: {
    id: "DEEPSEEK",
    label: "DeepSeek",
    keyPrefix: "sk-",
    url: "https://platform.deepseek.com/api_keys",
    urlLabel: "Abrir DeepSeek · API keys",
    steps: [
      "Entrá a platform.deepseek.com y creá tu cuenta.",
      "Cargá crédito en Billing (mínimo bajo; los precios son muy económicos).",
      "Andá a API Keys → «Create new API key».",
      "Copiá la key (empieza con sk-, se muestra una vez) y pegala acá abajo.",
    ],
  },
  XAI: {
    id: "XAI",
    label: "xAI (Grok)",
    keyPrefix: "xai-",
    url: "https://console.x.ai",
    urlLabel: "Abrir xAI Console · API keys",
    steps: [
      "Entrá a console.x.ai e iniciá sesión con tu cuenta de X o email.",
      "Andá a API Keys y tocá «Create API key», nombrala.",
      "Copiá la key (empieza con xai-, se muestra una vez) y pegala acá abajo.",
    ],
  },
  TOGETHER: {
    id: "TOGETHER",
    label: "Together AI",
    url: "https://api.together.xyz/settings/api-keys",
    urlLabel: "Abrir Together AI · API keys",
    steps: [
      "Entrá a api.together.xyz y creá tu cuenta (dan crédito inicial gratis).",
      "Andá a Settings → API Keys.",
      "Copiá tu key y pegala acá abajo.",
    ],
  },
  CUSTOM: {
    id: "CUSTOM",
    label: "Otro",
    url: "https://platform.openai.com/docs/api-reference/chat",
    urlLabel: "Formato OpenAI-compatible",
    steps: [
      "Escribí abajo el nombre del servicio (ej: Cerebras, Fireworks, tu propio proxy).",
      "Pegá la URL base del endpoint compatible con OpenAI (ej: https://api.miproveedor.com/v1).",
      "Opcional: indicá el modelo por defecto (ej: llama-3.3-70b).",
      "Conseguí la API key en el panel de tu proveedor y pegala acá abajo.",
    ],
    note: "Funciona con cualquier API compatible con OpenAI Chat Completions (la mayoría de los proveedores modernos lo son).",
  },
};

export const BUFFER_GUIDE: KeyGuide = {
  id: "BUFFER",
  label: "Buffer",
  url: "https://publish.buffer.com/settings/api",
  urlLabel: "Abrir Buffer · Settings → API",
  steps: [
    "Iniciá sesión en publish.buffer.com.",
    "Andá a Settings → API y elegí la pestaña «Personal Keys».",
    "Tocá «+ New Key», nombrala (ej: «Fábrica») y elegí una expiración (de 7 días a 1 año).",
    "Tocá «Generate API Key», copiala (se muestra una vez) y pegala acá abajo.",
  ],
  note: "La key es por usuario y solo la puede generar el dueño (owner) de la organización en Buffer. Después sincronizamos tus canales automáticamente.",
};

export const AI_PROVIDER_ORDER = [
  "OPENAI",
  "ANTHROPIC",
  "GEMINI",
  "OPENROUTER",
  "MINIMAX",
  "GROQ",
  "MISTRAL",
  "DEEPSEEK",
  "XAI",
  "TOGETHER",
  "CUSTOM",
] as const;
