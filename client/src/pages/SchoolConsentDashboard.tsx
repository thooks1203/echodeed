import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { 
  Shield, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle,
  Download,
  Calendar as CalendarIcon,
  Search,
  Filter,
  Eye,
  ArrowLeft,
  FileText,
  UserCheck,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

// 📊 TYPE DEFINITIONS
interface ConsentStats {
  totalStudents: number;
  approvedCount: number;
  pendingCount: number;
  deniedCount: number;
  revokedCount: number;
  expiredCount: number;
  pendingOlderThan48h: number;
  expiringIn7Days: number;
  approvedRate: number;
}

interface ConsentRecord {
  id: string;
  studentFirstName: string;
  studentLastName: string;
  studentGrade: string;
  parentName: string;
  parentEmail: string;
  consentStatus: 'pending' | 'approved' | 'denied' | 'revoked' | 'expired';
  consentSubmittedAt?: string;
  consentApprovedAt?: string;
  consentRevokedAt?: string;
  linkExpiresAt?: string;
  recordCreatedAt: string;
  isImmutable: boolean;
}

interface ConsentListResponse {
  consents: ConsentRecord[];
  total: number;
  page: number;
  pageSize: number;
}

interface AuditEvent {
  id: string;
  eventType: string;
  milestone?: string;
  createdAt: string;
  actorRole: string;
  details: {
    ipAddress?: string;
    userAgent?: string;
    [key: string]: any;
  };
}

interface StudentAuditResponse {
  studentId: string;
  auditTrail: AuditEvent[];
}

interface ExpiringConsentsResponse {
  expiringCount: number;
  consents: ConsentRecord[];
}

// 🏫 Main Dashboard Component
export default function SchoolConsentDashboard() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  
  // 🔒 SECURITY FIX: Get schoolId from authenticated user context
  const schoolId = user?.schoolId;
  
  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    navigate('/login');
    return null;
  }
  
  // Show loading while auth is loading or schoolId is not available
  if (authLoading || !schoolId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
          <div className="text-sm text-muted-foreground">Loading school dashboard...</div>
        </div>
      </div>
    );
  }
  
  // 🔒 ADMIN ROLE GUARD: Only admin and teacher users can access consent dashboard
  if (!authLoading && user && user.schoolRole !== 'admin' && user.schoolRole !== 'teacher') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Access Restricted</h2>
            <p className="text-sm text-muted-foreground mt-2">
              The school consent dashboard requires administrator or teacher privileges. 
              Please contact your school administrator for access.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  // 📊 OVERVIEW TAB STATE
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // 👥 STUDENTS TAB STATE
  const [studentsPage, setStudentsPage] = useState(1);
  const [studentsPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 🔍 AUDIT TAB STATE
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  // 📄 REPORTS TAB STATE
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [isExporting, setIsExporting] = useState(false);

  // 📈 DATA QUERIES
  
  // Overview stats query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/schools', schoolId, 'consents', 'stats'],
    enabled: !!schoolId && selectedTab === 'overview'
  });

  // Students list query with filters
  const { data: studentsList, isLoading: studentsLoading } = useQuery({
    queryKey: [
      '/api/schools', 
      schoolId, 
      'consents', 
      { 
        status: statusFilter, 
        grade: gradeFilter, 
        query: searchQuery, 
        page: studentsPage, 
        pageSize: studentsPageSize 
      }
    ],
    enabled: !!schoolId && selectedTab === 'students'
  });

  // Expiring consents query
  const { data: expiringConsents, isLoading: expiringLoading } = useQuery({
    queryKey: ['/api/schools', schoolId, 'consents', 'expiring'],
    enabled: !!schoolId && selectedTab === 'overview'
  });

  // Student audit query
  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['/api/schools', schoolId, 'students', selectedStudentId, 'audit'],
    enabled: !!schoolId && !!selectedStudentId && selectedTab === 'audit'
  });

  // 📊 OVERVIEW TAB COMPONENT
  const OverviewTab = () => {
    const statsData = statsLoading ? null : (stats as ConsentStats);
    const expiringData = expiringLoading ? null : (expiringConsents as ExpiringConsentsResponse);

    return (
      <div className="space-y-6" data-testid="overview-tab">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="card-total-students">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-students">
                {statsLoading ? <Skeleton className="h-8 w-16" /> : statsData?.totalStudents || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Enrolled in school
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-approved-rate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-approved-rate">
                {statsLoading ? <Skeleton className="h-8 w-16" /> : `${statsData?.approvedRate || 0}%`}
              </div>
              <Progress value={statsData?.approvedRate || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card data-testid="card-pending-count">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Consents</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" data-testid="text-pending-count">
                {statsLoading ? <Skeleton className="h-8 w-16" /> : statsData?.pendingCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsData?.pendingOlderThan48h || 0} older than 48h
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-expiring-count">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600" data-testid="text-expiring-count">
                {expiringLoading ? <Skeleton className="h-8 w-16" /> : expiringData?.expiringCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Within 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card data-testid="card-status-breakdown">
            <CardHeader>
              <CardTitle>Consent Status Breakdown</CardTitle>
              <CardDescription>Current distribution of consent statuses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {statsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Approved</span>
                    </div>
                    <Badge variant="secondary" data-testid="badge-approved-count">
                      {statsData?.approvedCount || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span>Pending</span>
                    </div>
                    <Badge variant="secondary" data-testid="badge-pending-count">
                      {statsData?.pendingCount || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>Denied</span>
                    </div>
                    <Badge variant="secondary" data-testid="badge-denied-count">
                      {statsData?.deniedCount || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span>Revoked</span>
                    </div>
                    <Badge variant="secondary" data-testid="badge-revoked-count">
                      {statsData?.revokedCount || 0}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Expiring Consents Table */}
          <Card data-testid="card-expiring-consents">
            <CardHeader>
              <CardTitle>Expiring Consents</CardTitle>
              <CardDescription>Consents that need renewal within 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {expiringLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  {(expiringData?.consents || []).slice(0, 5).map((consent) => (
                    <div key={consent.id} className="flex justify-between items-center p-2 border rounded" data-testid={`expiring-consent-${consent.id}`}>
                      <div>
                        <p className="text-sm font-medium">
                          {consent.studentFirstName} {consent.studentLastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Grade {consent.studentGrade} • {consent.parentEmail}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-orange-600">
                        {consent.linkExpiresAt ? 
                          `Expires ${format(new Date(consent.linkExpiresAt), 'MM/dd')}` : 
                          'Renewal Due'
                        }
                      </Badge>
                    </div>
                  ))}
                  {(!expiringData?.consents || expiringData.consents.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No consents expiring soon
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // 👥 STUDENTS TAB COMPONENT
  const StudentsTab = () => {
    const students = studentsLoading ? null : (studentsList as ConsentListResponse);

    const handleSearch = (query: string) => {
      setSearchQuery(query);
      setStudentsPage(1); // Reset to first page
    };

    const handleFilterChange = (type: 'status' | 'grade', value: string) => {
      if (type === 'status') {
        setStatusFilter(value);
      } else {
        setGradeFilter(value);
      }
      setStudentsPage(1); // Reset to first page
    };

    return (
      <div className="space-y-6" data-testid="students-tab">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Student Consent Records</CardTitle>
            <CardDescription>View and manage all student consent statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Students</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by student name, parent name, or email..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-8"
                    data-testid="input-student-search"
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <Label htmlFor="status-filter">Status Filter</Label>
                <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger data-testid="select-status-filter">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-32">
                <Label htmlFor="grade-filter">Grade Filter</Label>
                <Select value={gradeFilter} onValueChange={(value) => handleFilterChange('grade', value)}>
                  <SelectTrigger data-testid="select-grade-filter">
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Grades</SelectItem>
                    <SelectItem value="6">Grade 6</SelectItem>
                    <SelectItem value="7">Grade 7</SelectItem>
                    <SelectItem value="8">Grade 8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Students Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    (students?.consents || []).map((consent) => (
                      <TableRow key={consent.id} data-testid={`student-row-${consent.id}`}>
                        <TableCell className="font-medium">
                          {consent.studentFirstName} {consent.studentLastName}
                        </TableCell>
                        <TableCell>{consent.studentGrade}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{consent.parentName}</p>
                            <p className="text-xs text-muted-foreground">{consent.parentEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              consent.consentStatus === 'approved' ? 'default' :
                              consent.consentStatus === 'pending' ? 'secondary' :
                              consent.consentStatus === 'denied' ? 'destructive' :
                              consent.consentStatus === 'revoked' ? 'outline' : 'secondary'
                            }
                            data-testid={`badge-status-${consent.id}`}
                          >
                            {consent.consentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {consent.consentSubmittedAt ? 
                            format(new Date(consent.consentSubmittedAt), 'MM/dd/yyyy') : 
                            'Not submitted'
                          }
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedStudentId(consent.id);
                              setSelectedTab('audit');
                            }}
                            data-testid={`button-view-audit-${consent.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {students && students.total > students.pageSize && (
                <div className="flex items-center justify-between px-4 py-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {((students.page - 1) * students.pageSize) + 1} to {Math.min(students.page * students.pageSize, students.total)} of {students.total} students
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={students.page <= 1}
                      onClick={() => setStudentsPage(students.page - 1)}
                      data-testid="button-prev-page"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={students.page >= Math.ceil(students.total / students.pageSize)}
                      onClick={() => setStudentsPage(students.page + 1)}
                      data-testid="button-next-page"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 🔍 AUDIT TAB COMPONENT
  const AuditTab = () => {
    const audit = auditLoading ? null : (auditData as StudentAuditResponse);

    return (
      <div className="space-y-6" data-testid="audit-tab">
        <Card>
          <CardHeader>
            <CardTitle>Student Consent Audit Trail</CardTitle>
            <CardDescription>Complete timeline of consent-related activities with privacy protection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="student-select">Select Student</Label>
              <Input
                id="student-select"
                placeholder="Enter Student ID to view audit trail..."
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                data-testid="input-student-id"
              />
            </div>

            {selectedStudentId && (
              <div className="space-y-4">
                {auditLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    ))}
                  </div>
                ) : audit?.auditTrail?.length ? (
                  <div className="space-y-4">
                    {audit.auditTrail.map((event) => (
                      <div key={event.id} className="border rounded-lg p-4" data-testid={`audit-event-${event.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {event.milestone && (
                                <Badge variant="outline" data-testid={`milestone-${event.id}`}>
                                  {event.milestone}
                                </Badge>
                              )}
                              <span className="text-sm text-muted-foreground">
                                {event.actorRole}
                              </span>
                            </div>
                            <p className="text-sm font-medium mb-1">
                              Event: {event.eventType}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(event.createdAt), 'PPP p')}
                            </p>
                            
                            {/* Privacy-Protected Details */}
                            {event.details && (
                              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                                {event.details.ipAddress && (
                                  <p>IP: {event.details.ipAddress}</p>
                                )}
                                {event.details.userAgent && (
                                  <p>Device: {event.details.userAgent}</p>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {event.eventType.includes('signature') && (
                              <Shield className="h-4 w-4 text-green-600" />
                            )}
                            {event.eventType.includes('approved') && (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                            {event.eventType.includes('denied') && (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedStudentId ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Audit Trail Found</AlertTitle>
                    <AlertDescription>
                      No consent-related activities found for this student ID.
                    </AlertDescription>
                  </Alert>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // 📄 REPORTS TAB COMPONENT
  const ReportsTab = () => {
    const handleExportCSV = async () => {
      if (isExporting) return;
      
      setIsExporting(true);
      try {
        const params = new URLSearchParams();
        if (dateFrom) params.set('from', dateFrom.toISOString());
        if (dateTo) params.set('to', dateTo.toISOString());
        
        const response = await fetch(`/api/schools/${schoolId}/consents/export/csv?${params}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Export failed');
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `consent-report-${schoolId}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: 'Export Successful',
          description: 'Consent report has been downloaded successfully.',
        });
      } catch (error) {
        toast({
          title: 'Export Failed',
          description: 'Failed to export consent report. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsExporting(false);
      }
    };

    return (
      <div className="space-y-6" data-testid="reports-tab">
        <Card>
          <CardHeader>
            <CardTitle>Consent Compliance Reports</CardTitle>
            <CardDescription>Generate and export comprehensive consent reports for compliance and auditing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Range Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-testid="button-date-from"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, 'PPP') : 'Select start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label>To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-testid="button-date-to"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, 'PPP') : 'Select end date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Export Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="flex items-center space-x-2"
                data-testid="button-export-csv"
              >
                <Download className="h-4 w-4" />
                <span>{isExporting ? 'Exporting...' : 'Export CSV Report'}</span>
              </Button>
              
              <div className="text-sm text-muted-foreground flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>PII is masked in exports for privacy protection</span>
              </div>
            </div>

            {/* Report Information */}
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertTitle>Report Contents</AlertTitle>
              <AlertDescription>
                CSV reports include: Student Grade, Consent Status, Submitted Date, Approved Date, 
                Response Time, Parent Relationship, and Signature Method. All personally identifiable 
                information is masked for privacy compliance.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                data-testid="button-back-to-admin"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
              <div>
                <h1 className="text-2xl font-bold" data-testid="title-consent-dashboard">
                  Consent Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  COPPA compliance tracking and reporting for Burlington, NC middle schools
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              <Shield className="h-3 w-3 mr-1" />
              COPPA Compliant
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4" data-testid="tabs-list">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" data-testid="tab-students">
              <Users className="h-4 w-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="audit" data-testid="tab-audit">
              <Eye className="h-4 w-4 mr-2" />
              Audit
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="students">
            <StudentsTab />
          </TabsContent>

          <TabsContent value="audit">
            <AuditTab />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}