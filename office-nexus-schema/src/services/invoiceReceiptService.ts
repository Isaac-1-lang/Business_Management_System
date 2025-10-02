export interface InvoiceReceipt {
  id: string;
  transaction_id: string;
  type: 'invoice' | 'receipt';
  number: string;
  party_name: string;
  tin?: string;
  description: string;
  amount: number;
  vat: number;
  total: number;
  attachment_url?: string;
  date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  created_at: string;
  payment_method?: string;
  phone_number?: string;
  momo_reference?: string;
  tax_category?: string;
}

import { apiService } from './apiService';

class InvoiceReceiptService {
  static async createInvoiceReceipt(data: {
    transaction_id: string;
    type: 'invoice' | 'receipt';
    party_name: string;
    tin?: string;
    description: string;
    amount: number;
    vat: number;
    total: number;
    date: string;
    attachment_url?: string;
    invoice_number?: string;
    payment_method?: string;
    phone_number?: string;
    momo_reference?: string;
    tax_category?: string;
  }): Promise<InvoiceReceipt | null> {
    const res = await apiService.createInvoiceReceipt({
      transaction_id: data.transaction_id,
      type: data.type,
      party_name: data.party_name,
      tin: data.tin,
      description: data.description,
      amount: data.amount,
      vat: data.vat,
      total: data.total,
      date: data.date,
      attachment_url: data.attachment_url,
      payment_method: data.payment_method,
      phone_number: data.phone_number,
      momo_reference: data.momo_reference,
      tax_category: data.tax_category
    });
    if (res.success && res.data?.item) return res.data.item as InvoiceReceipt;
    console.error('Failed to create invoice/receipt:', res.error || res.message);
    return null;
  }

  static async getAllInvoiceReceipts(): Promise<InvoiceReceipt[]> {
    const res = await apiService.getInvoiceReceipts();
    if (res.success && res.data?.items) return (res.data.items as InvoiceReceipt[]).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    console.warn('Failed to fetch invoice/receipt records:', res.error || res.message);
    return [];
  }

  static async getInvoiceReceiptsByType(type: 'invoice' | 'receipt'): Promise<InvoiceReceipt[]> {
    const items = await this.getAllInvoiceReceipts();
    return items.filter(item => item.type === type);
  }

  static async getInvoiceReceiptByTransactionId(transactionId: string): Promise<InvoiceReceipt | undefined> {
    const items = await this.getAllInvoiceReceipts();
    return items.find(item => item.transaction_id === transactionId);
  }

  static async updateStatus(id: string, status: InvoiceReceipt['status']): Promise<boolean> {
    const res = await apiService.updateInvoiceStatus(id, status);
    return !!res.success;
  }

  static getSummary() {
    const invoices = this.getInvoiceReceiptsByType('invoice');
    const receipts = this.getInvoiceReceiptsByType('receipt');
    
    return {
      totalInvoices: invoices.length,
      totalReceipts: receipts.length,
      totalSales: invoices.reduce((sum, inv) => sum + inv.total, 0),
      totalPurchases: receipts.reduce((sum, rec) => sum + rec.total, 0),
      outstandingInvoices: invoices.filter(inv => inv.status !== 'paid').length,
      pendingReceipts: receipts.filter(rec => rec.status === 'draft').length
    };
  }

  private static generateInvoiceNumber(_type: 'invoice' | 'receipt'): string { return ''; }

  static async exportToCSV(): Promise<string> {
    const headers = ['Number', 'Type', 'Date', 'Party', 'TIN', 'Amount', 'VAT', 'Total', 'Status', 'Tax Category'];
    const items = await this.getAllInvoiceReceipts();
    const rows = items.map(item => [
      item.number,
      item.type,
      item.date,
      item.party_name,
      item.tin || '',
      item.amount.toString(),
      item.vat.toString(),
      item.total.toString(),
      item.status,
      item.tax_category || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

export default InvoiceReceiptService;
