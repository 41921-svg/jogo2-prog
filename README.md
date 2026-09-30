# ⚽ CAMISA11 — Football Career & Highlights Manager
> **"Crie sua história no futebol."**

O **CAMISA11** é um jogo de futebol de carreira e gerenciamento de clube (manager) com **partidas rápidas e jogáveis por Highlights (Momentos-Chave)**, desenvolvido 100% em **HTML5, CSS3 e JavaScript puro (ES6+) com LocalStorage**, sem dependências externas.

---

## 🎮 Conceito Central e Gameplay

- **Simulação Automática Acelerada**: O relógio da partida avança dinamicamente em ritmo rápido (duração total em torno de 1 a 2 minutos em tempo real).
- **Momentos-Chave (Highlights Interativos)**: Em lances decisivos, o jogador assume o controle direto da jogada em um campo 2D por gestos e toques.
- **Identidade Própria e Original**: Clubes, nomes, escudos procedurais vetoriais, sistema tático e motor de física totalmente originais.

---

## 🕹️ Controles da Partida

### 💻 No Computador (Mouse e Teclado)
- **Clique em companheiro ou espaço**: Realiza passe curto rasteiro.
- **Clique e arraste à frente (Swipe)**: Passe em profundidade com arrancada do atacante.
- **Clique e arraste em direção ao gol**: Chute com força e altura calibradas pelo comprimento e velocidade do gesto. Swipes curvos aplicam efeito (curva na bola).
- **Arrastar das laterais para a área**: Cruzamento com parábola aérea para cabeceio ou finalização de primeira.
- **Segurar e arrastar o atleta**: Condução e drible.
- **No momento defensivo**:
  - Clique no adversário: Pressionar / fechar o ângulo.
  - Arraste em direção à bola: Carrinho ou desarme em pé.
- **Teclado**:
  - `ESC`: Pausar partida
  - `SPACE`: Retomar simulação
  - `M`: Alternar mentalidade tática

### 📱 No Celular / Tablet (Touch & Gestures)
- **Toque**: Passe direto
- **Swipe / Arrastar**: Chute, cruzamento ou passe longo
- **Segurar**: Condução de bola
- **Toque no adversário**: Pressão
- **Swipe no adversário**: Desarme ou carrinho

---

## 🧩 Os Sistemas do Jogo

1. **🚀 Início & Onboarding**:
   - Escolha de clube (10 clubes com filtros, divisões, orçamentos e títulos) ou criação de clube próprio (nome, cores, formato e símbolo do escudo com gerador SVG em tempo real).
   - Geração automática de elenco inicial equilibrado (~21 atletas).
   - Escolha de dificuldade: Fácil, Normal ou Difícil.
   - Apresentação da temporada e objetivos da diretoria.
2. **🏠 Dashboard (Início)**:
   - Card hero da próxima partida com opções de **Jogar** e **Simular Instantaneamente**.
   - Placar e badge do último resultado.
   - Tabela resumida de classificação (G4).
3. **👥 Elenco & Campo Tático 2D**:
   - Visualização alternável entre Lista Completa e Campo Tático 2D.
   - 5 Formações táticas: `4-3-3`, `4-4-2`, `4-2-3-1`, `3-5-2`, `4-5-1`.
   - 11 slots interativos com OVR, posição, número e nome dos titulares.
   - Troca de atletas e substituições simples com o banco de reservas.
   - Botão de Auto-Escalar e inspeção detalhada de atributos individuais (Pace, Shoot, Pass, Dribble, Defend, Physical).
4. **⚽ Partidas & Motor de Highlights (Canvas 2D)**:
   - Relógio acelerado, barra de posse e narração lance a lance.
   - Alerta visual `⚡ MOMENTO-CHAVE!` e transição suave para o campo gráfico.
   - Diversos cenários: Ataque pelas pontas, contra-ataque rápido, finalização na entrada da área, 1v1 com o goleiro, faltas, pênaltis, escanteios e momentos defensivos.
   - Goleiro com IA de reação e salto.
   - Banner comemorativo de gol e áudio sintetizado proceduralmente (apito, chute, defesa, torcida).
5. **🛒 Mercado de Transferências**:
   - Compra e venda de jogadores com filtros por posição (GK, DEF, MEI, ATA).
   - Valores dinâmicos baseados em OVR, idade e potencial.
6. **🏆 Campeonato (Temporadas & Liga)**:
   - 10 clubes disputando 18 rodadas (turno e returno completo).
   - Tabela oficial com Pontos, Jogos, Vitórias, Empates, Derrotas, Gols Pró, Gols Contra e Saldo.
   - Zonas de promoção (G2) e rebaixamento.
   - Final de temporada com celebração de campeão, premiação, evolução/envelhecimento de atletas e novos talentos da categoria de base.
7. **💼 Carreira do Treinador & Ranking Global**:
   - Reputação do treinador (0 a 100), títulos conquistados e aproveitamento.
   - Propostas de contrato de clubes maiores no final da temporada.
   - Ranking global comparando os maiores clubes do futebol.

---

## 📁 Arquitetura do Projeto

```text
camisa11/
│
├── index.html              # Interface do usuário, modais e viewport da partida
├── style.css               # Design System dark esportivo, campo tático e responsividade
├── script.js               # Ponte de compatibilidade
├── README.md               # Documentação técnica do projeto
│
└── js/
    ├── data.js             # Banco de dados de clubes, nomes, formações e divisões
    ├── audio.js            # Sintetizador procedural de efeitos sonoros (Web Audio API)
    ├── storage.js          # Persistência LocalStorage e gerenciador de saves
    ├── club.js             # Gerador de escudos SVG, criação de clube e elencos
    ├── tactics.js          # Formações, coordenadas táticas e escalação 2D
    ├── market.js           # Mercado de transferências e scout
    ├── season.js           # Calendário de 18 rodadas, tabela e evolução de temporadas
    ├── match_canvas.js     # Motor gráfico 2D em Canvas dos Highlights e física da bola
    ├── match_sim.js        # Simulação acelerada da partida e coordenador de lances
    ├── career.js           # Perfil do treinador, reputação e ranking global
    └── app.js              # Controlador mestre da aplicação e eventos de interface
```

---

## 🚀 Como Executar

Basta abrir o arquivo `index.html` em qualquer navegador web moderno:
```bash
python -m http.server 8080
```
Ou dê um duplo clique no arquivo `index.html`.
