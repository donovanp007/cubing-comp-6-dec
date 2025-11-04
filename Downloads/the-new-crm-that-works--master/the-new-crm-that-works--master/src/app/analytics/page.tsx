'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">284</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Schools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +2 new partnerships
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R24,500</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  Students completing program
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Student Enrollment Trend</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Chart visualization coming soon...
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Performing Schools</CardTitle>
                <CardDescription>
                  By completion rate this quarter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Greenfield Primary
                      </p>
                      <p className="text-sm text-muted-foreground">
                        95% completion rate
                      </p>
                    </div>
                    <div className="ml-auto font-medium">95%</div>
                  </div>
                  <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Parktown High
                      </p>
                      <p className="text-sm text-muted-foreground">
                        92% completion rate
                      </p>
                    </div>
                    <div className="ml-auto font-medium">92%</div>
                  </div>
                  <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Sandton Academy
                      </p>
                      <p className="text-sm text-muted-foreground">
                        88% completion rate
                      </p>
                    </div>
                    <div className="ml-auto font-medium">88%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Analytics</CardTitle>
              <CardDescription>
                Detailed student performance and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Student analytics dashboard coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>School Analytics</CardTitle>
              <CardDescription>
                School performance and partnership insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                School analytics dashboard coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Financial performance and revenue tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Revenue analytics dashboard coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}