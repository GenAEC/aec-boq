import ExcelJS from 'exceljs';
import type { BOQProjectFile } from '../types/boq';

export async function exportToExcel(project: BOQProjectFile): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'OpenBOQ Construction Engine';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Master BOQ', {
        views: [{ state: 'frozen', ySplit: 4 }]
    });

    // Title Block
    sheet.mergeCells('A1:G1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = project.metadata.title;
    titleCell.font = { size: 14, bold: true, color: { argb: 'FF0F172A' } };

    sheet.addRow([
        `Revision: ${project.metadata.revision}`,
        '',
        '',
        '',
        `Currency: ${project.metadata.currency}`,
        '',
        `Export Date: ${new Date().toISOString().split('T')[0]}`
    ]);
    sheet.addRow([]);

    // Table Headers
    const headerRow = sheet.addRow([
        'WBS Code',
        'Description',
        'Unit',
        'Quantity',
        'Rate',
        'Amount',
        'Drawing / Spec References'
    ]);

    headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1E293B' } // Slate 800
        };
        cell.alignment = { vertical: 'middle' };
    });

    // Populate Data
    project.items.forEach((item) => {
        const rowNumber = sheet.rowCount + 1;
        const refText = [
            item.references?.drawingNo ? `Dwg: ${item.references.drawingNo}` : '',
            item.references?.specClause ? `Spec: ${item.references.specClause}` : '',
            item.references?.vendorQuote ? `Quote: ${item.references.vendorQuote}` : '',
            item.references?.notes || ''
        ]
            .filter(Boolean)
            .join(' | ');

        if (item.type === 'item') {
            const row = sheet.addRow([
                item.wbsCode,
                item.description,
                item.unit,
                item.quantity,
                item.rate,
                { formula: `D${rowNumber}*E${rowNumber}`, result: item.amount },
                refText
            ]);

            row.getCell(4).numFmt = '#,##0.00';
            row.getCell(5).numFmt = '#,##0.00';
            row.getCell(6).numFmt = '#,##0.00';
            row.getCell(6).font = { bold: true };
        } else {
            // Section header row
            const row = sheet.addRow([item.wbsCode, item.description, '', '', '', item.amount, '']);
            row.font = { bold: true };
            row.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF1F5F9' } // Slate 100
            };
            row.getCell(6).numFmt = '#,##0.00';
        }
    });

    // Set standard column widths
    sheet.columns = [
        { width: 14 },
        { width: 48 },
        { width: 10 },
        { width: 14 },
        { width: 14 },
        { width: 18 },
        { width: 35 }
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
}