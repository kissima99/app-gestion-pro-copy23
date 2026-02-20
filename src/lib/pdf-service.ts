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
  const primaryColor = [124, 58, 237]; 
  
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont(undefined, 'bold');
  doc.text(agency.name || 'AGENCE IMMOBILIÈRE', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`${agency.address || ''} | Tél: ${agency.phone || ''}`, 105, 27, { align: 'center' });
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.line(20, 35, 190, 35);

  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("CONTRAT DE BAIL À USAGE D'HABITATION", 105, 50, { align: 'center' });

  let y = 70;
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text("ENTRE LES SOUSSIGNÉS :", 20, y);
  
  y += 10;
  doc.text("LE BAILLEUR :", 20, y);
  doc.setFont(undefined, 'normal');
  doc.text(`M/Mme ${agency.ownerName || 'Le Propriétaire'}, représenté par l'agence ${agency.name}`, 55, y);
  
  y += 10;
  doc.setFont(undefined, 'bold');
  doc.text("LE PRENEUR :", 20, y);
  doc.setFont(undefined, 'normal');
  doc.text(`M/Mme ${tenant.firstName} ${tenant.lastName}, ID: ${tenant.idNumber}`, 55, y);

  y += 20;
  doc.setFont(undefined, 'bold');
  doc.text("ARTICLE 1 : OBJET", 20, y);
  y += 7;
  doc.setFont(undefined, 'normal');
  doc.text(`Location d'un local (${tenant.unitName}) sis à ${owner.address}.`, 20, y);

  y += 15;
  doc.setFont(undefined, 'bold');
  doc.text("ARTICLE 2 : LOYER", 20, y);
  y += 7;
  doc.setFont(undefined, 'normal');
  doc.text(`Fixé à ${formatNumber(tenant.rentAmount)} FCFA par mois.`, 20, y);

  // MENTION FINALE ET SIGNATURES
  y = 220;
  doc.setFont(undefined, 'bold');
  const dateFait = format(new Date(), 'dd MMMM yyyy', { locale: fr });
  doc.text(`Fait à Dakar, le ${dateFait}`, 105, y, { align: 'center' });

  y += 15;
  doc.text("Le Preneur", 40, y);
  doc.text("Le Bailleur / Agence", 140, y);
  doc.line(20, y + 10, 80, y + 10);
  doc.line(130, y + 10, 190, y + 10);

  doc.save(`Bail_${tenant.lastName}.pdf`);
};

export const generateCautionPDF = (owner: Owner, tenant: Tenant, agency: Agency) => {
  const doc = new jsPDF();
  const primaryColor = [124, 58, 237];

  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(agency.name || 'AGENCE IMMOBILIÈRE', 105, 20, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  doc.text("REÇU DE CAUTION", 105, 50, { align: 'center' });

  doc.setFontSize(12);
  let y = 80;
  const texte = `Je soussigné, ${agency.ownerName || 'le gérant'}, de l'agence ${agency.name}, certifie avoir reçu de M/Mme ${tenant.firstName} ${tenant.lastName}, la somme de :`;
  const splitTexte = doc.splitTextToSize(texte, 170);
  doc.text(splitTexte, 20, y);

  y += 15;
  doc.setFont(undefined, 'bold');
  doc.setFontSize(16);
  doc.text(`${formatNumber(tenant.rentAmount)} FCFA`, 105, y, { align: 'center' });
  
  y += 20;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(12);
  doc.text(`À titre de dépôt de garantie (Caution) pour le local situé à :`, 20, y);
  doc.text(`${owner.address}`, 20, y + 7);

  // MENTION FINALE JUSTE AVANT SIGNATURE
  y = 210;
  doc.setFont(undefined, 'bold');
  const dateFait = format(new Date(), 'dd MMMM yyyy', { locale: fr });
  doc.text(`Fait à Dakar, le ${dateFait}`, 105, y, { align: 'center' });

  y += 20;
  doc.text("Signature du Preneur", 40, y);
  doc.text("Signature du Bailleur", 140, y);
  doc.line(20, y + 10, 80, y + 10);
  doc.line(130, y + 10, 190, y + 10);

  doc.save(`Recu_Caution_${tenant.lastName}.pdf`);
};

export const generateReceiptPDF = (receipt: Receipt, agency: Agency) => {
  const doc = new jsPDF();
  const primaryColor = [124, 58, 237];
  
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(agency.name || 'AGENCE IMMOBILIÈRE', 45, 18);
  
  doc.setFontSize(22);
  doc.text('QUITTANCE DE LOYER', 105, 50, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text(`Quittance N° : ${receipt.receiptNumber}`, 25, 75);
  doc.text(`Montant : ${formatNumber(receipt.amount)} FCFA`, 25, 90);
  doc.text(`Locataire : ${receipt.tenantName}`, 25, 105);
  doc.text(`Période : ${receipt.periodStart} au ${receipt.periodEnd}`, 25, 120);

  doc.save(`Quittance_${receipt.receiptNumber}.pdf`);
};