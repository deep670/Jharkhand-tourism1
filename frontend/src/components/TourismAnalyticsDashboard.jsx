import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ChevronDown,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Globe,
  Target,
  Clock,
  Mail,
  Phone,
  MapPin,
  FileText,
  Briefcase,
  PieChart,
  LineChart,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  Menu,
  X,
  Zap,
  Shield,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw,
  Share2,
  Star,
  TrendingDown,
  MousePointer,
  Smartphone,
  Monitor,
  Home,
  Package,
  ShoppingCart,
  CreditCard,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';

const CompleteProfessionalDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', title: 'System Update', message: 'Scheduled maintenance tonight at 2 AM', time: '2h ago', read: false },
    { id: 2, type: 'success', title: 'Report Generated', message: 'Monthly analytics report is ready for download', time: '4h ago', read: false },
    { id: 3, type: 'warning', title: 'High Usage Alert', message: 'Server capacity reached 85% - consider scaling', time: '6h ago', read: true },
    { id: 4, type: 'info', title: 'New Feature', message: 'Advanced filtering options now available', time: '1d ago', read: true }
  ]);

  // Comprehensive sample data
  const performanceData = [
    { name: 'Jan', revenue: 45000, users: 2400, growth: 12, orders: 450, sessions: 12000 },
    { name: 'Feb', revenue: 52000, users: 2800, growth: 15, orders: 520, sessions: 14000 },
    { name: 'Mar', revenue: 48000, users: 2600, growth: 8, orders: 480, sessions: 13000 },
    { name: 'Apr', revenue: 61000, users: 3200, growth: 18, orders: 610, sessions: 16000 },
    { name: 'May', revenue: 55000, users: 2900, growth: 10, orders: 550, sessions: 15000 },
    { name: 'Jun', revenue: 67000, users: 3500, growth: 22, orders: 670, sessions: 18000 },
    { name: 'Jul', revenue: 71000, users: 3800, growth: 25, orders: 710, sessions: 19000 },
    { name: 'Aug', revenue: 68000, users: 3600, growth: 20, orders: 680, sessions: 18500 },
    { name: 'Sep', revenue: 75000, users: 4000, growth: 28, orders: 750, sessions: 20000 },
    { name: 'Oct', revenue: 72000, users: 3900, growth: 24, orders: 720, sessions: 19500 },
    { name: 'Nov', revenue: 78000, users: 4200, growth: 30, orders: 780, sessions: 21000 },
    { name: 'Dec', revenue: 82000, users: 4500, growth: 35, orders: 820, sessions: 22000 }
  ];

  const departmentData = [
    { name: 'Engineering', value: 35, color: '#1f2937', count: 42 },
    { name: 'Sales', value: 28, color: '#374151', count: 34 },
    { name: 'Marketing', value: 20, color: '#4b5563', count: 24 },
    { name: 'Support', value: 17, color: '#6b7280', count: 21 }
  ];

  const trafficSources = [
    { source: 'Direct', visitors: 15420, percentage: 35.2, change: 12.5 },
    { source: 'Google', visitors: 12350, percentage: 28.1, change: 8.3 },
    { source: 'Social Media', visitors: 8940, percentage: 20.4, change: -2.1 },
    { source: 'Email', visitors: 4280, percentage: 9.8, change: 15.7 },
    { source: 'Referral', visitors: 2810, percentage: 6.5, change: 5.2 }
  ];

  const deviceAnalytics = [
    { device: 'Desktop', users: 28500, percentage: 52.3, sessions: 45200, conversion: 3.4 },
    { device: 'Mobile', users: 21400, percentage: 39.2, sessions: 32100, conversion: 2.8 },
    { device: 'Tablet', users: 4600, percentage: 8.5, sessions: 6800, conversion: 2.1 }
  ];

  const topProducts = [
    { name: 'Premium Plan', revenue: 45200, units: 452, growth: 18.5, rating: 4.8 },
    { name: 'Basic Plan', revenue: 32800, units: 656, growth: 12.3, rating: 4.6 },
    { name: 'Enterprise Plan', revenue: 67400, units: 234, growth: 25.7, rating: 4.9 },
    { name: 'Starter Plan', revenue: 18600, units: 372, growth: 8.9, rating: 4.4 }
  ];

  const recentTransactions = [
    { id: 'TXN-001', customer: 'Acme Corp', amount: 2500, status: 'completed', date: '2024-01-15', type: 'subscription' },
    { id: 'TXN-002', customer: 'Tech Startup', amount: 890, status: 'pending', date: '2024-01-15', type: 'one-time' },
    { id: 'TXN-003', customer: 'Global Inc', amount: 5200, status: 'completed', date: '2024-01-14', type: 'enterprise' },
    { id: 'TXN-004', customer: 'Small Business', amount: 450, status: 'failed', date: '2024-01-14', type: 'subscription' },
    { id: 'TXN-005', customer: 'Enterprise Co', amount: 8900, status: 'completed', date: '2024-01-13', type: 'enterprise' }
  ];

  const systemMetrics = [
    { name: 'CPU Usage', value: 68, max: 100, status: 'good', trend: 'stable' },
    { name: 'Memory', value: 45, max: 100, status: 'good', trend: 'down' },
    { name: 'Disk Space', value: 78, max: 100, status: 'warning', trend: 'up' },
    { name: 'Network', value: 34, max: 100, status: 'good', trend: 'stable' }
  ];

  const StatCard = ({ title, value, change, icon: Icon, trend, subtitle, color = "gray" }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className={`p-1 rounded-full bg-${color}-50`}>
              <Icon className={`w-3 h-3 text-${color}-600`} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mb-3">{subtitle}</p>}
          <div className="flex items-center space-x-2">
            {change > 0 ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${
              change > 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {Math.abs(change)}%
            </span>
            <span className="text-sm text-gray-500">vs last period</span>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <button className="p-2 rounded-lg hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
          {trend && (
            <div className="w-16 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={performanceData.slice(-6)}>
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={change > 0 ? "#10b981" : "#ef4444"}
                    strokeWidth={2}
                    dot={false}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const MetricCard = ({ title, value, subtitle, icon: Icon, color = "gray", action }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <button className="p-1 rounded-lg hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
        {action && (
          <button className="mt-3 text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center">
            {action} <ArrowUpRight className="w-3 h-3 ml-1" />
          </button>
        )}
      </div>
    </div>
  );

  const NotificationItem = ({ notification, onDismiss, onMarkRead }) => {
    const getIcon = () => {
      switch (notification.type) {
        case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
        case 'warning': return <AlertCircle className="w-5 h-5 text-amber-600" />;
        case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
        default: return <Info className="w-5 h-5 text-blue-600" />;
      }
    };

    return (
      <div className={`flex items-start space-x-3 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}>
        {getIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
            </div>
            <div className="flex space-x-1 ml-2">
              {!notification.read && (
                <button
                  onClick={() => onMarkRead(notification.id)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark read
                </button>
              )}
              <button
                onClick={() => onDismiss(notification.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProgressBar = ({ value, max, color = "gray", showLabel = true }) => (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        {showLabel && (
          <span className="text-sm font-medium text-gray-900">{value}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`bg-${color}-600 h-2 rounded-full transition-all duration-500`}
          style={{ width: `${(value / max) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', id: 'overview', active: true },
    { icon: BarChart3, label: 'Analytics', id: 'analytics' },
    { icon: Users, label: 'Customers', id: 'customers' },
    { icon: Package, label: 'Products', id: 'products' },
    { icon: ShoppingCart, label: 'Orders', id: 'orders' },
    { icon: CreditCard, label: 'Payments', id: 'payments' },
    { icon: FileText, label: 'Reports', id: 'reports' },
    { icon: Settings, label: 'Settings', id: 'settings' }
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markNotificationRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden mt-[-4vh]">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col pt-[3vh]`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">Enterprise</h1>
                <p className="text-sm text-gray-600">Business Dashboard</p>
              </div>
            )}
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors text-left ${
                    activeTab === item.id
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className={`${sidebarOpen ? 'block' : 'hidden'}`}>
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">System Status</span>
              </div>
              <p className="text-xs text-gray-600">All systems operational</p>
            </div>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              Help & Support
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Business Intelligence</h1>
                <p className="text-sm text-gray-600">Comprehensive performance monitoring and analytics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white"
                />
              </div>
              
             

              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                </button>
              </div>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content - Scrollable */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Key Metrics */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Key Performance Indicators</h2>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg">Overview</button>
                <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded-lg">Detailed</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value="$847.2K"
                change={12.5}
                icon={DollarSign}
                trend={true}
                subtitle="Monthly recurring revenue"
                color="emerald"
              />
              <StatCard
                title="Active Users"
                value="24,847"
                change={8.2}
                icon={Users}
                trend={true}
                subtitle="Daily active users"
                color="blue"
              />
              <StatCard
                title="Conversion Rate"
                value="4.24%"
                change={-2.1}
                icon={Target}
                trend={true}
                subtitle="Overall conversion rate"
                color="purple"
              />
              <StatCard
                title="Average Session"
                value="6m 42s"
                change={15.3}
                icon={Clock}
                trend={true}
                subtitle="User engagement time"
                color="amber"
              />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Revenue & Growth Trends</h3>
                  <p className="text-sm text-gray-600">12-month performance analysis with growth metrics</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg">Revenue</button>
                  <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded-lg">Users</button>
                  <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded-lg">Orders</button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={performanceData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1f2937" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1f2937" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1f2937"
                    strokeWidth={3}
                    fill="url(#revenueGradient)"
                    name="Revenue ($)"
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="orders" 
                    fill="#d1d5db" 
                    name="Orders"
                    radius={[2, 2, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="growth"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Growth %"
                    dot={{ r: 3, fill: '#10b981' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Team Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Team Distribution</h3>
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <RechartsPieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ value }) => `${value}%`}
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="space-y-3 mt-4">
                {departmentData.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }}></div>
                      <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{dept.count}</span>
                      <span className="text-xs text-gray-500 ml-1">({dept.value}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Metrics Grid */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Support Tickets"
                value="247"
                subtitle="12 pending resolution"
                icon={Mail}
                color="blue"
                action="View all tickets"
              />
              <MetricCard
                title="Active Projects"
                value="18"
                subtitle="3 due this week"
                icon={Briefcase}
                color="green"
                action="Manage projects"
              />
              <MetricCard
                title="Server Uptime"
                value="99.9%"
                subtitle="Last 30 days"
                icon={Activity}
                color="emerald"
                action="View status"
              />
              <MetricCard
                title="Global Reach"
                value="47"
                subtitle="Countries served"
                icon={Globe}
                color="purple"
                action="View analytics"
              />
            </div>
          </section>

          {/* Traffic Sources & Device Analytics */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Traffic Sources</h3>
                <button className="text-sm text-gray-600 hover:text-gray-900">View Details</button>
              </div>
              <div className="space-y-4">
                {trafficSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{source.source}</span>
                        <span className="text-sm font-bold text-gray-900">{source.visitors.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gray-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${source.percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{source.percentage}%</span>
                          <span className={`text-xs font-medium ${
                            source.change > 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {source.change > 0 ? '+' : ''}{source.change}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Device Analytics</h3>
                <button className="text-sm text-gray-600 hover:text-gray-900">View Details</button>
              </div>
              <div className="space-y-4">
                {deviceAnalytics.map((device, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg border border-gray-200">
                          {device.device === 'Desktop' && <Monitor className="w-5 h-5 text-gray-600" />}
                          {device.device === 'Mobile' && <Smartphone className="w-5 h-5 text-gray-600" />}
                          {device.device === 'Tablet' && <MousePointer className="w-5 h-5 text-gray-600" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{device.device}</h4>
                          <p className="text-sm text-gray-600">{device.users.toLocaleString()} users</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{device.percentage}%</p>
                        <p className="text-sm text-gray-600">{device.conversion}% conv.</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Products Performance & Recent Transactions */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
                <button className="text-sm text-gray-600 hover:text-gray-900">View All</button>
              </div>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-all">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{product.name}</h4>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{product.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">${product.revenue.toLocaleString()}</span>
                        <span className="text-sm text-gray-600">{product.units} units</span>
                      </div>
                      <div className="flex items-center mt-2">
                        {product.growth > 0 ? (
                          <ArrowUp className="w-3 h-3 text-emerald-600 mr-1" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-red-600 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          product.growth > 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {product.growth > 0 ? '+' : ''}{product.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                <button className="text-sm text-gray-600 hover:text-gray-900">View All</button>
              </div>
              <div className="space-y-4">
                {recentTransactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{transaction.customer}</span>
                        <span className="font-bold text-gray-900">${transaction.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{transaction.id}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            transaction.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                          <span className="text-xs text-gray-500">{transaction.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* System Metrics & Activity */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* System Performance */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">System Performance</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">All systems operational</span>
                </div>
              </div>
              <div className="space-y-6">
                {systemMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {metric.name === 'CPU Usage' && <Cpu className="w-4 h-4 text-gray-600" />}
                        {metric.name === 'Memory' && <HardDrive className="w-4 h-4 text-gray-600" />}
                        {metric.name === 'Disk Space' && <Database className="w-4 h-4 text-gray-600" />}
                        {metric.name === 'Network' && <Wifi className="w-4 h-4 text-gray-600" />}
                        <span className="font-medium text-gray-900">{metric.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold">{metric.value}%</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          metric.status === 'good' ? 'bg-emerald-100 text-emerald-800' :
                          metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {metric.status}
                        </span>
                      </div>
                    </div>
                    <ProgressBar 
                      value={metric.value} 
                      max={metric.max} 
                      color={metric.status === 'good' ? 'emerald' : metric.status === 'warning' ? 'yellow' : 'red'}
                      showLabel={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { user: "Sarah Chen", action: "completed Q4 financial report", time: "2 hours ago", type: "success", avatar: "SC" },
                  { user: "Mike Johnson", action: "uploaded marketing campaign assets", time: "4 hours ago", type: "info", avatar: "MJ" },
                  { user: "Team Alpha", action: "deployed version 2.1.4 to production", time: "6 hours ago", type: "success", avatar: "TA" },
                  { user: "Emma Wilson", action: "created new customer support ticket", time: "8 hours ago", type: "warning", avatar: "EW" },
                  { user: "System", action: "completed automated backup process", time: "12 hours ago", type: "info", avatar: "SY" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      activity.type === 'success' ? 'bg-emerald-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}>
                      {activity.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'success' ? 'bg-emerald-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                View All Activities
              </button>
            </div>
          </section>

          {/* Notifications Panel */}
          <section className="mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  System Notifications
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      {notifications.filter(n => !n.read).length} new
                    </span>
                  )}
                </h3>
                <button 
                  className="text-sm text-gray-600 hover:text-gray-900"
                  onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                >
                  Mark All Read
                </button>
              </div>
              <div className="space-y-0 -mx-2 max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onDismiss={dismissNotification}
                    onMarkRead={markNotificationRead}
                  />
                ))}
              </div>
              {notifications.length === 0 && (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No notifications at this time</p>
                </div>
              )}
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-gray-200 pt-6 pb-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
                <span>•</span>
                <span>Data refreshed every 5 minutes</span>
                <span>•</span>
                <button 
                  onClick={handleRefresh}
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Refresh now
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <button className="hover:text-gray-700">Privacy</button>
                <button className="hover:text-gray-700">Terms</button>
                <button className="hover:text-gray-700">Support</button>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default CompleteProfessionalDashboard;