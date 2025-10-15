import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PlanAssignmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onSuccess: () => void;
}

export const PlanAssignment = ({ open, onOpenChange, clientId, onSuccess }: PlanAssignmentProps) => {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    plan_id: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    payment_status: "pending",
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const { data } = await supabase
      .from("plans")
      .select("*")
      .eq("is_active", true);
    
    setPlans(data || []);
  };

  const calculateEndDate = (startDate: string, months: number) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split("T")[0];
  };

  const handlePlanChange = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      const endDate = calculateEndDate(formData.start_date, plan.duration_months);
      setFormData({ ...formData, plan_id: planId, end_date: endDate });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("client_plans").insert([{
      client_id: clientId,
      ...formData,
      status: "active",
    }]);

    if (error) {
      toast.error("Erro ao atribuir plano");
    } else {
      toast.success("Plano atribuído com sucesso!");
      onOpenChange(false);
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atribuir Plano</DialogTitle>
          <DialogDescription>
            Selecione um plano e defina as datas
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plan">Plano</Label>
            <Select value={formData.plan_id} onValueChange={handlePlanChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - R$ {plan.price.toFixed(2)} ({plan.duration_months} meses)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data de Início</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => {
                  const plan = plans.find(p => p.id === formData.plan_id);
                  const endDate = plan ? calculateEndDate(e.target.value, plan.duration_months) : "";
                  setFormData({ ...formData, start_date: e.target.value, end_date: endDate });
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Data de Término</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment_status">Status de Pagamento</Label>
            <Select value={formData.payment_status} onValueChange={(value) => setFormData({ ...formData, payment_status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="overdue">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : "Atribuir Plano"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
