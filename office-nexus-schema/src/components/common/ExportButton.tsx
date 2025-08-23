
import { useState } from "react";
import { Download, FileText, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import ExcelJS from  'exceljs';
import { jsPDF } from 'jspdf';

interface ExportButtonProps {
  data: any[];
  filename: string;
  title?: string;
  columns?: { key: string; label: string }[];
}

export function ExportButton({ data, filename, title, columns }: ExportButtonProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
  
      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data');
  
      // Add header row
      const headers = columns ? columns.map(col => col.label) : Object.keys(data[0] || {});
      worksheet.addRow(headers);
  
      // Add data rows
      data.forEach(item => {
        const row = columns
          ? columns.map(col => item[col.key] ?? '')
          : Object.values(item);
        worksheet.addRow(row);
      });
  
      // Generate Excel file as Blob
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
  
      toast({
        title: "Export Successful",
        description: `Data exported to ${filename}.xlsx`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Export Failed",
        description: "Failed to export to Excel",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };  

  const exportToPDF = () => {
    try {
      setIsExporting(true);
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Header
      doc.setFontSize(16);
      doc.text(title || filename, pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });
      
      // Table data
      let yPosition = 50;
      const lineHeight = 6;
      
      if (columns && data.length > 0) {
        // Headers
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        let xPosition = 20;
        columns.forEach(col => {
          doc.text(col.label, xPosition, yPosition);
          xPosition += 40;
        });
        
        yPosition += lineHeight;
        doc.setFont(undefined, 'normal');
        
        // Data rows
        data.slice(0, 30).forEach(item => { // Limit to first 30 rows
          xPosition = 20;
          columns.forEach(col => {
            const value = String(item[col.key] || '');
            doc.text(value.substring(0, 15), xPosition, yPosition);  // Truncate long values
            xPosition += 40;
          });
          yPosition += lineHeight;
          
          if (yPosition > 280) { // New page if needed
            doc.addPage();
            yPosition = 20;
          }
        });
      }
      
      doc.save(`${filename}.pdf`);
      
      toast({
        title: "Export Successful",
        description: `Data exported to ${filename}.pdf`
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export to PDF",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToExcel}>
          <File className="w-4 h-4 mr-2" />
          Export to Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="w-4 h-4 mr-2" />
          Export to PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
