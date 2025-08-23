import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import UniversalTransactionHandler from "@/services/universalTransactionHandler";
import TaxCategoryService from "@/services/taxCategoryService";

interface UniversalTransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UniversalTransactionForm({ open, onClose, onSuccess }: UniversalTransactionFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    payment_method: '',
    payment_status: 'paid',
    paid_amount: '',
    due_date: '',
    party_name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    supplier: '',
    client: '',
    income_source: '',
    tax_category: '',
    // Invoice-specific fields
    invoice_number: '',
    tin: '',
    // Mobile money specific fields
    phone_number: '',
    momo_reference: '',
    // Capital/Equity specific fields
    shareholder_name: '',
    shareholder_id: '',
    shares_allocated: '',
    par_value: '1000',
    adjustment_type: '',
    from_account: '',
    to_account: ''
  });

  const isCapitalTransaction = ['capital_contribution', 'capital_withdrawal', 'share_issuance', 'dividend_declaration', 'dividend_payment', 'equity_adjustment'].includes(formData.type);
  const showInvoiceFields = formData.type === 'sale' || formData.type === 'purchase';
  const showMobileMoneyFields = formData.payment_method === 'mobile_money';
  const showIncomeSourceField = formData.type === 'sale' || formData.type === 'income';
  const showTaxCategoryField = formData.type === 'expense' || formData.type === 'purchase';
  const showShareholderFields = ['capital_contribution', 'capital_withdrawal', 'share_issuance', 'dividend_payment'].includes(formData.type);
  const showEquityAdjustmentFields = formData.type === 'equity_adjustment';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.amount || !formData.payment_method || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Additional validation for capital transactions
    if (showShareholderFields && !formData.shareholder_name) {
      toast({
        title: "Validation Error",
        description: "Shareholder name is required for capital transactions",
        variant: "destructive"
      });
      return;
    }

    // Validate income source for income transactions
    if (showIncomeSourceField && !formData.income_source) {
      toast({
        title: "Validation Error",
        description: "Please select an income source",
        variant: "destructive"
      });
      return;
    }

    // Validate tax category for expense transactions
    if (showTaxCategoryField && !formData.tax_category) {
      toast({
        title: "Validation Error",
        description: "Please select a tax category for proper compliance",
        variant: "destructive"
      });
      return;
    }

    // Validate mobile money fields if mobile money is selected
    if (showMobileMoneyFields && (!formData.phone_number || !formData.momo_reference)) {
      toast({
        title: "Validation Error",
        description: "Phone number and transaction reference are required for mobile money payments",
        variant: "destructive"
      });
      return;
    }

    try {
      // Determine party name based on transaction type
      const partyName = formData.type === 'sale' ? formData.client : 
                       formData.type === 'purchase' ? formData.supplier : 
                       formData.type === 'capital_contribution' ? formData.shareholder_name :
                       formData.party_name;

      const response = await UniversalTransactionHandler.processTransaction({
        type: formData.type as any,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        payment_method: formData.payment_method as any,
        payment_status: formData.payment_status as any,
        paid_amount: formData.payment_status === 'partially_paid' ? parseFloat(formData.paid_amount || '0') : 
                    formData.payment_status === 'paid' ? parseFloat(formData.amount) : 0,
        due_date: formData.payment_status !== 'paid' ? formData.due_date : undefined,
        party_name: partyName,
        reference_number: formData.reference || undefined,
        supporting_documents: [],
        additional_data: {
          supplier: formData.supplier || undefined,
          client: formData.client || undefined,
          income_source: formData.income_source || undefined,
          tax_category: formData.tax_category || undefined,
          invoice_number: formData.invoice_number || undefined,
          tin: formData.tin || undefined,
          phone_number: formData.phone_number || undefined,
          momo_reference: formData.momo_reference || undefined,
          // Capital/Equity specific fields
          shareholder_name: formData.shareholder_name || undefined,
          shareholder_id: formData.shareholder_id || `SH-${Date.now()}`,
          shares_allocated: parseFloat(formData.shares_allocated || '0'),
          par_value: parseFloat(formData.par_value || '1000'),
          adjustment_type: formData.adjustment_type || undefined,
          from_account: formData.from_account || undefined,
          to_account: formData.to_account || undefined
        }
      });

      if (response.success) {
        toast({
          title: "Transaction Processed Successfully",
          description: `Transaction posted to accounting books with ${response.accounting_entries.length} journal entries`
        });
        
        // Reset form
        setFormData({
          type: '',
          amount: '',
          payment_method: '',
          payment_status: 'paid',
          paid_amount: '',
          due_date: '',
          party_name: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          reference: '',
          supplier: '',
          client: '',
          income_source: '',
          tax_category: '',
          invoice_number: '',
          tin: '',
          phone_number: '',
          momo_reference: '',
          shareholder_name: '',
          shareholder_id: '',
          shares_allocated: '',
          par_value: '1000',
          adjustment_type: '',
          from_account: '',
          to_account: ''
        });
        
        onSuccess();
        onClose();
      } else {
        toast({
          title: "Transaction Failed",
          description: response.errors?.join(', ') || "Failed to process transaction",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post transaction",
        variant: "destructive"
      });
    }
  };

  const selectedTaxCategory = TaxCategoryService.getCategory(formData.tax_category);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Universal Transaction Entry</DialogTitle>
          <p className="text-sm text-gray-600">
            Single entry system - automatically posts to all relevant books and registers
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Transaction Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">🛒 Sale/Revenue</SelectItem>
                  <SelectItem value="income">💰 Other Income</SelectItem>
                  <SelectItem value="purchase">📦 Purchase</SelectItem>
                  <SelectItem value="expense">💸 General Expense</SelectItem>
                  <SelectItem value="salary">👥 Salary Payment</SelectItem>
                  <SelectItem value="asset_acquisition">🏢 Asset Purchase</SelectItem>
                  <SelectItem value="transfer">🔄 Account Transfer</SelectItem>
                  {/* Capital & Equity Transactions */}
                  <SelectItem value="capital_contribution">🏦 Capital Contribution</SelectItem>
                  <SelectItem value="capital_withdrawal">💸 Capital Withdrawal</SelectItem>
                  <SelectItem value="share_issuance">📈 Share Issuance</SelectItem>
                  <SelectItem value="dividend_declaration">💰 Dividend Declaration</SelectItem>
                  <SelectItem value="dividend_payment">💳 Dividend Payment</SelectItem>
                  <SelectItem value="equity_adjustment">⚖️ Equity Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount (RWF) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="Enter amount"
              />
            </div>

            <div>
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select value={formData.payment_method} onValueChange={(value) => setFormData({...formData, payment_method: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">💵 Cash</SelectItem>
                  <SelectItem value="bank">🏦 Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">📱 Mobile Money</SelectItem>
                  <SelectItem value="card">💳 Credit/Debit Card</SelectItem>
                  <SelectItem value="cheque">📝 Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          {/* Credit Transaction Fields - Show for sales and purchases */}
          {(formData.type === 'sale' || formData.type === 'purchase') && (
            <div className="bg-purple-50 p-4 rounded-lg space-y-4 border border-purple-200">
              <h3 className="font-medium text-purple-900 flex items-center gap-2">
                💳 Payment Status & Credit Handling
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="payment_status">Payment Status *</Label>
                  <Select value={formData.payment_status} onValueChange={(value) => setFormData({...formData, payment_status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">✅ Paid (Cash/Immediate)</SelectItem>
                      <SelectItem value="unpaid">⏳ Unpaid (Credit)</SelectItem>
                      <SelectItem value="partially_paid">📝 Partially Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.payment_status === 'partially_paid' && (
                  <div>
                    <Label htmlFor="paid_amount">Amount Paid (RWF)</Label>
                    <Input
                      id="paid_amount"
                      type="number"
                      step="0.01"
                      value={formData.paid_amount}
                      onChange={(e) => setFormData({...formData, paid_amount: e.target.value})}
                      placeholder="Amount already paid"
                    />
                    <p className="text-xs text-purple-600 mt-1">
                      Remaining: RWF {(parseFloat(formData.amount || '0') - parseFloat(formData.paid_amount || '0')).toLocaleString()}
                    </p>
                  </div>
                )}

                {formData.payment_status !== 'paid' && (
                  <div>
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    />
                  </div>
                )}
              </div>

              {formData.payment_status !== 'paid' && (
                <div>
                  <Label htmlFor="party_name">{formData.type === 'sale' ? 'Client' : 'Supplier'} Name</Label>
                  <Input
                    id="party_name"
                    value={formData.party_name}
                    onChange={(e) => setFormData({...formData, party_name: e.target.value})}
                    placeholder={`Enter ${formData.type === 'sale' ? 'client' : 'supplier'} name for credit tracking`}
                  />
                </div>
              )}

              {/* Credit Preview */}
              {formData.payment_status !== 'paid' && formData.amount && (
                <div className="bg-purple-100 p-3 rounded border">
                  <h5 className="font-medium text-purple-900 text-sm mb-2">📊 Credit Transaction Impact:</h5>
                  <div className="text-xs space-y-1">
                    {formData.type === 'sale' && (
                      <>
                        <div className="flex justify-between">
                          <span>Dr: {formData.payment_status === 'partially_paid' ? 'Cash + Accounts Receivable' : 'Accounts Receivable'}</span>
                          <span>RWF {parseFloat(formData.amount || '0').toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cr: Sales Revenue</span>
                          <span>RWF {parseFloat(formData.amount || '0').toLocaleString()}</span>
                        </div>
                      </>
                    )}
                    {formData.type === 'purchase' && (
                      <>
                        <div className="flex justify-between">
                          <span>Dr: Expense Account</span>
                          <span>RWF {parseFloat(formData.amount || '0').toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cr: {formData.payment_status === 'partially_paid' ? 'Cash + Accounts Payable' : 'Accounts Payable'}</span>
                          <span>RWF {parseFloat(formData.amount || '0').toLocaleString()}</span>
                        </div>
                      </>
                    )}
                    <p className="text-purple-700 mt-2">
                      ⚡ Payment reminders will be set based on due date
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Capital/Equity Transaction Fields */}
          {isCapitalTransaction && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-4 border border-blue-200">
              <h3 className="font-medium text-blue-900 flex items-center gap-2">
                🏦 Capital & Equity Transaction Details
              </h3>
              
              {showShareholderFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shareholder_name">Shareholder Name *</Label>
                    <Input
                      id="shareholder_name"
                      value={formData.shareholder_name}
                      onChange={(e) => setFormData({...formData, shareholder_name: e.target.value})}
                      placeholder="Enter shareholder name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shares_allocated">Shares Allocated</Label>
                    <Input
                      id="shares_allocated"
                      type="number"
                      value={formData.shares_allocated}
                      onChange={(e) => setFormData({...formData, shares_allocated: e.target.value})}
                      placeholder="Number of shares"
                    />
                  </div>
                </div>
              )}

              {formData.type === 'share_issuance' && (
                <div>
                  <Label htmlFor="par_value">Par Value per Share (RWF)</Label>
                  <Input
                    id="par_value"
                    type="number"
                    value={formData.par_value}
                    onChange={(e) => setFormData({...formData, par_value: e.target.value})}
                    placeholder="1000"
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    Premium: RWF {(parseFloat(formData.amount || '0') - (Math.floor(parseFloat(formData.amount || '0') / parseFloat(formData.par_value || '1000')) * parseFloat(formData.par_value || '1000'))).toLocaleString()}
                  </p>
                </div>
              )}

              {showEquityAdjustmentFields && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="adjustment_type">Adjustment Type</Label>
                    <Select value={formData.adjustment_type} onValueChange={(value) => setFormData({...formData, adjustment_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="correction">Correction</SelectItem>
                        <SelectItem value="revaluation">Revaluation</SelectItem>
                        <SelectItem value="reclassification">Reclassification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="from_account">From Account</Label>
                    <Input
                      id="from_account"
                      value={formData.from_account}
                      onChange={(e) => setFormData({...formData, from_account: e.target.value})}
                      placeholder="e.g., Retained Earnings"
                    />
                  </div>
                  <div>
                    <Label htmlFor="to_account">To Account</Label>
                    <Input
                      id="to_account"
                      value={formData.to_account}
                      onChange={(e) => setFormData({...formData, to_account: e.target.value})}
                      placeholder="e.g., Equity Adjustment"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {showTaxCategoryField && (
            <div className="bg-orange-50 p-4 rounded-lg space-y-4 border border-orange-200">
              <h3 className="font-medium text-orange-900 flex items-center gap-2">
                📊 Tax Classification (RRA Compliance)
              </h3>
              
              <div>
                <Label htmlFor="tax_category">Tax Category *</Label>
                <Select value={formData.tax_category} onValueChange={(value) => setFormData({...formData, tax_category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax classification" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {TaxCategoryService.getAllCategories().map((category) => (
                      <SelectItem key={category.code} value={category.code}>
                        <div className="flex items-center gap-2">
                          <span>{category.label}</span>
                          <Badge variant={category.deductible ? "default" : "destructive"} className="text-xs">
                            {category.deductible ? "Deductible" : "Non-deductible"}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTaxCategory && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">
                      <strong>Kinyarwanda:</strong> {selectedTaxCategory.label_rw}
                    </p>
                    {selectedTaxCategory.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {selectedTaxCategory.description}
                      </p>
                    )}
                    <Badge 
                      variant={selectedTaxCategory.deductible ? "default" : "destructive"} 
                      className="text-xs mt-1"
                    >
                      {selectedTaxCategory.deductible ? "✅ Tax Deductible" : "❌ Not Tax Deductible"}
                    </Badge>
                  </div>
                )}
                <p className="text-xs text-gray-600 mt-1">
                  This classification will be used for CIT filing and RRA compliance reporting
                </p>
              </div>
            </div>
          )}

          {showIncomeSourceField && (
            <div className="bg-green-50 p-4 rounded-lg space-y-4">
              <h3 className="font-medium text-green-900 flex items-center gap-2">
                💰 Income Source Classification
              </h3>
              
              <div>
                <Label htmlFor="income_source">Source of Income *</Label>
                <Select value={formData.income_source} onValueChange={(value) => setFormData({...formData, income_source: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select income source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">🛒 Sales Revenue (Core Business)</SelectItem>
                    <SelectItem value="loan_creditor">🏦 Loan/Creditor</SelectItem>
                    <SelectItem value="gift_friend">🎁 Gift/Friend Contribution</SelectItem>
                    <SelectItem value="grant_donation">📜 Grant/Donation</SelectItem>
                    <SelectItem value="asset_sale">🏠 Asset Sale</SelectItem>
                    <SelectItem value="investment_return">📈 Investment Return</SelectItem>
                    <SelectItem value="other">📋 Other Income</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 mt-1">
                  This helps classify income for financial reporting and tax compliance
                </p>
              </div>
            </div>
          )}

          {showMobileMoneyFields && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-4">
              <h3 className="font-medium text-blue-900 flex items-center gap-2">
                📱 Mobile Money Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone_number">Phone Number *</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    placeholder="078xxxxxxx"
                  />
                </div>

                <div>
                  <Label htmlFor="momo_reference">Transaction Reference *</Label>
                  <Input
                    id="momo_reference"
                    value={formData.momo_reference}
                    onChange={(e) => setFormData({...formData, momo_reference: e.target.value})}
                    placeholder="MP241234567"
                  />
                </div>
              </div>
            </div>
          )}

          {showInvoiceFields && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-4">
              <h3 className="font-medium text-blue-900">Invoice/Receipt Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice_number">Invoice/Receipt Number</Label>
                  <Input
                    id="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                    placeholder="Auto-generated if left blank"
                  />
                </div>

                <div>
                  <Label htmlFor="tin">TIN Number</Label>
                  <Input
                    id="tin"
                    value={formData.tin}
                    onChange={(e) => setFormData({...formData, tin: e.target.value})}
                    placeholder="Tax Identification Number"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'sale' && (
            <div>
              <Label htmlFor="client">Client Name</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData({...formData, client: e.target.value})}
                placeholder="Enter client name"
              />
            </div>
          )}

          {(formData.type === 'purchase' || formData.type === 'payment') && (
            <div>
              <Label htmlFor="supplier">Supplier Name</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                placeholder="Enter supplier name"
              />
            </div>
          )}

          <div>
            <Label htmlFor="reference">Reference Number</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData({...formData, reference: e.target.value})}
              placeholder="Auto-generated if left blank"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter transaction description"
            />
          </div>

          {/* Accounting Preview */}
          {formData.amount && formData.type && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">📊 Accounting Journal Preview</h4>
              <div className="text-sm space-y-1 font-mono">
                {/* Preview logic based on transaction type */}
                {formData.type === 'capital_contribution' && (
                  <>
                    <div className="flex justify-between">
                      <span>Dr: {formData.payment_method === 'cash' ? 'Petty Cash' : 'Cash at Bank'}</span>
                      <span>RWF {parseFloat(formData.amount || '0').toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cr: Share Capital</span>
                      <span>RWF {parseFloat(formData.amount || '0').toLocaleString()}</span>
                    </div>
                  </>
                )}
                {formData.type === 'dividend_payment' && (
                  <>
                    <div className="flex justify-between">
                      <span>Dr: Dividend Payable</span>
                      <span>RWF {parseFloat(formData.amount || '0').toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cr: {formData.payment_method === 'cash' ? 'Petty Cash' : 'Cash at Bank'}</span>
                      <span>RWF {parseFloat(formData.amount || '0').toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs text-green-700 mt-2">
                ✅ Will automatically update: General Ledger, Cash Book, Capital Register, and all related reports
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Process Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
