import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mt-4">Termos de Uso</h1>
      <p className="text-muted-foreground text-sm mt-2">
        Última atualização: fevereiro de 2025
      </p>

      <div className="prose prose-sm dark:prose-invert mt-6 space-y-4 text-foreground">
        <p>Ao acessar e usar o Saloonly, você concorda com os termos abaixo.</p>
        <h2 className="text-lg font-medium mt-6">Uso do serviço</h2>
        <p>
          O Saloonly é uma ferramenta de gestão de agendamentos para
          negócios. Você é responsável pelos dados que cadastra e por
          manter suas credenciais de acesso em sigilo.
        </p>
        <h2 className="text-lg font-medium mt-6">Obrigações do usuário</h2>
        <p>
          É proibido usar o serviço para fins ilegais, enviar conteúdo ofensivo
          ou que viole direitos de terceiros, ou tentar acessar áreas restritas
          do sistema sem autorização.
        </p>
        <h2 className="text-lg font-medium mt-6">Privacidade</h2>
        <p>
          O tratamento de dados pessoais é regido pela nossa{" "}
          <Link to="/privacy" className="text-primary underline">
            Política de Privacidade
          </Link>
          , em conformidade com a LGPD.
        </p>
        <h2 className="text-lg font-medium mt-6">Alterações</h2>
        <p>
          Podemos alterar estes termos e a política de privacidade. O uso
          continuado após a publicação das mudanças constitui aceitação.
        </p>
        <h2 className="text-lg font-medium mt-6">Contato</h2>
        <p>
          Dúvidas sobre estes termos podem ser enviadas ao contato de suporte
          informado no produto.
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
