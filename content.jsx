/* STUDIO F03 website — content + i18n dictionary (exported to window) */

/* Projects: neutral data + per-language strings keyed by id.
   catKey drives the filter chips. dots = brand placeholder config. */
const PROJECTS = [
  { id: 'aurora',  title: 'Residencial Aurora', loc: 'São Paulo · SP',          client: 'Vilaurbe', year: '2025', catKey: 'facade', dots: { cols: 12, center: 'left'  }, span: 7, tall: true,  img: 'renders/aurora-1.jpg',    gallery: ['renders/aurora-2.jpg', 'renders/aurora-3.jpg', 'renders/detalhe-fachada.jpg'] },
  { id: 'mirante', title: 'Edifício Mirante',   loc: 'Balneário Camboriú · SC', client: 'Terre Urbanismo',  year: '2025', catKey: 't360',     dots: { cols: 14, center: 'mid'   }, span: 5, tall: true,  img: 'renders/decorado-sala.jpg', gallery: ['renders/decorado-quarto1.jpg', 'renders/quarto2.jpg', 'renders/living.jpg'] },
  { id: 'botanica',title: 'Reserva Botânica',   loc: 'Curitiba · PR',           client: 'Pedreschi', year: '2024', catKey: 'anim',     dots: { cols: 16, center: 'right' }, span: 5, tall: false, img: 'renders/fachada-insta.jpg', gallery: ['renders/detalhe-fachada.jpg', 'renders/chu.jpg', 'renders/cng-fachada.jpg'] },
  { id: 'maritima',title: 'Vila Marítima',      loc: 'Florianópolis · SC',      client: 'Perplan',         year: '2024', catKey: 'facade',   dots: { cols: 11, center: 'right' }, span: 4, tall: false, img: 'renders/fachada-1.jpg',   gallery: ['renders/fachada-2.jpg', 'renders/cng-fachada.jpg', 'renders/detalhe-fachada.jpg'] },
  { id: 'lumen',   title: 'Lumen Offices',      loc: 'São Paulo · SP',          client: 'Telesil',  year: '2025', catKey: 'interior', dots: { cols: 15, center: 'mid'   }, span: 3, tall: false, img: 'renders/living.jpg',      gallery: ['renders/decorado-sala.jpg', 'renders/pergola.jpg', 'renders/detalhe-fachada.jpg'] },
  { id: 'praca',   title: 'Praça Jardim',       loc: 'Ribeirão Preto · SP',     client: 'Vilaurbe', year: '2024', catKey: 't360',     dots: { cols: 13, center: 'left'  }, span: 12, tall: false, img: 'renders/resort.jpg',      gallery: ['renders/piscina-cng.jpg', 'renders/piscina-ush.jpg', 'renders/pergola.jpg'] },
];

/* Embedded 360° virtual tours (meupasseiovirtual). label keys map to DICT.tour.scenes. */
const TOURS = [
  'https://tour.meupasseiovirtual.com/view/PBNZ9Oo9Sto',
  'https://tour.meupasseiovirtual.com/view/NgPon35hvML',
];

/* WORK FEED — Instagram-style masonry. Each item keeps its natural aspect ratio.
   cat drives the filter chips; name is a short caption; r = width/height. */
const FEED = [
  { src: 'renders/aurora-1.jpg',         cat: 'facade',   name: 'Residencial Aurora', r: 0.81 },
  { src: 'renders/decorado-sala.jpg',    cat: 'interior', name: 'Living decorado',    r: 1.78 },
  { src: 'renders/fachada-1.jpg',        cat: 'facade',   name: 'Vila Marítima',      r: 0.56 },
  { src: 'renders/piscina-cng.jpg',      cat: 'commons',  name: 'Piscina',            r: 1.78 },
  { src: 'renders/living.jpg',           cat: 'interior', name: 'Living',             r: 0.85 },
  { src: 'renders/chu.jpg',              cat: 'commons',  name: 'Área comum - Espaço gourmet', r: 1.78 },
  { src: 'renders/detalhe-fachada.jpg',  cat: 'facade',   name: 'Detalhe arquitetônico', r: 0.81 },
  { src: 'renders/pergola.jpg',          cat: 'commons',  name: 'Pergolado',          r: 1.78 },
  { src: 'renders/fachada-2.jpg',        cat: 'facade',   name: 'Vila Marítima',      r: 0.56 },
  { src: 'renders/quarto2.jpg',          cat: 'interior', name: 'Dormitório',         r: 1.78 },
  { src: 'renders/aurora-2.jpg',         cat: 'facade',   name: 'Residencial Aurora', r: 0.81 },
  { src: 'renders/cng-fachada.jpg',      cat: 'facade',   name: 'Canonge',            r: 1.78 },
  { src: 'renders/resort.jpg',           cat: 'commons',  name: 'Praça Jardim',       r: 0.81 },
  { src: 'renders/decorado-quarto1.jpg', cat: 'interior', name: 'Suíte',              r: 1.78 },
  { src: 'renders/fachada-insta.jpg',    cat: 'facade',   name: 'Reserva Botânica',   r: 0.81 },
  { src: 'renders/piscina-ush.jpg',      cat: 'commons',  name: 'Solário',            r: 1.78 },
  { src: 'renders/aurora-3.jpg',         cat: 'facade',   name: 'Planta humanizada - Implantação', r: 0.81 },
  { src: 'renders/play.jpg',             cat: 'commons',  name: 'Espaço Play',            r: 1.78 },
  { src: 'renders/fitness.jpg',          cat: 'commons',  name: 'Fitness',               r: 1.78 },
  { src: 'renders/rua-externa.jpg',      cat: 'facade',   name: 'Rua externa',           r: 1.60 },
  { src: 'renders/planta-terreo.png',    cat: 'plan',     name: 'Planta Térreo',       r: 1.0, light: true },
  { src: 'renders/movie-game.jpg',       cat: 'commons',  name: 'Movie & Game',          r: 1.78 },
  { src: 'renders/pub.jpg',              cat: 'commons',  name: 'Pub',                   r: 1.78 },
  { src: 'renders/aerea.jpg',            cat: 'facade',   name: 'Implantação aérea',     r: 1.78 },
  { src: 'renders/planta-3dorm.png',     cat: 'plan',     name: 'Planta 3 dormitórios', r: 1.0, light: true },
  { src: 'renders/jogos.jpg',            cat: 'commons',  name: 'Sala de Jogos',         r: 1.78 },
  { src: 'renders/parque-externo.jpg',   cat: 'commons',  name: 'Parque',                r: 1.78 },
  { src: 'renders/ciclovia.jpg',         cat: 'facade',   name: 'Boulevard & ciclovia',  r: 1.78 },
  { src: 'renders/planta-suite2.png',    cat: 'plan',     name: 'Planta Suíte + 2',     r: 1.0, light: true },
  { src: 'renders/planta-cobertura.png', cat: 'plan',     name: 'Planta Cobertura',     r: 1.0, light: true },
];

const PROJECT_I18N = {
  pt: {
    aurora:  { type: 'Imagens 3D', scope: 'Fachada · Áreas comuns',   desc: 'Conjunto de imagens de fachada e áreas comuns para o lançamento de um residencial de alto padrão. O objetivo foi traduzir a sofisticação do projeto arquitetônico em uma luz de fim de tarde, valorizando volumetria e materiais nobres.' },
    mirante: { type: 'Tour 360°',  scope: 'Tour 360° · Decorado',     desc: 'Tour virtual 360° de um apartamento decorado, permitindo ao comprador percorrer cada ambiente antes da entrega. Iluminação interna calibrada para transmitir aconchego e amplitude.' },
    botanica:{ type: 'Animação',   scope: 'Vídeo · Implantação aérea',desc: 'Animação aérea da implantação do empreendimento integrada à paisagem. A narrativa parte de uma vista macro do entorno e aproxima gradualmente até os detalhes da fachada.' },
    maritima:{ type: 'Imagens 3D', scope: 'Fachada · Pôr do sol',     desc: 'Imagens de fachada para um residencial frente-mar. A direção de arte priorizou a relação do edifício com o horizonte e a luz quente do litoral.' },
    lumen:   { type: 'Imagens 3D', scope: 'Lobby · Lajes corporativas',desc: 'Renders internos de lobby e lajes corporativas para um edifício comercial classe A. Materiais, reflexos e iluminação trabalhados para um resultado fotorrealista.' },
    praca:   { type: 'Tour 360°',  scope: 'Áreas comuns · Paisagismo',desc: 'Experiência 360° das áreas comuns e paisagismo, com piscina, lounge e quadras. Vegetação e mobiliário modelados para uma leitura realista do convívio.' },
  },
  en: {
    aurora:  { type: '3D Stills',  scope: 'Façade · Amenities',        desc: 'A set of façade and amenity stills for the launch of a high-end residential building. The goal was to translate the sophistication of the architecture into late-afternoon light, emphasizing volume and premium materials.' },
    mirante: { type: '360° Tour',  scope: '360° Tour · Show unit',     desc: 'A 360° virtual tour of a furnished show unit, letting buyers walk through every room before handover. Interior lighting calibrated to convey warmth and spaciousness.' },
    botanica:{ type: 'Animation',  scope: 'Film · Aerial siteplan',    desc: 'An aerial animation of the development integrated into its landscape. The narrative opens on a macro view of the surroundings and gradually moves in toward the façade details.' },
    maritima:{ type: '3D Stills',  scope: 'Façade · Sunset',           desc: 'Façade stills for an oceanfront residential project. Art direction prioritized the building\u2019s relationship with the horizon and the warm coastal light.' },
    lumen:   { type: '3D Stills',  scope: 'Lobby · Office floors',     desc: 'Interior renders of the lobby and office floors for a class-A commercial building. Materials, reflections and lighting crafted for a photoreal result.' },
    praca:   { type: '360° Tour',  scope: 'Amenities · Landscaping',   desc: 'A 360° experience of the amenities and landscaping \u2014 pool, lounge and courts. Vegetation and furniture modeled for a realistic read of daily life.' },
  },
};

const DICT = {
  pt: {
    nav: { work: 'Trabalhos', services: 'Serviços', process: 'Processo', studio: 'Studio', contact: 'Contato', quote: 'Orçamento' },
    hero: {
      eyebrow: 'Archviz · Mercado imobiliário',
      title: 'Damos forma ao futuro dos seus empreendimentos',
      sub: 'Studio de visualização arquitetônica especializado em lançamentos imobiliários para construtoras e incorporadoras. Um parceiro estratégico para o seu próximo lançamento.',
      ctaWork: 'Ver trabalhos', ctaQuote: 'Solicitar orçamento', scroll: 'Role para explorar',
      meta: [['+4', 'Anos de studio'], ['+500', 'Projetos entregues'], ['+1000', 'Produtos entregues']],
    },
    clients: { label: 'Conheça quem confia em nós.' },
    services: {
      eyebrow: 'O que fazemos', title: 'Do briefing ao lançamento, produto por produto',
      desc: 'Cada peça é produzida para potencializar a venda do seu empreendimento, unindo precisão técnica e direção de arte.',
      items: [
        { icon: 'image', title: 'Imagens 3D', desc: 'Renders fotorrealistas de fachadas, interiores e áreas comuns para materiais de venda.', list: ['Fachadas & implantação', 'Interiores decorados', 'Áreas comuns & lazer'] },
        { icon: 'clapperboard', title: 'Animações', desc: 'Vídeos que percorrem o empreendimento e a vizinhança, contando a história do projeto.', list: ['Vídeos aéreos', 'Walkthroughs internos', 'Teaser de lançamento'] },
        { icon: 'view', title: 'Tours 360°', desc: 'Experiências imersivas que permitem visitar cada ambiente antes da entrega.', list: ['Decorados virtuais', 'Áreas comuns', 'Integração com stands'] },
      ],
    },
    work: {
      eyebrow: 'Trabalhos', title: 'Lançamentos que ganharam imagem',
      cats: [['all', 'Todos'], ['facade', 'Fachadas'], ['interior', 'Interiores'], ['commons', 'Áreas comuns'], ['plan', 'Plantas']],
      tags: { facade: 'Fachada', interior: 'Interior', commons: 'Área comum', plan: 'Planta' },
      open: 'Ampliar', counter: 'de',
    },
    process: {
      eyebrow: 'Como trabalhamos', title: 'Um processo claro, do ponto de partida à entrega',
      steps: [
        { t: 'Briefing', d: 'Recebemos plantas, referências e o conceito do empreendimento. Alinhamos expectativas e prazos.' },
        { t: 'Modelagem', d: 'Construímos o modelo 3D fiel ao projeto arquitetônico, com materiais e contexto urbano.' },
        { t: 'Renderização', d: 'Direção de luz, câmera e arte. Refino até o nível de fotorrealismo aprovado.' },
        { t: 'Entrega', d: 'Imagens, vídeos e tours 360° prontos para os canais de venda do seu lançamento.' },
      ],
    },
    about: {
      eyebrow: 'O estúdio', title: 'Um ponto de partida que virou movimento',
      p1: 'A F03 nasceu de um endereço, um ponto cartográfico de partida. Há mais de 4 anos transformamos projetos em imagens que ajudam incorporadoras e construtoras a vender antes da obra começar.',
      p2: 'Trabalhamos lado a lado com arquitetos e equipes de marketing, unindo precisão técnica e direção de arte para traduzir cada empreendimento na sua melhor luz.',
      quote: '“Imagens que dão forma ao que ainda vai existir.”',
      name: 'Vitor Rodrigues', role: 'Fundador · STUDIO F03',
    },
    tour: {
      eyebrow: 'Experiência 360°', title: 'Visite o empreendimento antes da entrega',
      desc: 'Explore os ambientes em 360° direto do navegador. Clique e arraste dentro do tour para olhar ao redor, com a mesma experiência que o comprador tem no anúncio ou no stand de vendas.',
      hint: 'Clique e arraste para olhar ao redor', scenes: ['ILHA DE MALLORCA', 'CANONGE'],
    },
    cta: { title: 'Vamos dar o primeiro passo?', quote: 'Solicitar orçamento' },
    contact: {
      eyebrow: 'Contato', title: 'Conte sobre o empreendimento',
      desc: 'Respondemos em até 1 dia útil com um orçamento e um prazo de entrega.',
      fields: { name: 'Nome', namePh: 'Seu nome', company: 'Empresa', companyPh: 'Incorporadora', email: 'E-mail', emailPh: 'voce@empresa.com', service: 'Serviço', message: 'Mensagem', messagePh: 'Conte sobre o empreendimento, prazo e quantidade de imagens.' },
      services: ['Imagens 3D', 'Animação', 'Tour 360°', 'Pacote completo'],
      send: 'Enviar', okTitle: 'Recebido!', okText: 'Em breve entramos em contato.',
    },
    footer: { intro: 'Studio de visualização arquitetônica para o mercado imobiliário. Um parceiro estratégico para o seu próximo lançamento.', studio: 'Studio', rights: 'Todos os direitos reservados.', tagline: 'F03 · Um ponto de partida.' },
  },

  en: {
    nav: { work: 'Work', services: 'Services', process: 'Process', studio: 'Studio', contact: 'Contact', quote: 'Get a quote' },
    hero: {
      eyebrow: 'Archviz · Real estate',
      title: 'We give form to the future of your developments',
      sub: 'An architectural visualization studio specialized in real-estate launches for builders and developers. A strategic partner for your next launch.',
      ctaWork: 'View work', ctaQuote: 'Request a quote', scroll: 'Scroll to explore',
      meta: [['+4', 'Years of studio'], ['+500', 'Projects delivered'], ['+1000', 'Products delivered']],
    },
    clients: { label: 'Meet who trusts us.' },
    services: {
      eyebrow: 'What we do', title: 'From brief to launch, product by product',
      desc: 'Every piece is produced to drive the sale of your development, combining technical precision and art direction.',
      items: [
        { icon: 'image', title: '3D Stills', desc: 'Photoreal renders of façades, interiors and amenities for your sales materials.', list: ['Façades & siteplan', 'Furnished interiors', 'Amenities & leisure'] },
        { icon: 'clapperboard', title: 'Animations', desc: 'Films that move through the development and its surroundings, telling the project\u2019s story.', list: ['Aerial films', 'Interior walkthroughs', 'Launch teaser'] },
        { icon: 'view', title: '360° Tours', desc: 'Immersive experiences that let buyers visit every room before handover.', list: ['Virtual show units', 'Amenities', 'Sales-stand integration'] },
      ],
    },
    work: {
      eyebrow: 'Work', title: 'Launches that found their image',
      cats: [['all', 'All'], ['facade', 'Façades'], ['interior', 'Interiors'], ['commons', 'Amenities'], ['plan', 'Floor plans']],
      tags: { facade: 'Façade', interior: 'Interior', commons: 'Amenity', plan: 'Floor plan' },
      open: 'Expand', counter: 'of',
    },
    process: {
      eyebrow: 'How we work', title: 'A clear process, from starting point to delivery',
      steps: [
        { t: 'Brief', d: 'We receive plans, references and the concept of the development. We align expectations and timelines.' },
        { t: 'Modeling', d: 'We build the 3D model true to the architectural project, with materials and urban context.' },
        { t: 'Rendering', d: 'Lighting, camera and art direction. We refine to the approved level of photorealism.' },
        { t: 'Delivery', d: 'Stills, films and 360° tours ready for your launch\u2019s sales channels.' },
      ],
    },
    about: {
      eyebrow: 'The studio', title: 'A starting point that became movement',
      p1: 'F03 was born from an address, a cartographic starting point. For over 4 years we have turned projects into images that help developers and builders sell before the ground breaks.',
      p2: 'We work side by side with architects and marketing teams, combining technical precision and art direction to render each development in its best light.',
      quote: '“Images that give form to what doesn\u2019t exist yet.”',
      name: 'Vitor Rodrigues', role: 'Founder · STUDIO F03',
    },
    tour: {
      eyebrow: '360° Experience', title: 'Visit the development before handover',
      desc: 'Explore the spaces in 360° straight from the browser. Click and drag inside the tour to look around, the same experience buyers get from the listing or the sales stand.',
      hint: 'Click and drag to look around', scenes: ['ILHA DE MALLORCA', 'CANONGE'],
    },
    cta: { title: 'Shall we take the first step?', quote: 'Request a quote' },
    contact: {
      eyebrow: 'Contact', title: 'Tell us about the development',
      desc: 'We reply within 1 business day with a quote and a delivery timeline.',
      fields: { name: 'Name', namePh: 'Your name', company: 'Company', companyPh: 'Developer', email: 'Email', emailPh: 'you@company.com', service: 'Service', message: 'Message', messagePh: 'Tell us about the development, timeline and number of images.' },
      services: ['3D Stills', 'Animation', '360° Tour', 'Full package'],
      send: 'Send', okTitle: 'Received!', okText: 'We\u2019ll be in touch shortly.',
    },
    footer: { intro: 'An archviz studio for real estate. Images that sell before the ground breaks.', studio: 'Studio', rights: 'All rights reserved.', tagline: 'F03 · A starting point.' },
  },
};

Object.assign(window, { PROJECTS, PROJECT_I18N, DICT });
