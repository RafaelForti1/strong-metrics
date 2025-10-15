import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/TransactionForm"; // <- importa o seu form
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: string;
  description: string | null;
  type: string; // qualquer string
  category: string;
  amount: number;
  payment_method?: string | null;
  client_id?: string | null;
  transaction_date: string;
  status?: string;
  created_at?: string;
  created_by?: string;
}

const Finance = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔹 Carregar transações do Supabase
  const loadTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("transaction_date", { ascending: false });

    if (error) {
      console.error("Erro ao carregar transações:", error);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // 🔹 Cálculos
  const totalReceitas = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalDespesas = Math.abs(
    transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0)
  );

  const saldo = totalReceitas - totalDespesas;

  const pendentes = transactions
    .filter((t) => t.status === "Pendente")
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground mt-1">
            Controle de receitas e despesas
          </p>
        </div>
        <Button className="gap-2" onClick={() => setTransactionFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      {/* Cards resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              R${" "}
              {totalReceitas.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              R${" "}
              {totalDespesas.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                saldo >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              R${" "}
              {pendentes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de transações */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {transaction.description || "Sem descrição"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {transaction.category} •{" "}
                      {new Date(
                        transaction.transaction_date
                      ).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          transaction.type === "income"
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}R${" "}
                        {Math.abs(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        transaction.status === "Pago" ? "default" : "secondary"
                      }
                    >
                      {transaction.status || "Pago"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form de criação */}
      <TransactionForm
        open={transactionFormOpen}
        onOpenChange={setTransactionFormOpen}
        onSuccess={loadTransactions}
      />
    </div>
  );
};

export default Finance;
