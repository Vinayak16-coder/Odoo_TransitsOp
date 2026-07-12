import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Save } from 'lucide-react';
import { toast } from 'sonner';

export function GeneralSettings() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings saved successfully');
  };

  return (
    <Card className="border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-indigo-400" />
          General Info
        </CardTitle>
        <CardDescription>Configure your depot's primary settings.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSave}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="depotName">Depot Name</Label>
            <Input id="depotName" defaultValue="Central Hub (Alpha)" className="bg-zinc-900 border-zinc-800" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select defaultValue="USD">
              <SelectTrigger id="currency" className="bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="distanceUnit">Distance Unit</Label>
            <Select defaultValue="KM">
              <SelectTrigger id="distanceUnit" className="bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="Select Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KM">Kilometers (km)</SelectItem>
                <SelectItem value="MI">Miles (mi)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
            <Save className="w-4 h-4 mr-2" /> Save Settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
