export interface Episode {
  id: string;
  number: number;
  title: string;
  duration: string;
  thumbnail: string;
  fileName?: string;
}

export interface Season {
  id: string;
  number: number;
  title: string;
  folderName: string;
  episodes: Episode[];
  filePrefix?: string;
  fileSuffix?: string;
}

export interface Anime {
  id: string;
  title: string;
  cover: string;
  banner: string;
  description: string;
  genres: string[];
  rating: number;
  year: number;
  status: string;
  folderName: string;
  seasons: Season[];
}

const generateEpisodes = (
  count: number,
  thumbnail: string,
  filePrefix?: string,
  fileSuffix?: string
): Episode[] =>
  Array.from({ length: count }, (_, i) => {
    const epNum = String(i + 1).padStart(2, "0");
    const fileName = filePrefix
      ? `${filePrefix}${epNum}${fileSuffix || ""}.mp4`
      : `episodio-${i + 1}.mp4`;
    return {
      id: `ep-${i + 1}`,
      number: i + 1,
      title: `Episodio ${i + 1}`,
      duration: `${20 + Math.floor(Math.random() * 5)} min`,
      thumbnail,
      fileName,
    };
  });

export const animeList: Anime[] = [
  // ═══════════════════════════════════════
  // DR. STONE
  // ═══════════════════════════════════════
  {
    id: "dr-stone-s1",
    title: "Dr. Stone",
    folderName: "Dr. Stone ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1613/102576.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1613/102576l.jpg",
    description: "Una luce misteriosa pietrifica istantaneamente tutta l'umanità. Migliaia di anni dopo, il genio della scienza Senku Ishigami si risveglia in un mondo tornato all'età della pietra.",
    genres: ["Avventura", "Sci-Fi", "Commedia"],
    rating: 8.3,
    year: 2019,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Dr. Stone", filePrefix: "DrStone_Ep_", fileSuffix: "_ITA", episodes: generateEpisodes(24, "https://cdn.myanimelist.net/images/anime/1613/102576.jpg", "DrStone_Ep_", "_ITA") },
    ],
  },
  {
    id: "dr-stone-s2",
    title: "Dr. Stone: Stone Wars",
    folderName: "Dr. Stone ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1711/110614.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1711/110614l.jpg",
    description: "Senku e il Regno della Scienza dichiarano guerra all'Impero di Tsukasa. Con ingegno e scienza, Senku pianifica di sconfiggere la forza bruta con la tecnologia.",
    genres: ["Avventura", "Sci-Fi", "Commedia"],
    rating: 8.1,
    year: 2021,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Dr. Stone: Stone Wars", filePrefix: "DrStone2_Ep_", fileSuffix: "_ITA", episodes: generateEpisodes(11, "https://cdn.myanimelist.net/images/anime/1711/110614.jpg", "DrStone2_Ep_", "_ITA") },
    ],
  },
  {
    id: "dr-stone-s3",
    title: "Dr. Stone: New World",
    folderName: "Dr. Stone ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1236/138696.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1236/138696l.jpg",
    description: "Senku e i suoi compagni salpano verso nuove terre alla ricerca delle risorse per risvegliare tutta l'umanità dalla pietrificazione.",
    genres: ["Avventura", "Sci-Fi", "Commedia"],
    rating: 8.3,
    year: 2023,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Dr. Stone: New World", filePrefix: "DrStone3_Ep_", fileSuffix: "_ITA", episodes: generateEpisodes(22, "https://cdn.myanimelist.net/images/anime/1236/138696.jpg", "DrStone3_Ep_", "_ITA") },
    ],
  },
  {
    id: "dr-stone-s4",
    title: "Dr. Stone: Science Future Parte 1",
    folderName: "Dr. Stone ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1403/146479.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1403/146479l.jpg",
    description: "L'avventura finale di Senku. La battaglia per il futuro della scienza e dell'umanità raggiunge il culmine.",
    genres: ["Avventura", "Sci-Fi", "Commedia"],
    rating: 8.4,
    year: 2025,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Dr. Stone: Science Future parte 1", filePrefix: "DrStone4_Ep_", fileSuffix: "_ITA", episodes: generateEpisodes(12, "https://cdn.myanimelist.net/images/anime/1403/146479.jpg", "DrStone4_Ep_", "_ITA") },
    ],
  },
  {
    id: "dr-stone-s4p2",
    title: "Dr. Stone: Science Future Parte 2",
    folderName: "Dr. Stone ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1785/151710.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1785/151710l.jpg",
    description: "La seconda parte della stagione finale. Senku affronta le sfide più grandi nella corsa per salvare l'umanità.",
    genres: ["Avventura", "Sci-Fi", "Commedia"],
    rating: 8.4,
    year: 2025,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Dr. Stone: Science Future parte 2", filePrefix: "DrStone4P2_Ep_", fileSuffix: "_ITA", episodes: generateEpisodes(6, "https://cdn.myanimelist.net/images/anime/1785/151710.jpg", "DrStone4P2_Ep_", "_ITA") },
    ],
  },
  {
    id: "dr-stone-s4p3",
    title: "Dr. Stone: Science Future Parte 3",
    folderName: "Dr. Stone ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1773/155779.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1773/155779l.jpg",
    description: "Il gran finale di Dr. Stone. La conclusione dell'epica avventura scientifica di Senku.",
    genres: ["Avventura", "Sci-Fi", "Commedia"],
    rating: 8.5,
    year: 2026,
    status: "In corso",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Dr. Stone: Science Future parte 3", filePrefix: "DrStone4P3_Ep_", fileSuffix: "_ITA", episodes: generateEpisodes(12, "https://cdn.myanimelist.net/images/anime/1773/155779.jpg", "DrStone4P3_Ep_", "_ITA") },
    ],
  },

  // ═══════════════════════════════════════
  // ATTACK ON TITAN
  // ═══════════════════════════════════════
  {
    id: "aot-s1",
    title: "Attack on Titan",
    folderName: "Attack on Titan ITA",
    cover: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
    description: "Secoli fa, l'umanità fu massacrata fino quasi all'estinzione da mostri enormi chiamati Titani. I pochi sopravvissuti si rifugiarono dietro tre enormi mura concentriche.",
    genres: ["Azione", "Dark Fantasy", "Post-apocalittico"],
    rating: 8.5,
    year: 2013,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Stagione 1", episodes: generateEpisodes(25, "https://cdn.myanimelist.net/images/anime/10/47347.jpg") },
    ],
  },
  {
    id: "aot-s2",
    title: "Attack on Titan Season 2",
    folderName: "Attack on Titan ITA",
    cover: "https://cdn.myanimelist.net/images/anime/4/84177.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/4/84177l.jpg",
    description: "Dopo la scoperta scioccante nella parete, l'umanità affronta nuove minacce. Il Corpo di Ricerca deve combattere i Titani mentre cerca la verità sul mondo.",
    genres: ["Azione", "Dark Fantasy", "Post-apocalittico"],
    rating: 8.5,
    year: 2017,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Stagione 2", episodes: generateEpisodes(12, "https://cdn.myanimelist.net/images/anime/4/84177.jpg") },
    ],
  },
  {
    id: "aot-s3",
    title: "Attack on Titan Season 3",
    folderName: "Attack on Titan ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1429/95946.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1429/95946l.jpg",
    description: "Il Corpo di Ricerca si prepara a riprendere Wall Maria. Eren e i suoi compagni scoprono la verità sul mondo oltre le mura.",
    genres: ["Azione", "Dark Fantasy", "Post-apocalittico"],
    rating: 8.6,
    year: 2018,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Parte 1", folderName: "Stagione 3", episodes: generateEpisodes(12, "https://cdn.myanimelist.net/images/anime/1429/95946.jpg") },
      { id: "s2", number: 2, title: "Parte 2", folderName: "Stagione 3 Parte 2", episodes: generateEpisodes(10, "https://cdn.myanimelist.net/images/anime/1429/95946.jpg") },
    ],
  },
  {
    id: "aot-final",
    title: "Attack on Titan: The Final Season",
    folderName: "Attack on Titan ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1000/110531.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1000/110531l.jpg",
    description: "La storia raggiunge la conclusione. Eren Yeager e i suoi compagni affrontano la battaglia finale che deciderà il destino dell'umanità.",
    genres: ["Azione", "Dark Fantasy", "Post-apocalittico"],
    rating: 8.7,
    year: 2020,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Parte 1", folderName: "Stagione Finale Parte 1", episodes: generateEpisodes(16, "https://cdn.myanimelist.net/images/anime/1000/110531.jpg") },
      { id: "s2", number: 2, title: "Parte 2", folderName: "Stagione Finale Parte 2", episodes: generateEpisodes(12, "https://cdn.myanimelist.net/images/anime/1948/120625.jpg") },
      { id: "s3", number: 3, title: "Parte 3", folderName: "Stagione Finale Parte 3", episodes: generateEpisodes(2, "https://cdn.myanimelist.net/images/anime/1279/131078.jpg") },
    ],
  },

  // ═══════════════════════════════════════
  // DEMON SLAYER
  // ═══════════════════════════════════════
  {
    id: "demon-slayer-s1",
    title: "Demon Slayer: Kimetsu no Yaiba",
    folderName: "Demon Slayer ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
    description: "Tanjiro è un giovane carbonaio che trova la sua famiglia massacrata da un demone. L'unica sopravvissuta è sua sorella Nezuko, trasformata in un demone. Così inizia il suo viaggio per trovare una cura.",
    genres: ["Azione", "Fantasy", "Soprannaturale"],
    rating: 8.4,
    year: 2019,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Stagione 1", episodes: generateEpisodes(26, "https://cdn.myanimelist.net/images/anime/1286/99889.jpg") },
    ],
  },
  {
    id: "demon-slayer-mugen",
    title: "Demon Slayer: Mugen Train",
    folderName: "Demon Slayer ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1704/116137.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1704/116137l.jpg",
    description: "Tanjiro e i suoi compagni si uniscono al Pilastro della Fiamma Kyojuro Rengoku a bordo del Treno dell'Infinito per indagare su misteriose sparizioni.",
    genres: ["Azione", "Fantasy", "Soprannaturale"],
    rating: 8.3,
    year: 2021,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Arco del Treno", folderName: "Mugen Train", episodes: generateEpisodes(7, "https://cdn.myanimelist.net/images/anime/1704/116137.jpg") },
    ],
  },
  {
    id: "demon-slayer-s2",
    title: "Demon Slayer: Distretto a Luci Rosse",
    folderName: "Demon Slayer ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1908/120036.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1908/120036l.jpg",
    description: "Tanjiro, Zenitsu e Inosuke accompagnano il Pilastro del Suono Tengen Uzui nel Distretto a Luci Rosse per indagare sulla scomparsa delle sue mogli.",
    genres: ["Azione", "Fantasy", "Soprannaturale"],
    rating: 8.2,
    year: 2021,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Distretto a Luci Rosse", episodes: generateEpisodes(11, "https://cdn.myanimelist.net/images/anime/1908/120036.jpg") },
    ],
  },
  {
    id: "demon-slayer-s3",
    title: "Demon Slayer: Villaggio dei Fabbri",
    folderName: "Demon Slayer ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1765/135099.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1765/135099l.jpg",
    description: "Tanjiro si reca al villaggio nascosto dei fabbri per far riparare la sua spada. Ma il villaggio viene attaccato da potenti demoni delle Lune Crescenti.",
    genres: ["Azione", "Fantasy", "Soprannaturale"],
    rating: 8.1,
    year: 2023,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Villaggio dei Fabbri", episodes: generateEpisodes(11, "https://cdn.myanimelist.net/images/anime/1765/135099.jpg") },
    ],
  },
  {
    id: "demon-slayer-s4",
    title: "Demon Slayer: Allenamento dei Pilastri",
    folderName: "Demon Slayer ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1081/142917.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1081/142917l.jpg",
    description: "I Cacciatori di Demoni si sottopongono a un duro allenamento sotto la guida dei Pilastri in preparazione alla battaglia finale contro Muzan.",
    genres: ["Azione", "Fantasy", "Soprannaturale"],
    rating: 7.5,
    year: 2024,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Allenamento dei Pilastri", episodes: generateEpisodes(8, "https://cdn.myanimelist.net/images/anime/1081/142917.jpg") },
    ],
  },

  // ═══════════════════════════════════════
  // JUJUTSU KAISEN
  // ═══════════════════════════════════════
  {
    id: "jujutsu-kaisen-s1",
    title: "Jujutsu Kaisen",
    folderName: "Jujutsu Kaisen ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
    description: "Yuji Itadori ingoia un dito di Ryomen Sukuna, il Re delle Maledizioni, diventando il suo recipiente. Entra nel mondo degli stregoni per affrontare maledizioni terrificanti.",
    genres: ["Azione", "Soprannaturale", "Scolastico"],
    rating: 8.6,
    year: 2020,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Stagione 1", episodes: generateEpisodes(24, "https://cdn.myanimelist.net/images/anime/1171/109222.jpg") },
    ],
  },
  {
    id: "jujutsu-kaisen-s2",
    title: "Jujutsu Kaisen Stagione 2",
    folderName: "Jujutsu Kaisen ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1792/138022.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1792/138022l.jpg",
    description: "La storia esplora il passato di Gojo e Geto, poi si immerge nell'Incidente di Shibuya dove gli stregoni affrontano la più grande crisi della storia.",
    genres: ["Azione", "Soprannaturale"],
    rating: 8.6,
    year: 2023,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Stagione 2", episodes: generateEpisodes(23, "https://cdn.myanimelist.net/images/anime/1792/138022.jpg") },
    ],
  },

  // ═══════════════════════════════════════
  // ONE PIECE (serie lunga, saghe come stagioni)
  // ═══════════════════════════════════════
  {
    id: "one-piece",
    title: "One Piece",
    folderName: "One Piece ITA",
    cover: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg",
    description: "Monkey D. Luffy parte per trovare il leggendario tesoro One Piece e diventare il nuovo Re dei Pirati.",
    genres: ["Azione", "Avventura", "Commedia"],
    rating: 8.7,
    year: 1999,
    status: "In corso",
    seasons: [
      { id: "s1", number: 1, title: "East Blue", folderName: "East Blue", episodes: generateEpisodes(61, "https://cdn.myanimelist.net/images/anime/6/73245.jpg") },
      { id: "s2", number: 2, title: "Alabasta", folderName: "Alabasta", episodes: generateEpisodes(73, "https://cdn.myanimelist.net/images/anime/6/73245.jpg") },
    ],
  },

  // ═══════════════════════════════════════
  // MY HERO ACADEMIA
  // ═══════════════════════════════════════
  {
    id: "mha-s1",
    title: "My Hero Academia",
    folderName: "My Hero Academia ITA",
    cover: "https://cdn.myanimelist.net/images/anime/10/78745.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/10/78745l.jpg",
    description: "In un mondo dove l'80% della popolazione possiede superpoteri chiamati 'Quirk', Izuku Midoriya nasce senza alcun potere ma sogna di diventare un eroe.",
    genres: ["Azione", "Supereroi", "Scolastico"],
    rating: 7.9,
    year: 2016,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Stagione 1", episodes: generateEpisodes(13, "https://cdn.myanimelist.net/images/anime/10/78745.jpg") },
    ],
  },
  {
    id: "mha-s2",
    title: "My Hero Academia 2",
    folderName: "My Hero Academia ITA",
    cover: "https://cdn.myanimelist.net/images/anime/9/88573.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/9/88573l.jpg",
    description: "Gli studenti della Classe 1-A partecipano al Festival Sportivo della U.A., mettendo in mostra i loro Quirk davanti al mondo intero.",
    genres: ["Azione", "Supereroi", "Scolastico"],
    rating: 8.1,
    year: 2017,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Stagione 2", episodes: generateEpisodes(25, "https://cdn.myanimelist.net/images/anime/9/88573.jpg") },
    ],
  },
  {
    id: "mha-s3",
    title: "My Hero Academia 3",
    folderName: "My Hero Academia ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1531/95320.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1531/95320l.jpg",
    description: "La Lega dei Villain attacca il campo estivo della U.A. in un piano per catturare Bakugo. Gli eroi devono affrontare la loro più grande sfida.",
    genres: ["Azione", "Supereroi", "Scolastico"],
    rating: 8.0,
    year: 2018,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Stagione 3", episodes: generateEpisodes(25, "https://cdn.myanimelist.net/images/anime/1531/95320.jpg") },
    ],
  },

  // ═══════════════════════════════════════
  // SPY×FAMILY
  // ═══════════════════════════════════════
  {
    id: "spy-x-family-s1",
    title: "SPY×FAMILY",
    folderName: "Spy x Family ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1441/122795.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1441/122795l.jpg",
    description: "La spia 'Twilight' deve costruire una famiglia copertura. La figlia adottiva legge la mente e la moglie è un'assassina. Insieme formano una famiglia esilarante.",
    genres: ["Azione", "Commedia", "Famiglia"],
    rating: 8.5,
    year: 2022,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Parte 1", folderName: "Stagione 1", episodes: generateEpisodes(12, "https://cdn.myanimelist.net/images/anime/1441/122795.jpg") },
      { id: "s2", number: 2, title: "Parte 2", folderName: "Stagione 1 Parte 2", episodes: generateEpisodes(13, "https://cdn.myanimelist.net/images/anime/1506/128656.jpg") },
    ],
  },
  {
    id: "spy-x-family-s2",
    title: "SPY×FAMILY Season 2",
    folderName: "Spy x Family ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1506/138982.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1506/138982l.jpg",
    description: "La famiglia Forger continua le sue avventure. Loid gestisce la sua missione, Anya affronta nuove sfide scolastiche e Yor protegge la famiglia.",
    genres: ["Azione", "Commedia", "Famiglia"],
    rating: 8.3,
    year: 2023,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Stagione 2", episodes: generateEpisodes(12, "https://cdn.myanimelist.net/images/anime/1506/138982.jpg") },
    ],
  },

  // ═══════════════════════════════════════
  // CHAINSAW MAN
  // ═══════════════════════════════════════
  {
    id: "chainsaw-man",
    title: "Chainsaw Man",
    folderName: "Chainsaw Man ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1806/126216l.jpg",
    description: "Denji è un ragazzo in estrema povertà. Quando viene ucciso e tradito, Pochita si fonde con lui, trasformandolo nel temibile Chainsaw Man.",
    genres: ["Azione", "Dark Fantasy", "Horror"],
    rating: 8.3,
    year: 2022,
    status: "In corso",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Stagione 1", episodes: generateEpisodes(12, "https://cdn.myanimelist.net/images/anime/1806/126216.jpg") },
    ],
  },

  // ═══════════════════════════════════════
  // SOLO LEVELING
  // ═══════════════════════════════════════
  {
    id: "solo-leveling-s1",
    title: "Solo Leveling",
    folderName: "Solo Leveling ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1808/141625.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1808/141625l.jpg",
    description: "Sung Jinwoo è il cacciatore più debole. Dopo una missione quasi fatale, riceve il 'Sistema', un potere unico che gli permette di salire di livello.",
    genres: ["Azione", "Fantasy", "Avventura"],
    rating: 8.3,
    year: 2024,
    status: "Completato",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Stagione 1", episodes: generateEpisodes(12, "https://cdn.myanimelist.net/images/anime/1808/141625.jpg") },
    ],
  },
  {
    id: "solo-leveling-s2",
    title: "Solo Leveling: Arise from the Shadow",
    folderName: "Solo Leveling ITA",
    cover: "https://cdn.myanimelist.net/images/anime/1885/146565.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1885/146565l.jpg",
    description: "Sung Jinwoo continua la sua ascesa, sbloccando il potere dell'ombra e affrontando nemici sempre più potenti nei dungeon di classe superiore.",
    genres: ["Azione", "Fantasy", "Avventura"],
    rating: 8.5,
    year: 2025,
    status: "In corso",
    seasons: [
      { id: "s1", number: 1, title: "Stagione 1", folderName: "Stagione 2", episodes: generateEpisodes(13, "https://cdn.myanimelist.net/images/anime/1885/146565.jpg") },
    ],
  },
];

export const featuredAnime = animeList.find(a => a.id === "aot-final") || animeList[0];

export const popularAnime = animeList.slice(0, 10);
export const topRatedAnime = [...animeList].sort((a, b) => b.rating - a.rating);
export const recentAnime = [...animeList].filter(a => a.year >= 2022);

export function getVideoPath(anime: Anime, season: Season, episode: Episode): string {
  const fileName = episode.fileName || `episodio-${episode.number}.mp4`;
  return `/anime/${encodeURIComponent(anime.folderName)}/${encodeURIComponent(season.folderName)}/${encodeURIComponent(fileName)}`;
}
