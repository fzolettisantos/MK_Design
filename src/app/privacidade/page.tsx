import type { Metadata } from "next";
import { PageBody, PageHero } from "@/components/shared/page-hero";
import { WhatsAppCTA } from "@/components/shared/whatsapp-cta";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Como a MK Design trata os dados pessoais de quem solicita instalação de TVs, suportes e assistência técnica.",
  alternates: { canonical: "/privacidade" },
};

const UPDATED = "17 de novembro de 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-2xl">{title}</h2>
      {children}
    </section>
  );
}
const ul = "flex list-disc flex-col gap-1 pl-6";

/** Política baseada no que o sistema realmente faz. Revisar com assessoria jurídica e completar com razão social/CNPJ. */
export default function PrivacyPage() {
  return (
    <>
      <PageHero id="privacidade-title" eyebrow="LGPD" title="Política de privacidade">
        <p className="text-surface/80">Última atualização: {UPDATED}</p>
      </PageHero>
      <PageBody>
        <article className="container-mk flex max-w-3xl flex-col gap-10 ml-0 md:mx-auto">
          <p className="text-lg">
            Esta política explica quais dados pessoais a MK Design coleta quando você usa este site para pedir um
            serviço, por que coleta, com quem compartilha, por quanto tempo guarda e como você pode exercer seus
            direitos, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
          </p>

          <Section title="1. Quem é o responsável">
            <p>
              A <strong>MK Design</strong>, que presta serviços de instalação de TVs e suportes e de assistência
              técnica, é a responsável (controladora) pelos dados tratados neste site. Para qualquer assunto sobre
              seus dados, fale conosco pelo WhatsApp:
            </p>
            <WhatsAppCTA variant="dark" className="self-start" message="Olá! Tenho uma dúvida sobre meus dados pessoais.">
              Falar sobre meus dados
            </WhatsAppCTA>
          </Section>

          <Section title="2. Quais dados coletamos">
            <p>Coletamos apenas o necessário para atender ao seu pedido:</p>
            <ul className={ul}>
              <li>nome e telefone (WhatsApp);</li>
              <li>bairro, cidade e, se você informar, CEP;</li>
              <li>detalhes do serviço: tamanho, marca e modelo da TV, tipo de suporte, problema relatado e as observações que você escrever;</li>
              <li>o dia e o horário que você escolheu;</li>
              <li>o registro do seu aceite desta política (data e hora) e o número de protocolo do pedido.</li>
            </ul>
            <p>Não pedimos CPF, documentos nem dados de pagamento neste site.</p>
          </Section>

          <Section title="3. Para que usamos">
            <ul className={ul}>
              <li>registrar e organizar o seu pedido e reservar o horário solicitado;</li>
              <li>entrar em contato pelo WhatsApp para confirmar, recusar ou remarcar o atendimento e informar o orçamento;</li>
              <li>enviar a você, quando necessário, um link individual para escolher outro dia e horário;</li>
              <li>cumprir obrigações legais e proteger o negócio contra uso indevido do site.</li>
            </ul>
            <p>Não usamos seus dados para publicidade nem os vendemos.</p>
          </Section>

          <Section title="4. Base legal">
            <p>
              Tratamos seus dados com base no seu <strong>consentimento</strong> (a caixa de aceite do formulário) e
              na realização de <strong>procedimentos preliminares relacionados a um contrato</strong> que você mesmo
              pediu, como o orçamento e o agendamento (art. 7º, incisos I e V, da LGPD). Você pode retirar o
              consentimento a qualquer momento.
            </p>
          </Section>

          <Section title="5. Com quem compartilhamos">
            <p>Os dados ficam com a equipe da MK Design e com os fornecedores de tecnologia necessários para o site funcionar:</p>
            <ul className={ul}>
              <li>hospedagem do site (Vercel) e banco de dados (Neon), que armazenam e processam as informações sob nossas instruções;</li>
              <li>o WhatsApp (Meta), quando você envia a mensagem do pedido; a partir daí vale a política do próprio WhatsApp.</li>
            </ul>
            <p>
              Esses fornecedores podem operar servidores fora do Brasil. Nesses casos, exigimos medidas de segurança
              compatíveis com a LGPD.
            </p>
          </Section>

          <Section title="6. Por quanto tempo guardamos">
            <p>
              Guardamos os dados do pedido por até <strong>12 meses</strong> após o atendimento (ou após o pedido, se
              não houve horário). Passado esse prazo, eles são apagados automaticamente. Reservas de horário não
              finalizadas não guardam dado pessoal e são limpas periodicamente.
            </p>
          </Section>

          <Section title="7. Seus direitos">
            <p>Você pode pedir, a qualquer momento e sem custo:</p>
            <ul className={ul}>
              <li>confirmação de que tratamos seus dados e acesso a eles;</li>
              <li>correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>anonimização, bloqueio ou eliminação dos dados desnecessários ou tratados em desconformidade;</li>
              <li>portabilidade dos dados e informação sobre com quem os compartilhamos;</li>
              <li>eliminação dos dados tratados com base no consentimento e a revogação desse consentimento.</li>
            </ul>
            <p>
              Faça o pedido pelo WhatsApp indicado acima. Responderemos em até 15 dias. Se achar que seus direitos não
              foram respeitados, você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).
            </p>
          </Section>

          <Section title="8. Cookies">
            <p>
              Este site não usa cookies de publicidade nem de análise de comportamento. Usamos apenas um cookie técnico
              de sessão na área restrita do técnico, que não é aplicado a quem faz um pedido.
            </p>
          </Section>

          <Section title="9. Segurança">
            <p>
              A conexão com o site é protegida (HTTPS), o acesso aos pedidos é restrito ao técnico por senha, o banco de
              dados não é acessível pela internet pública e os links individuais de agendamento são guardados de forma
              irreversível. Nenhum sistema é totalmente imune a falhas; se houver um incidente que possa afetar você,
              avisaremos conforme a lei.
            </p>
          </Section>

          <Section title="10. Mudanças nesta política">
            <p>Podemos atualizar esta política. A data da última atualização fica sempre no topo da página.</p>
          </Section>
        </article>
      </PageBody>
    </>
  );
}
