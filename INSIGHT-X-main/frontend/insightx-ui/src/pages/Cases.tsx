import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, FolderOpen } from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCases } from '@/hooks/useCases';
import { formatTimeAgo } from '@/lib/utils';
import type { CaseStatus, CasePriority } from '../api/cases.types';

export default function Cases() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useCases({ page, pageSize: 20 });

  // Filter cases by search query (client-side)
  const filteredCases = data?.cases?.filter(caseItem =>
    searchQuery === '' ||
    caseItem.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    caseItem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    caseItem.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getStatusVariant = (status: CaseStatus) => {
    switch (status) {
      case 'OPEN':
      case 'INVESTIGATING':
        return 'warning';
      case 'PENDING_ACTION':
        return 'info';
      case 'RESOLVED':
      case 'CLOSED':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityVariant = (priority: CasePriority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'danger';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'default';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={(error as Error).message || 'Failed to load cases'} />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Case Management</h1>
          <p className="text-text-secondary">Manage and investigate security incidents.</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search cases..."
            icon={<Search className="h-4 w-4" />}
            className="w-full md:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button onClick={() => navigate('/cases/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Button>
        </div>
      </div>

      {filteredCases.length === 0 ? (
        <Card>
          <EmptyState
            icon={FolderOpen}
            title="No Cases Found"
            description={searchQuery
              ? "No cases match your search query. Try different keywords."
              : "No security cases have been created yet. Click 'New Case' to create one."}
          />
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="bg-bg-secondary p-5 rounded-lg border border-border-subtle hover:border-border-strong transition-colors cursor-pointer group"
              onClick={() => navigate(`/cases/${caseItem.id}`)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-2 bg-primary-500/10 rounded-lg text-primary-400 group-hover:text-primary-300 group-hover:bg-primary-500/20 transition-colors">
                    <FolderOpen className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-bold text-text-primary font-mono">
                        {caseItem.id}
                      </h3>
                      <Badge variant={getPriorityVariant(caseItem.priority)} size="sm">
                        {caseItem.priority}
                      </Badge>
                      <Badge variant={getStatusVariant(caseItem.status)} size="sm">
                        {caseItem.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <p className="text-text-primary font-medium mb-1">
                      {caseItem.title || 'Untitled Case'}
                    </p>

                    {caseItem.description && (
                      <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                        {caseItem.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-text-tertiary">
                      {caseItem.subject && (
                        <span>
                          Subject: <span className="text-text-primary">{caseItem.subject}</span>
                        </span>
                      )}
                      {caseItem.updatedAt && (
                        <span>Updated: {formatTimeAgo(caseItem.updatedAt)}</span>
                      )}
                      {caseItem.createdAt && (
                        <span>Opened: {formatTimeAgo(caseItem.createdAt)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="text-sm text-text-secondary">Assigned to</div>
                  <div className="text-sm font-medium text-text-primary">
                    {caseItem.assignedTo || 'Unassigned'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.total > 20 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-text-secondary">
            Showing {filteredCases.length} of {data.total} cases
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={filteredCases.length < 20}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
