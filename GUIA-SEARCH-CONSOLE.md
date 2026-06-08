# Guia do Google Search Console — STUDIO F03

Guia prático pra extrair o máximo do Search Console no site **studiof03.com**.
Feito sob medida pro seu caso: site de archviz, uma página, atualizado poucas vezes por ano.

> O que é, em uma frase: o Search Console é o painel onde o **Google te mostra como o
> seu site aparece nas buscas** — quem te encontra, por quais palavras, e o que precisa
> arrumar pra aparecer mais.

---

## PARTE 1 — Fazer agora (uma vez só)

Estes passos você faz **uma vez** e destravam tudo. Em ordem de importância.

### 1.1 Enviar o sitemap (o mais importante)
O sitemap é a "lista de páginas" que diz ao Google o que existe no site. Já criei o arquivo
`sitemap.xml` no projeto. Depois que ele estiver no ar (após o próximo deploy):

1. No Search Console, menu lateral → **Sitemaps**.
2. No campo "Adicionar um novo sitemap", digite: `sitemap.xml`
3. Clique em **Enviar**.
4. O status deve virar **"Sucesso"** em algumas horas.

> Isso faz o Google indexar o site **muito mais rápido** (dias em vez de semanas).

### 1.2 Pedir indexação manual da home
Pra dar um empurrão imediato:

1. No topo, na barra **"Inspecionar qualquer URL"**, cole: `https://www.studiof03.com/`
2. Aperte Enter. O Google analisa a página.
3. Clique em **"Solicitar indexação"**.
4. Pronto — você pulou pra frente na fila de indexação do Google.

### 1.3 Resolver o aviso de "tokens de verificação não usados"
Aquele aviso amarelo na sua tela ("Tokens de verificação não usados: 1") é só limpeza.
Acontece quando o site foi verificado por mais de um método. Não é urgente nem é erro.
Quando tiver tempo: clique em **"Analisar relatório"** e remova o token antigo que não usa mais.

---

## PARTE 2 — Acompanhar de tempos em tempos (o que olhar)

Você não precisa entrar todo dia. Pra um site assim, **uma olhada por mês** já é ótimo.
Quando entrar, olhe estas quatro coisas:

### 2.1 Desempenho — quem está te achando
Menu **Desempenho**. É o relatório mais útil. Ele mostra 4 números:

- **Cliques**: quantas pessoas clicaram no seu site vindo do Google.
- **Impressões**: quantas vezes seu site **apareceu** numa busca (mesmo sem clicar).
- **CTR**: a % de quem viu e clicou.
- **Posição média**: em que lugar você aparece (1 = topo; quanto menor, melhor).

Desça até a aba **"Consultas"** — ali estão **as palavras que as pessoas digitaram** e
acharam você. Ouro puro: mostra se você está aparecendo pra "archviz", "renderização
arquitetônica", "imagens 3D imobiliário" etc. Se aparecer um termo com muitas impressões
mas poucos cliques, é sinal de que vale reforçar aquele assunto no site.

### 2.2 Páginas (Indexação) — o site está no Google?
Menu **Indexação → Páginas**. Confirma se a sua página foi **indexada** (verde) ou se há
algum problema. Pra um site de uma página, você quer ver "1 página indexada". Se aparecer
"não indexada", clique pra ver o motivo (e me chame se não entender).

### 2.3 Experiência → Core Web Vitals e HTTPS
- **Core Web Vitals**: mede a velocidade/estabilidade do site pro visitante. Como otimizamos
  as imagens (433 MB → 38 MB), aqui deve ficar verde. Se aparecer algo vermelho, me avise.
- **HTTPS**: confirma que o site é seguro. Deve estar tudo verde (já configuramos o certificado).

### 2.4 Segurança e ações manuais
Menu **Segurança e ações manuais**. Aqui você quer ver **"Nenhum problema detectado"**.
Se algum dia aparecer algo, é importante — me chame.

---

## PARTE 3 — Pra aparecer mais (SEO contínuo)

O Search Console mostra o diagnóstico; estas ações melhoram o resultado:

- **Use as "Consultas" como bússola.** Os termos que já trazem impressões são os que o Google
  associa a você. Reforçar esses assuntos nos textos do site aumenta o ranqueamento.
- **Quanto mais conteúdo relevante, melhor.** Um site de uma página ranqueia, mas páginas
  dedicadas (ex.: uma página só de "Animações imobiliárias", outra de "Tour 360°") dariam mais
  portas de entrada no Google. Se um dia quiser expandir, me chame — dá pra fazer.
- **Links de fora ajudam muito.** Quando outros sites apontam pro seu (parceiros, Instagram,
  LinkedIn, portais de arquitetura), o Google entende que você é confiável. Coloque o link
  `studiof03.com` na bio do Instagram, no LinkedIn da empresa, em assinaturas de e-mail.
- **Google Negócios (Perfil da Empresa).** Pra buscas locais ("archviz Ribeirão Preto"),
  criar um perfil no Google Negócios (gratuito) coloca o studio no mapa e nas buscas da região.

---

## PARTE 4 — Calendário sugerido

| Quando | O que fazer |
|---|---|
| **Agora (1x)** | Enviar sitemap, pedir indexação da home (Parte 1) |
| **Toda semana, 1º mês** | Olhar "Indexação → Páginas" até confirmar que está indexado |
| **1x por mês** | Olhar Desempenho: cliques, impressões e a aba Consultas |
| **A cada 3 meses** | Conferir Core Web Vitals, HTTPS e Ações manuais (tudo verde?) |
| **Quando atualizar o site** | Reenviar o sitemap e pedir reindexação da home |

---

## Glossário rápido (sem juridiquês de SEO)

- **Indexar**: o Google "guardar" sua página pra poder mostrá-la nas buscas.
- **Impressão**: seu site apareceu numa busca (a pessoa viu, mesmo sem clicar).
- **Consulta/Query**: a palavra que a pessoa digitou no Google.
- **CTR**: de cada 100 que viram, quantos clicaram.
- **Sitemap**: a lista de páginas do site, pro Google se guiar.
- **Core Web Vitals**: nota de velocidade e estabilidade da página.

---

*Dúvida em qualquer passo? Me chame e a gente resolve junto. Os dados do Search Console
demoram de 2 a 3 dias pra começar a aparecer, então tenha um pouco de paciência no início —
site novo leva algumas semanas pra ganhar tração no Google.*
