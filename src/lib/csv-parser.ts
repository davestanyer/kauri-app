export interface InventoryRow {
  GRP: string;
  ITEMID: string;
  ITEMDESC: string;
  WHCode: string;
  WHName: string;
  WHRegion: string;
  Desc3: string;
  ItemOrder1: number;
  ItemOrder2: number;
  ClipBd: string;
  Company: string;
  QtyOnHand: number;
  QtyOnPO: number;
  QtyOnSO: number;
  QtyAvailable: number;
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
        'ItemOrder1', 'ItemOrder2', 
        'QtyOnHand', 'QtyOnPO', 'QtyOnSO', 'QtyAvailable'
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
    const whName = row.WHName || row.WHCode; // Use WHName if available, fallback to WHCode
    
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
    
    // Add lot details for tooltips (simplified for new structure)
    if (!item.lotDetails[whName]) {
      item.lotDetails[whName] = [];
    }
    
    if (row.QtyOnHand > 0) {
      item.lotDetails[whName].push({
        lotId: `${row.ITEMID}-${whName}`,
        qty: row.QtyOnHand,
        firstDate: '',
        latestDate: '',
        cost: 0
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
    item.qtyAvailable += row.QtyAvailable; // Use provided QtyAvailable directly
    item.totalValue += 0; // No cost data available in new structure
  });
  
  // Return the items (QtyAvailable is already calculated above)
  return Array.from(grouped.values());
}

export function getUniqueValues(data: InventoryRow[], field: keyof InventoryRow): string[] {
  return [...new Set(data.map(row => String(row[field])).filter(value => value && value.trim() !== ''))].sort();
}

export function getUniqueWmCodes(data: InventoryRow[]): string[] {
  return getUniqueValues(data, 'WHCode');
}

export function getUniqueWarehouseNames(data: InventoryRow[]): string[] {
  return getUniqueValues(data, 'WHName');
}

export function getWarehouseMapping(data: InventoryRow[]): Map<string, string> {
  const mapping = new Map<string, string>();
  data.forEach(row => {
    if (row.WHCode && row.WHName) {
      mapping.set(row.WHCode, row.WHName);
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