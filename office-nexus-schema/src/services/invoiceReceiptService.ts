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

class InvoiceReceiptService {
  private static invoiceReceipts: InvoiceReceipt[] = [];
  private static invoiceCounter = 1;
  private static receiptCounter = 1;

  static createInvoiceReceipt(data: {
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
  }): InvoiceReceipt {
    const invoiceReceipt: InvoiceReceipt = {
      id: `inv-${Date.now()}`,
      transaction_id: data.transaction_id,
      type: data.type,
      number: data.invoice_number || this.generateInvoiceNumber(data.type),
      party_name: data.party_name,
      tin: data.tin,
      description: data.description,
      amount: data.amount,
      vat: data.vat,
      total: data.total,
      attachment_url: data.attachment_url,
      date: data.date,
      status: 'draft',
      created_at: new Date().toISOString(),
      payment_method: data.payment_method,
      phone_number: data.phone_number,
      momo_reference: data.momo_reference,
      tax_category: data.tax_category
    };

    this.invoiceReceipts.push(invoiceReceipt);
    console.log(`Created ${data.type} record: ${invoiceReceipt.number}`);
    
    return invoiceReceipt;
  }

  static getAllInvoiceReceipts(): InvoiceReceipt[] {
    return [...this.invoiceReceipts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  static getInvoiceReceiptsByType(type: 'invoice' | 'receipt'): InvoiceReceipt[] {
    return this.invoiceReceipts.filter(item => item.type === type);
  }

  static getInvoiceReceiptByTransactionId(transactionId: string): InvoiceReceipt | undefined {
    return this.invoiceReceipts.find(item => item.transaction_id === transactionId);
  }

  static updateStatus(id: string, status: InvoiceReceipt['status']): void {
    const invoice = this.invoiceReceipts.find(item => item.id === id);
    if (invoice) {
      invoice.status = status;
      console.log(`Updated ${invoice.type} ${invoice.number} status to: ${status}`);
    }
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

  private static generateInvoiceNumber(type: 'invoice' | 'receipt'): string {
    if (type === 'invoice') {
      const number = `INV-${new Date().getFullYear()}-${String(this.invoiceCounter).padStart(3, '0')}`;
      this.invoiceCounter++;
      return number;
    } else {
      const number = `REC-${new Date().getFullYear()}-${String(this.receiptCounter).padStart(3, '0')}`;
      this.receiptCounter++;
      return number;
    }
  }

  static exportToCSV(): string {
    const headers = ['Number', 'Type', 'Date', 'Party', 'TIN', 'Amount', 'VAT', 'Total', 'Status', 'Tax Category'];
    const rows = this.invoiceReceipts.map(item => [
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
