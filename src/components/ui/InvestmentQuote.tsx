import { useEffect, useState } from 'react'
import { Quote } from 'lucide-react'

const INVESTMENT_QUOTES = [
  {
    quote: "El precio es lo que pagas. El valor es lo que obtienes.",
    author: "Warren Buffett"
  },
  {
    quote: "La mejor inversión que puedes hacer es en ti mismo.",
    author: "Warren Buffett"
  },
  {
    quote: "El riesgo viene de no saber lo que estás haciendo.",
    author: "Warren Buffett"
  },
  {
    quote: "Sé temeroso cuando otros son codiciosos, y codicioso cuando otros son temerosos.",
    author: "Warren Buffett"
  },
  {
    quote: "En el corto plazo, el mercado es una máquina de votar. En el largo plazo, es una máquina de pesar.",
    author: "Benjamin Graham"
  },
  {
    quote: "El inversor inteligente es un realista que vende a optimistas y compra a pesimistas.",
    author: "Benjamin Graham"
  },
  {
    quote: "La clave del éxito en la inversión es no perder dinero.",
    author: "Charlie Munger"
  },
  {
    quote: "Invierte en negocios que cualquier idiota podría dirigir, porque algún día lo hará un idiota.",
    author: "Peter Lynch"
  },
  {
    quote: "Los mercados pueden permanecer irracionales más tiempo del que tú puedes permanecer solvente.",
    author: "John Maynard Keynes"
  },
  {
    quote: "El tiempo en el mercado supera al timing del mercado.",
    author: "Ken Fisher"
  },
  {
    quote: "La diversificación es la única comida gratis en las inversiones.",
    author: "Harry Markowitz"
  },
  {
    quote: "No pongas todos tus huevos en una sola canasta.",
    author: "Proverbio de inversión"
  },
  {
    quote: "El mercado de valores es un dispositivo para transferir dinero del impaciente al paciente.",
    author: "Warren Buffett"
  },
  {
    quote: "Nunca inviertas en un negocio que no puedas entender.",
    author: "Warren Buffett"
  },
  {
    quote: "La paciencia es la virtud más importante del inversor.",
    author: "Benjamin Graham"
  }
]

interface InvestmentQuoteProps {
  className?: string
  interval?: number // milliseconds to change quote
}

export default function InvestmentQuote({ className = '', interval = 8000 }: InvestmentQuoteProps) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => {
    // Pick random initial quote
    setCurrentQuoteIndex(Math.floor(Math.random() * INVESTMENT_QUOTES.length))
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % INVESTMENT_QUOTES.length)
        setFadeIn(true)
      }, 300)
    }, interval)

    return () => clearInterval(timer)
  }, [interval])

  const currentQuote = INVESTMENT_QUOTES[currentQuoteIndex]

  return (
    <div className={`flex items-start gap-3 p-4 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg ${className}`}>
      <Quote className="text-blue-400 flex-shrink-0 mt-1" size={24} />
      <div className={`transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-gray-200 italic mb-2">"{currentQuote.quote}"</p>
        <p className="text-sm text-blue-400 font-medium">— {currentQuote.author}</p>
      </div>
    </div>
  )
}
