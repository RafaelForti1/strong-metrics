import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

const Finance = () => {
  const transactions = [
    {
      id: 1,
      description: "Mensalidade - João Silva",
      type: "Receita",
      category: "Mensalidades",
      amount: 150.00,
      date: "2025-10-14",
      status: "Pago",
    },
    {
      id: 2,
      description: "Personal Training - Maria Santos",
      type: "Receita",
      category: "Personal",
      amount: 200.00,
      date: "2025-10-14",
      status: "Pago",
    },
    {
      id: 3,
      description: "Fornecedor - Suplementos XYZ",
      type: "Despesa",
      category: "Produtos",
      amount: -850.00,
      date: "2025-10-13",
      status: "Pago",
    },
    {
      id: 4,
      description: "Mensalidade - Ana Oliveira",
      type: "Receita",
      category: "Mensalidades",
      amount: 150.00,
      date: "2025-10-15",
      status: "Pendente",
    },
    {
      id: 5,
      description: "Aluguel",
      type: "Despesa",
      category: "Fixos",
      amount: -3500.00,
      date: "2025-10-10",
      status: "Pago",
    },
  ];

  const totalReceitas = transactions
    .filter(t => t.type === "Receita" && t.status === "Pago")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalDespesas = Math.abs(
    transactions
      .filter(t => t.type === "Despesa" && t.status === "Pago")
      .reduce((acc, t) => acc + t.amount, 0)
  );

  const saldo = totalReceitas - totalDespesas;

  const pendentes = transactions
    .filter(t => t.status === "Pendente")
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
        <p className="text-muted-foreground mt-1">Controle de receitas e despesas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-success' : 'text-destructive'}`}>
              R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              R$ {pendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{transaction.description}</h3>
                  <p className="text-sm text-muted-foreground">
                    {transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.amount >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {transaction.amount >= 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                  <Badge variant={transaction.status === "Pago" ? "default" : "secondary"}>
                    {transaction.status}
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

export default Finance;
