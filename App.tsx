
import React, { useState, useEffect } from 'react';
import { ExcelLoader } from './components/ExcelLoader';
import { MovieSearch } from './components/MovieSearch';
import { parseExcelFile, parseExcelFromUrl, searchMovieInRecords } from './services/excelService';
import { getMovieInsights, getSmartSuggestions } from './services/geminiService';
import { MovieRecord, SearchResult } from './types';
import { Film, AlertCircle, Info, Star, Bookmark, Hash, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [movies, setMovies] = useState<MovieRecord[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [autoLoadError, setAutoLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadDefaultExcel = async () => {
      setIsLoading(true);
      try {
        // Attempt to load the default file from the same directory
        // This works for GitHub Pages if the file is in the same folder
        const defaultFileName = 'LISTADO_PELIS.xlsx';
        const records = await parseExcelFromUrl(`./${defaultFileName}`);
        setMovies(records);
        setFileName(defaultFileName);
      } catch (error) {
        console.warn("Could not auto-load LISTADO_PELIS.xlsx", error);
        setAutoLoadError("No se pudo cargar el archivo automático. Por favor, sube uno manualmente.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDefaultExcel();
  }, []);

  const handleFileLoaded = async (file: File) => {
    setIsLoading(true);
    try {
      const records = await parseExcelFile(file);
      setMovies(records);
      setFileName(file.name);
      setResult(null);
    } catch (error) {
      console.error("Error loading file", error);
      alert("Error al procesar el archivo Excel. Asegúrate de que no esté dañado.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setResult(null);

    // 1. Local Search in Excel Data (Column A only via our updated service)
    const matches = searchMovieInRecords(query, movies);

    if (matches.length > 0) {
      // Found matches! Get AI insights for the first one to keep it snappy, or provide general info
      const firstMovieTitle = matches[0].title;
      const insights = await getMovieInsights(firstMovieTitle);
      
      setResult({
        found: true,
        movies: matches,
        aiInsights: [insights]
      });
    } else {
      // Not found. Get smart suggestions
      const suggestions = await getSmartSuggestions(query);
      setResult({
        found: false,
        suggestions: suggestions
      });
    }
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-12">
      <header className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-semibold mb-6 border border-blue-500/20">
          <Film size={16} />
          <span>Buscador de Columnas Especializado</span>
        </div>
        <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4">
          Cine<span className="text-blue-500">Check</span> Pro
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Buscando exclusivamente en la <span className="text-blue-400 font-bold">Columna A</span> de tu Excel.
        </p>
      </header>

      <main className="max-w-4xl mx-auto space-y-12">
        <ExcelLoader 
          onFileLoaded={handleFileLoaded} 
          isLoaded={movies.length > 0} 
          fileName={fileName} 
          isLoading={isLoading}
        />

        {autoLoadError && !movies.length && !isLoading && (
          <div className="flex items-center gap-2 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400 text-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} />
            <span>{autoLoadError}</span>
          </div>
        )}

        <MovieSearch 
          onSearch={handleSearch} 
          isLoading={isSearching} 
          disabled={movies.length === 0} 
        />

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            {result.found ? (
              <>
                <div className="flex items-center justify-between mb-2 px-2">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Hash className="text-blue-500" />
                    Resultados Encontrados ({result.movies?.length})
                  </h2>
                </div>
                
                {result.movies?.map((movie, index) => (
                  <div key={index} className="glass-panel rounded-3xl overflow-hidden shadow-2xl border-white/5 hover:border-blue-500/30 transition-all duration-300">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 flex items-center justify-between border-b border-white/5">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{movie.title}</h3>
                        <span className="inline-block px-2 py-0.5 bg-blue-500/10 rounded-md text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
                          HOJA: {movie.sheetName}
                        </span>
                      </div>
                      <Bookmark className="text-white/20" size={24} />
                    </div>
                    
                    <div className="p-6 space-y-6">
                      {index === 0 && result.aiInsights?.[0] && (
                        <div className="flex gap-4 items-start bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
                          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                            <Star size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-blue-400 mb-1 uppercase tracking-wider">Info Destacada (IA)</h4>
                            <div className="text-slate-300 text-sm leading-relaxed italic">
                              {result.aiInsights[0]}
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Info size={14} />
                          Datos de la Fila Completa
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Array.isArray(movie.originalRow) ? (
                            movie.originalRow.map((val, i) => (
                              <div key={i} className="bg-slate-900/40 p-3 rounded-xl border border-white/5">
                                <span className="text-[10px] text-slate-500 block mb-0.5 font-bold uppercase">Columna {String.fromCharCode(65 + i)}</span>
                                <span className="text-slate-200 text-sm font-medium truncate" title={String(val)}>
                                  {val !== undefined && val !== null ? String(val) : '-'}
                                </span>
                              </div>
                            ))
                          ) : (
                            Object.entries(movie.originalRow || {}).map(([key, value]) => (
                              <div key={key} className="bg-slate-900/40 p-3 rounded-xl border border-white/5">
                                <span className="text-[10px] text-slate-500 block mb-0.5 font-bold uppercase">{key}</span>
                                <span className="text-slate-200 text-sm font-medium truncate" title={String(value)}>
                                  {String(value)}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="glass-panel p-10 rounded-3xl border-orange-500/20 text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-orange-500/10 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No se encontró en la Columna A</h3>
                <p className="text-slate-400 mb-8">
                  No hay coincidencias exactas o parciales en la primera columna del archivo. Quizás te interese:
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {result.suggestions?.map((s, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleSearch(s)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl border border-slate-700 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-20 text-center text-slate-600 text-sm">
        <p>&copy; 2024 CineCheck Excel Pro — Filtro exclusivo por Columna A</p>
      </footer>
    </div>
  );
};

export default App;
