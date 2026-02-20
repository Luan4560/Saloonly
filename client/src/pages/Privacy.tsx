import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mt-4">Política de Privacidade</h1>
      <p className="text-muted-foreground text-sm mt-2">
        Última atualização: fevereiro de 2025
      </p>

      <div className="prose prose-sm dark:prose-invert mt-6 space-y-4 text-foreground">
        <p>
          O Saloonly coleta e utiliza dados apenas para fins de gestão de
          agendamentos e funcionamento do painel administrativo.
        </p>
        <h2 className="text-lg font-medium mt-6">Dados coletados</h2>
        <p>
          Coletamos nome, e-mail, telefone e senha (criptografada) dos usuários
          do painel; dados do negócio (nome, endereço, contato, imagem);
          dados de colaboradores e de agendamentos (cliente, colaborador,
          serviço, data e horário).
        </p>
        <h2 className="text-lg font-medium mt-6">Finalidade</h2>
        <p>
          Os dados são usados para autenticação, cadastro de negócios,
          serviços e colaboradores, e para registrar e exibir agendamentos.
        </p>
        <h2 className="text-lg font-medium mt-6">Compartilhamento</h2>
        <p>
          Não vendemos nem compartilhamos seus dados com terceiros para
          marketing. Dados podem ser compartilhados apenas quando exigido por
          lei ou para cumprimento de obrigação legal.
        </p>
        <h2 className="text-lg font-medium mt-6">Seus direitos (LGPD)</h2>
        <p>
          Você pode solicitar acesso, correção, exclusão ou portabilidade dos
          seus dados entrando em contato conosco. Também pode revogar o
          consentimento quando aplicável.
        </p>
        <h2 className="text-lg font-medium mt-6">Contato</h2>
        <p>
          Para dúvidas sobre esta política ou sobre seus dados, entre em contato
          pelo e-mail de suporte informado no produto.
        </p>
      </div>

      <div className="mt-8">
        <Link to="/">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
    </div>
  );
}
