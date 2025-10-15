import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Edit, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ClientForm } from "@/components/ClientForm";
import { PlanAssignment } from "@/components/PlanAssignment";

const CRM = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [planAssignmentOpen, setPlanAssignmentOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select(`
        *,
        client_plans (
          id,
          status,
          end_date,
          plans (name, price)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar clientes");
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir cliente");
    } else {
      toast.success("Cliente excluído!");
      loadClients();
    }
  };

  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CRM - Gestão de Alunos</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus clientes e alunos</p>
        </div>
        <Button className="gap-2" onClick={() => {
          setEditingClient(null);
          setClientFormOpen(true);
        }}>
          <UserPlus className="h-4 w-4" />
          Novo Aluno
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar aluno por nome ou email..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClients.map((client) => {
              const activePlan = client.client_plans?.find((cp: any) => cp.status === "active");
              return (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{client.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                    {client.phone && (
                      <p className="text-xs text-muted-foreground">{client.phone}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {activePlan ? (
                        <>
                          <p className="text-sm font-medium text-foreground">
                            {activePlan.plans.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Vence: {new Date(activePlan.end_date).toLocaleDateString("pt-BR")}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Sem plano ativo</p>
                      )}
                    </div>
                    <Badge variant={activePlan ? "default" : "secondary"}>
                      {activePlan ? "Ativo" : "Inativo"}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingClient(client);
                          setClientFormOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedClientId(client.id);
                          setPlanAssignmentOpen(true);
                        }}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(client.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredClients.length === 0 && !loading && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum cliente encontrado
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <ClientForm
        open={clientFormOpen}
        onOpenChange={setClientFormOpen}
        client={editingClient}
        onSuccess={loadClients}
      />

      <PlanAssignment
        open={planAssignmentOpen}
        onOpenChange={setPlanAssignmentOpen}
        clientId={selectedClientId}
        onSuccess={loadClients}
      />
    </div>
  );
};

export default CRM;
