+++
title = "Chaque interrupteur, et ce qu'il coûte"
description = "Ce que chaque option de la configuration vitrine active, et ce qu'elle ajoute à la page"
date = "2026-02-07"
type = ["posts","post"]
cover = "img/cover-switches.svg"
tags = ["hugo"]
categories = ["Development"]
series = ["Showcase"]
[author]
  name = "Jane Doe"
+++

Ce site a son propre dossier, `showcaseSite/`, qui ne contient que ce qui diffère
de la démo par défaut : un fichier de configuration et ces deux pages. Le contenu
et les images de la démo sont montés plutôt que copiés, et sa configuration est
posée en dessous de celle-ci — Hugo fusionne la configuration au lieu de la
remplacer, donc ce fichier n'a qu'à nommer ce qui change :

| option | ce que vous voyez |
| --- | --- |
| `backgroundImage` | l'image derrière la page d'accueil |
| `defaultTheme` | la page arrive en sombre au lieu d'y basculer |
| `enableThumbnails` | les couvertures à côté des titres dans la liste |

Aucune n'est active dans la démo par défaut, et c'est délibéré : un thème doit
ressembler à lui-même à l'installation, pas à une liste de fonctionnalités. La
liste de fonctionnalités, c'est ici.

Une option reste éteinte même ici. `gitUrl` avec `enableGitInfo` relie chaque
page au commit qui l'a modifiée en dernier : cela lie chaque build à
l'historique complet, et vise l'historique du thème plutôt que ce que vous
lisez.

Les deux articles qui portent une miniature sont les seuls à avoir un `cover`.
Les autres n'en ont pas et s'affichent exactement comme avant — une liste mélange
les deux sans avoir l'air cassée, et c'est ça qui méritait d'être vérifié.
