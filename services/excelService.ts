
import * as XLSX from 'xlsx';
import { MovieRecord } from '../types';

/**
 * Parses an Excel file and extracts a list of movie-like strings from Column A.
 */
export const parseExcelFile = async (file: File): Promise<MovieRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const allMovies: MovieRecord[] = [];

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          // Use header: 1 to get raw arrays (rows)
          const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          jsonData.forEach((row: any[]) => {
            // Column A is index 0
            const columnAValue = row[0];
            
            if (columnAValue !== undefined && columnAValue !== null) {
              const title = String(columnAValue).trim();
              if (title.length > 0) {
                allMovies.push({
                  title: title,
                  // We store the row as an object for display, but could also store as array
                  originalRow: row,
                  sheetName: sheetName
                });
              }
            }
          });
        });

        resolve(allMovies);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Search only in Column A records (which are already pre-filtered in parseExcelFile)
 * Returns ALL matches.
 */
export const searchMovieInRecords = (query: string, records: MovieRecord[]): MovieRecord[] => {
  const normalizedQuery = query.toLowerCase().trim();
  return records.filter(r => r.title.toLowerCase().includes(normalizedQuery));
};
