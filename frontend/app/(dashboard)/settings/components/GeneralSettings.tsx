'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { useState } from 'react';

export function GeneralSettings() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  return (
    <Card className="bg-zinc-950 border-zinc-800">
      <CardHeader>
        <CardTitle>General Config</CardTitle>
        <CardDescription>Global localization and identity defaults</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="space-y-2">
          <Label className="text-zinc-300">Depot Name</Label>
          <Input defaultValue="TransitOps Central Hub" className="bg-zinc-900 border-zinc-800" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Currency</Label>
            <Select defaultValue="USD">
              <SelectTrigger className="bg-zinc-900 border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800">
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Distance Unit</Label>
            <Select defaultValue="KM">
              <SelectTrigger className="bg-zinc-900 border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800">
                <SelectItem value="KM">Kilometers (km)</SelectItem>
                <SelectItem value="MI">Miles (mi)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-zinc-950 font-medium"
          >
            {saving ? 'Saving...' : saved ? 'Saved Successfully' : (
              <>
                <Save className="h-4 w-4 mr-2" /> Save Config
              </>
            )}
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}
