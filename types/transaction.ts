export interface TransactionItem {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  amount: number;
  isIncome: boolean;
  completedAt: Date | string;
  userPId: number;
  rawData: string;
}

export interface StatementResponse {
  success: boolean;
  transactions: {
    count: number;
    items: TransactionItem[];
  };
}

// You might also want to add the request type
export interface StatementRequest {
  transactions: string; // CSV string content
  statementType: 'credit-card' | 'bank';
}