import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: any;
  onSuccess: () => void;
}

export const ClientForm = ({ open, onOpenChange, client, onSuccess }: ClientFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: client?.full_name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    birth_date: client?.birth_date || "",
    address: client?.address || "",
    emergency_contact: client?.emergency_contact || "",
    emergency_phone: client?.emergency_phone || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const clientData = {
      ...formData,
      created_by: user?.id,
    };

    let error;
    if (client) {
      ({ error } = await supabase
        .from("clients")
        .update(clientData)
        .eq("id", client.id));
    } else {
      ({ error } = await supabase.from("clients").insert([clientData]));
    }

    if (error) {
      toast.error("Erro ao salvar cliente");
    } else {
      toast.success(client ? "Cliente atualizado!" : "Cliente cadastrado!");
      onOpenChange(false);
      onSuccess();
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        birth_date: "",
        address: "",
        emergency_contact: "",
        emergency_phone: "",
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          <DialogDescription>
            Preencha as informações do cliente
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_date">Data de Nascimento</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Contato de Emergência</Label>
              <Input
                id="emergency_contact"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_phone">Telefone de Emergência</Label>
              <Input
                id="emergency_phone"
                type="tel"
                value={formData.emergency_phone}
                onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : client ? "Atualizar" : "Cadastrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
