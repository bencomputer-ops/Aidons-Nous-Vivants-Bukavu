/* ===== VOS ALBUMS : c'est le seul fichier à modifier pour publier =====
   type : "photo"   -> fichier image dans le dossier media/
          "video"   -> fichier .mp4 dans le dossier media/
          "youtube" -> src = identifiant de la vidéo YouTube
   Pour publier : copiez le fichier dans media/ puis ajoutez une ligne ici. */
const ALBUMS = {
  "Nettoyage de plage": [
    {type:"photo", src:"media/plage1.jpg", titre:"Équipe du matin"},
    {type:"photo", src:"media/plage2.jpg", titre:"Collecte des déchets"}
  ],
  "Distribution solidaire": [
    {type:"photo", src:"media/don1.jpg", titre:"Remise des dons"},
    {type:"video", src:"media/don-video.mp4", titre:"Notre journée en vidéo"}
  ],
  "Vidéos": [
    {type:"youtube", src:"dQw4w9WgXcQ", titre:"Exemple YouTube (à remplacer)"}
  ]
};


