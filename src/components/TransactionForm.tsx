import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Client {
  id: string;
  full_name: string;
}

type TransactionType = "income" | "expense";
type PaymentMethod =
  | "Dinheiro"
  | "Débito"
  | "Crédito"
  | "PIX"
  | "Transferência";

interface TransactionFormState {
  type: TransactionType;
  category: string;
  description: string;
  amount: string; // mantemos como string para bind do input
  payment_method: PaymentMethod | "";
  client_id: string;
  transaction_date: string;
}

const incomeCategories = [
  "Mensalidade",
  "Produto",
  "Personal Trainer",
  "Avaliação",
  "Outros",
] as const;

const expenseCategories = [
  "Aluguel",
  "Salários",
  "Equipamentos",
  "Manutenção",
  "Marketing",
  "Utilities",
  "Outros",
] as const;

const paymentMethods: PaymentMethod[] = [
  "Dinheiro",
  "Débito",
  "Crédito",
  "PIX",
  "Transferência",
];

export const TransactionForm = ({
  open,
  onOpenChange,
  onSuccess,
}: TransactionFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState<TransactionFormState>({
    type: "income",
    category: "",
    description: "",
    amount: "",
    payment_method: "",
    client_id: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const { data } = await supabase
      .from("clients")
      .select("id, full_name")
      .order("full_name");

    setClients((data as Client[]) || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const transactionData = {
      type: formData.type,
      category: formData.category,
      description: formData.description || null,
      amount: parseFloat(formData.amount),
      payment_method: formData.payment_method || null,
      client_id: formData.client_id || null,
      transaction_date: formData.transaction_date,
      created_by: user?.id,
    };

    const { error } = await supabase
      .from("transactions")
      .insert([transactionData]);

    if (error) {
      toast.error("Erro ao registrar transação");
    } else {
      toast.success("Transação registrada!");
      onOpenChange(false);
      onSuccess();
      setFormData({
        type: "income",
        category: "",
        description: "",
        amount: "",
        payment_method: "",
        client_id: "",
        transaction_date: new Date().toISOString().split("T")[0],
      });
    }
    setLoading(false);
  };

  const categories =
    formData.type === "income" ? incomeCategories : expenseCategories;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>Registre uma receita ou despesa</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: TransactionType) =>
                setFormData({ ...formData, type: value, category: "" })
              }
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction_date">Data *</Label>
              <Input
                id="transaction_date"
                type="date"
                value={formData.transaction_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    transaction_date: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>
          {formData.type === "income" && (
            <div className="space-y-2">
              <Label htmlFor="client">Cliente (opcional)</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, client_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="payment_method">Forma de Pagamento</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value: PaymentMethod) =>
                setFormData({ ...formData, payment_method: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : "Registrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default TransactionForm;
