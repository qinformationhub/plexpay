import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Export data to PDF file
 * @param filename The name of the file without extension
 * @param data The data to export
 */
export function exportToPdf(filename: string, data: any): void {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(45, 55, 72); // Primary color #2D3748
  doc.text(data.title || "Report", 14, 22);
  
  // Add subtitle with date range if available
  if (data.dateRange) {
    doc.setFontSize(12);
    doc.setTextColor(113, 128, 150);
    doc.text(`Period: ${data.dateRange}`, 14, 32);
  }
  
  // Add summary information
  let yPos = 45;
  if (data.totalExpenses) {
    doc.setFontSize(12);
    doc.setTextColor(45, 55, 72);
    doc.text(`Total Expenses: ${data.totalExpenses}`, 14, yPos);
    yPos += 10;
  }
  
  if (data.totalIncome) {
    doc.setFontSize(12);
    doc.setTextColor(45, 55, 72);
    doc.text(`Total Income: ${data.totalIncome}`, 14, yPos);
    yPos += 10;
  }
  
  if (data.netProfit) {
    doc.setFontSize(12);
    doc.setTextColor(45, 55, 72);
    doc.text(`Net Profit: ${data.netProfit}`, 14, yPos);
    yPos += 10;
  }
  
  // Add line
  doc.setDrawColor(226, 232, 240);
  doc.line(14, yPos, 196, yPos);
  yPos += 10;
  
  // Generate table for expenses if available
  if (data.expenses && Array.isArray(data.expenses)) {
    doc.autoTable({
      startY: yPos,
      head: [["Description", "Category", "Date", "Amount"]],
      body: data.expenses.map((expense: any) => [
        expense.description,
        expense.category,
        expense.date,
        expense.amount
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [66, 153, 225], // Secondary color #4299E1
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [247, 250, 252] // Light background #F7FAFC
      }
    });
  }
  
  // Handle payslip content
  if (data.employeeName) {
    doc.setFontSize(16);
    doc.setTextColor(45, 55, 72);
    doc.text("PAYSLIP", 14, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.text(`Employee: ${data.employeeName}`, 14, yPos);
    yPos += 8;
    
    if (data.position) {
      doc.text(`Position: ${data.position}`, 14, yPos);
      yPos += 8;
    }
    
    if (data.payPeriod) {
      doc.text(`Pay Period: ${data.payPeriod}`, 14, yPos);
      yPos += 8;
    }
    
    if (data.processedDate) {
      doc.text(`Processed Date: ${data.processedDate}`, 14, yPos);
      yPos += 12;
    }
    
    // Draw a line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, yPos, 196, yPos);
    yPos += 10;
    
    // Payment details
    if (data.grossAmount) {
      doc.text(`Gross Amount: ${data.grossAmount}`, 14, yPos);
      yPos += 8;
    }
    
    if (data.deductions) {
      doc.text(`Deductions: ${data.deductions}`, 14, yPos);
      yPos += 8;
    }
    
    if (data.netAmount) {
      doc.setFontSize(14);
      doc.setTextColor(72, 187, 120); // Accent color #48BB78
      doc.text(`Net Amount: ${data.netAmount}`, 14, yPos);
    }
  }
  
  // Save the PDF
  doc.save(`${filename}.pdf`);
}

/**
 * Export data to Excel file
 * @param data The data to export as an array of objects
 * @param filename The name of the file without extension
 */
export function exportToExcel(data: any[], filename: string): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  
  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Create blob and save
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  
  // Clean up
  URL.revokeObjectURL(url);
}
