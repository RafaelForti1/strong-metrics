import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Plus, Trash2, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Admin = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration_months: "",
    features: "",
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar planos");
    } else {
      setPlans(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const planData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration_months: parseInt(formData.duration_months),
      features: formData.features.split("\n").filter(f => f.trim()),
      is_active: true,
    };

    let error;
    if (editingPlan) {
      ({ error } = await supabase
        .from("plans")
        .update(planData)
        .eq("id", editingPlan.id));
    } else {
      ({ error } = await supabase.from("plans").insert([planData]));
    }

    if (error) {
      toast.error("Erro ao salvar plano");
    } else {
      toast.success(editingPlan ? "Plano atualizado!" : "Plano criado!");
      setDialogOpen(false);
      setEditingPlan(null);
      setFormData({ name: "", description: "", price: "", duration_months: "", features: "" });
      loadPlans();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este plano?")) return;

    const { error } = await supabase.from("plans").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir plano");
    } else {
      toast.success("Plano excluído!");
      loadPlans();
    }
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || "",
      price: plan.price.toString(),
      duration_months: plan.duration_months.toString(),
      features: plan.features?.join("\n") || "",
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Área Administrativa
          </h1>
          <p className="text-muted-foreground mt-1">Gerenciamento de planos e configurações</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Planos Disponíveis</CardTitle>
              <CardDescription>Gerencie os planos oferecidos pela academia</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={() => {
                  setEditingPlan(null);
                  setFormData({ name: "", description: "", price: "", duration_months: "", features: "" });
                }}>
                  <Plus className="h-4 w-4" />
                  Novo Plano
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingPlan ? "Editar Plano" : "Novo Plano"}</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do plano
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Plano</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço (R$)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duração (meses)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration_months}
                        onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="features">Recursos (um por linha)</Label>
                    <Textarea
                      id="features"
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      placeholder="Acesso livre&#10;Personal trainer&#10;Avaliação física"
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Salvando..." : editingPlan ? "Atualizar" : "Criar Plano"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{plan.name}</span>
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      R$ {plan.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {plan.duration_months} {plan.duration_months === 1 ? "mês" : "meses"}
                    </p>
                  </div>
                  {plan.features && plan.features.length > 0 && (
                    <ul className="space-y-1 text-sm">
                      {plan.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(plan)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(plan.id)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {plans.length === 0 && !loading && (
            <p className="text-center text-muted-foreground py-8">
              Nenhum plano cadastrado ainda
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
