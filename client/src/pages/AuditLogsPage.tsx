import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { apiClient } from '../lib/apiClient';
import {
  Shield,
  Clock,
  User,
  Globe,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileCode,
} from 'lucide-react';

interface IAuditLogItem {
  _id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId?: {
    name: string;
    email: string;
    role: string;
  };
  schoolId?: {
    name: string;
    code: string;
  };
  ipAddress?: string;
  userAgent?: string;
  before?: any;
  after?: any;
  createdAt: string;
}

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<IAuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (actionFilter) params.action = actionFilter;
      if (resourceFilter) params.resource = resourceFilter;

      const res = await apiClient.get('/audit', { params });
      if (res.data.success) {
        setLogs(res.data.data);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages);
          setTotalRecords(res.data.pagination.total);
        }
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, resourceFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Platform Global Audit Trail</h1>
            <Badge variant="info">Super Admin Only</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Immutable system-wide telemetry tracking administrator actions, tenant creation, state mutations, and access logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Logs
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4 flex-wrap shadow-subtle">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Filter by Action (e.g. CREATE, UPDATE)..."
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="w-64 h-9 text-xs"
          />
          <Input
            placeholder="Filter by Resource (e.g. School, User)..."
            value={resourceFilter}
            onChange={(e) => {
              setResourceFilter(e.target.value);
              setPage(1);
            }}
            className="w-64 h-9 text-xs"
          />
        </div>
        <div className="text-xs text-slate-400">
          Showing {logs.length} of {totalRecords} total entries
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator / User</th>
                <th className="py-3 px-4">Target Tenant</th>
                <th className="py-3 px-4">Action & Resource</th>
                <th className="py-3 px-4">IP & Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] text-slate-400 pl-5">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {log.userId ? (
                      <div>
                        <div className="font-semibold text-slate-900">{log.userId.name}</div>
                        <div className="text-[11px] text-slate-400">{log.userId.email}</div>
                        <Badge variant="info" size="sm" className="mt-1">
                          {log.userId.role}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">System Automation</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {log.schoolId ? (
                      <div>
                        <div className="font-semibold text-slate-800">{log.schoolId.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{log.schoolId.code}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400">Global (Platform Level)</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 text-slate-800">
                        {log.action}
                      </span>
                      <span className="font-semibold text-brand-700">{log.resource}</span>
                    </div>
                    {log.resourceId && (
                      <div className="text-[10px] font-mono text-slate-400 mt-1">
                        ID: {log.resourceId}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    <div className="flex items-center gap-1 font-mono text-slate-700">
                      <Globe className="w-3 h-3 text-slate-400" />
                      {log.ipAddress || '127.0.0.1'}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[180px] mt-0.5">
                      {log.userAgent || 'API Client'}
                    </div>
                  </td>
                </tr>
              ))}

              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs italic">
                    No audit records logged yet. As actions are executed across schools, audit entries will populate automatically.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
