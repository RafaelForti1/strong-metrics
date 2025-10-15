import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const CRM = () => {
  const clients = [
    {
      id: 1,
      name: "João Silva",
      email: "joao@email.com",
      plan: "Premium",
      status: "Ativo",
      lastVisit: "Hoje",
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria@email.com",
      plan: "Básico",
      status: "Ativo",
      lastVisit: "Ontem",
    },
    {
      id: 3,
      name: "Pedro Costa",
      email: "pedro@email.com",
      plan: "Personal",
      status: "Ativo",
      lastVisit: "Há 3 dias",
    },
    {
      id: 4,
      name: "Ana Oliveira",
      email: "ana@email.com",
      plan: "Premium",
      status: "Inativo",
      lastVisit: "Há 15 dias",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CRM - Gestão de Alunos</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus clientes e alunos</p>
        </div>
        <Button className="gap-2">
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
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{client.name}</h3>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{client.plan}</p>
                    <p className="text-xs text-muted-foreground">Última visita: {client.lastVisit}</p>
                  </div>
                  <Badge variant={client.status === "Ativo" ? "default" : "secondary"}>
                    {client.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRM;
