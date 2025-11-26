"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Settings, Timer, Plus, Pencil } from "lucide-react";
import type { EventType } from "@/lib/types/database.types";

export default function SettingsPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("event_types")
      .select("*")
      .order("sort_order");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch event types",
        variant: "destructive",
      });
    } else {
      setEventTypes(data || []);
    }
    setLoading(false);
  };

  const toggleEventActive = async (event: EventType) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("event_types")
      .update({ active: !event.active })
      .eq("id", event.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Updated",
        description: `${event.display_name} is now ${!event.active ? "active" : "inactive"}`,
      });
      fetchEventTypes();
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-gray-600" />
            Settings
          </h1>
          <p className="text-gray-500 mt-1">Manage event types and system settings</p>
        </div>
      </div>

      {/* Event Types */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-blue-500" />
                Event Types
              </CardTitle>
              <CardDescription>
                Manage cube events available for competitions
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <AddEventDialog
                onSuccess={() => {
                  setIsAddDialogOpen(false);
                  fetchEventTypes();
                }}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventTypes.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="text-gray-500">{event.sort_order}</TableCell>
                    <TableCell className="font-mono">{event.name}</TableCell>
                    <TableCell className="font-medium">{event.display_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.format.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={event.active ? "success" : "secondary"}>
                        {event.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleEventActive(event)}
                      >
                        {event.active ? "Disable" : "Enable"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About Cubing Hub</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Version</p>
              <p className="font-medium">1.0.0</p>
            </div>
            <div>
              <p className="text-gray-500">Framework</p>
              <p className="font-medium">Next.js 15</p>
            </div>
            <div>
              <p className="text-gray-500">Database</p>
              <p className="font-medium">Supabase (PostgreSQL)</p>
            </div>
            <div>
              <p className="text-gray-500">UI Components</p>
              <p className="font-medium">shadcn/ui + Tailwind</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AddEventDialog({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    display_name: "",
    description: "",
    format: "ao5",
    sort_order: 10,
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.from("event_types").insert({
      name: formData.name,
      display_name: formData.display_name,
      description: formData.description || null,
      format: formData.format,
      sort_order: formData.sort_order,
      active: true,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Event type added",
      });
      onSuccess();
    }

    setLoading(false);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Event Type</DialogTitle>
        <DialogDescription>Add a new cube event type</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Code Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 3x3x3"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="e.g., Rubik's Cube"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Input
                id="format"
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                placeholder="ao5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Event"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
