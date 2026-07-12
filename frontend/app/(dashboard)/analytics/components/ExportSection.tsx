'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Car, Users, Route, ReceiptText } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function ExportSection() {
  const token = useAuthStore(s => s.token);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (type: string) => {
    if (!token) return;
    setDownloading(type);
    
    try {
      const response = await fetch(`${API_BASE}/analytics/export/${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Failed to download CSV.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Card className="bg-zinc-950 border-zinc-800">
      <CardHeader>
        <CardTitle>Data Export</CardTitle>
        <CardDescription>Download raw datasets in CSV format for external analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="w-full justify-start border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100" 
            onClick={() => handleDownload('vehicles')}
            disabled={downloading !== null}
          >
            <Car className="h-4 w-4 mr-2 text-blue-400" />
            {downloading === 'vehicles' ? 'Exporting...' : 'Vehicles'}
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100" 
            onClick={() => handleDownload('drivers')}
            disabled={downloading !== null}
          >
            <Users className="h-4 w-4 mr-2 text-green-400" />
            {downloading === 'drivers' ? 'Exporting...' : 'Drivers'}
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100" 
            onClick={() => handleDownload('trips')}
            disabled={downloading !== null}
          >
            <Route className="h-4 w-4 mr-2 text-amber-400" />
            {downloading === 'trips' ? 'Exporting...' : 'Trips'}
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100" 
            onClick={() => handleDownload('expenses')}
            disabled={downloading !== null}
          >
            <ReceiptText className="h-4 w-4 mr-2 text-purple-400" />
            {downloading === 'expenses' ? 'Exporting...' : 'Expenses'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
