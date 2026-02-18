import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Owner, Tenant, Receipt } from '../types/rental';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Utilitaire de formatage simple pour garantir l'affichage en chiffres
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export const generateLeasePDF = (owner: Owner, tenant: Tenant) => {
  const doc = new jsPDF();
  
  doc.setFontSize(22);
  doc.setTextColor(124, 58, 237); // Couleur Violette
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

export const generateReceiptPDF = (receipt: Receipt) => {
  const doc = new jsPDF();
  
  // Cadre violet
  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(1);
  doc.rect(10, 10, 190, 110); 
  
  doc.setFontSize(20);
  doc.setTextColor(124, 58, 237);
  doc.text('QUITTANCE DE LOYER', 105, 25, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Quittance N° : ${receipt.receiptNumber}`, 20, 40);
  doc.text(`Locataire : ${receipt.tenantName}`, 20, 50);
  
  // Affichage explicite du montant en chiffres
  doc.setFont(undefined, 'bold');
  const displayAmount = typeof receipt.amount === 'number' ? receipt.amount : parseInt(String(receipt.amount));
  doc.text(`Montant : ${formatNumber(displayAmount)} FCFA`, 20, 60);
  
  doc.setFont(undefined, 'normal');
  doc.text(`Période : du ${receipt.periodStart} au ${receipt.periodEnd}`, 20, 70);
  doc.text(`Local : ${receipt.unitName}`, 20, 80);
  doc.text(`Adresse : ${receipt.propertyAddress}`, 20, 90);
  
  doc.setFontSize(10);
  doc.text(`Date de paiement : ${receipt.paymentDate}`, 140, 110);
  
  doc.save(`Quittance_${receipt.receiptNumber}.pdf`);
};