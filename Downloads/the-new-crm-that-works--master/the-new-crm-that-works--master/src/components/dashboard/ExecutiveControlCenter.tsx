'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Crown,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Zap,
  Shield,
  Award,
  Calendar,
  Building,
  UserCheck,
  MapPin,
  Star,
  Briefcase,
  Settings,
  Bell,
  Filter,
  Download,
  Maximize,
  Minimize,
  RefreshCw
} from 'lucide-react';

interface ExecutiveMetrics {
  revenue: {
    total: number;
    growth: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
  };
  performance: {
    overall: number;
    teams_excelling: number;
    teams_at_risk: number;
    student_satisfaction: number;
  };
  operations: {
    active_teams: number;
    total_students: number;
    active_schools: number;
    completion_rate: number;
  };
  goals: {
    total: number;
    on_track: number;
    completed: number;
    overdue: number;
  };
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  action_required: boolean;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
  category: 'financial' | 'operational' | 'strategic' | 'analytics';
}

export default function ExecutiveControlCenter() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Financial Dashboard',
      description: 'Real-time revenue and financial analytics',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'text-green-600 bg-green-100',
      route: '/dashboard/ceo',
      category: 'financial'
    },
    {
      id: '2',
      title: 'Team Management',
      description: 'Manage teams and assignments',
      icon: <Users className="h-6 w-6" />,
      color: 'text-blue-600 bg-blue-100',
      route: '/dashboard/ceo',
      category: 'operational'
    },
    {
      id: '3',
      title: 'Goal Tracking',
      description: 'Monitor organizational goals',
      icon: <Target className="h-6 w-6" />,
      color: 'text-orange-600 bg-orange-100',
      route: '/goal-tracking',
      category: 'strategic'
    },
    {
      id: '4',
      title: 'Student Analytics',
      description: 'Student performance insights',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'text-purple-600 bg-purple-100',
      route: '/student-performance-analytics',
      category: 'analytics'
    },
    {
      id: '5',
      title: 'Team Organizer',
      description: 'Drag & drop team assignments',
      icon: <UserCheck className="h-6 w-6" />,
      color: 'text-indigo-600 bg-indigo-100',
      route: '/student-team-organizer',
      category: 'operational'
    },
    {
      id: '6',
      title: 'Area Management',
      description: 'Regional oversight and control',
      icon: <MapPin className="h-6 w-6" />,
      color: 'text-teal-600 bg-teal-100',
      route: '/dashboard/ceo',
      category: 'operational'
    },
    {
      id: '7',
      title: 'School Operations',
      description: 'Manage school partnerships',
      icon: <Building className="h-6 w-6" />,
      color: 'text-amber-600 bg-amber-100',
      route: '/schools',
      category: 'operational'
    },
    {
      id: '8',
      title: 'Strategic Planning',
      description: 'Long-term planning tools',
      icon: <Briefcase className="h-6 w-6" />,
      color: 'text-slate-600 bg-slate-100',
      route: '/dashboard/ceo',
      category: 'strategic'
    }
  ];

  const fetchExecutiveData = async () => {
    try {
      // Simulate executive-level data aggregation
      const mockMetrics: ExecutiveMetrics = {
        revenue: {
          total: 2450000,
          growth: 15.3,
          target: 3000000,
          trend: 'up'
        },
        performance: {
          overall: 87,
          teams_excelling: 12,
          teams_at_risk: 3,
          student_satisfaction: 92
        },
        operations: {
          active_teams: 25,
          total_students: 1250,
          active_schools: 45,
          completion_rate: 89
        },
        goals: {
          total: 28,
          on_track: 20,
          completed: 6,
          overdue: 2
        }
      };

      const mockAlerts: Alert[] = [
        {
          id: '1',
          type: 'critical',
          title: 'Revenue Target Alert',
          message: 'Q1 revenue is 15% below target. Immediate strategic review required.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          action_required: true
        },
        {
          id: '2',
          type: 'warning',
          title: 'Team Performance',
          message: 'Team Delta performance has declined 12% this month.',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          action_required: true
        },
        {
          id: '3',
          type: 'info',
          title: 'New Partnership',
          message: 'Successfully onboarded 3 new school partnerships this week.',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          action_required: false
        },
        {
          id: '4',
          type: 'success',
          title: 'Goal Achievement',
          message: 'Student completion rate goal achieved ahead of schedule.',
          timestamp: new Date(Date.now() - 21600000).toISOString(),
          action_required: false
        },
        {
          id: '5',
          type: 'warning',
          title: 'Resource Allocation',
          message: 'North region requires additional teaching staff allocation.',
          timestamp: new Date(Date.now() - 28800000).toISOString(),
          action_required: true
        }
      ];

      setMetrics(mockMetrics);
      setAlerts(mockAlerts);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching executive data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutiveData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchExecutiveData();
      }, 300000); // Refresh every 5 minutes

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'success': return 'border-green-200 bg-green-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredActions = (category: string) => {
    return quickActions.filter(action => action.category === category);
  };

  if (loading) return <div className="p-6">Loading Executive Control Center...</div>;
  if (!metrics) return <div className="p-6">No data available</div>;

  return (
    <div className="p-6 max-w-full overflow-x-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Executive Control Center
              </h1>
              <p className="text-gray-600">Ultimate command interface for organizational oversight</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <div className="text-gray-500">Last Updated</div>
              <div className="font-semibold">{lastUpdate.toLocaleTimeString()}</div>
            </div>
            <Button
              onClick={fetchExecutiveData}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
            </Button>
          </div>
        </div>

        {/* Critical Alerts Banner */}
        {alerts.filter(a => a.type === 'critical').length > 0 && (
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="flex justify-between items-center">
              <span className="font-semibold text-red-800">
                {alerts.filter(a => a.type === 'critical').length} critical alert(s) require immediate attention
              </span>
              <Button
                onClick={() => {
                  setSelectedAlert(alerts.find(a => a.type === 'critical') || null);
                  setAlertDialogOpen(true);
                }}
                size="sm"
                variant="destructive"
              >
                Review Now
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Executive KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Metrics */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            {getTrendIcon(metrics.revenue.trend)}
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-green-700">
              ${(metrics.revenue.total / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-green-600 font-semibold">
              +{metrics.revenue.growth}% growth
            </div>
            <Progress
              value={(metrics.revenue.total / metrics.revenue.target) * 100}
              className="h-2"
            />
            <div className="text-xs text-gray-600">
              Target: ${(metrics.revenue.target / 1000000).toFixed(1)}M
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-700">
              {metrics.performance.overall}%
            </div>
            <div className="text-sm text-blue-600 font-semibold">
              Overall Performance
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-green-600">
                {metrics.performance.teams_excelling} excelling
              </span>
              <span className="text-red-600">
                {metrics.performance.teams_at_risk} at risk
              </span>
            </div>
            <div className="text-xs text-gray-600">
              Student Satisfaction: {metrics.performance.student_satisfaction}%
            </div>
          </div>
        </Card>

        {/* Operations Metrics */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <Activity className="h-4 w-4 text-purple-500" />
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-purple-700">
              {metrics.operations.total_students.toLocaleString()}
            </div>
            <div className="text-sm text-purple-600 font-semibold">
              Active Students
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Teams: {metrics.operations.active_teams}</div>
              <div>Schools: {metrics.operations.active_schools}</div>
            </div>
            <div className="text-xs text-gray-600">
              Completion Rate: {metrics.operations.completion_rate}%
            </div>
          </div>
        </Card>

        {/* Goals Metrics */}
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <CheckCircle className="h-4 w-4 text-orange-500" />
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-orange-700">
              {metrics.goals.total}
            </div>
            <div className="text-sm text-orange-600 font-semibold">
              Active Goals
            </div>
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div className="text-green-600">{metrics.goals.completed} done</div>
              <div className="text-blue-600">{metrics.goals.on_track} on track</div>
              <div className="text-red-600">{metrics.goals.overdue} overdue</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Control Interface */}
      <Tabs defaultValue="command" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="command" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Command Center
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alerts ({alerts.filter(a => a.action_required).length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="strategy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Strategy
          </TabsTrigger>
        </TabsList>

        {/* Command Center Tab */}
        <TabsContent value="command" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Financial Operations */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-600">
                <DollarSign className="h-5 w-5" />
                Financial Operations
              </h3>
              <div className="space-y-3">
                {filteredActions('financial').map((action) => (
                  <Button
                    key={action.id}
                    onClick={() => router.push(action.route)}
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto p-4"
                  >
                    <div className={`p-2 rounded ${action.color}`}>
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{action.title}</div>
                      <div className="text-xs text-gray-600">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Operational Control */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-600">
                <Settings className="h-5 w-5" />
                Operational Control
              </h3>
              <div className="space-y-3">
                {filteredActions('operational').map((action) => (
                  <Button
                    key={action.id}
                    onClick={() => router.push(action.route)}
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto p-4"
                  >
                    <div className={`p-2 rounded ${action.color}`}>
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{action.title}</div>
                      <div className="text-xs text-gray-600">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Strategic Planning */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-600">
                <Briefcase className="h-5 w-5" />
                Strategic Planning
              </h3>
              <div className="space-y-3">
                {filteredActions('strategic').map((action) => (
                  <Button
                    key={action.id}
                    onClick={() => router.push(action.route)}
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto p-4"
                  >
                    <div className={`p-2 rounded ${action.color}`}>
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{action.title}</div>
                      <div className="text-xs text-gray-600">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Analytics & Insights */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-orange-600">
                <BarChart3 className="h-5 w-5" />
                Analytics & Insights
              </h3>
              <div className="space-y-3">
                {filteredActions('analytics').map((action) => (
                  <Button
                    key={action.id}
                    onClick={() => router.push(action.route)}
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto p-4"
                  >
                    <div className={`p-2 rounded ${action.color}`}>
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{action.title}</div>
                      <div className="text-xs text-gray-600">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${getAlertColor(alert.type)}`}
                onClick={() => {
                  setSelectedAlert(alert);
                  setAlertDialogOpen(true);
                }}
              >
                <div className="flex items-start gap-4">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <div className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{alert.message}</p>
                    {alert.action_required && (
                      <Badge variant="destructive" className="text-xs">
                        Action Required
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Executive Summary</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">94%</div>
                    <div className="text-sm text-gray-600">Operational Efficiency</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded p-3 text-center">
                    <div className="text-lg font-bold text-green-600">↑ 23%</div>
                    <div className="text-xs text-gray-600">Revenue Growth</div>
                  </div>
                  <div className="bg-blue-50 rounded p-3 text-center">
                    <div className="text-lg font-bold text-blue-600">87%</div>
                    <div className="text-xs text-gray-600">Goal Progress</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Risk Assessment</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Financial Risk</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '30%'}} />
                    </div>
                    <span className="text-sm font-semibold text-yellow-600">Low</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Operational Risk</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '15%'}} />
                    </div>
                    <span className="text-sm font-semibold text-green-600">Minimal</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Strategic Risk</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{width: '45%'}} />
                    </div>
                    <span className="text-sm font-semibold text-orange-600">Medium</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Strategy Tab */}
        <TabsContent value="strategy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-gold-500" />
                Strategic Initiatives
              </h3>
              <div className="space-y-3">
                <div className="p-3 border rounded">
                  <div className="font-semibold">Market Expansion</div>
                  <div className="text-sm text-gray-600">Q2 2024 Initiative</div>
                  <Progress value={65} className="h-2 mt-2" />
                </div>
                <div className="p-3 border rounded">
                  <div className="font-semibold">Technology Upgrade</div>
                  <div className="text-sm text-gray-600">Ongoing</div>
                  <Progress value={40} className="h-2 mt-2" />
                </div>
                <div className="p-3 border rounded">
                  <div className="font-semibold">Partnership Development</div>
                  <div className="text-sm text-gray-600">Q3 2024 Target</div>
                  <Progress value={85} className="h-2 mt-2" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                Market Position
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">#2</div>
                  <div className="text-sm text-gray-600">Market Position</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Market Share</span>
                    <span className="font-semibold">18.5%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Growth Rate</span>
                    <span className="font-semibold text-green-600">+15.3%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Competitive Advantage</span>
                    <span className="font-semibold">Strong</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Success Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Customer Satisfaction</span>
                  <span className="font-bold text-green-600">94%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Employee Retention</span>
                  <span className="font-bold text-blue-600">89%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ROI</span>
                  <span className="font-bold text-purple-600">127%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Innovation Index</span>
                  <span className="font-bold text-orange-600">8.7/10</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Alert Detail Modal */}
      <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedAlert && getAlertIcon(selectedAlert.type)}
              Alert Details
            </DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedAlert.title}</h3>
                <p className="text-gray-600 mt-2">{selectedAlert.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <Badge className={`ml-2 ${getAlertColor(selectedAlert.type)}`}>
                    {selectedAlert.type}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Timestamp:</span>
                  <span className="ml-2 font-semibold">
                    {new Date(selectedAlert.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              {selectedAlert.action_required && (
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <div className="font-semibold text-red-800 mb-2">Action Required</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive">
                      Take Action
                    </Button>
                    <Button size="sm" variant="outline">
                      Assign to Team
                    </Button>
                    <Button size="sm" variant="outline">
                      Schedule Review
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}