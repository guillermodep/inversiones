# 📈 Inversiones - Aplicación de Análisis de Inversiones con IA

Aplicación web completa de análisis y recomendaciones de inversión en acciones con inteligencia artificial.

**Estado:** ✅ **COMPLETADO Y FUNCIONAL**

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

La aplicación estará disponible en `http://localhost:5173`

## 📋 Características Implementadas

✅ **Dashboard Principal** - Resumen de mercado e indicadores clave  
✅ **Análisis de Mercado** - Búsqueda y análisis de acciones  
✅ **Análisis Profundo con IA** - Recomendaciones personalizadas por LLM  
✅ **Gestión de Portfolios** - Múltiples portfolios con seguimiento P&L  
✅ **Constructor de Portfolio con IA** - Creación asistida por IA  
✅ **Screener de Acciones** - Filtros y estrategias predefinidas  
✅ **Importación de Tenencias** - CSV y extracción desde imágenes con IA  
✅ **Configuración de API Keys** - Gestión segura en localStorage

## 🛠️ Stack Tecnológico

- **Frontend:** React 18 + TypeScript + Vite
- **Estilos:** Tailwind CSS (tema oscuro profesional)
- **Gráficos:** Recharts + Lightweight Charts
- **Estado:** Zustand
- **Routing:** React Router DOM
- **Iconos:** Lucide React
- **Almacenamiento:** localStorage para portfolios y configuración

---

## ⚙️ Configuración

### 1. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura tus API keys:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus API keys:

```env
# LLM Configuration (Required for AI analysis)
VITE_LLM_PROVIDER=openai  # or 'anthropic'
VITE_LLM_API_KEY=your_openai_or_anthropic_key_here
VITE_LLM_MODEL=gpt-4o  # or 'claude-sonnet-4-20250514'

# Market Data APIs (Optional)
VITE_ALPHA_VANTAGE_KEY=your_alpha_vantage_key_here
VITE_FMP_KEY=your_fmp_key_here

# News APIs (Optional)
VITE_NEWS_API_KEY=your_newsapi_key_here
VITE_FINNHUB_KEY=your_finnhub_key_here
```

**Dónde obtener las API keys:**
- **OpenAI:** [platform.openai.com](https://platform.openai.com) - Modelo recomendado: `gpt-4o`
- **Anthropic:** [console.anthropic.com](https://console.anthropic.com) - Modelo: `claude-sonnet-4-20250514`
- **Alpha Vantage:** [alphavantage.co](https://www.alphavantage.co) - Free tier disponible
- **NewsAPI:** [newsapi.org](https://newsapi.org) - Free tier disponible
- **Finnhub:** [finnhub.io](https://finnhub.io) - Free tier disponible

**Nota:** La aplicación funciona sin API keys usando datos demo, pero las funcionalidades de IA requieren configurar `VITE_LLM_API_KEY`.

### 2. Uso de la Aplicación

1. **Dashboard:** Vista general del mercado y tus portfolios
2. **Mercado:** Busca y analiza cualquier acción por ticker o nombre
3. **Análisis con IA:** Click en "Analizar con IA" en cualquier acción para obtener recomendaciones
4. **Portfolios:** Crea y gestiona múltiples portfolios con seguimiento en tiempo real
5. **Constructor IA:** Deja que la IA construya un portfolio basado en tus preferencias
6. **Screener:** Encuentra oportunidades usando filtros predefinidos
7. **Importar:** Sube CSV o imágenes de tu broker para importar posiciones

## 📊 APIs Integradas

### Datos de mercado:
- Yahoo Finance API (via yahoo-finance2) — gratuita, sin key
- Alpha Vantage API — free tier disponible
- Financial Modeling Prep API — free tier disponible

### Noticias financieras:
- NewsAPI.org — free tier
- Finnhub.io — free tier incluye noticias por ticker

### LLM para análisis:
- OpenAI GPT-4o
- Anthropic Claude Sonnet 4

---

## MÓDULOS DE LA APLICACIÓN

### 1. DASHBOARD PRINCIPAL
- Resumen del portfolio del usuario
- Indicadores clave del mercado: S&P 500, NASDAQ, DOW, VIX
- Alertas y recomendaciones del día generadas por LLM
- Últimas noticias relevantes para las acciones en cartera
- Widget de "Acción del día" con recomendación Buy/Hold/Sell

### 2. ANÁLISIS DE MERCADO (módulo principal)
Mostrar una tabla + gráfico interactivo con:
- Acciones (stocks), ETFs y Bonos (TLT, IEF, BND como referencia)
- Filtros por: fecha (1D, 1W, 1M, 3M, 6M, 1Y, 5Y, custom), sector, tipo de activo
- Gráfico de velas (candlestick) o línea, switcheable
- Indicadores técnicos opcionales: SMA 20/50/200, RSI, MACD, Bollinger Bands
- Tabla con: ticker, precio actual, cambio %, volumen, market cap, P/E ratio
- Al hacer click en cualquier activo → abrir panel de análisis profundo

### 3. ANÁLISIS PROFUNDO DE UNA ACCIÓN
Al seleccionar un ticker, mostrar:
- Precio histórico con gráfico interactivo y filtro de fechas
- Datos fundamentales: EPS, Revenue, Debt/Equity, Free Cash Flow
- Noticias recientes relacionadas al ticker (últimas 20)
- Eventos próximos: earnings date, dividendos, splits
- Cambios de C-Level executives (obtener de noticias + FMP API)
- Análisis técnico automático (tendencia, soporte, resistencia)
- Sección de RECOMENDACIÓN LLM:
  * Botón "Analizar con IA"
  * El LLM recibe: precio histórico 90 días, noticias recientes, fundamentales,
    cambios ejecutivos, contexto macroeconómico
  * Output estructurado: 
    - Recomendación: COMPRAR / MANTENER / VENDER
    - Confianza: Alta / Media / Baja
    - Precio objetivo a 30/90 días
    - Razones principales (bullets)
    - Riesgos a considerar
    - Horizonte recomendado

### 4. GESTIÓN DE PORTFOLIO
- Crear múltiples portfolios con nombre y objetivo:
  * 🚀 Corto plazo (1-6 meses): alta liquidez, momentum stocks
  * 📈 Largo plazo (5+ años): value investing, dividendos, ETFs
  * 💵 Liquidez inmediata: ETFs de money market, T-Bills, dividendos altos
  * ⚡ Agresivo / Growth: tecnología, small caps, alto riesgo
  * 🛡️ Conservador: bonos, utilities, blue chips

- Para cada portfolio:
  * Agregar posiciones: ticker, cantidad de acciones, precio de compra, fecha
  * Ver P&L (ganancia/pérdida) en tiempo real
  * Distribución por sector (pie chart)
  * Performance histórico vs S&P 500 (benchmark)
  * Botón "Analizar Portfolio con IA" → el LLM evalúa toda la cartera y sugiere
    rebalanceo, qué vender, qué mantener, qué agregar

### 5. CONSTRUCTOR DE PORTFOLIO ASISTIDO POR IA
Wizard de 3 pasos:
1. El usuario responde: presupuesto, horizonte temporal, tolerancia al riesgo,
   sectores de interés, necesidad de liquidez
2. El LLM genera un portfolio sugerido con 5-15 acciones/ETFs con justificación
3. El usuario puede aceptar, modificar y guardar el portfolio sugerido

### 6. IMPORTACIÓN DE TENENCIAS (Upload)
- Subir imagen (JPG/PNG) de estado de cuenta o captura de broker:
  * Usar LLM Vision (GPT-4o o Claude) para extraer los tickers y cantidades
  * Confirmar datos extraídos con el usuario antes de importar
  
- Subir Excel/CSV con columnas: Ticker, Cantidad, Precio_Compra, Fecha:
  * Parser automático con papaparse
  * Detección automática de columnas aunque tengan nombres distintos
  * Preview antes de confirmar importación

- Tras importar: análisis automático completo del portfolio con recomendaciones

### 7. SCREENER DE ACCIONES
Filtros avanzados para descubrir oportunidades:
- Por sector, market cap, P/E ratio, dividend yield, RSI (sobrecomprado/sobrevendido)
- Preset de estrategias: "Value picks", "Momentum", "High Dividend", "Growth"
- Resultados con mini-sparkline de precio
- Botón de análisis rápido IA por cada resultado

### 8. CONFIGURACIÓN (Settings)
- Ingresar y guardar API Keys: LLM (OpenAI/Anthropic), Alpha Vantage, NewsAPI, Finnhub
- Seleccionar LLM preferido y modelo
- Moneda de visualización: USD, EUR, etc.
- Tema: Dark mode / Light mode (default dark, estilo fintech)

---

## DISEÑO Y UX
- Tema oscuro por defecto, estilo Bloomberg/fintech profesional
- Colores: verde para ganancias (#00C805), rojo para pérdidas (#FF3B30), 
  fondo #0D1117, cards #161B22
- Responsive: funciona en desktop y tablet
- Loading skeletons mientras cargan datos
- Tooltips informativos en métricas complejas
- Notificaciones toast para confirmaciones y errores

---

## MANEJO DE ERRORES Y LÍMITES DE API
- Cuando una API free tier alcance su límite, mostrar mensaje claro y sugerir alternativa
- Cache de datos en localStorage por 15 minutos para reducir llamadas a APIs
- Fallback: si falla API primaria, intentar con API secundaria automáticamente
- Modo offline básico mostrando último dato cacheado

---

## ESTRUCTURA DE ARCHIVOS SUGERIDA
src/
├── components/
│   ├── Dashboard/
│   ├── MarketAnalysis/
│   ├── StockDetail/
│   ├── Portfolio/
│   ├── PortfolioBuilder/
│   ├── Screener/
│   ├── Upload/
│   └── Settings/
├── services/
│   ├── marketDataService.ts    # Yahoo Finance, Alpha Vantage
│   ├── newsService.ts          # NewsAPI, Finnhub
│   ├── llmService.ts           # OpenAI / Anthropic
│   └── portfolioService.ts     # CRUD portfolios
├── hooks/
│   ├── useStockData.ts
│   ├── usePortfolio.ts
│   └── useLLMAnalysis.ts
├── store/                      # Zustand para estado global
└── utils/
    ├── cache.ts
    ├── formatters.ts
    └── excelParser.ts

---

## 🚢 Deployment

### Build para Producción

```bash
npm run build
```

Los archivos optimizados estarán en la carpeta `dist/`. Puedes desplegarlos en:
- **Vercel:** `vercel deploy`
- **Netlify:** Arrastra la carpeta `dist` o conecta el repositorio
- **GitHub Pages:** Configura el workflow de GitHub Actions

### Variables de Entorno

Las API keys se configuran mediante variables de entorno en el archivo `.env`. Ver sección de Configuración arriba.

## 📦 Repositorio

```bash
# Clonar repositorio
git clone https://github.com/guillermodep/inversiones.git

# Subir cambios
git add .
git commit -m "Update"
git push origin main
```

## ⚠️ Notas Importantes

1. **Seguridad:** Las API keys se configuran en `.env` (nunca se suben al repositorio gracias a `.gitignore`)
2. **Disclaimer:** Los análisis con IA son orientativos, no constituyen asesoramiento financiero
3. **Rate Limiting:** La aplicación implementa caché de 15 minutos para reducir llamadas a APIs
4. **Fallbacks:** Si una API falla, automáticamente intenta con APIs alternativas
5. **Datos Gratuitos:** Yahoo Finance no requiere API key y es el fallback principal

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.