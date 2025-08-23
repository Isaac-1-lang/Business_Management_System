
export interface TaxCategory {
  code: string;
  label: string;
  label_rw: string;
  deductible: boolean;
  description?: string;
}

export const TAX_CATEGORIES: TaxCategory[] = [
  {
    code: 'crops_purchase',
    label: 'Purchase of Crops',
    label_rw: 'Ibihingwa (Inyanya, ibiribwa,...)',
    deductible: true,
    description: 'Agricultural products for business use'
  },
  {
    code: 'animals_purchase',
    label: 'Purchase of Animals',
    label_rw: 'Amatungo (ihene, inka,...)',
    deductible: true,
    description: 'Livestock purchase for business'
  },
  {
    code: 'animal_products',
    label: 'Products from Animals',
    label_rw: 'Ibikomoka ku matungo (amata, impu,...)',
    deductible: true,
    description: 'Animal-derived products'
  },
  {
    code: 'crop_products',
    label: 'Products from Crops',
    label_rw: 'Ibikomoka ku bihingwa (amakara, inkwi,...)',
    deductible: true,
    description: 'Crop-derived products'
  },
  {
    code: 'unregistered_credit',
    label: 'Purchase on Credit (Unregistered Person)',
    label_rw: 'Ibyaguzwe ku mwenda ku bantu batanditse',
    deductible: false,
    description: 'May have limited deductibility'
  },
  {
    code: 'business_mission',
    label: 'Business Mission (Local & Abroad)',
    label_rw: 'Ubutumwa bw\'akazi (mu gihugu, hanze)',
    deductible: true,
    description: 'Business travel and mission expenses'
  },
  {
    code: 'charity_expense',
    label: 'Charity & Donations',
    label_rw: 'Amafaranga y\'ubugiraneza',
    deductible: false,
    description: 'Charitable contributions - limited deductibility'
  },
  {
    code: 'insurance_claims',
    label: 'Insurance Claims Paid',
    label_rw: 'Amafaranga yishyuwe n\'ubwishingizi',
    deductible: true,
    description: 'Insurance premium payments'
  },
  {
    code: 'depreciation_amortisation',
    label: 'Depreciation / Amortisation',
    label_rw: 'Ubwicungure / gukamuka kw\'umutungo',
    deductible: true,
    description: 'Asset depreciation and amortisation'
  },
  {
    code: 'provisions',
    label: 'General & Specific Provisions',
    label_rw: 'Ibyateganirijwe (imanza, imyenda mibi, ishimwe,...)',
    deductible: false,
    description: 'Provisions for doubtful debts, legal cases'
  },
  {
    code: 'ifrs_adjustments',
    label: 'IFRS Adjustments',
    label_rw: 'Ikosora rishingiye kuri IFRS',
    deductible: false,
    description: 'Accounting standard adjustments'
  },
  {
    code: 'accruals',
    label: 'Accruals (unpaid expenses)',
    label_rw: 'Ibyakoreshejwe bitarishyurwa',
    deductible: true,
    description: 'Accrued expenses'
  },
  {
    code: 'unclaimed_vat',
    label: 'Non-claimed VAT',
    label_rw: 'TVA itarasubijwe',
    deductible: false,
    description: 'VAT that cannot be claimed back'
  },
  {
    code: 'bank_momo_fees',
    label: 'Bank/Mobile Money Fees',
    label_rw: 'Serivisi za banki/MoMo',
    deductible: true,
    description: 'Banking and mobile money service fees'
  },
  {
    code: 'forex_loss',
    label: 'Forex Losses',
    label_rw: 'Igihombo cy\'ivunjisha',
    deductible: true,
    description: 'Foreign exchange losses'
  },
  {
    code: 'loan_interest_expense',
    label: 'Interest & Loan Charges',
    label_rw: 'Inyungu n\'amafaranga ajyana n\'inguzanyo',
    deductible: true,
    description: 'Interest payments and loan fees'
  },
  {
    code: 'transport_services',
    label: 'Transport Services',
    label_rw: 'Ubwikorezi bwose',
    deductible: true,
    description: 'Transportation and logistics services'
  },
  {
    code: 'accommodation_services',
    label: 'Accommodation & Meals',
    label_rw: 'Icumbi na serivisi zibiribwa',
    deductible: true,
    description: 'Hotel, accommodation and meal expenses'
  },
  {
    code: 'external_services',
    label: 'Other External Services',
    label_rw: 'Izindi serivisi (amahugurwa, ubusemuzi, etc)',
    deductible: true,
    description: 'Professional services, training, consulting'
  },
  {
    code: 'gov_fees',
    label: 'Government Fees',
    label_rw: 'Serivisi za guverinoma',
    deductible: true,
    description: 'Government service fees and permits'
  },
  {
    code: 'document_fees',
    label: 'Document Fees',
    label_rw: 'Ibyangombwa (Visa, Passport, Permit)',
    deductible: true,
    description: 'Document processing fees'
  },
  {
    code: 'court_charges',
    label: 'Court-Approved Charges',
    label_rw: 'Amafaranga yemejwe n\'urukiko',
    deductible: true,
    description: 'Legal fees approved by court'
  },
  {
    code: 'property_transfer_fees',
    label: 'General Property Transfer Fees',
    label_rw: 'Ihinduranya ry\'ubutaka, inzu, ibinyabiziga',
    deductible: true,
    description: 'Property and asset transfer fees'
  },
  {
    code: 'parking_fees',
    label: 'Parking Fees',
    label_rw: 'Kwishyura parikingi',
    deductible: true,
    description: 'Parking and related fees'
  },
  {
    code: 'other_expenses',
    label: 'Other Business Expenses',
    label_rw: 'Izindi byongeyeho',
    deductible: true,
    description: 'Miscellaneous business expenses'
  }
];

class TaxCategoryService {
  static getAllCategories(): TaxCategory[] {
    return TAX_CATEGORIES;
  }

  static getCategory(code: string): TaxCategory | undefined {
    return TAX_CATEGORIES.find(cat => cat.code === code);
  }

  static getDeductibleCategories(): TaxCategory[] {
    return TAX_CATEGORIES.filter(cat => cat.deductible);
  }

  static getNonDeductibleCategories(): TaxCategory[] {
    return TAX_CATEGORIES.filter(cat => !cat.deductible);
  }

  static getCategoryLabel(code: string): string {
    const category = this.getCategory(code);
    return category ? category.label : 'Unknown Category';
  }

  static generateTaxReport(expenses: Array<{amount: number, tax_category?: string, date: string}>): {
    deductibleTotal: number;
    nonDeductibleTotal: number;
    categoryBreakdown: Array<{
      category: string;
      label: string;
      amount: number;
      deductible: boolean;
      count: number;
    }>;
  } {
    const breakdown = new Map<string, {amount: number, count: number}>();
    
    expenses.forEach(expense => {
      const category = expense.tax_category || 'other_expenses';
      const existing = breakdown.get(category) || {amount: 0, count: 0};
      existing.amount += expense.amount;
      existing.count += 1;
      breakdown.set(category, existing);
    });

    const categoryBreakdown = Array.from(breakdown.entries()).map(([code, data]) => {
      const category = this.getCategory(code);
      return {
        category: code,
        label: category?.label || 'Unknown',
        amount: data.amount,
        deductible: category?.deductible || false,
        count: data.count
      };
    });

    const deductibleTotal = categoryBreakdown
      .filter(item => item.deductible)
      .reduce((sum, item) => sum + item.amount, 0);

    const nonDeductibleTotal = categoryBreakdown
      .filter(item => !item.deductible)
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      deductibleTotal,
      nonDeductibleTotal,
      categoryBreakdown: categoryBreakdown.sort((a, b) => b.amount - a.amount)
    };
  }
}

export default TaxCategoryService;
