
import React from 'react';
import { FileSpreadsheet, Upload, CheckCircle2 } from 'lucide-react';

interface ExcelLoaderProps {
  onFileLoaded: (file: File) => void;
  isLoaded: boolean;
  fileName?: string;
}

export const ExcelLoader: React.FC<ExcelLoaderProps> = ({ onFileLoaded, isLoaded, fileName }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileLoaded(e.target.files[0]);
    }
  };

  return (
    <div className={`glass-panel p-8 rounded-2xl transition-all duration-500 ${isLoaded ? 'border-green-500/30' : 'border-blue-500/20'}`}>
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full ${isLoaded ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
          {isLoaded ? <CheckCircle2 size={48} /> : <FileSpreadsheet size={48} />}
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">
            {isLoaded ? 'Catálogo Vinculado' : 'Vincular Base de Datos Excel'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {isLoaded ? `Archivo actual: ${fileName}` : 'Selecciona tu archivo de películas para comenzar'}
          </p>
        </div>

        <label className="relative flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl cursor-pointer transition-all active:scale-95 shadow-lg shadow-blue-900/20">
          <Upload size={18} />
          <span>{isLoaded ? 'Cambiar Archivo' : 'Subir Excel'}</span>
          <input 
            type="file" 
            className="hidden" 
            accept=".xlsx, .xls, .csv" 
            onChange={handleFileChange} 
          />
        </label>
        
        {!isLoaded && (
          <p className="text-xs text-slate-500 italic">
            * Nota: Los navegadores no pueden acceder a rutas fijas del disco por seguridad. Selecciona el archivo una vez para indexarlo.
          </p>
        )}
      </div>
    </div>
  );
};
