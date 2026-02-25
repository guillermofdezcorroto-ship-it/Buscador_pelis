
import * as XLSX from 'xlsx';
import { MovieRecord } from '../types';

/**
 * Helper to process workbook data into MovieRecord array
 */
const processWorkbook = (workbook: XLSX.WorkBook): MovieRecord[] => {
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

  return allMovies;
};

/**
 * Parses an Excel file from a File object.
 */
export const parseExcelFile = async (file: File): Promise<MovieRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        resolve(processWorkbook(workbook));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Fetches and parses an Excel file from a URL.
 */
export const parseExcelFromUrl = async (url: string): Promise<MovieRecord[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Excel file: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);
  const workbook = XLSX.read(data, { type: 'array' });
  return processWorkbook(workbook);
};

/**
 * Search only in Column A records (which are already pre-filtered in parseExcelFile)
 * Returns ALL matches.
 */
export const searchMovieInRecords = (query: string, records: MovieRecord[]): MovieRecord[] => {
  const normalizedQuery = query.toLowerCase().trim();
  return records.filter(r => r.title.toLowerCase().includes(normalizedQuery));
};
