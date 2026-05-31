import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export const ReportService = {
  generatePDF(title: string, columns: string[], data: any[][], fileName: string) {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(18)
    doc.text('ERP UNIVERSITARIO', 14, 22)
    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text(title, 14, 30)
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 38)
    
    // Table
    autoTable(doc, {
      startY: 45,
      head: [columns],
      body: data,
      theme: 'grid',
      headStyles: { fillStyle: [37, 99, 235], textColor: 255 },
      alternateRowStyles: { fillStyle: [249, 250, 251] }
    })
    
    doc.save(`${fileName}.pdf`)
  },

  generateExcel(data: any[], fileName: string) {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  }
}
