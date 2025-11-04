'use client';

import React, { useEffect, useState } from 'react';
import { fetchRetention30d, fetchParentNps } from '@/lib/db/kpis';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Star,
  Activity,
  MessageSquare
} from 'lucide-react';

export default function OperationsDashboard() {
  const [retention, setRetention] = useState<any[]>([]);
  const [nps, setNps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [r, n] = await Promise.all([
          fetchRetention30d(),
          fetchParentNps()
        ]);
        setRetention(r);
        setNps(n);
      } catch (e: any) {
        console.error('Failed to fetch operations data:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Operations Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-destructive/50 bg-destructive/5">
        <div className="text-destructive">
          <h3 className="font-semibold mb-2">Failed to load operations data</h3>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2 text-muted-foreground">
            Please ensure the TCH CRM delta migrations have been applied to your database.
          </p>
        </div>
      </Card>
    );
  }

  // Calculate aggregated metrics
  const totalRetention = retention.reduce((acc, r) => ({
    active: acc.active + (r.active_count || 0),
    new30d: acc.new30d + (r.new_last_30d || 0)
  }), { active: 0, new30d: 0 });

  const retentionRate = totalRetention.active > 0 
    ? ((totalRetention.active - totalRetention.new30d) / totalRetention.active * 100).toFixed(1)
    : 0;

  const avgNps = nps.length > 0
    ? (nps.reduce((acc, n) => acc + (n.avg_rating || 0), 0) / nps.length).toFixed(1)
    : 0;

  const totalResponses = nps.reduce((acc, n) => acc + (n.response_count || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Operations Dashboard</h1>
        <p className="text-muted-foreground">Student retention, satisfaction, and operational metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">30-Day Retention</p>
              <p className="text-3xl font-bold mt-1">{retentionRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalRetention.active - totalRetention.new30d} retained students
              </p>
            </div>
            <div className={`p-3 rounded-full ${Number(retentionRate) >= 80 ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <Activity className={`h-6 w-6 ${Number(retentionRate) >= 80 ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Parent NPS</p>
              <p className="text-3xl font-bold mt-1">{avgNps}/10</p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalResponses} responses
              </p>
            </div>
            <div className={`p-3 rounded-full ${Number(avgNps) >= 8 ? 'bg-green-100' : Number(avgNps) >= 6 ? 'bg-yellow-100' : 'bg-red-100'}`}>
              <Star className={`h-6 w-6 ${Number(avgNps) >= 8 ? 'text-green-600' : Number(avgNps) >= 6 ? 'text-yellow-600' : 'text-red-600'}`} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Students</p>
              <p className="text-3xl font-bold mt-1">{totalRetention.active}</p>
              <p className="text-xs text-muted-foreground mt-1">
                +{totalRetention.new30d} new (30d)
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Feedback Rate</p>
              <p className="text-3xl font-bold mt-1">
                {totalRetention.active > 0 
                  ? ((totalResponses / totalRetention.active) * 100).toFixed(0)
                  : 0}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Parent engagement
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Retention by Team */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Retention by Team (30 Days)</h2>
        <div className="space-y-4">
          {retention.length > 0 ? (
            retention.map((r, idx) => {
              const retRate = r.active_count > 0 
                ? ((r.active_count - r.new_last_30d) / r.active_count * 100)
                : 0;
              return (
                <div key={r.team_id || idx} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{r.team_name || 'Unknown Team'}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {r.active_count || 0} active • {r.new_last_30d || 0} new
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Progress value={retRate} className="w-32 h-2" />
                    <Badge variant={retRate >= 80 ? 'default' : retRate >= 60 ? 'secondary' : 'destructive'}>
                      {retRate.toFixed(0)}%
                    </Badge>
                    {retRate >= 80 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground text-center py-8">No retention data available</p>
          )}
        </div>
      </Card>

      {/* Parent NPS by Team */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Parent Satisfaction by Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nps.length > 0 ? (
            nps.map((n, idx) => (
              <Card key={n.team_id || idx} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{n.team_name || 'Unknown Team'}</div>
                    <div className="text-2xl font-bold mt-2">
                      {Number(n.avg_rating || 0).toFixed(1)}/10
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {n.response_count || 0} responses
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor((n.avg_rating || 0) / 2) 
                            ? 'text-yellow-500 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No parent feedback data available
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}