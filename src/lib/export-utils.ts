import * as XLSX from 'xlsx';
import { PivotedItem } from './csv-parser';

export function exportToExcel(
  data: PivotedItem[],
  wmCodes: string[],
  visibleColumns: Record<string, boolean>,
  regions: Record<string, string[]>,
  filename: string = 'inventory-export'
) {
  // Filter only visible warehouse codes
  const visibleWmCodes = wmCodes.filter(code => visibleColumns[code]);
  
  // Prepare data for export
  const exportData = data.map(item => {
    const row: Record<string, string | number> = {
      'Item ID': item.itemId,
      'Description': item.itemDesc,
      'Group': item.group,
    };
    
    // Add quantities for visible warehouses
    visibleWmCodes.forEach(code => {
      row[code] = item.quantities[code] || 0;
    });
    
    // Add summary columns
    row['Total On Hand'] = item.totalQty;
    row['Qty on PO'] = item.totalQtyOnPO;
    row['Qty on SO'] = item.totalQtyOnSO;
    row['Qty Available'] = item.qtyAvailable;
    
    return row;
  });
  
  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);
  
  // Set column widths
  const colWidths = [
    { wch: 15 }, // Item ID
    { wch: 40 }, // Description
    { wch: 15 }, // Group
    ...visibleWmCodes.map(() => ({ wch: 10 })), // Warehouse columns
    { wch: 15 }, // Total On Hand
    { wch: 12 }, // Qty on PO
    { wch: 12 }, // Qty on SO
    { wch: 15 }, // Qty Available
  ];
  ws['!cols'] = colWidths;
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
  
  // Add metadata sheet
  const metadata = [
    ['Export Date', new Date().toLocaleString()],
    ['Total Items', data.length],
    ['Visible Warehouses', visibleWmCodes.join(', ')],
    ['Applied Filters', 'Current view with all active filters']
  ];
  const metaWs = XLSX.utils.aoa_to_sheet(metadata);
  metaWs['!cols'] = [{ wch: 20 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, metaWs, 'Metadata');
  
  // Save file
  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${filename}_${date}.xlsx`);
}