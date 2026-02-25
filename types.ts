
export interface MovieRecord {
  title: string;
  originalRow: any;
  sheetName: string;
}

export interface SearchResult {
  found: boolean;
  movies?: MovieRecord[];
  aiInsights?: string[];
  suggestions?: string[];
}

export interface ExcelData {
  fileName: string;
  movies: MovieRecord[];
  lastUpdated: number;
}
