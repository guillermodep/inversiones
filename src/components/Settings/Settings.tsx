import Card from '@/components/ui/Card'
import { env, hasLLMConfig, hasMarketDataConfig, hasNewsConfig } from '@/config/env'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function Settings() {
  const StatusIcon = ({ active }: { active: boolean }) => 
    active ? <CheckCircle className="text-green-500" size={20} /> : <XCircle className="text-red-500" size={20} />

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-gray-400 mt-1">Estado de las variables de entorno</p>
      </div>

      <Card className="bg-blue-900/20 border-blue-600">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-400 mt-1" size={24} />
          <div>
            <p className="font-medium text-blue-400 mb-2">Configuración mediante archivo .env</p>
            <p className="text-sm text-gray-300">
              Las API keys se configuran en el archivo <code className="bg-background px-2 py-1 rounded">.env</code> en la raíz del proyecto.
              Copia el archivo <code className="bg-background px-2 py-1 rounded">.env.example</code> y renómbralo a <code className="bg-background px-2 py-1 rounded">.env</code>,
              luego agrega tus API keys.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4">Estado de Configuración LLM</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
            <div>
              <p className="font-medium">Proveedor LLM</p>
              <p className="text-sm text-gray-400">
                {env.llm.provider === 'azure' ? 'Azure OpenAI' : 
                 env.llm.provider === 'openai' ? 'OpenAI Direct' : 'Anthropic Claude'}
              </p>
            </div>
            <StatusIcon active={!!env.llm.provider} />
          </div>
          
          {env.llm.provider === 'azure' && (
            <>
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div>
                  <p className="font-medium">Endpoint Azure</p>
                  <p className="text-sm text-gray-400">{env.llm.azure.endpoint ? 'Configurado' : 'No configurado'}</p>
                </div>
                <StatusIcon active={!!env.llm.azure.endpoint} />
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div>
                  <p className="font-medium">Deployment</p>
                  <p className="text-sm text-gray-400">{env.llm.azure.deployment || 'No configurado'}</p>
                </div>
                <StatusIcon active={!!env.llm.azure.deployment} />
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div>
                  <p className="font-medium">API Key Configurada</p>
                  <p className="text-sm text-gray-400">{env.llm.azure.apiKey ? 'Sí' : 'No configurada'}</p>
                </div>
                <StatusIcon active={!!env.llm.azure.apiKey} />
              </div>
            </>
          )}
          
          {env.llm.provider === 'openai' && (
            <>
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div>
                  <p className="font-medium">API Key Configurada</p>
                  <p className="text-sm text-gray-400">{env.llm.openai.apiKey ? 'Sí' : 'No configurada'}</p>
                </div>
                <StatusIcon active={!!env.llm.openai.apiKey} />
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div>
                  <p className="font-medium">Modelo</p>
                  <p className="text-sm text-gray-400">{env.llm.openai.model || 'No configurado'}</p>
                </div>
                <StatusIcon active={!!env.llm.openai.model} />
              </div>
            </>
          )}
          
          {env.llm.provider === 'anthropic' && (
            <>
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div>
                  <p className="font-medium">API Key Configurada</p>
                  <p className="text-sm text-gray-400">{env.llm.anthropic.apiKey ? 'Sí' : 'No configurada'}</p>
                </div>
                <StatusIcon active={!!env.llm.anthropic.apiKey} />
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div>
                  <p className="font-medium">Modelo</p>
                  <p className="text-sm text-gray-400">{env.llm.anthropic.model || 'No configurado'}</p>
                </div>
                <StatusIcon active={!!env.llm.anthropic.model} />
              </div>
            </>
          )}
        </div>
        {!hasLLMConfig() && (
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
            <p className="text-sm text-yellow-500">
              ⚠️ Se requiere una API key de LLM para usar las funciones de análisis con IA
            </p>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4">APIs de Datos de Mercado</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
            <div>
              <p className="font-medium">Alpha Vantage</p>
              <p className="text-sm text-gray-400">{env.marketData.alphaVantageKey ? 'Configurada' : 'No configurada'}</p>
            </div>
            <StatusIcon active={!!env.marketData.alphaVantageKey} />
          </div>
          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
            <div>
              <p className="font-medium">Financial Modeling Prep</p>
              <p className="text-sm text-gray-400">{env.marketData.fmpKey ? 'Configurada' : 'Usando demo'}</p>
            </div>
            <StatusIcon active={!!env.marketData.fmpKey} />
          </div>
        </div>
        {!hasMarketDataConfig() && (
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
            <p className="text-sm text-blue-400">
              ℹ️ La aplicación funciona sin estas keys usando datos demo y fallbacks gratuitos
            </p>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4">APIs de Noticias</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
            <div>
              <p className="font-medium">NewsAPI</p>
              <p className="text-sm text-gray-400">{env.news.newsApiKey ? 'Configurada' : 'No configurada'}</p>
            </div>
            <StatusIcon active={!!env.news.newsApiKey} />
          </div>
          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
            <div>
              <p className="font-medium">Finnhub</p>
              <p className="text-sm text-gray-400">{env.news.finnhubKey ? 'Configurada' : 'No configurada'}</p>
            </div>
            <StatusIcon active={!!env.news.finnhubKey} />
          </div>
        </div>
        {!hasNewsConfig() && (
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
            <p className="text-sm text-blue-400">
              ℹ️ Opcional - mejora la calidad y cantidad de noticias disponibles
            </p>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4">Cómo Configurar</h2>
        <div className="space-y-3 text-sm text-gray-300">
          <p>1. Copia el archivo <code className="bg-background px-2 py-1 rounded">.env.example</code> a <code className="bg-background px-2 py-1 rounded">.env</code></p>
          <p>2. Edita el archivo <code className="bg-background px-2 py-1 rounded">.env</code> y agrega tus API keys</p>
          <p>3. Reinicia el servidor de desarrollo (<code className="bg-background px-2 py-1 rounded">npm run dev</code>)</p>
          <div className="mt-4 p-3 bg-background rounded-lg">
            <p className="font-medium mb-2">Ejemplo de .env (Azure OpenAI):</p>
            <pre className="text-xs overflow-x-auto">
{`VITE_LLM_PROVIDER=azure
VITE_AZURE_OPENAI_ENDPOINT=https://tu-recurso.openai.azure.com
VITE_AZURE_OPENAI_API_KEY=tu_api_key_aqui
VITE_AZURE_OPENAI_DEPLOYMENT=tu-deployment
VITE_AZURE_OPENAI_API_VERSION=2025-01-01-preview`}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  )
}
