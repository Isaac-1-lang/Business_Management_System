
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Target, 
  Plus, 
  Edit, 
  Eye, 
  Archive, 
  FileText, 
  Calendar,
  TrendingUp,
  Building2,
  Users,
  BarChart3,
  Search
} from "lucide-react";
import BusinessPlanService, { BusinessPlan } from "@/services/businessPlanService";
import { BusinessPlanForm } from "@/components/forms/BusinessPlanForm";
import { useToast } from "@/hooks/use-toast";

export default function BusinessPlanPage() {
  const { toast } = useToast();
  const [businessPlans, setBusinessPlans] = useState<BusinessPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<BusinessPlan | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BusinessPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState<number | null>(null);

  useEffect(() => {
    loadBusinessPlans();
  }, []);

  const loadBusinessPlans = () => {
    const plans = BusinessPlanService.getAllBusinessPlans();
    setBusinessPlans(plans);
    
    // Set the active plan as selected by default
    const activePlan = BusinessPlanService.getActiveBusinessPlan();
    if (activePlan && !selectedPlan) {
      setSelectedPlan(activePlan);
    }
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setShowForm(true);
  };

  const handleEditPlan = (plan: BusinessPlan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleFormSubmit = (plan: BusinessPlan) => {
    loadBusinessPlans();
    setShowForm(false);
    setEditingPlan(null);
    setSelectedPlan(plan);
  };

  const handleSetActive = (plan: BusinessPlan) => {
    BusinessPlanService.setActiveBusinessPlan(plan.id);
    loadBusinessPlans();
    toast({
      title: "Success",
      description: `"${plan.title}" is now the active business plan`,
    });
  };

  const handleArchivePlan = (plan: BusinessPlan) => {
    BusinessPlanService.archiveBusinessPlan(plan.id);
    loadBusinessPlans();
    if (selectedPlan?.id === plan.id) {
      setSelectedPlan(null);
    }
    toast({
      title: "Success",
      description: `"${plan.title}" has been archived`,
    });
  };

  const filteredPlans = businessPlans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = !yearFilter || plan.year === yearFilter;
    return matchesSearch && matchesYear;
  });

  const years = [...new Set(businessPlans.map(p => p.year))].sort((a, b) => b - a);
  const yearsSummary = BusinessPlanService.getYearsSummary();

  if (showForm) {
    return (
      <div className="container mx-auto py-8">
        <BusinessPlanForm
          businessPlan={editingPlan}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600" />
            Business Plan & Strategy
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your strategic business plans, vision, and compliance documentation
          </p>
        </div>
        <Button onClick={handleCreatePlan} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Business Plan
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">All Plans</TabsTrigger>
          <TabsTrigger value="details">Plan Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{businessPlans.length}</div>
                <p className="text-xs text-muted-foreground">
                  Across {years.length} years
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Plan</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {BusinessPlanService.getActiveBusinessPlan()?.year || "None"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current strategic plan
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Latest Update</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {businessPlans.length > 0 
                    ? new Date(Math.max(...businessPlans.map(p => new Date(p.updated_at).getTime()))).toLocaleDateString()
                    : "N/A"
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Most recent plan update
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Years Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Plans by Year
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {yearsSummary.map(({ year, planCount, hasActive }) => (
                  <div key={year} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{year}</span>
                      {hasActive && <Badge variant="default">Active</Badge>}
                    </div>
                    <span className="text-sm text-gray-600">
                      {planCount} plan{planCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search business plans..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={yearFilter || ""}
                  onChange={(e) => setYearFilter(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Plans List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{plan.title}</h3>
                        <Badge variant={plan.status === 'active' ? 'default' : plan.status === 'draft' ? 'secondary' : 'outline'}>
                          {plan.status}
                        </Badge>
                        <Badge variant="outline">{plan.year}</Badge>
                      </div>
                      {plan.description && (
                        <p className="text-gray-600 mb-3">{plan.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Version {plan.version}</span>
                        <span>Updated {new Date(plan.updated_at).toLocaleDateString()}</span>
                        <span>By {plan.uploaded_by}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPlan(plan)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {plan.status !== 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetActive(plan)}
                        >
                          Set Active
                        </Button>
                      )}
                      {plan.status !== 'archived' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArchivePlan(plan)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Plan Details Tab */}
        <TabsContent value="details" className="space-y-6">
          {selectedPlan ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        {selectedPlan.title}
                        <Badge variant={selectedPlan.status === 'active' ? 'default' : selectedPlan.status === 'draft' ? 'secondary' : 'outline'}>
                          {selectedPlan.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {selectedPlan.year} • Version {selectedPlan.version} • Updated {new Date(selectedPlan.updated_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Button onClick={() => handleEditPlan(selectedPlan)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Plan
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {selectedPlan.mission_statement && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Mission Statement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{selectedPlan.mission_statement}</p>
                    </CardContent>
                  </Card>
                )}

                {selectedPlan.vision_statement && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Vision Statement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{selectedPlan.vision_statement}</p>
                    </CardContent>
                  </Card>
                )}

                {selectedPlan.strategic_goals && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Strategic Goals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-gray-700 whitespace-pre-wrap">{selectedPlan.strategic_goals}</pre>
                    </CardContent>
                  </Card>
                )}

                {selectedPlan.swot_analysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">SWOT Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-gray-700 whitespace-pre-wrap">{selectedPlan.swot_analysis}</pre>
                    </CardContent>
                  </Card>
                )}

                {selectedPlan.financial_projections && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Financial Projections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-gray-700 whitespace-pre-wrap">{selectedPlan.financial_projections}</pre>
                    </CardContent>
                  </Card>
                )}

                {selectedPlan.market_analysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Market Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-gray-700 whitespace-pre-wrap">{selectedPlan.market_analysis}</pre>
                    </CardContent>
                  </Card>
                )}

                {selectedPlan.competitive_analysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Competitive Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-gray-700 whitespace-pre-wrap">{selectedPlan.competitive_analysis}</pre>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No Plan Selected</h3>
                <p className="text-gray-600 mb-4">Select a business plan from the "All Plans" tab to view its details</p>
                <Button onClick={() => setActiveTab("plans")}>
                  View All Plans
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
