'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TestIntegrationPage() {
  const [tests, setTests] = useState<Array<{name: string, status: 'loading' | 'pass' | 'fail', message: string}>>([]);
  
  useEffect(() => {
    runIntegrationTests();
  }, []);

  const runIntegrationTests = async () => {
    const testResults = [];

    // Test 1: Check existing students table
    testResults.push({ name: 'Students Table', status: 'loading', message: 'Checking...' });
    try {
      const { data: students, error } = await supabase.from('students').select('*').limit(1);
      if (error) throw error;
      testResults[testResults.length - 1] = {
        name: 'Students Table',
        status: 'pass',
        message: `✅ Found ${students?.length || 0} students in database`
      };
    } catch (error: any) {
      testResults[testResults.length - 1] = {
        name: 'Students Table',
        status: 'fail',
        message: `❌ Error: ${error.message}`
      };
    }

    // Test 2: Check schools table
    testResults.push({ name: 'Schools Table', status: 'loading', message: 'Checking...' });
    try {
      const { data: schools, error } = await supabase.from('schools').select('*').limit(1);
      if (error) throw error;
      testResults[testResults.length - 1] = {
        name: 'Schools Table',
        status: 'pass',
        message: `✅ Found ${schools?.length || 0} schools in database`
      };
    } catch (error: any) {
      testResults[testResults.length - 1] = {
        name: 'Schools Table',
        status: 'fail',
        message: `❌ Error: ${error.message}`
      };
    }

    // Test 3: Check teams table (TCH CRM)
    testResults.push({ name: 'Teams Table (TCH CRM)', status: 'loading', message: 'Checking...' });
    try {
      const { data: teams, error } = await supabase.from('teams').select('*').limit(1);
      if (error) throw error;
      testResults[testResults.length - 1] = {
        name: 'Teams Table (TCH CRM)',
        status: 'pass',
        message: `✅ TCH CRM integrated! Found ${teams?.length || 0} teams`
      };
    } catch (error: any) {
      testResults[testResults.length - 1] = {
        name: 'Teams Table (TCH CRM)',
        status: 'fail',
        message: `❌ Migration needed: ${error.message}`
      };
    }

    // Test 4: Check staff table
    testResults.push({ name: 'Staff Table', status: 'loading', message: 'Checking...' });
    try {
      const { data: staff, error } = await supabase.from('staff').select('*').limit(1);
      if (error) throw error;
      testResults[testResults.length - 1] = {
        name: 'Staff Table',
        status: 'pass',
        message: `✅ Found ${staff?.length || 0} staff members`
      };
    } catch (error: any) {
      testResults[testResults.length - 1] = {
        name: 'Staff Table',
        status: 'fail',
        message: `❌ Migration needed: ${error.message}`
      };
    }

    // Test 5: Check CEO dashboard view
    testResults.push({ name: 'CEO Dashboard View', status: 'loading', message: 'Checking...' });
    try {
      const { data: ceoDash, error } = await supabase.from('ceo_dashboard').select('*').single();
      if (error) throw error;
      testResults[testResults.length - 1] = {
        name: 'CEO Dashboard View',
        status: 'pass',
        message: `✅ CEO Dashboard ready! ${ceoDash.total_students || 0} total students`
      };
    } catch (error: any) {
      testResults[testResults.length - 1] = {
        name: 'CEO Dashboard View',
        status: 'fail',
        message: `❌ View not ready: ${error.message}`
      };
    }

    // Test 6: Check team performance view
    testResults.push({ name: 'Team Performance View', status: 'loading', message: 'Checking...' });
    try {
      const { data: teamPerf, error } = await supabase.from('team_performance').select('*');
      if (error) throw error;
      testResults[testResults.length - 1] = {
        name: 'Team Performance View',
        status: 'pass',
        message: `✅ Team Performance ready! ${teamPerf?.length || 0} teams tracked`
      };
    } catch (error: any) {
      testResults[testResults.length - 1] = {
        name: 'Team Performance View',
        status: 'fail',
        message: `❌ View not ready: ${error.message}`
      };
    }

    setTests([...testResults]);
  };

  const overallStatus = tests.length > 0 ? (
    tests.every(t => t.status === 'pass') ? 'pass' : 
    tests.some(t => t.status === 'loading') ? 'loading' : 'fail'
  ) : 'loading';

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Integration Test Results</h1>
        <p className="text-muted-foreground">
          Testing the connection between your existing student data and the new TCH CRM dashboards
        </p>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Overall Status</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {overallStatus === 'pass' && 'All systems integrated and working!'}
              {overallStatus === 'fail' && 'Migration needed to complete integration'}
              {overallStatus === 'loading' && 'Testing in progress...'}
            </p>
          </div>
          <Badge variant={
            overallStatus === 'pass' ? 'default' : 
            overallStatus === 'fail' ? 'destructive' : 'secondary'
          }>
            {overallStatus === 'pass' && '✅ Ready'}
            {overallStatus === 'fail' && '⚠️ Needs Migration'}
            {overallStatus === 'loading' && '🔄 Testing...'}
          </Badge>
        </div>
      </Card>

      <div className="grid gap-4">
        {tests.map((test, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{test.name}</div>
                <div className="text-sm text-muted-foreground mt-1">{test.message}</div>
              </div>
              <Badge variant={
                test.status === 'pass' ? 'default' : 
                test.status === 'fail' ? 'destructive' : 'secondary'
              }>
                {test.status === 'pass' && 'Pass'}
                {test.status === 'fail' && 'Fail'}
                {test.status === 'loading' && 'Testing...'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {overallStatus === 'fail' && (
        <Card className="mt-6 p-6 border-orange-200 bg-orange-50">
          <h3 className="font-semibold text-orange-900 mb-3">🚀 Next Steps</h3>
          <div className="text-sm text-orange-800 space-y-2">
            <p><strong>1. Apply the migration:</strong> Run the SQL script in <code>database_migrations/complete_crm_integration.sql</code></p>
            <p><strong>2. Refresh this page</strong> to see the integration working</p>
            <p><strong>3. Visit the dashboards:</strong></p>
            <ul className="ml-4 mt-2 space-y-1">
              <li>• <a href="/dashboard/ceo" className="underline hover:no-underline">CEO Command Center</a></li>
              <li>• <a href="/dashboard/operations" className="underline hover:no-underline">Operations Dashboard</a></li>
            </ul>
          </div>
        </Card>
      )}

      {overallStatus === 'pass' && (
        <Card className="mt-6 p-6 border-green-200 bg-green-50">
          <h3 className="font-semibold text-green-900 mb-3">🎉 Integration Complete!</h3>
          <div className="text-sm text-green-800 space-y-2">
            <p>Your student data is now connected to the TCH CRM dashboards.</p>
            <p><strong>Try these next:</strong></p>
            <ul className="ml-4 mt-2 space-y-1">
              <li>• Add a new student in <a href="/students" className="underline hover:no-underline">/students</a></li>
              <li>• Check the updated metrics in <a href="/dashboard/ceo" className="underline hover:no-underline">CEO Dashboard</a></li>
              <li>• View team performance in <a href="/dashboard/operations" className="underline hover:no-underline">Operations Dashboard</a></li>
            </ul>
          </div>
        </Card>
      )}

      <div className="mt-6 text-center">
        <button 
          onClick={() => {
            setTests([]);
            runIntegrationTests();
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Rerun Tests
        </button>
      </div>
    </div>
  );
}