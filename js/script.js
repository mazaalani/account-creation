"use strict";
window.addEventListener("load", function () {
  // état initial des contrôles
  // --------------------------
  let controles = {
    civilite: {
      exp: "",
      msg: "Obligatoire.",
      valider: validerCivilite,
    },
    nom: {
      exp: /^[a-zéèàùûêâôë]+([ '-][a-zéèàùûêâôë]+)*$/i,
      msg: "nom invalide.",
      valider: validerNom,
    },
    prenom: {
      exp: /^[a-zéèàùûêâôë]+([ '-][a-zéèàùûêâôë]+)*$/i,
      msg: "prenom invalide.",
      valider: validerPrenom,
    },
    courriel: {
      exp: /[a-zéèàùûêâôë0-9\._-]+@\w+\.\w{2,3}$/i,
      msg: "Format courriel invalide.",
      valider: validerCourriel,
    },
    codeConfidentiel: {
      exp: /^[a-z0-9&#@+=$%!]{8,}$/i,
      msg: "8 caractères minimum",
      valider: validerCodeConfidentiel,
    },
    locationAchat: {
      exp: "",
      msg: "Obligatoire.",
      valider: validerlocationAchat,
    },
    type: {
      exp: "",
      msg: "Obligatoire.",
      valider: validerType,
    },
    codePostal: {
      exp: /^[A-CEGHJ-NPR-TVXY]\d[A-CEGHJ-NPR-TV-Z]\s[A-CEGHJ-NPR-TVXY]\d[A-CEGHJ-NPR-TV-Z]$/,
      msg: "Format valide - A1B 2C3",
      valider: validerCodePostal,
    },
    anneeConstruction: {
      exp: /^\d{4}$/,
      msg: "Obligatoire.",
      valider: validerAnneeConstruction,
    },
    superficie: {
      exp: /^[1-9]\d{2,3}$/,
      msg: "Format valide - entre 100 et 9999",
      valider: validerSuperficie,
    },
    nbPieces: {
      exp: /^([1-9]|1\d|20)$/,
      msg: "Format valide - de 1 à 20 pièces.",
      valider: validerNbPieces,
    },
    aProximiteDe: {
      exp: "",
      msg: "Veuillez selectionner au moins une option.",
      valider: validerAProximiteDe,
      nom: "aProximiteDe[]",
    },
    presentation: {
      exp: /^\S+(\s+\S+){4,}$/i,
      msg: "Format valide - au moins 5 mots",
      valider: validerPresentation,
    },
    contacts: {
      exp: "",
      msg: "Veuillez selectionner au moins une de ces cases.",
      valider: validerContacts,
      nom: "contacts[]",
    },
  };
  let f = form1;
  let erreur = false;

  /**
   * Gestionnaire de l'évènement click sur le bouton d'attribut name="envoi"
   * pour valider tous les champs du formulaire
   */
  form1.envoi.addEventListener("click", (evt) => {
    if (controlerTousLesChamps()) evt.preventDefault();
  });

  /**
   * Gestionnaire de l'évènement input sur tous les éléments du formulaire
   * pour valider chaque champ du formulaire dès qu'il est modifié
   */
  form1.addEventListener("input", function (evt) {
    let champ = evt.target.name;
    controlerChamp(champ);
    afficherSuivant();
  });

  // initialisation de chaque champ avec son numéro de groupe et son statut de saisie et erreur
  for (let controle in controles) {
    if (controles[controle].nom == null) controles[controle].nom = controle; // rajouter nom a chaque controle contenant son nom de balise (incluant les [] pour les choix multiples)
    controles[controle].groupe = parseInt(
      f.querySelector(`[name="${controles[controle].nom}"]`).parentNode.dataset
        .groupe
    );
    controles[controle].saisi = false;
    controles[controle].aErreur = false;
  }

  // état initial des groupes et des boutons de navigation et d'envoi
  // ----------------------------------------------------------------
  let groupes = [];
  f.querySelectorAll("[data-groupe]").forEach(
    (groupe) => (groupes[groupe.dataset.groupe] = groupe)
  );
  let nbGroupes = groupes.length - 1;
  let numGroupe = 1;
  f.precedent.disabled = true;
  f.suivant.disabled = true;
  f.envoi.disabled = true;
  afficherGroupe();

  // Gestion de l'état de l'interface (groupes et boutons)
  // ----------------------------------------------------------------
  f.precedent.addEventListener("click", () => {
    numGroupe--;
    afficherGroupe();
    afficherSuivant();
  });

  f.suivant.addEventListener("click", () => {
    numGroupe++;
    afficherGroupe();
    afficherSuivant();
  });

  function afficherPrecedent() {
    if (numGroupe > 1) f.precedent.disabled = false;
    else f.precedent.disabled = true;
  }

  function afficherGroupe() {
    for (let i = 1; i <= nbGroupes; i++) {
      if (i === numGroupe) {
        groupes[i].style.display = "block";
      } else groupes[i].style.display = "none";
    }
    if (numGroupe < nbGroupes) f.envoi.disabled = true;
    afficherPrecedent();
  }

  function afficherSuivant() {
    f.suivant.disabled = true;
    if (estValide()) {
      if (numGroupe === nbGroupes) {
        f.envoi.disabled = false;
      } else {
        f.suivant.disabled = false;
      }
    }
    if (numGroupe === nbGroupes) f.envoi.disabled = false;
  }

  // Valider que les champs du groupe sont remplis et sans erreurs
  function estValide() {
    let cValide = false;
    let nbChamps = 0;
    let nbVerifie = 0;
    for (let c in controles) {
      if (controles[c].groupe === numGroupe) nbChamps++;
      if (
        controles[c].groupe === numGroupe &&
        controles[c].saisi &&
        !controles[c].aErreur
      )
        nbVerifie++;
      //DEBUG
      /*  console.log(c + " saisi " + controles[c].saisi);
            console.log(c + " erreur " + controles[c].aErreur); */
      //DEBUG Fin
    }
    if (nbChamps === nbVerifie) cValide = true;
    return cValide;
  }

  // Fonctions de validation des champs
  // ============================================

  /**
   * Exécuter toutes les fonctions de validation
   * pour valider tous les champs du formulaire
   * @return {boolean} erreur
   */
  function controlerTousLesChamps(form) {
    erreur = false;
    for (let controle in controles) {
      controles[controle].aErreur = false;
      controles[controle].valider();
    }
    return erreur;
  }

  /**
   * Exécuter la fonction de validation d'un champ du formulaire
   * pour contrôler ce champ
   * @param {string} nomChamp
   */
  function controlerChamp(nomChamp) {
    nomChamp = nomChamp.replace("[]", "");
    controles[nomChamp].valider();
  }
  /* Champs a radio --------------------------------------------------------------------------*/
  /**
   * controle choix multiples
   */
  function controlerChoix(champAtester, valeurChamp) {
    let msgErr = "";
    if (valeurChamp === "") {
      msgErr = controles[champAtester].msg;
      controles[champAtester].saisi = false;
    } else {
      controles[champAtester].saisi = true;
    }
    if (msgErr !== "") {
      erreur = true;
      controles[champAtester].aErreur = true;
    }
    return (document.getElementById("err" + champAtester).innerHTML = msgErr);
  }

  /**
   * Valider le champ civilite
   */
  function validerCivilite() {
    /*   //DEBUG
        console.log(controles.civilite.msg);
        console.log(controles["civilite"]);
        //fin DEBUG   */
    let val = f.civilite.value;
    controlerChoix("civilite", val);
  }

  /**
   * Valider le champ locationAchat
   */
  function validerlocationAchat() {
    let val = f.locationAchat.value;
    controlerChoix("locationAchat", val);
  }

  /**
   * Valider le champ CodeConfidentiel
   */
  function validerType() {
    let val = f.type.value;
    controlerChoix("type", val);
  }

  /**
   * Valider le champ AProximiteDe
   */
  function validerAProximiteDe() {
    let val = f.aProximiteDe.value;
    controlerChoix("aProximiteDe", val);
  }

  /* Champs a espression reguliere --------------------------------------------------------------*/
  /**
   * controle espression reguliere
   */
  function controlerExpression(champAtester, valeurChamp) {
    let msgErr = "";
    if (valeurChamp === "") {
      msgErr = controles[champAtester].msg;
      controles[champAtester].saisi = false;
    } else {
      if (!controles[champAtester].exp.test(valeurChamp)) {
        msgErr = controles[champAtester].msg;
      } else {
        if (champAtester == "codeConfidentiel") {
          let different = "";
          for (let i = 0; i < valeurChamp.length; i++)
            if (!different.includes(valeurChamp[i]))
              different += valeurChamp[i];

          if (different.length - 1 < 5)
            msgErr = "au moins 5 caractères différents";
        }
      }
      if (champAtester == "anneeConstruction") {
        let annee = new Date().getFullYear(); //https://www.w3schools.com/jsref/jsref_getfullyear.asp
        if (parseInt(valeurChamp) < 1800 || parseInt(valeurChamp) > annee)
          msgErr = "Entre 1800 et l'année en cours.";
      }
      controles[champAtester].saisi = true;
    }

    if (msgErr !== "") {
      erreur = true;
      controles[champAtester].aErreur = true;
    } else controles[champAtester].aErreur = false;
    return (document.getElementById("err" + champAtester).innerHTML = msgErr);
  }

  /**
   * Valider le champ nom
   */
  function validerNom() {
    let val = f.nom.value.trim();
    controlerExpression("nom", val);
  }

  /**
   * Valider le champ prenom
   */
  function validerPrenom() {
    let val = f.prenom.value.trim();
    controlerExpression("prenom", val);
  }

  /**
   * Valider le champ courriel
   */
  function validerCourriel() {
    let val = f.courriel.value.trim();
    controlerExpression("courriel", val);
  }

  /**
   * Valider le champ CodeConfidentiel
   */
  function validerCodeConfidentiel() {
    let val = f.codeConfidentiel.value.trim();
    controlerExpression("codeConfidentiel", val);
  }

  /**
   * Valider le champ CodePostal
   */
  function validerCodePostal() {
    let val = f.codePostal.value.trim();
    controlerExpression("codePostal", val);
  }

  /**
   * Valider le champ AnneeConstruction
   */
  function validerAnneeConstruction() {
    let val = f.anneeConstruction.value.trim();
    controlerExpression("anneeConstruction", val);
  }

  /**
   * Valider le champ Superficie
   */
  function validerSuperficie() {
    let val = f.superficie.value.trim();
    controlerExpression("superficie", val);
  }

  /**
   * Valider le champ NbPieces
   */
  function validerNbPieces() {
    let val = f.nbPieces.value.trim();
    controlerExpression("nbPieces", val);
  }

  /**
   * Valider le champ Presentation
   */
  function validerPresentation() {
    let val = f.presentation.value.trim();
    controlerExpression("presentation", val);
  }

  /* Champs a checkbox ----------------------------------------------------------------------*/
  /**
   * Valider le champ Contacts
   */
  function validerContacts() {
    let msgErr = "";
    let checkbox = f.elements["contacts[]"];
    let isChecked = false;
    checkbox.forEach((cBox) => {
      if (cBox.checked) {
        isChecked = true;
        controles["contacts"].saisi = true;
      }
    });
    if (!isChecked) {
      msgErr = controles.contacts.msg;
      controles["contacts"].saisi = false;
    }
    if (msgErr !== "") {
      erreur = true;
      controles["contacts"].aErreur = true;
    }
    document.getElementById("errcontacts").innerHTML = msgErr;
  }
});
