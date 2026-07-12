'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { FuelTable, FuelLog } from './components/FuelTable';
import { ExpenseTable, ExpenseLog } from './components/ExpenseTable';
import { LogFuelDialog } from './components/LogFuelDialog';
import { AddExpenseDialog } from './components/AddExpenseDialog';

export default function FuelExpensesPage() {
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<ExpenseLog[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [operationalCost, setOperationalCost] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [fuelDialogOpen, setFuelDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  const loadData = async () => {
    try {
      const [fuelRes, expenseRes, vehiclesRes, tripsRes, kpisRes] = await Promise.all([
        apiFetch('/fuel'),
        apiFetch('/expenses'),
        apiFetch('/vehicles'),
        apiFetch('/trips'),
        apiFetch('/analytics/kpis'),
      ]);
      setFuelLogs(fuelRes.data);
      setExpenses(expenseRes.data);
      setVehicles(vehiclesRes.data);
      setTrips(tripsRes.data);
      setOperationalCost(kpisRes.data?.operationalCost || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateFuel = async (data: any) => {
    try {
      await apiFetch('/fuel', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await loadData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to log fuel' };
    }
  };

  const handleCreateExpense = async (data: any) => {
    try {
      await apiFetch('/expenses', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await loadData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to add expense' };
    }
  };

  const handleDeleteFuel = async (id: string) => {
    try {
      await apiFetch(`/fuel/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-zinc-100">Fuel & Expenses</h1>
          <p className="text-sm text-zinc-400">Track refuels, tolls, and miscellaneous operational costs.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setExpenseDialogOpen(true)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700">
            <Plus className="h-4 w-4 mr-2" /> Add Expense
          </Button>
          <Button onClick={() => setFuelDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold">
            <Plus className="h-4 w-4 mr-2" /> Log Fuel
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-zinc-500 animate-pulse">Loading ledgers...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-200">Fuel Logs</h2>
            <FuelTable logs={fuelLogs} onDelete={handleDeleteFuel} />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-200">Other Expenses</h2>
            <ExpenseTable logs={expenses} onDelete={handleDeleteExpense} />
          </div>
          
        </div>
      )}

      {/* Pinned Footer for Total Operational Cost */}
      {!loading && (
        <div className="fixed bottom-0 left-0 right-0 md:left-64 lg:left-72 bg-zinc-950 border-t border-zinc-800 p-4 px-8 z-10 flex justify-end items-center shadow-lg">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Total Operational Cost (Fuel + Maint):</span>
            <span className="text-2xl font-mono text-amber-500 font-bold">${operationalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}

      <LogFuelDialog 
        open={fuelDialogOpen} 
        onOpenChange={setFuelDialogOpen} 
        vehicles={vehicles} 
        trips={trips} 
        onSubmit={handleCreateFuel} 
      />

      <AddExpenseDialog 
        open={expenseDialogOpen} 
        onOpenChange={setExpenseDialogOpen} 
        vehicles={vehicles} 
        trips={trips} 
        onSubmit={handleCreateExpense} 
      />
    </div>
  );
}
