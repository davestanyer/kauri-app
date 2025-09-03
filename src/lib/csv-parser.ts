export interface InventoryRow {
  GRP: string;
  ITEMID: string;
  ITEMDESC: string;
  wmcode: string;
  QTY: number;
  UCat: string;
  WHRegion: string;
  WHName: string;
  AverageCost: number;
  Amount: number;
  LotID: string;
  first_date: string;
  latest_date: string;
}

export interface LotDetail {
  lotId: string;
  qty: number;
  firstDate: string;
  latestDate: string;
  cost: number;
}

export interface PivotedItem {
  itemId: string;
  itemDesc: string;
  group: string;
  category: string;
  quantities: Record<string, number>;
  lotDetails: Record<string, LotDetail[]>;
  totalQty: number;
  avgCost: number;
  totalValue: number;
  regions: Record<string, Record<string, number>>;
}

export function parseCSV(csvContent: string): InventoryRow[] {
  const lines = csvContent.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const row: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index]?.trim() || '';
      if (header === 'QTY' || header === 'AverageCost' || header === 'Amount') {
        row[header] = value === 'NULL' || value === '' ? 0 : parseFloat(value);
      } else {
        row[header] = value === 'NULL' ? '' : value;
      }
    });
    
    return row as InventoryRow;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

export function pivotData(data: InventoryRow[]): PivotedItem[] {
  const grouped = new Map<string, PivotedItem>();
  
  data.forEach(row => {
    const key = `${row.ITEMID}-${row.GRP}`;
    
    if (!grouped.has(key)) {
      grouped.set(key, {
        itemId: row.ITEMID,
        itemDesc: row.ITEMDESC,
        group: row.GRP,
        category: row.UCat,
        quantities: {},
        lotDetails: {},
        totalQty: 0,
        avgCost: row.AverageCost || 0,
        totalValue: 0,
        regions: {}
      });
    }
    
    const item = grouped.get(key)!;
    
    // Add quantity by wmcode
    if (!item.quantities[row.wmcode]) {
      item.quantities[row.wmcode] = 0;
    }
    item.quantities[row.wmcode] += row.QTY;
    
    // Add lot details for tooltips
    if (!item.lotDetails[row.wmcode]) {
      item.lotDetails[row.wmcode] = [];
    }
    
    if (row.LotID && row.QTY > 0) {
      item.lotDetails[row.wmcode].push({
        lotId: row.LotID,
        qty: row.QTY,
        firstDate: row.first_date,
        latestDate: row.latest_date,
        cost: row.AverageCost || 0
      });
    }
    
    // Add to region grouping
    if (!item.regions[row.WHRegion]) {
      item.regions[row.WHRegion] = {};
    }
    if (!item.regions[row.WHRegion][row.wmcode]) {
      item.regions[row.WHRegion][row.wmcode] = 0;
    }
    item.regions[row.WHRegion][row.wmcode] += row.QTY;
    
    // Update totals
    item.totalQty += row.QTY;
    item.totalValue += row.Amount || 0;
  });
  
  return Array.from(grouped.values());
}

export function getUniqueValues(data: InventoryRow[], field: keyof InventoryRow): string[] {
  return [...new Set(data.map(row => String(row[field])).filter(Boolean))].sort();
}

export function getUniqueWmCodes(data: InventoryRow[]): string[] {
  return getUniqueValues(data, 'wmcode');
}

export function getUniqueRegions(data: InventoryRow[]): string[] {
  return getUniqueValues(data, 'WHRegion');
}