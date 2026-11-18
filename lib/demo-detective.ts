import type { DirectSolutionResponse } from '@/lib/types';

export interface ExampleCase {
  id: string;
  label: string;
  category: string;
  prompt: string;
}

export const EXAMPLE_CASES: ExampleCase[] = [
  {
    id: 'internet',
    label: 'Queda de Conexão',
    category: 'Rede & Casa',
    prompt: 'Minha internet cai toda noite por volta das 21h',
  },
  {
    id: 'foco',
    label: 'Queda de Foco',
    category: 'Produtividade',
    prompt: 'Não consigo manter o foco no trabalho à tarde',
  },
  {
    id: 'bolo',
    label: 'Bolo Solado',
    category: 'Culinária',
    prompt: 'Meu bolo sempre sola no meio depois de sair do forno',
  },
];

function detectScenario(problem: string): 'internet' | 'foco' | 'bolo' | 'generic' {
  const normalized = problem.toLowerCase();
  if (
    normalized.includes('internet') ||
    normalized.includes('wi-fi') ||
    normalized.includes('wifi') ||
    normalized.includes('roteador') ||
    normalized.includes('conexão') ||
    normalized.includes('sinal')
  ) {
    return 'internet';
  }
  if (
    normalized.includes('foco') ||
    normalized.includes('concentra') ||
    normalized.includes('procrastin') ||
    normalized.includes('trabalho') ||
    normalized.includes('distra') ||
    normalized.includes('sono')
  ) {
    return 'foco';
  }
  if (
    normalized.includes('bolo') ||
    normalized.includes('sola') ||
    normalized.includes('forno') ||
    normalized.includes('massa') ||
    normalized.includes('assado')
  ) {
    return 'bolo';
  }
  return 'generic';
}

export function runDirectDemoDiagnosis(
  problem: string,
  refinementNote?: string
): DirectSolutionResponse {
  const scenario = detectScenario(problem);
  const extraNote = refinementNote?.trim();

  if (scenario === 'internet') {
    return {
      caseTitle: 'Queda Noturna de Conexão (21h)',
      quickSummary:
        'Congestionamento de canal Wi-Fi no horário de pico somado a superaquecimento ou memória cheia do roteador.',
      rootCause: extraNote
        ? `Considerando o detalhe informado ("${extraNote}"), o problema é ocasionado pelo gargalo simultâneo no horário nobre das 21h: muitas redes Wi-Fi vizinhas disputam o mesmo canal de 2.4 GHz enquanto o roteador acumula tabela NAT/DNS saturada e aquecimento ao longo do dia, derrubando a entrega de pacotes.`
        : 'O problema geralmente é ocasionado por três fatores que se somam às 21h: congestionamento da frequência 2.4 GHz pelos vizinhos no horário de pico, saturação da memória/tabela NAT do roteador ligado sem reinício há dias e servidor DNS lento da operadora.',
      actionPlan: [
        {
          id: 'step-1',
          step: 'Mudar os aparelhos principais para o Wi-Fi 5 GHz',
          difficulty: 'Fácil',
          detail:
            'Conecte celular, notebook e TV na rede 5 GHz do seu roteador; ela sofre muito menos interferência noturna de vizinhos e eletrodomésticos.',
        },
        {
          id: 'step-2',
          step: 'Tirar o roteador de dentro de móveis e reiniciar por 60s',
          difficulty: 'Fácil',
          detail:
            'Coloque o aparelho em local alto e ventilado para evitar superaquecimento à noite e desligue-o da tomada por 1 minuto para limpar a memória.',
        },
        {
          id: 'step-3',
          step: 'Fixar o canal do Wi-Fi e trocar o DNS para 1.1.1.1',
          difficulty: 'Moderado',
          detail:
            'Acesse as configurações do roteador, tire o canal 2.4 GHz de "Automático" para 1, 6 ou 11 e defina o DNS primário como 1.1.1.1 (Cloudflare) ou 8.8.8.8 (Google).',
        },
        {
          id: 'step-4',
          step: 'Testar com cabo de rede às 21h para cobrar a operadora',
          difficulty: 'Avançado',
          detail:
            'Se cair também no cabo direto no horário das 21h, é saturação no nó externo da operadora — registre a queda e solicite troca de porta/rota.',
        },
      ],
      preventionTip:
        'Ative o reinício automático semanal do roteador (de madrugada, às 04h) e mantenha equipamentos de streaming conectados preferencialmente via cabo ou 5 GHz.',
    };
  }

  if (scenario === 'foco') {
    return {
      caseTitle: 'Queda de Foco no Período da Tarde',
      quickSummary:
        'Vale natural de alerta pós-almoço agravado por excesso de notificações e troca de contexto na manhã.',
      rootCause: extraNote
        ? `Com base no seu contexto ("${extraNote}"), o bloqueio à tarde acontece porque você tenta executar tarefas que exigem alta carga mental exatamente durante a queda fisiológica pós-almoço (13h30–15h30), com a atenção já fragmentada por múltiplas abas e mensagens acumuladas desde cedo.`
        : 'A perda de foco à tarde é ocasionada pela combinação do vale natural do ritmo circadiano após o almoço (pico glicêmico e queda de alerta) com fadiga de decisão acumulada por notificações e trocas constantes de tarefa durante a manhã.',
      actionPlan: [
        {
          id: 'step-1',
          step: 'Tirar o celular do campo de visão por blocos de 25 minutos',
          difficulty: 'Fácil',
          detail:
            'Ative o modo Não Perturbe e deixe o telefone fora da mesa. Trabalhe em apenas uma aba aberta durante 25 minutos antes de checar mensagens.',
        },
        {
          id: 'step-2',
          step: 'Mudar a ordem das tarefas: deixe o operacional para 13h30–15h',
          difficulty: 'Fácil',
          detail:
            'Em vez de forçar escrita ou análise pesada logo após o almoço, aloque e-mails, revisões curtas e organização para essa janela e concentre tarefas difíceis pela manhã.',
        },
        {
          id: 'step-3',
          step: 'Reduzir açúcares/carboidratos simples no almoço e caminhar 10 min',
          difficulty: 'Moderado',
          detail:
            'Almoços muito pesados ampliam a sonolência. Uma caminhada curta com luz natural antes de voltar à mesa restaura o nível de alerta.',
        },
        {
          id: 'step-4',
          step: 'Definir na noite anterior o primeiro micro-passo da tarde',
          difficulty: 'Avançado',
          detail:
            'Escreva a ação exata de início (ex: "abrir planilha X e preencher coluna B") para eliminar o atrito mental de decidir o que fazer quando a energia cair.',
        },
      ],
      preventionTip:
        'Proteja 1 bloco fixo de 60 minutos sem reuniões no seu horário de maior clareza mental e evite começar a tarde abrindo redes sociais ou caixas de entrada.',
    };
  }

  if (scenario === 'bolo') {
    return {
      caseTitle: 'Bolo Solado no Meio Após Sair do Forno',
      quickSummary:
        'Desenvolvimento excessivo de glúten ao bater a farinha ou choque térmico antes da estrutura do miolo firmar.',
      rootCause: extraNote
        ? `Levando em conta esse detalhe ("${extraNote}"), o bolo sola porque a rede de ar criada pelo fermento colapsa antes que o amido e os ovos solidifiquem o centro — geralmente por bater a farinha demais, usar forno sem pré-aquecimento ou abrir a porta antes dos 30 minutos.`
        : 'O bolo sola no centro porque as bolhas de gás do fermento escapam ou contraem antes da massa assar por dentro. Os culpados mais diretos são: bater a farinha na batedeira/liquidificador, colocar a forma em forno frio ou abrir o forno cedo demais.',
      actionPlan: [
        {
          id: 'step-1',
          step: 'Parar de bater a farinha no liquidificador ou batedeira',
          difficulty: 'Fácil',
          detail:
            'Bata líquidos, ovos e açúcar normalmente, mas misture a farinha e o fermento à mão com espátula ou fouet, de baixo para cima, apenas até incorporar.',
        },
        {
          id: 'step-2',
          step: 'Pré-aquecer o forno a 180 °C por 15 minutos antes de assar',
          difficulty: 'Fácil',
          detail:
            'Nunca leve a massa ao forno frio: o fermento reage devagar e perde força antes de a estrutura crescer e firmar.',
        },
        {
          id: 'step-3',
          step: 'Não abrir a porta do forno nos primeiros 30 minutos',
          difficulty: 'Moderado',
          detail:
            'A entrada de ar frio murcha o vapor no centro da massa ainda líquida. Acompanhe apenas pelo vidro até a massa dourar levemente.',
        },
        {
          id: 'step-4',
          step: 'Ajustar a grade central e baixar 15 °C se dourar rápido demais',
          difficulty: 'Avançado',
          detail:
            'Se a casca fica escura mas o centro continua cru/pesado, o forno está quente demais acima do marcado: asse na grade do meio a 165–170 °C.',
        },
      ],
      preventionTip:
        'Sempre teste fermento antigo colocando uma pitada em água morna (precisa borbulhar na hora) e dê preferência a formas com furo central para o calor cozinhar o miolo por igual.',
    };
  }

  return {
    caseTitle: 'Diagnóstico Direto & Ajustes Recomendados',
    quickSummary:
      'Interrompa o gatilho recorrente alterando primeiro a variável de maior impacto e menor esforço.',
    rootCause: extraNote
      ? `Considerando o seu relato ("${problem}") e o detalhe adicional ("${extraNote}"), o problema se repete porque existe um fator de atrito ou gatilho contínuo no ambiente/rotina que está alimentando o sintoma antes que você perceba a falha final.`
      : `Para o cenário relatado ("${problem}"), o problema costuma ser ocasionado por um gargalo recorrente na etapa inicial do processo ou por uma configuração/hábito padrão que não está adaptado às condições reais de uso.`,
    actionPlan: [
      {
        id: 'step-1',
        step: 'Eliminar a causa mais óbvia nas condições imediatas',
        difficulty: 'Fácil',
        detail:
          'Revise o ambiente ou configuração básica ligada diretamente ao problema e aplique um ajuste simples agora (reiniciar, limpar, simplificar ou isolar o item que falha).',
      },
      {
        id: 'step-2',
        step: 'Mudar uma única variável por vez para confirmar a melhora',
        difficulty: 'Fácil',
        detail:
          'Evite mudar tudo ao mesmo tempo; altere primeiro o ponto que exige menos esforço para observar rapidamente se o sintoma reduz.',
      },
      {
        id: 'step-3',
        step: 'Trocar o padrão atual por uma rotina preventiva fixa',
        difficulty: 'Moderado',
        detail:
          'Substitua a reação improvisada quando o problema já aconteceu por um checklist ou ajuste automático aplicado antes do horário crítico.',
      },
      {
        id: 'step-4',
        step: 'Usar a IA Gemini ou adicionar um detalhe técnico abaixo para refinar',
        difficulty: 'Avançado',
        detail:
          'Se precisar de passos hiper-específicos para a sua situação exata, ative o modo "IA Gemini" no topo da página ou informe mais contexto no campo de refinamento.',
      },
    ],
    preventionTip:
      'Observe os 10 minutos anteriores ao problema acontecer: agir na causa que antecede o sintoma costuma resolver definitivamente com menos esforço.',
  };
}
