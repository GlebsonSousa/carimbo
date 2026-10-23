/**
 * Todos os textos da interface em português.
 * Para traduzir, copie este arquivo, traduza os valores e registre em i18n/index.ts.
 * Use {nome} para inserir valores.
 */
export const ptBR = {
  'app.name': 'Carimbo',
  'app.tagline': 'Converta arquivos de dados e texto direto no celular, sem internet.',

  'home.pickFile': 'Escolher arquivo',
  'home.pasteText': 'Converter texto copiado',
  'home.supported': 'Formatos aceitos',
  'home.tip': 'Dica: em qualquer app, segure um arquivo, toque em Compartilhar e escolha Carimbo. A roda abre por cima do app.',
  'home.history': 'Últimas conversões',
  'home.historyEmpty': 'As conversões que você fizer aparecem aqui.',
  'home.clipboardEmpty': 'A área de transferência está vazia. Copie um texto e tente de novo.',

  'convert.back': 'Voltar',
  'convert.detected': 'Formato detectado',
  'convert.size': '{size}',
  'convert.chooseTarget': 'Escolha o formato de destino',
  'convert.convertTo': 'Converter para {format}',
  'convert.working': 'Convertendo…',
  'convert.noTargets': 'Este arquivo é {format}, e ainda não há conversões para ele. O app converte JSON, CSV, XML, YAML e Markdown.',
  'convert.pastedName': 'texto-colado',
  'convert.sharedName': 'texto-compartilhado',

  'result.done': 'Convertido para {format}',
  'result.save': 'Salvar em uma pasta',
  'result.share': 'Compartilhar',
  'result.copy': 'Copiar texto',
  'result.copied': 'Texto copiado.',
  'result.saved': 'Arquivo salvo como {name}.',
  'result.another': 'Converter outro arquivo',
  'result.preview': 'Prévia',

  'error.title': 'Não deu para converter',
  'error.unknown_format': 'Não reconhecemos este arquivo. O app converte JSON, CSV, XML, YAML e Markdown.',
  'error.unsupported_conversion': 'Ainda não existe conversão de {from} para {to}.',
  'error.file_too_large': 'O arquivo passa de {maxMb} MB. Escolha um arquivo menor.',
  'error.empty_file': 'O arquivo está vazio. Escolha outro arquivo.',
  'error.invalid_json': 'O JSON tem um erro de sintaxe. Corrija o arquivo e tente de novo.',
  'error.invalid_json.line': 'O JSON tem um erro de sintaxe na linha {line}. Corrija e tente de novo.',
  'error.invalid_csv': 'O CSV não tem cabeçalho ou tem linhas quebradas. Corrija o arquivo e tente de novo.',
  'error.invalid_csv.line': 'A linha {line} do CSV tem um número de colunas diferente do cabeçalho. Corrija e tente de novo.',
  'error.invalid_xml': 'O XML tem uma tag aberta ou mal fechada. Corrija o arquivo e tente de novo.',
  'error.invalid_xml.line': 'O XML tem uma tag aberta ou mal fechada na linha {line}. Corrija e tente de novo.',
  'error.invalid_yaml': 'O YAML tem um erro de indentação ou sintaxe. Corrija o arquivo e tente de novo.',
  'error.invalid_yaml.line': 'O YAML tem um erro na linha {line}. Corrija e tente de novo.',
  'error.read_failed': 'Não foi possível ler o arquivo. Ele pode ter sido movido ou não é texto.',
  'error.save_failed': 'Não foi possível salvar na pasta escolhida. Tente outra pasta.',
  'error.unexpected': 'Algo deu errado durante a conversão. Tente de novo.',

  'wheel.source': 'origem',
  'wheel.convert': 'Converter',
  'wheel.hint': 'Toque no formato ou deslize até ele e solte',
  'wheel.hintSelected': 'Toque no centro para converter',
  'wheel.cancel': 'Cancelar',

  'format.desc.json': 'dados',
  'format.desc.csv': 'planilha',
  'format.desc.xml': 'sistemas',
  'format.desc.yaml': 'configuração',
  'format.desc.markdown': 'texto formatado',
  'format.desc.html': 'página',
  'format.desc.txt': 'texto puro',

  'result.close': 'Fechar',
  'result.lines': '{n} linhas',

  'bubble.title': 'Bolha flutuante',
  'bubble.body': 'Uma bolha fica na borda da tela, por cima de qualquer app. Toque nela para converter um arquivo sem sair do que está fazendo.',
  'bubble.enable': 'Ativar bolha flutuante',
  'bubble.disable': 'Desligar bolha',
  'bubble.on': 'Bolha ativa. Arraste para mudar de lugar.',
  'bubble.permission': 'Na próxima tela, ative "Permitir exibição sobre outros apps" para o Carimbo e volte aqui.',
  'quick.pickFile': 'Escolher arquivo',
  'quick.pasteText': 'Converter texto copiado',
  'quick.close': 'Fechar',

  'time.now': 'agora',
  'time.minutes': 'há {n} min',
  'time.hours': 'há {n} h',
  'time.days': 'há {n} d',
} as const;

export type TranslationKey = keyof typeof ptBR;
