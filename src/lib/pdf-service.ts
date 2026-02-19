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
  
  // --- EN-TÊTE AGENCE ---
  doc.setFontSize(18);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont(undefined, 'bold');
  doc.text(agency.name || 'AGENCE IMMOBILIÈRE', 105, 20, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont(undefined, 'normal');
  doc.text(`${agency.address || ''} | Tél: ${agency.phone || ''}`, 105, 26, { align: 'center' });
  doc.text(`NINEA: ${agency.ninea || '...'} | RCCM: ${agency.rccm || '...'}`, 105, 30, { align: 'center' });

  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  // --- TITRE DU CONTRAT ---
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text("CONTRAT DE BAIL À USAGE D'HABITATION", 105, 45, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Fait le : ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`, 160, 52);

  // --- LES PARTIES ---
  let y = 65;
  doc.setFont(undefined, 'bold');
  doc.text("ENTRE LES SOUSSIGNÉS :", 20, y);
  
  y += 10;
  doc.setFont(undefined, 'bold');
  doc.text("LE BAILLEUR :", 20, y);
  doc.setFont(undefined, 'normal');
  doc.text(`M/Mme ${owner.firstName} ${owner.lastName}`, 50, y);
  y += 5;
  doc.text(`Représenté par l'agence ${agency.name}`, 50, y);
  
  y += 10;
  doc.setFont(undefined, 'bold');
  doc.text("LE PRENEUR :", 20, y);
  doc.setFont(undefined, 'normal');
  doc.text(`M/Mme ${tenant.firstName} ${tenant.lastName}`, 50, y);
  y += 5;
  doc.text(`Né(e) le ${tenant.birthDate || '...'} à ${tenant.birthPlace || '...'}`, 50, y);
  doc.text(`Identité (NCI/Passeport) : ${tenant.idNumber}`, 50, y + 5);

  // --- ARTICLES ---
  y += 20;
  doc.setFont(undefined, 'bold');
  doc.text("ARTICLE 1 : OBJET DU CONTRAT", 20, y);
  y += 7;
  doc.setFont(undefined, 'normal');
  const objetText = `Le bailleur donne en location au preneur, qui l'accepte, le local de type "${tenant.unitName}" composé de ${tenant.roomsCount} pièce(s), situé à l'adresse suivante : ${owner.address}.`;
  const splitObjet = doc.splitTextToSize(objetText, 170);
  doc.text(splitObjet, 20, y);
  
  y += (splitObjet.length * 5) + 5;
  doc.setFont(undefined, 'bold');
  doc.text("ARTICLE 2 : DURÉE DU CONTRAT", 20, y);
  y += 7;
  doc.setFont(undefined, 'normal');
  doc.text(`Le présent contrat est conclu pour une durée déterminée d'un an renouvelable par tacite reconduction, commençant le ${format(new Date(tenant.startDate || new Date()), 'dd/MM/yyyy')}.`, 20, y);

  y += 15;
  doc.setFont(undefined, 'bold');
  doc.text("ARTICLE 3 : LOYER ET CHARGES", 20, y);
  y += 7;
  doc.setFont(undefined, 'normal');
  doc.text(`Le loyer mensuel est fixé à la somme de : ${formatNumber(tenant.rentAmount || 0)} FCFA.`, 20, y);
  y += 5;
  doc.text("Le loyer est payable d'avance entre le 1er et le 05 de chaque mois.", 20, y);

  y += 15;
  doc.setFont(undefined, 'bold');
  doc.text("ARTICLE 4 : DÉPÔT DE GARANTIE (CAUTION)", 20, y);
  y += 7;
  doc.setFont(undefined, 'normal');
  doc.text(`Le preneur verse à l'entrée une somme correspondant au dépôt de garantie qui sera restituée en fin de bail, déduction faite des éventuelles réparations locatives.`, 20, y);

  // --- SIGNATURES ---
  y = 230;
  doc.setFont(undefined, 'bold');
  doc.text("SIGNATURE DU PRENEUR", 30, y);
  doc.text("SIGNATURE DU BAILLEUR / AGENCE", 120, y);
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  doc.text("(Précédé de la mention 'Lu et approuvé')", 35, y + 5);
  doc.text("(Cachet et Signature)", 140, y + 5);

  doc.setLineWidth(0.2);
  doc.line(20, y + 10, 80, y + 10);
  doc.line(120, y + 10, 190, y + 10);

  // Pied de page
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Contrat généré par GESTION LOCATIVE PRO - Page 1/1`, 105, 285, { align: 'center' });

  doc.save(`Contrat_Bail_${tenant.lastName}_${tenant.firstName}.pdf`);
};

export const generateReceiptPDF = (receipt: Receipt, agency: Agency) => {
  const doc = new jsPDF();
  const primaryColor = [124, 58, 237]; // Violet
  
  // --- EN-TÊTE AGENCE ---
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
  doc.text(`Tél: ${agency.phone || 'Non renseigné'} | Email: ${agency.email || ''}`, 45, 27);

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
  const footerText = `NINEA: ${agency.ninea || '...'} | RCCM: ${agency.rccm || '...'} | Généré par GESTION LOCATIVE PRO sn`;
  doc.text(footerText, 105, 155, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text('Cachet et Signature de l\'Agence', 130, 180);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.line(130, 182, 185, 182);

  doc.save(`Quittance_${receipt.receiptNumber}.pdf`);
};