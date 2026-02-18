import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Owner, Tenant, Receipt, Agency } from '../types/rental';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export const generateLeasePDF = (owner: Owner, tenant: Tenant) => {
  const doc = new jsPDF();
  
  doc.setFontSize(22);
  doc.setTextColor(124, 58, 237); 
  doc.text('CONTRAT DE BAIL D\'HABITATION', 105, 20, { align: 'center' });
  
  doc.setDrawColor(124, 58, 237);
  doc.line(20, 25, 190, 25);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text('ENTRE LES SOUSSIGNÉS :', 20, 40);
  
  doc.setFont(undefined, 'bold');
  doc.text(`LE BAILLEUR : M/Mme ${owner.firstName} ${owner.lastName}`, 20, 50);
  doc.setFont(undefined, 'normal');
  doc.text(`Demeurant à : ${owner.address}`, 20, 55);
  doc.text(`Téléphone : ${owner.telephone || 'Non renseigné'}`, 20, 60);
  
  doc.setFont(undefined, 'bold');
  doc.text(`LE PRENEUR : M/Mme ${tenant.firstName} ${tenant.lastName}`, 20, 75);
  doc.setFont(undefined, 'normal');
  doc.text(`Né(e) le : ${tenant.birthDate} à ${tenant.birthPlace}`, 20, 80);
  doc.text(`Identité (NCI/NPT) : ${tenant.idNumber}`, 20, 85);
  
  doc.setFont(undefined, 'bold');
  doc.text('OBJET DU CONTRAT ET LOYER :', 20, 100);
  doc.setFont(undefined, 'normal');
  doc.text(`Le bailleur loue au preneur le local suivant : ${tenant.unitName}`, 20, 110);
  doc.text(`Situé à l'adresse : ${owner.address}`, 20, 115);
  doc.setFont(undefined, 'bold');
  doc.text(`Montant du loyer mensuel : ${formatNumber(tenant.rentAmount || 0)} FCFA`, 20, 125);
  
  doc.setFont(undefined, 'normal');
  doc.text('Fait à ........................., le ' + format(new Date(), 'dd MMMM yyyy', { locale: fr }), 20, 145);
  
  doc.setLineWidth(0.5);
  doc.line(20, 165, 80, 165);
  doc.line(130, 165, 190, 165);
  doc.text('Signature du Bailleur', 35, 172);
  doc.text('Signature du Preneur', 145, 172);
  
  doc.save(`Bail_${tenant.lastName}_${tenant.firstName}.pdf`);
};

export const generateReceiptPDF = (receipt: Receipt, agency: Agency) => {
  const doc = new jsPDF();
  const primaryColor = [124, 58, 237]; // Violet
  
  // --- EN-TÊTE AGENCE ---
  // Logo stylisé (Maison)
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.line(20, 20, 30, 10); // Toit gauche
  doc.line(30, 10, 40, 20); // Toit droit
  doc.rect(23, 20, 14, 12); // Corps maison
  
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont(undefined, 'bold');
  doc.text(agency.name || 'AGENCE IMMOBILIÈRE', 45, 18);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont(undefined, 'normal');
  doc.text(agency.address || 'Adresse de l\'agence', 45, 23);
  doc.text(`Tél: ${agency.phone || 'Non renseigné'} | Email: ${agency.email || ''}`, 45, 27);

  // Titre du document
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont(undefined, 'bold');
  doc.text('QUITTANCE DE LOYER', 105, 50, { align: 'center' });
  
  // --- CORPS DE LA QUITTANCE ---
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.rect(15, 60, 180, 100); // Cadre principal
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  
  // Ligne 1: Numéro et Date
  doc.text(`Quittance N° : ${receipt.receiptNumber}`, 25, 75);
  doc.text(`Date d'émission : ${format(new Date(), 'dd/MM/yyyy')}`, 140, 75);
  
  // Ligne 2: Locataire
  doc.setFont(undefined, 'bold');
  doc.text('LOCATAIRE :', 25, 90);
  doc.setFont(undefined, 'normal');
  doc.text(receipt.tenantName, 60, 90);
  
  // Ligne 3: Montant (Mise en évidence)
  doc.setFillColor(245, 243, 255);
  doc.rect(25, 98, 160, 15, 'F');
  doc.setFont(undefined, 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`MONTANT REÇU : ${formatNumber(receipt.amount)} FCFA`, 105, 108, { align: 'center' });
  
  // Ligne 4: Détails
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text(`Période : du ${receipt.periodStart} au ${receipt.periodEnd}`, 25, 125);
  doc.text(`Local : ${receipt.unitName}`, 25, 135);
  doc.text(`Adresse du bien : ${receipt.propertyAddress}`, 25, 145);
  
  // --- PIED DE PAGE ---
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const footerText = `NINEA: ${agency.ninea || '...'} | RCCM: ${agency.rccm || '...'} | Généré par GESTION LOCATIVE PRO sn`;
  doc.text(footerText, 105, 155, { align: 'center' });
  
  // Zone de signature
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text('Cachet et Signature de l\'Agence', 130, 180);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.line(130, 182, 185, 182);

  doc.save(`Quittance_${receipt.receiptNumber}.pdf`);
};