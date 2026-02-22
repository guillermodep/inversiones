// Descriptions for stocks, ETFs, and bonds

interface InstrumentDescription {
  description: string
  type: 'stock' | 'etf' | 'bond'
}

const instrumentDescriptions: Record<string, InstrumentDescription> = {
  // Tech Stocks
  'AAPL': {
    type: 'stock',
    description: 'Apple Inc. es una empresa tecnológica multinacional que diseña, desarrolla y vende electrónica de consumo, software y servicios en línea. Conocida por productos como iPhone, iPad, Mac, Apple Watch y servicios como iCloud y Apple Music.'
  },
  'MSFT': {
    type: 'stock',
    description: 'Microsoft Corporation es una empresa tecnológica líder que desarrolla, licencia y vende software, hardware y servicios. Creadora de Windows, Office 365, Azure (cloud computing), Xbox y LinkedIn.'
  },
  'GOOGL': {
    type: 'stock',
    description: 'Alphabet Inc. es la empresa matriz de Google, el motor de búsqueda más utilizado del mundo. También opera YouTube, Android, Google Cloud, y desarrolla tecnologías de inteligencia artificial y vehículos autónomos (Waymo).'
  },
  'META': {
    type: 'stock',
    description: 'Meta Platforms Inc. (anteriormente Facebook) es una empresa de tecnología y redes sociales. Opera Facebook, Instagram, WhatsApp y está desarrollando el metaverso. Líder en publicidad digital y redes sociales.'
  },
  'NVDA': {
    type: 'stock',
    description: 'NVIDIA Corporation diseña unidades de procesamiento gráfico (GPUs) para gaming, centros de datos, inteligencia artificial y vehículos autónomos. Líder en chips para IA y aprendizaje automático.'
  },
  'AMD': {
    type: 'stock',
    description: 'Advanced Micro Devices Inc. desarrolla procesadores y tarjetas gráficas para computadoras, servidores y consolas de videojuegos. Competidor principal de Intel y NVIDIA en el mercado de semiconductores.'
  },
  'INTC': {
    type: 'stock',
    description: 'Intel Corporation es uno de los mayores fabricantes de semiconductores del mundo. Produce microprocesadores, chipsets y otros componentes para computadoras, servidores y dispositivos IoT.'
  },
  'NFLX': {
    type: 'stock',
    description: 'Netflix Inc. es el servicio de streaming líder mundial, ofreciendo películas, series y documentales por suscripción. Produce contenido original y opera en más de 190 países.'
  },
  'TSLA': {
    type: 'stock',
    description: 'Tesla Inc. diseña, fabrica y vende vehículos eléctricos, sistemas de almacenamiento de energía y paneles solares. Líder en innovación automotriz eléctrica y tecnología de conducción autónoma.'
  },

  // Healthcare & Pharma
  'JNJ': {
    type: 'stock',
    description: 'Johnson & Johnson es una corporación multinacional de dispositivos médicos, farmacéuticos y productos de consumo. Desarrolla medicamentos, vacunas, dispositivos médicos y productos de cuidado personal.'
  },
  'UNH': {
    type: 'stock',
    description: 'UnitedHealth Group es la mayor compañía de seguros de salud de Estados Unidos. Opera UnitedHealthcare (seguros) y Optum (servicios de salud y tecnología médica).'
  },
  'PFE': {
    type: 'stock',
    description: 'Pfizer Inc. es una empresa farmacéutica líder que desarrolla y produce medicamentos y vacunas. Conocida por desarrollar la vacuna COVID-19, Viagra, Lipitor y otros medicamentos importantes.'
  },
  'ABBV': {
    type: 'stock',
    description: 'AbbVie Inc. es una empresa biofarmacéutica que investiga y desarrolla medicamentos avanzados. Conocida por Humira (tratamiento autoinmune) y terapias oncológicas.'
  },

  // Finance
  'JPM': {
    type: 'stock',
    description: 'JPMorgan Chase & Co. es el banco más grande de Estados Unidos. Ofrece banca de inversión, servicios financieros, gestión de activos, banca privada y servicios de tesorería.'
  },
  'BAC': {
    type: 'stock',
    description: 'Bank of America Corporation es uno de los mayores bancos del mundo. Ofrece servicios bancarios, de inversión, gestión de activos y productos financieros para consumidores y empresas.'
  },
  'WFC': {
    type: 'stock',
    description: 'Wells Fargo & Company es un banco multinacional que ofrece servicios bancarios, hipotecas, inversiones y productos financieros para consumidores, pequeñas empresas y corporaciones.'
  },
  'GS': {
    type: 'stock',
    description: 'Goldman Sachs Group Inc. es un banco de inversión líder global. Ofrece banca de inversión, valores, gestión de inversiones y servicios financieros para corporaciones, gobiernos e individuos.'
  },

  // Energy
  'XOM': {
    type: 'stock',
    description: 'Exxon Mobil Corporation es una de las mayores empresas petroleras del mundo. Explora, produce, refina y comercializa petróleo y gas natural. También invierte en energías renovables.'
  },
  'CVX': {
    type: 'stock',
    description: 'Chevron Corporation es una empresa energética multinacional. Participa en exploración, producción y refinación de petróleo y gas, además de productos químicos y energía geotérmica.'
  },

  // Retail & Consumer
  'WMT': {
    type: 'stock',
    description: 'Walmart Inc. es la cadena de tiendas minoristas más grande del mundo. Opera hipermercados, tiendas de descuento y comercio electrónico en múltiples países.'
  },
  'AMZN': {
    type: 'stock',
    description: 'Amazon.com Inc. es líder en comercio electrónico y cloud computing (AWS). Ofrece retail online, streaming (Prime Video), dispositivos (Kindle, Alexa) y servicios de logística.'
  },
  'HD': {
    type: 'stock',
    description: 'The Home Depot Inc. es el mayor minorista de mejoras para el hogar. Vende herramientas, materiales de construcción, electrodomésticos y servicios para proyectos de remodelación.'
  },
  'COST': {
    type: 'stock',
    description: 'Costco Wholesale Corporation opera almacenes de membresía que ofrecen productos a precios bajos. Vende alimentos, electrónica, muebles y otros productos al por mayor.'
  },

  // ETFs - Equity
  'SPY': {
    type: 'etf',
    description: 'SPDR S&P 500 ETF Trust replica el índice S&P 500. Composición: 500 empresas más grandes de EE.UU. incluyendo Apple (7%), Microsoft (6.5%), Amazon, NVIDIA, Google. Sectores principales: Tecnología (28%), Finanzas (13%), Salud (12%). El ETF más líquido del mundo.'
  },
  'QQQ': {
    type: 'etf',
    description: 'Invesco QQQ Trust replica el índice Nasdaq-100. Composición: 100 empresas tecnológicas más grandes incluyendo Apple (11%), Microsoft (9%), Amazon, NVIDIA, Meta, Tesla. Sectores: Tecnología (50%), Consumo Discrecional (15%), Salud (6%). Enfoque en innovación y crecimiento.'
  },
  'VOO': {
    type: 'etf',
    description: 'Vanguard S&P 500 ETF replica el índice S&P 500. Composición similar a SPY: 500 empresas líderes de EE.UU. con Apple, Microsoft, Amazon como principales holdings. Comisiones muy bajas (0.03%). Ideal para inversión pasiva a largo plazo.'
  },
  'VTI': {
    type: 'etf',
    description: 'Vanguard Total Stock Market ETF replica todo el mercado accionario de EE.UU. Composición: ~4,000 acciones incluyendo large, mid y small caps. Diversificación total del mercado estadounidense. Comisiones: 0.03%.'
  },
  'IWM': {
    type: 'etf',
    description: 'iShares Russell 2000 ETF replica el índice Russell 2000. Composición: 2,000 empresas de pequeña capitalización de EE.UU. Mayor volatilidad pero potencial de crecimiento. Sectores: Finanzas (17%), Salud (16%), Industriales (15%).'
  },
  'DIA': {
    type: 'etf',
    description: 'SPDR Dow Jones Industrial Average ETF replica el Dow Jones. Composición: 30 empresas blue-chip estadounidenses incluyendo UnitedHealth, Goldman Sachs, Microsoft, Apple. Ponderado por precio. Empresas establecidas y estables.'
  },

  // ETFs - International
  'EFA': {
    type: 'etf',
    description: 'iShares MSCI EAFE ETF replica mercados desarrollados internacionales. Composición: ~900 empresas de Europa, Asia y Pacífico (excluye EE.UU. y Canadá). Países principales: Japón (23%), Reino Unido (15%), Francia (11%). Diversificación internacional.'
  },
  'EEM': {
    type: 'etf',
    description: 'iShares MSCI Emerging Markets ETF replica mercados emergentes. Composición: ~1,400 empresas de China (30%), India (18%), Taiwán (16%), Brasil, Corea del Sur. Mayor riesgo y potencial de crecimiento. Sectores: Tecnología (20%), Finanzas (20%).'
  },
  'VEA': {
    type: 'etf',
    description: 'Vanguard FTSE Developed Markets ETF replica mercados desarrollados internacionales. Composición: ~4,000 empresas de Europa, Pacífico y Canadá. Países: Japón (20%), Reino Unido (13%), Francia (10%). Comisiones bajas: 0.05%.'
  },

  // ETFs - Sector
  'XLK': {
    type: 'etf',
    description: 'Technology Select Sector SPDR Fund se enfoca en tecnología del S&P 500. Composición: Apple (22%), Microsoft (21%), NVIDIA (13%), Broadcom, Adobe. Empresas de software, semiconductores, hardware y servicios IT.'
  },
  'XLF': {
    type: 'etf',
    description: 'Financial Select Sector SPDR Fund se enfoca en finanzas del S&P 500. Composición: Berkshire Hathaway (13%), JPMorgan (10%), Visa (7%), Bank of America. Bancos, seguros, servicios financieros y gestión de activos.'
  },
  'XLE': {
    type: 'etf',
    description: 'Energy Select Sector SPDR Fund se enfoca en energía del S&P 500. Composición: Exxon Mobil (23%), Chevron (16%), ConocoPhillips (7%). Empresas de petróleo, gas, equipos y servicios energéticos.'
  },
  'XLV': {
    type: 'etf',
    description: 'Health Care Select Sector SPDR Fund se enfoca en salud del S&P 500. Composición: UnitedHealth (10%), Johnson & Johnson (8%), Eli Lilly (7%), AbbVie. Farmacéuticas, biotecnología, equipos médicos y seguros de salud.'
  },

  // Bonds & Fixed Income
  'TLT': {
    type: 'bond',
    description: 'iShares 20+ Year Treasury Bond ETF invierte en bonos del Tesoro de EE.UU. con vencimientos mayores a 20 años. Duración: ~17 años. Rendimiento: ~4.5%. Alta sensibilidad a tasas de interés. Refugio seguro en volatilidad.'
  },
  'IEF': {
    type: 'bond',
    description: 'iShares 7-10 Year Treasury Bond ETF invierte en bonos del Tesoro de EE.UU. con vencimientos de 7-10 años. Duración: ~8 años. Rendimiento: ~4%. Menor volatilidad que TLT. Balance entre rendimiento y estabilidad.'
  },
  'SHY': {
    type: 'bond',
    description: 'iShares 1-3 Year Treasury Bond ETF invierte en bonos del Tesoro de EE.UU. de corto plazo (1-3 años). Duración: ~2 años. Rendimiento: ~4.8%. Baja volatilidad. Ideal para preservación de capital y liquidez.'
  },
  'AGG': {
    type: 'bond',
    description: 'iShares Core U.S. Aggregate Bond ETF replica el mercado de bonos de EE.UU. Composición: Bonos del Tesoro (40%), hipotecarios (27%), corporativos (25%). Duración: ~6 años. Diversificación total de renta fija estadounidense.'
  },
  'BND': {
    type: 'bond',
    description: 'Vanguard Total Bond Market ETF replica todo el mercado de bonos de EE.UU. Composición: ~10,000 bonos incluyendo Tesoro, corporativos, hipotecarios. Duración: ~6.5 años. Comisiones: 0.03%. Diversificación completa de renta fija.'
  },
  'TIP': {
    type: 'bond',
    description: 'iShares TIPS Bond ETF invierte en bonos del Tesoro protegidos contra inflación (TIPS). El principal se ajusta con inflación. Duración: ~7 años. Protección contra aumento de precios. Ideal en entornos inflacionarios.'
  },
  'LQD': {
    type: 'bond',
    description: 'iShares iBoxx $ Investment Grade Corporate Bond ETF invierte en bonos corporativos de grado de inversión. Composición: ~2,000 bonos de empresas sólidas (Apple, Microsoft, AT&T). Duración: ~8 años. Mayor rendimiento que Tesoros con riesgo moderado.'
  },
  'HYG': {
    type: 'bond',
    description: 'iShares iBoxx $ High Yield Corporate Bond ETF invierte en bonos corporativos de alto rendimiento (junk bonds). Mayor riesgo crediticio pero rendimientos ~6-8%. Empresas con calificaciones BB o inferiores. Correlación con acciones.'
  },
}

export function getInstrumentDescription(ticker: string): string {
  const info = instrumentDescriptions[ticker.toUpperCase()]
  if (info) {
    return info.description
  }
  
  // Default descriptions by type
  if (ticker.match(/^(TLT|IEF|SHY|AGG|BND|TIP|LQD|HYG|GOVT|VGSH|VGIT|VGLT)$/i)) {
    return 'Instrumento de renta fija que invierte en bonos del Tesoro o corporativos. Ofrece ingresos predecibles y menor volatilidad que las acciones.'
  }
  
  if (ticker.match(/^(SPY|QQQ|VOO|VTI|IWM|DIA|EFA|EEM|VEA|XLK|XLF|XLE|XLV)$/i)) {
    return 'Fondo cotizado en bolsa (ETF) que replica un índice o sector específico. Ofrece diversificación instantánea y bajas comisiones.'
  }
  
  return 'Instrumento financiero cotizado en bolsa. Consulta análisis detallado para más información sobre su perfil de riesgo y rendimiento.'
}

export function getInstrumentType(ticker: string): 'stock' | 'etf' | 'bond' | 'unknown' {
  const info = instrumentDescriptions[ticker.toUpperCase()]
  if (info) {
    return info.type
  }
  
  // Try to infer from ticker
  if (ticker.match(/^(TLT|IEF|SHY|AGG|BND|TIP|LQD|HYG|GOVT|VGSH|VGIT|VGLT)$/i)) {
    return 'bond'
  }
  
  if (ticker.match(/^(SPY|QQQ|VOO|VTI|IWM|DIA|EFA|EEM|VEA|XLK|XLF|XLE|XLV)$/i)) {
    return 'etf'
  }
  
  return 'stock'
}
