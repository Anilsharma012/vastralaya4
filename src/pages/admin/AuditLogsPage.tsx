import { useState, useEffect } from "react";
import { Search, Activity, Calendar, User, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface AuditLog {
  _id: string;
  adminId: { _id: string; name: string; email: string };
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

const AuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await api.get<{ logs: AuditLog[] }>('/admin/audit-logs');
      setLogs(data.logs || []);
    } catch (error) {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("create") || action.includes("add")) return "default";
    if (action.includes("update") || action.includes("edit")) return "secondary";
    if (action.includes("delete") || action.includes("remove")) return "destructive";
    return "outline";
  };

  const filteredLogs = logs.filter(log => {
    const matchSearch = log.action?.toLowerCase().includes(search.toLowerCase()) ||
                       log.entity?.toLowerCase().includes(search.toLowerCase()) ||
                       log.adminId?.name?.toLowerCase().includes(search.toLowerCase()) ||
                       log.details?.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "all" || log.action?.includes(actionFilter);
    return matchSearch && matchAction;
  });

  if (isLoading) {
    return <div className="p-6">Loading audit logs...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Audit Logs</h1>
        <Badge variant="outline">{logs.length} total entries</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-40" data-testid="select-action">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="login">Login</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No audit logs found
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log._id} data-testid={`card-log-${log._id}`}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                        <span className="text-sm text-muted-foreground">on</span>
                        <Badge variant="outline">{log.entity}</Badge>
                      </div>
                      {log.details && (
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.adminId?.name || "System"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                        {log.entityId && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            ID: {log.entityId.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;
