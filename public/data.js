// Contenu : pillole et scènes. Ajouter une scène = ajouter une entrée dans SCENES.
const PILLOLE = [
  {it:"Vorrei…", ph:"vor-RÈ-i", fr:"Je voudrais…", rule:"La clé passe-partout. <b>Vorrei</b> + ce que tu veux : « vorrei un caffè », « vorrei un biglietto ». Ça règle 80 % des demandes, poliment."},
  {it:"Scusi!", ph:"SKOU-zi", fr:"Excusez-moi ! (pour interpeller)", rule:"Pour attirer l'attention d'un inconnu ou d'un serveur. Entre amis on dit <b>scusa</b>."},
  {it:"Non ho capito.", ph:"non o ka-PI-to", fr:"Je n'ai pas compris.", rule:"Le <b>h</b> ne se prononce jamais. « Ho » se dit « o »."},
  {it:"Può ripetere più piano?", ph:"pwo ri-PÈ-té-ré piou PYA-no", fr:"Vous pouvez répéter plus lentement ?", rule:"<b>Piano</b> = doucement, lentement. La phrase la plus utile quand ça va trop vite."},
  {it:"Quanto costa?", ph:"KWAN-to KOS-ta", fr:"Combien ça coûte ?", rule:"Pour plusieurs choses : <b>quanto costano?</b>"},
  {it:"Dov'è…?", ph:"do-VÈ", fr:"Où est… ?", rule:"« Dov'è la stazione? », « dov'è il bagno? ». Le doigt pointé fait le reste."},
  {it:"Posso…?", ph:"POS-so", fr:"Je peux… ?", rule:"<b>Posso</b> + verbe à l'infinitif : « posso pagare con la carta? », « posso sedermi? »."},
  {it:"Va bene.", ph:"va BÈ-né", fr:"D'accord, ça marche.", rule:"Réponse universelle. Plus enthousiaste : <b>va benissimo!</b>"},
  {it:"Volentieri!", ph:"vo-len-TYÉ-ri", fr:"Avec plaisir !", rule:"Pour accepter une proposition avec chaleur. Très apprécié."},
  {it:"Prego.", ph:"PRÈ-go", fr:"Je vous en prie / Allez-y", rule:"Réponse à « grazie », mais aussi « entrez », « servez-vous », « que puis-je pour vous ? ». Un mot, quatre usages."},
  {it:"Che bello!", ph:"ké BÈL-lo", fr:"Que c'est beau ! / Génial !", rule:"<b>ch</b> devant e ou i se dit « k ». À l'inverse, <b>c</b> devant e ou i se dit « tch »."},
  {it:"Magari!", ph:"ma-GA-ri", fr:"Si seulement ! / J'aimerais bien !", rule:"Le mot le plus italien qui soit. On répond « magari! » quand on rêve de quelque chose."},
  {it:"Un attimo, per favore.", ph:"oun AT-ti-mo, pèr fa-VO-ré", fr:"Un instant, s'il vous plaît.", rule:"Pour gagner du temps et chercher ses mots, sans stress."}
];

const SCENES = {
 ristorante: {
  label:"Ristorante", place:"Scène · ce soir à Rome", title:"Al ristorante", who:"Il cameriere", endTitle:"Buona serata!",
  lines: [
  {w:{it:"Buonasera! Quanti siete?", ph:"bwo-na-SÉ-ra ! KWAN-ti SYÈ-té ?", fr:"Bonsoir ! Vous êtes combien ?"},
   opts:[
    {it:"Siamo in due.", ph:"SYA-mo in DOU-é", fr:"Nous sommes deux."},
    {it:"Un tavolo per due, per favore.", ph:"oun TA-vo-lo pèr DOU-é, pèr fa-VO-ré", fr:"Une table pour deux, s'il vous plaît."},
    {it:"Abbiamo prenotato a nome Bouzeran.", ph:"ab-BYA-mo pré-no-TA-to a NO-mé…", fr:"Nous avons réservé au nom de Bouzeran."}],
   tip:"<b>Siamo in</b> + nombre : « siamo in tre », « siamo in quattro »."},
  {w:{it:"Prego, accomodatevi. Ecco il menù.", ph:"PRÈ-go, ak-ko-mo-DA-té-vi. ÈK-ko il mé-NOU", fr:"Je vous en prie, installez-vous. Voici la carte."},
   opts:[
    {it:"Grazie mille.", ph:"GRA-tsyé MIL-lé", fr:"Merci beaucoup."},
    {it:"Possiamo sederci fuori?", ph:"pos-SYA-mo sé-DÉR-tchi FWO-ri ?", fr:"On peut s'asseoir dehors ?"}],
   tip:"<b>Ecco</b> = voici. Tu l'entendras partout, à chaque fois qu'on te tend quelque chose."},
  {w:{it:"Cosa vi porto da bere?", ph:"KO-za vi POR-to da BÉ-ré ?", fr:"Qu'est-ce que je vous apporte à boire ?"},
   opts:[
    {it:"Una bottiglia d'acqua naturale, per favore.", ph:"OU-na bot-TI-llya DAK-kwa na-tou-RA-lé", fr:"Une bouteille d'eau plate, s'il vous plaît."},
    {it:"Acqua frizzante, grazie.", ph:"AK-kwa frit-TSAN-té, GRA-tsyé", fr:"De l'eau gazeuse, merci."},
    {it:"Un quarto di vino rosso della casa.", ph:"oun KWAR-to di VI-no ROS-so DÉL-la KA-za", fr:"Un quart de vin rouge maison."}],
   tip:"Le vin maison se commande en <b>quarto</b> (25 cl), <b>mezzo</b> (50 cl) ou <b>litro</b>."},
  {w:{it:"Avete deciso?", ph:"a-VÉ-té dé-TCHI-zo ?", fr:"Vous avez choisi ?"},
   opts:[
    {it:"Non ancora, ancora un minuto.", ph:"non an-KO-ra, an-KO-ra oun mi-NOU-to", fr:"Pas encore, encore une minute."},
    {it:"Cosa ci consiglia?", ph:"KO-za tchi kon-SI-llya ?", fr:"Qu'est-ce que vous nous conseillez ?"},
    {it:"Per me, le tagliatelle al ragù.", ph:"pèr MÉ, lé ta-llya-TÈL-lé al ra-GOU", fr:"Pour moi, les tagliatelles au ragù."}],
   tip:"<b>Per me</b> = pour moi. Tu montres le plat sur la carte, tu dis « per me, questo ». C'est gagné."},
  {w:{it:"E di secondo?", ph:"é di sé-KON-do ?", fr:"Et comme plat principal ?"},
   opts:[
    {it:"Niente secondo, grazie.", ph:"NYÈN-té sé-KON-do, GRA-tsyé", fr:"Pas de plat principal, merci."},
    {it:"Una tagliata con rucola, al sangue.", ph:"OU-na ta-LLYA-ta kon ROU-ko-la, al SAN-gwé", fr:"Une tagliata à la roquette, saignante."}],
   tip:"Le repas italien : <b>antipasto</b>, <b>primo</b> (pâtes, risotto), <b>secondo</b> (viande, poisson), <b>dolce</b>. Personne ne prend tout."},
  {w:{it:"Tutto bene?", ph:"TOUT-to BÈ-né ?", fr:"Tout va bien ?"},
   opts:[
    {it:"Tutto buonissimo, grazie!", ph:"TOUT-to bwo-NIS-si-mo", fr:"Tout est délicieux, merci !"},
    {it:"Scusi, manca una forchetta.", ph:"SKOU-zi, MAN-ka OU-na for-KÉT-ta", fr:"Excusez-moi, il manque une fourchette."},
    {it:"Potrebbe portarci ancora un po' di pane?", ph:"po-TRÈB-bé por-TAR-tchi an-KO-ra oun PO di PA-né ?", fr:"Pourriez-vous nous apporter encore un peu de pain ?"}],
   tip:"<b>Manca</b> + ce qui manque : « manca il sale », « manca un bicchiere ». Pas besoin de plus."},
  {w:{it:"Desiderate un dolce, un caffè?", ph:"dé-zi-dé-RA-té oun DOL-tché, oun kaf-FÈ ?", fr:"Vous désirez un dessert, un café ?"},
   opts:[
    {it:"Un tiramisù e due caffè.", ph:"oun ti-ra-mi-ZOU é DOU-é kaf-FÈ", fr:"Un tiramisu et deux cafés."},
    {it:"Solo un caffè, grazie.", ph:"SO-lo oun kaf-FÈ", fr:"Juste un café, merci."},
    {it:"No grazie, siamo pieni!", ph:"no GRA-tsyé, SYA-mo PYÈ-ni", fr:"Non merci, on n'a plus faim !"}],
   tip:"<b>Un caffè</b> = un espresso, toujours. Un cappuccino après le repas fait sourire le serveur."},
  {w:{it:"Desiderate altro?", ph:"dé-zi-dé-RA-té AL-tro ?", fr:"Vous désirez autre chose ?"},
   opts:[
    {it:"Il conto, per favore.", ph:"il KON-to, pèr fa-VO-ré", fr:"L'addition, s'il vous plaît."},
    {it:"Possiamo pagare con la carta?", ph:"pos-SYA-mo pa-GA-ré kon la KAR-ta ?", fr:"On peut payer par carte ?"}],
   tip:"<b>Il conto</b>, jamais « l'addizione ». Le <b>coperto</b> sur la note, c'est le couvert : normal, pas une arnaque."},
  {w:{it:"Grazie a voi, buona serata!", ph:"GRA-tsyé a VO-i, BWO-na sé-RA-ta", fr:"Merci à vous, bonne soirée !"},
   opts:[
    {it:"Grazie, arrivederci!", ph:"GRA-tsyé, ar-ri-vé-DÉR-tchi", fr:"Merci, au revoir !"},
    {it:"Era tutto ottimo. A presto!", ph:"È-ra TOUT-to OT-ti-mo. a PRÈS-to", fr:"Tout était excellent. À bientôt !"}],
   tip:"<b>Buonasera</b> dès le milieu d'après-midi. <b>Buona serata</b> pour souhaiter une bonne soirée en partant."}
]
 }
};

const SOON = ["Stazione","Aeroporto","In città","Al bar","Albergo"];
