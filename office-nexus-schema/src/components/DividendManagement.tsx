
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, DollarSign, FileText, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DividendService, { DividendDeclaration, DividendDistribution } from "@/services/dividendService";

export function DividendManagement() {
  const { toast } = useToast();
  const [declarations, setDeclarations] = useState<DividendDeclaration[]>([]);
  const [selectedDeclaration, setSelectedDeclaration] = useState<string | null>(null);
  const [distributions, setDistributions] = useState<DividendDistribution[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allDeclarations = DividendService.getAllDeclarations();
    setDeclarations(allDeclarations);
    setSummary(DividendService.getDividendSummary());
    
    if (selectedDeclaration) {
      const dists = DividendService.getDistributionsByDeclaration(selectedDeclaration);
      setDistributions(dists);
    }
  };

  const handleConfirmDeclaration = (declarationId: string) => {
    try {
      DividendService.confirmDividendDeclaration(declarationId);
      loadData();
      toast({
        title: "Success",
        description: "Dividend declaration confirmed and posted to accounting"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm dividend declaration",
        variant: "destructive"
      });
    }
  };

  const handlePayDividend = (distributionId: string) => {
    try {
      DividendService.payDividend(distributionId);
      loadData();
      toast({
        title: "Success",
        description: "Dividend payment recorded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record dividend payment",
        variant: "destructive"
      });
    }
  };

  const handleViewDistributions = (declarationId: string) => {
    setSelectedDeclaration(declarationId);
    const dists = DividendService.getDistributionsByDeclaration(declarationId);
    setDistributions(dists);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{summary.totalDeclarations}</div>
                  <div className="text-sm text-gray-600">Total Declarations</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-lg font-bold">{formatCurrency(summary.totalDeclared)}</div>
                  <div className="text-sm text-gray-600">Total Declared</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-lg font-bold">{formatCurrency(summary.totalPaid)}</div>
                  <div className="text-sm text-gray-600">Total Paid</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="text-lg font-bold">{formatCurrency(summary.pendingPayments)}</div>
                  <div className="text-sm text-gray-600">Pending Payments</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="declarations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="declarations">Dividend Declarations</TabsTrigger>
          <TabsTrigger value="distributions">Payment Distributions</TabsTrigger>
        </TabsList>

        <TabsContent value="declarations">
          <Card>
            <CardHeader>
              <CardTitle>Dividend Declarations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Profit Amount</TableHead>
                    <TableHead>Dividend %</TableHead>
                    <TableHead>Dividend Pool</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {declarations.map((declaration) => (
                    <TableRow key={declaration.id}>
                      <TableCell>{declaration.declaration_date}</TableCell>
                      <TableCell>{formatCurrency(declaration.profit_amount)}</TableCell>
                      <TableCell>{declaration.dividend_percentage}%</TableCell>
                      <TableCell className="font-medium">{formatCurrency(declaration.dividend_pool)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(declaration.status)}>
                          {declaration.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {declaration.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirmDeclaration(declaration.id)}
                            >
                              Confirm
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDistributions(declaration.id)}
                          >
                            <Users className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distributions">
          <Card>
            <CardHeader>
              <CardTitle>
                Payment Distributions
                {selectedDeclaration && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    (Declaration: {selectedDeclaration})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {distributions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shareholder</TableHead>
                      <TableHead>Shares Held</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Paid Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributions.map((distribution) => (
                      <TableRow key={distribution.id}>
                        <TableCell className="font-medium">{distribution.shareholder_name}</TableCell>
                        <TableCell>{distribution.shares_held_at_time}%</TableCell>
                        <TableCell className="font-medium">{formatCurrency(distribution.amount)}</TableCell>
                        <TableCell>
                          <Badge className={distribution.is_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {distribution.is_paid ? 'Paid' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>{distribution.paid_on || '-'}</TableCell>
                        <TableCell>
                          {!distribution.is_paid && (
                            <Button
                              size="sm"
                              onClick={() => handlePayDividend(distribution.id)}
                            >
                              Mark Paid
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No distributions</h3>
                  <p className="mt-1 text-sm text-gray-500">Select a declaration to view its distributions.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
