export interface InventoryRow {
  GRP: string;
  ITEMID: string;
  ITEMDESC: string;
  wmcode: string;
  Desc3: string;
  LotID: string;
  BestBefore: string;
  OldDesc: string;
  ItemOrder1: number;
  ItemOrder2: number;
  WH_ID: number;
  ClipBd: string;
  WH_Name: string;
  WHRegion: string;
  UCat: string;
  IGroup: number;
  QtyOnHand: number;
  QtyOnPO: number;
  QtyOnSO: number;
  NetAvailable: number;
  ArrivalDT: string;
  TotalWeightOnHand: number;
  TotalWeightOnPO: number;
  TotalWeightOnSO: number;
  AverageCost: number;
  AmountOnHand: number;
  first_date: string;
  latest_date: string;
  Company: string;
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
  quantities: Record<string, number>;  // keyed by WH_Name now
  quantitiesOnPO: Record<string, number>;  // keyed by WH_Name now
  quantitiesOnSO: Record<string, number>;  // keyed by WH_Name now
  lotDetails: Record<string, LotDetail[]>;  // keyed by WH_Name now
  totalQty: number;
  totalQtyOnPO: number;
  totalQtyOnSO: number;
  qtyAvailable: number;
  avgCost: number;
  totalValue: number;
  regions: Record<string, Record<string, number>>;  // region -> WH_Name -> qty
}

export function parseCSV(csvContent: string): InventoryRow[] {
  const lines = csvContent.trim().split(/\r?\n/); // Handle both \n and \r\n line endings
  const headers = parseCSVLine(lines[0]).map(header => header.trim().replace(/\r$/, '')); // Remove carriage returns
  
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: Record<string, string | number> = {};
    
    headers.forEach((header, index) => {
      const value = values[index]?.trim() || '';
      const numericFields = [
        'ItemOrder1', 'ItemOrder2', 'WH_ID', 'IGroup', 
        'QtyOnHand', 'QtyOnPO', 'QtyOnSO', 'NetAvailable',
        'TotalWeightOnHand', 'TotalWeightOnPO', 'TotalWeightOnSO', 
        'AverageCost', 'AmountOnHand'
      ];
      
      if (numericFields.includes(header)) {
        row[header] = value === 'NULL' || value === '' || value === '-1' ? 0 : parseFloat(value);
      } else {
        row[header] = value === 'NULL' ? '' : value;
      }
    });
    
    return row as unknown as InventoryRow;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  // Clean the line first - remove any trailing \r or \n
  const cleanLine = line.replace(/[\r\n]+$/, '');
  
  for (let i = 0; i < cleanLine.length; i++) {
    const char = cleanLine[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Always push the final value
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
        quantitiesOnPO: {},
        quantitiesOnSO: {},
        lotDetails: {},
        totalQty: 0,
        totalQtyOnPO: 0,
        totalQtyOnSO: 0,
        qtyAvailable: 0,
        avgCost: row.AverageCost || 0,
        totalValue: 0,
        regions: {}
      });
    }
    
    const item = grouped.get(key)!;
    const whName = row.WH_Name || row.wmcode; // Use WH_Name if available, fallback to wmcode
    
    // Add quantity on hand by warehouse name
    if (!item.quantities[whName]) {
      item.quantities[whName] = 0;
    }
    item.quantities[whName] += row.QtyOnHand;
    
    // Add quantity on PO by warehouse name
    if (!item.quantitiesOnPO[whName]) {
      item.quantitiesOnPO[whName] = 0;
    }
    item.quantitiesOnPO[whName] += row.QtyOnPO;
    
    // Add quantity on SO by warehouse name
    if (!item.quantitiesOnSO[whName]) {
      item.quantitiesOnSO[whName] = 0;
    }
    item.quantitiesOnSO[whName] += row.QtyOnSO;
    
    // Add lot details for tooltips
    if (!item.lotDetails[whName]) {
      item.lotDetails[whName] = [];
    }
    
    if (row.LotID && row.QtyOnHand > 0) {
      item.lotDetails[whName].push({
        lotId: row.LotID,
        qty: row.QtyOnHand,
        firstDate: row.first_date,
        latestDate: row.latest_date,
        cost: row.AverageCost || 0
      });
    }
    
    // Add to region grouping
    if (!item.regions[row.WHRegion]) {
      item.regions[row.WHRegion] = {};
    }
    if (!item.regions[row.WHRegion][whName]) {
      item.regions[row.WHRegion][whName] = 0;
    }
    item.regions[row.WHRegion][whName] += row.QtyOnHand;
    
    // Update totals
    item.totalQty += row.QtyOnHand;
    item.totalQtyOnPO += row.QtyOnPO;
    item.totalQtyOnSO += row.QtyOnSO;
    item.totalValue += row.AmountOnHand || 0;
  });
  
  // Calculate available quantity for each item
  // Note: QtyOnSO is already negative in the data, so we add it
  const items = Array.from(grouped.values());
  items.forEach(item => {
    item.qtyAvailable = item.totalQty + item.totalQtyOnPO + item.totalQtyOnSO;
  });
  
  return items;
}

export function getUniqueValues(data: InventoryRow[], field: keyof InventoryRow): string[] {
  return [...new Set(data.map(row => String(row[field])).filter(value => value && value.trim() !== ''))].sort();
}

export function getUniqueWmCodes(data: InventoryRow[]): string[] {
  return getUniqueValues(data, 'wmcode');
}

export function getUniqueWarehouseNames(data: InventoryRow[]): string[] {
  return getUniqueValues(data, 'WH_Name');
}

export function getWarehouseMapping(data: InventoryRow[]): Map<string, string> {
  const mapping = new Map<string, string>();
  data.forEach(row => {
    if (row.wmcode && row.WH_Name) {
      mapping.set(row.wmcode, row.WH_Name);
    }
  });
  return mapping;
}

export function getUniqueRegions(data: InventoryRow[]): string[] {
  return getUniqueValues(data, 'WHRegion');
}

export function getUniqueCompanies(data: InventoryRow[]): string[] {
  return getUniqueValues(data, 'Company');
}