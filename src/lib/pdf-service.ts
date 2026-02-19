import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Owner, Tenant, Receipt, Agency } from '../types/rental';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export const generateLeasePDF = (owner: Owner, tenant: Tenant, agency: Agency) => {
  const doc = new jsPDF();
  const primaryColor = [124, 58, 237]; // Violet
  
  // --- EN-TÊTE ---
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont(undefined, 'bold');
  doc.text(agency.name || 'AGENCE IMMOBILIÈRE', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont(undefined, 'normal');
  doc.text(`${agency.address || ''} | Tél: ${agency.phone || ''}`, 105, 27, { align: 'center' });
  doc.text(`NINEA: ${agency.ninea || '...'} | RCCM: ${agency.rccm || '...'}`, 105, 32, { align: 'center' });

  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.8);
  doc.line(20, 38, 190, 38);

  // --- TITRE ---
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text("CONTRAT DE BAIL À USAGE D'HABITATION", 105, 55, { align: 'center' });

  // --- LES PARTIES ---
  let y = 75;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text("ENTRE LES SOUSSIGNÉS :", 20, y);
  
  y += 12;
  doc.setFont(undefined, 'bold');
  doc.text("LE BAILLEUR :", 20, y);
  doc.setFont(undefined, 'normal');
  // Utilisation du nom du gérant de l'agence comme demandé
  const bailleurText = `M/Mme ${agency.ownerName || 'Le Gérant'}, agissant au nom et pour le compte de l'agence ${agency.name}.`;
  const splitBailleur = doc.splitTextToSize(bailleurText, 140);
  doc.text(splitBailleur, 55, y);
  
  y += (splitBailleur.length * 6) + 5;
  doc.setFont(undefined, 'bold');
  doc.text("LE PRENEUR :", 20, y);
  doc.setFont(undefined, 'normal');
  // Récupération automatique des données du locataire
  doc.text(`M/Mme ${tenant.firstName} ${tenant.lastName}`, 55, y);
  y += 6;
  doc.text(`N° Identité (NCI/Passeport) : ${tenant.idNumber || 'Non renseigné'}`, 55, y);

  // --- ARTICLES ---
  y += 20;
  doc.setFont(undefined, 'bold');
  doc.text("ARTICLE 1 : OBJET ET DÉSIGNATION", 20, y);
  y += 7;
  doc.setFont(undefined, 'normal');
  const objetText = `Le présent contrat a pour objet la location d'un local de type "${tenant.unitName}" de ${tenant.roomsCount} pièce(s), situé à : ${owner.address}. Ce local est strictement réservé à l'usage d'habitation.`;
  const splitObjet = doc.splitTextToSize(objetText, 170);
  doc.text(splitObjet, 20, y);
  
  y += (splitObjet.length * 6) + 10;
  doc.setFont(undefined, 'bold');
  doc.text("ARTICLE 2 : DURÉE", 20, y);
  y += 7;
  doc.setFont(undefined, 'normal');
  const dateDebut = tenant.startDate ? format(new Date(tenant.startDate), 'dd/MM/yyyy') : 'date d\'entrée';
  doc.text(`Le bail est consenti pour une durée d'un (01) an renouvelable, prenant effet le ${dateDebut}.`, 20, y);

  y += 15;
  doc.setFont(undefined, 'bold');
  doc.text("ARTICLE 3 : LOYER", 20, y);
  y += 7;
  doc.setFont(undefined, 'normal');
  doc.text(`Le loyer mensuel est fixé à la somme de : ${formatNumber(tenant.rentAmount)} FCFA NET.`, 20, y);
  y += 6;
  doc.text("Le paiement doit être effectué au plus tard le 05 de chaque mois auprès de l'agence.", 20, y);

  y += 15;
  doc.setFont(undefined, 'bold');
  doc.text("ARTICLE 4 : CAUTION", 20, y);
  y += 7;
  doc.setFont(undefined, 'normal');
  doc.text("Le preneur a versé un dépôt de garantie pour répondre des dommages éventuels en fin de bail.", 20, y);

  // --- MENTION "FAIT À DAKAR" EN BAS ---
  y = 220;
  doc.setFont(undefined, 'italic');
  doc.setFontSize(11);
  const dateFait = format(new Date(), 'dd MMMM yyyy', { locale: fr });
  doc.text(`Fait à Dakar, le ${dateFait}`, 190, y, { align: 'right' });

  // --- SIGNATURES ---
  y += 15;
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text("Signature du Preneur", 20, y);
  doc.text("Le Bailleur / L'Agence", 130, y);
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text("(Mention 'Lu et approuvé')", 20, y + 5);
  doc.text("(Cachet et signature)", 130, y + 5);

  doc.setDrawColor(200, 200, 200);
  doc.line(20, y + 10, 80, y + 10);
  doc.line(130, y + 10, 190, y + 10);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Document officiel généré par GESTION LOCATIVE PRO - Kissima Media`, 105, 285, { align: 'center' });

  doc.save(`Bail_${tenant.lastName}_${tenant.firstName}.pdf`);
};

export const generateReceiptPDF = (receipt: Receipt, agency: Agency) => {
  const doc = new jsPDF();
  const primaryColor = [124, 58, 237]; // Violet
  
  // --- EN-TÊTE ---
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.line(20, 20, 30, 10);
  doc.line(30, 10, 40, 20);
  doc.rect(23, 20, 14, 12);
  
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont(undefined, 'bold');
  doc.text(agency.name || 'AGENCE IMMOBILIÈRE', 45, 18);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont(undefined, 'normal');
  doc.text(agency.address || 'Adresse de l\'agence', 45, 23);
  doc.text(`Tél: ${agency.phone || 'Non renseigné'}`, 45, 27);

  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont(undefined, 'bold');
  doc.text('QUITTANCE DE LOYER', 105, 50, { align: 'center' });
  
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.rect(15, 60, 180, 100);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  
  doc.text(`Quittance N° : ${receipt.receiptNumber}`, 25, 75);
  doc.text(`Date d'émission : ${format(new Date(), 'dd/MM/yyyy')}`, 140, 75);
  
  doc.setFont(undefined, 'bold');
  doc.text('LOCATAIRE :', 25, 90);
  doc.setFont(undefined, 'normal');
  doc.text(receipt.tenantName, 60, 90);
  
  doc.setFillColor(245, 243, 255);
  doc.rect(25, 98, 160, 15, 'F');
  doc.setFont(undefined, 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`MONTANT REÇU : ${formatNumber(receipt.amount)} FCFA`, 105, 108, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text(`Période : du ${receipt.periodStart} au ${receipt.periodEnd}`, 25, 125);
  doc.text(`Local : ${receipt.unitName}`, 25, 135);
  doc.text(`Adresse du bien : ${receipt.propertyAddress}`, 25, 145);
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const footerText = `NINEA: ${agency.ninea || '...'} | Généré par GESTION LOCATIVE PRO sn`;
  doc.text(footerText, 105, 155, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text('Cachet et Signature de l\'Agence', 130, 180);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.line(130, 182, 185, 182);

  doc.save(`Quittance_${receipt.receiptNumber}.pdf`);
};